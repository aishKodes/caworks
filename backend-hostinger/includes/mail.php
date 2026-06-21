<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

function mail_db_column_exists(string $table, string $column): bool {
    static $cache = [];
    $key = $table . '.' . $column;
    if (array_key_exists($key, $cache)) return $cache[$key];
    try {
        $stmt = db()->prepare('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1');
        $stmt->execute([$table, $column]);
        $cache[$key] = (bool) $stmt->fetch();
    } catch (Throwable $ignored) {
        $cache[$key] = false;
    }
    return $cache[$key];
}

function mail_integration_settings(): array {
    static $settings = null;
    if ($settings !== null) return $settings;
    $settings = [];
    try {
        $rows = db()->query("SELECT setting_key, setting_value FROM integration_settings WHERE setting_group IN ('smtp','site') OR setting_key IN ('admin_email')")->fetchAll();
        foreach ($rows as $row) $settings[$row['setting_key']] = (string) ($row['setting_value'] ?? '');
    } catch (Throwable $ignored) {
    }
    return $settings;
}

function mail_truthy(mixed $value, bool $default = false): bool {
    if ($value === null || $value === '') return $default;
    if (is_bool($value)) return $value;
    return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on', 'enabled'], true);
}

function mail_config(): array {
    $app = app_config();
    $smtp = $app['smtp'] ?? [];
    $settings = mail_integration_settings();
    $value = static function (string $settingKey, string $configKey, mixed $default = '') use ($settings, $smtp) {
        if (array_key_exists($settingKey, $settings) && trim((string) $settings[$settingKey]) !== '') return $settings[$settingKey];
        return $smtp[$configKey] ?? $default;
    };
    $rootValue = static function (string $settingKey, string $configKey, mixed $default = '') use ($settings, $app) {
        if (array_key_exists($settingKey, $settings) && trim((string) $settings[$settingKey]) !== '') return $settings[$settingKey];
        return $app[$configKey] ?? $default;
    };
    $port = (int) $value('smtp_port', 'port', 465);
    $encryption = strtolower(trim((string) $value('smtp_encryption', 'encryption', $port === 465 ? 'ssl' : 'tls')));
    if (!in_array($encryption, ['ssl', 'tls', 'none'], true)) $encryption = $port === 465 ? 'ssl' : 'tls';
    return [
        'enabled' => mail_truthy($value('smtp_enabled', 'enabled', true), true),
        'host' => trim((string) $value('smtp_host', 'host', 'smtp.hostinger.com')),
        'port' => $port,
        'encryption' => $encryption,
        'username' => trim((string) $value('smtp_username', 'username', '')),
        'password' => (string) $value('smtp_password', 'password', ''),
        'from_email' => trim((string) $value('smtp_from_email', 'from_email', $smtp['username'] ?? '')),
        'from_name' => trim((string) $value('smtp_from_name', 'from_name', 'VB Consultants')),
        'reply_to' => trim((string) $value('smtp_reply_to', 'reply_to', $smtp['from_email'] ?? $smtp['username'] ?? '')),
        'admin_email' => trim((string) $rootValue('admin_email', 'admin_email', $smtp['from_email'] ?? $smtp['username'] ?? '')),
        'debug' => mail_truthy($value('mail_debug', 'debug', false), false),
    ];
}

function mail_safe_error(?string $message): string {
    $message = (string) $message;
    $config = mail_config();
    foreach (['password', 'username'] as $key) {
        $secret = (string) ($config[$key] ?? '');
        if ($secret !== '') $message = str_replace($secret, $key === 'password' ? '[smtp-password]' : '[smtp-username]', $message);
    }
    return trim($message);
}

function mail_diagnostics(): array {
    $config = mail_config();
    return [
        'config_loaded' => true,
        'smtp_enabled' => $config['enabled'],
        'host' => $config['host'],
        'port' => $config['port'],
        'encryption' => $config['encryption'],
        'username' => $config['username'],
        'from_email' => $config['from_email'],
        'from_name' => $config['from_name'],
        'reply_to' => $config['reply_to'],
        'admin_email' => $config['admin_email'],
        'debug' => $config['debug'],
        'password_set' => $config['password'] !== '',
    ];
}

function mail_log_attempt(array $data): void {
    try {
        $columns = ['recipient', 'subject', 'status', 'error_message'];
        $values = [
            $data['recipient'] ?? '',
            $data['subject'] ?? '',
            $data['status'] ?? '',
            mail_safe_error($data['error_message'] ?? ''),
        ];
        $optional = [
            'event_type' => $data['event_type'] ?? 'general',
            'provider' => $data['provider'] ?? 'smtp',
            'related_user_id' => $data['related_user_id'] ?? null,
            'related_request_id' => $data['related_request_id'] ?? null,
        ];
        foreach ($optional as $column => $value) {
            if (mail_db_column_exists('email_logs', $column)) {
                $columns[] = $column;
                $values[] = $value;
            }
        }
        $placeholders = implode(',', array_fill(0, count($columns), '?'));
        $sql = 'INSERT INTO email_logs (' . implode(',', $columns) . ') VALUES (' . $placeholders . ')';
        db()->prepare($sql)->execute($values);
    } catch (Throwable $ignored) {
    }
}

function smtp_read_response($socket): array {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    $code = (int) substr($data, 0, 3);
    return [$code, trim($data)];
}

function smtp_command($socket, ?string $command, array $expectedCodes, string $label): string {
    if ($command !== null) fwrite($socket, $command . "\r\n");
    [$code, $response] = smtp_read_response($socket);
    if (!in_array($code, $expectedCodes, true)) {
        throw new RuntimeException($label . ' failed. SMTP response: ' . mail_safe_error($response));
    }
    return $response;
}

function smtp_escape_data(string $message): string {
    $normalized = str_replace(["\r\n", "\r"], "\n", $message);
    $escaped = preg_replace('/^\./m', '..', $normalized) ?? $normalized;
    return str_replace("\n", "\r\n", $escaped);
}

function mail_subject_header(string $subject): string {
    return function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n")
        : '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function mail_text_from_html(string $html): string {
    return trim(html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $html)), ENT_QUOTES, 'UTF-8'));
}

function mail_build_message(array $config, string $to, string $subject, string $plainBody, ?string $htmlBody = null): string {
    $from = $config['from_email'];
    $fromName = trim($config['from_name']);
    $replyTo = $config['reply_to'] ?: $from;
    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . ($fromName !== '' ? '"' . addcslashes($fromName, '"\\') . '" ' : '') . '<' . $from . '>',
        'To: <' . $to . '>',
        'Reply-To: <' . $replyTo . '>',
        'Subject: ' . mail_subject_header($subject),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . preg_replace('/^www\./', '', parse_url(app_config()['app_url'] ?? 'https://api.vbcbharat.com', PHP_URL_HOST) . '') . '>',
        'MIME-Version: 1.0',
    ];
    if ($htmlBody !== null && trim($htmlBody) !== '') {
        $boundary = 'b' . bin2hex(random_bytes(12));
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
        $body = "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n{$plainBody}\r\n";
        $body .= "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n{$htmlBody}\r\n";
        $body .= "--{$boundary}--";
    } else {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        $body = $plainBody;
    }
    return implode("\r\n", $headers) . "\r\n\r\n" . $body;
}

function send_email_result(string $to, string $subject, string $body, array $options = []): array {
    $config = mail_config();
    $eventType = (string) ($options['event_type'] ?? 'general');
    $relatedUserId = isset($options['related_user_id']) ? (int) $options['related_user_id'] : null;
    $relatedRequestId = isset($options['related_request_id']) ? (int) $options['related_request_id'] : null;
    $htmlBody = $options['html'] ?? null;
    $plainBody = $htmlBody ? mail_text_from_html((string) $htmlBody) : $body;
    $status = 'failed';
    $error = '';

    try {
        if (!$config['enabled']) throw new RuntimeException('SMTP is disabled.');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Recipient email is invalid.');
        foreach (['host', 'username', 'password', 'from_email'] as $required) {
            if (trim((string) $config[$required]) === '') throw new RuntimeException('SMTP setting missing: ' . $required . '.');
        }
        if (!filter_var($config['from_email'], FILTER_VALIDATE_EMAIL)) throw new RuntimeException('From email is invalid.');

        $remote = ($config['encryption'] === 'ssl' ? 'ssl://' : '') . $config['host'] . ':' . $config['port'];
        $socket = @stream_socket_client($remote, $errno, $errstr, 25, STREAM_CLIENT_CONNECT);
        if (!$socket) throw new RuntimeException($errstr ?: 'SMTP connection failed.');
        stream_set_timeout($socket, 25);

        smtp_command($socket, null, [220], 'SMTP greeting');
        smtp_command($socket, 'EHLO vbcbharat.com', [250], 'EHLO');
        if ($config['encryption'] === 'tls') {
            smtp_command($socket, 'STARTTLS', [220], 'STARTTLS');
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('STARTTLS negotiation failed.');
            }
            smtp_command($socket, 'EHLO vbcbharat.com', [250], 'EHLO after STARTTLS');
        }
        smtp_command($socket, 'AUTH LOGIN', [334], 'SMTP AUTH');
        smtp_command($socket, base64_encode($config['username']), [334], 'SMTP username');
        smtp_command($socket, base64_encode($config['password']), [235], 'SMTP password');
        smtp_command($socket, 'MAIL FROM:<' . $config['from_email'] . '>', [250], 'MAIL FROM');
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251], 'RCPT TO');
        smtp_command($socket, 'DATA', [354], 'DATA');
        fwrite($socket, smtp_escape_data(mail_build_message($config, $to, $subject, $plainBody, $htmlBody ? (string) $htmlBody : null)) . "\r\n.\r\n");
        smtp_command($socket, null, [250], 'Message send');
        smtp_command($socket, 'QUIT', [221, 250], 'QUIT');
        fclose($socket);
        $status = 'sent';
    } catch (Throwable $e) {
        $error = mail_safe_error($e->getMessage());
        if (isset($socket) && is_resource($socket)) fclose($socket);
    }

    mail_log_attempt([
        'event_type' => $eventType,
        'recipient' => $to,
        'subject' => $subject,
        'status' => $status,
        'provider' => 'smtp',
        'error_message' => $error,
        'related_user_id' => $relatedUserId,
        'related_request_id' => $relatedRequestId,
    ]);

    return [
        'ok' => $status === 'sent',
        'status' => $status,
        'provider' => 'smtp',
        'recipient' => $to,
        'subject' => $subject,
        'error' => $error,
        'diagnostics' => mail_diagnostics(),
    ];
}

function send_email(string $to, string $subject, string $body, array $options = []): bool {
    return send_email_result($to, $subject, $body, $options)['ok'];
}

function render_email_template(string $templateKey, array $vars, string $fallbackSubject, string $fallbackBody): array {
    $subject = $fallbackSubject;
    $body = $fallbackBody;
    try {
        $stmt = db()->prepare('SELECT subject, body FROM email_templates WHERE template_key=? AND active=1 LIMIT 1');
        $stmt->execute([$templateKey]);
        $row = $stmt->fetch();
        if ($row) {
            $subject = (string) $row['subject'];
            $body = (string) $row['body'];
        }
    } catch (Throwable $ignored) {
    }
    foreach ($vars as $key => $value) {
        $subject = str_replace('{' . $key . '}', (string) $value, $subject);
        $body = str_replace('{' . $key . '}', (string) $value, $body);
    }
    return [$subject, $body];
}

function send_template_email(string $to, string $templateKey, array $vars, string $fallbackSubject, string $fallbackBody, array $options = []): array {
    [$subject, $body] = render_email_template($templateKey, $vars, $fallbackSubject, $fallbackBody);
    $options['event_type'] = $options['event_type'] ?? $templateKey;
    return send_email_result($to, $subject, $body, $options);
}

function email_admin_template(string $templateKey, array $vars, string $fallbackSubject, string $fallbackBody, ?int $relatedUserId = null, ?int $relatedRequestId = null): array {
    $adminEmail = mail_config()['admin_email'];
    if (!$adminEmail) {
        mail_log_attempt([
            'event_type' => $templateKey,
            'recipient' => '',
            'subject' => $fallbackSubject,
            'status' => 'failed',
            'provider' => 'smtp',
            'error_message' => 'Admin email is not configured.',
            'related_user_id' => $relatedUserId,
            'related_request_id' => $relatedRequestId,
        ]);
        return ['ok' => false, 'error' => 'Admin email is not configured.'];
    }
    return send_template_email($adminEmail, $templateKey, $vars, $fallbackSubject, $fallbackBody, [
        'event_type' => $templateKey,
        'related_user_id' => $relatedUserId,
        'related_request_id' => $relatedRequestId,
    ]);
}

function email_admin(string $subject, string $body, string $eventType = 'admin_alert', ?int $relatedUserId = null, ?int $relatedRequestId = null): array {
    $adminEmail = mail_config()['admin_email'];
    if (!$adminEmail) {
        mail_log_attempt([
            'event_type' => $eventType,
            'recipient' => '',
            'subject' => $subject,
            'status' => 'failed',
            'provider' => 'smtp',
            'error_message' => 'Admin email is not configured.',
            'related_user_id' => $relatedUserId,
            'related_request_id' => $relatedRequestId,
        ]);
        return ['ok' => false, 'error' => 'Admin email is not configured.'];
    }
    return send_email_result($adminEmail, $subject, $body, [
        'event_type' => $eventType,
        'related_user_id' => $relatedUserId,
        'related_request_id' => $relatedRequestId,
    ]);
}
