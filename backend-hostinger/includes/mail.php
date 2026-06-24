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
    $settings = [];
    try {
        $rows = db()->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('support_email','public_email')")->fetchAll();
        foreach ($rows as $row) $settings[$row['setting_key']] = (string) ($row['setting_value'] ?? '');
        $rows = db()->query("SELECT setting_key, setting_value FROM integration_settings WHERE setting_group IN ('smtp','site') OR setting_key IN ('admin_email','public_email')")->fetchAll();
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
    $configSource = (string) ($app['_config_source'] ?? 'config.example.php');
    $isLiveConfig = $configSource === 'config.php';
    $sources = [];
    $mismatches = [];
    $configured = static fn(mixed $value): bool => $value === false || $value === true || ($value !== null && trim((string) $value) !== '');
    $choose = static function (string $settingKey, array $config, string $configKey, mixed $default = '') use ($settings, $isLiveConfig, $configSource, $configured, &$sources, &$mismatches) {
        $configHasValue = array_key_exists($configKey, $config) && $configured($config[$configKey]);
        $dbHasValue = array_key_exists($settingKey, $settings) && trim((string) $settings[$settingKey]) !== '';
        if ($isLiveConfig && $configHasValue) {
            $sources[$settingKey] = 'config.php';
            if ($dbHasValue && (string) $settings[$settingKey] !== (string) $config[$configKey]) {
                $mismatches[$settingKey] = ['config' => (string) $config[$configKey], 'database' => (string) $settings[$settingKey]];
            }
            return $config[$configKey];
        }
        if ($dbHasValue) {
            $sources[$settingKey] = 'database';
            return $settings[$settingKey];
        }
        if ($configHasValue) {
            $sources[$settingKey] = $configSource;
            return $config[$configKey];
        }
        $sources[$settingKey] = 'default';
        return $default;
    };
    $port = (int) $choose('smtp_port', $smtp, 'port', 465);
    $encryption = strtolower(trim((string) $choose('smtp_encryption', $smtp, 'encryption', $port === 465 ? 'ssl' : 'tls')));
    if (!in_array($encryption, ['ssl', 'tls', 'none'], true)) $encryption = $port === 465 ? 'ssl' : 'tls';
    $username = trim((string) $choose('smtp_username', $smtp, 'username', ''));
    $fromEmail = trim((string) $choose('smtp_from_email', $smtp, 'from_email', $username));
    $replyTo = trim((string) $choose('smtp_reply_to', $smtp, 'reply_to', $fromEmail ?: $username));
    return [
        'enabled' => mail_truthy($choose('smtp_enabled', $smtp, 'enabled', true), true),
        'host' => trim((string) $choose('smtp_host', $smtp, 'host', 'smtp.hostinger.com')),
        'port' => $port,
        'encryption' => $encryption,
        'username' => $username,
        'password' => (string) $choose('smtp_password', $smtp, 'password', ''),
        'from_email' => $fromEmail ?: $username,
        'from_name' => trim((string) $choose('smtp_from_name', $smtp, 'from_name', 'VB Consultants')),
        'reply_to' => $replyTo ?: ($fromEmail ?: $username),
        'admin_email' => trim((string) $choose('admin_email', $app, 'admin_email', $fromEmail ?: $username)),
        'public_email' => trim((string) $choose('public_email', $app, 'public_email', '')),
        'debug' => mail_truthy($choose('mail_debug', $smtp, 'debug', false), false),
        'config_source' => $configSource,
        'sources' => $sources,
        'mismatches' => $mismatches,
        'database_values' => $settings,
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
        'public_email' => $config['public_email'],
        'debug' => $config['debug'],
        'password_set' => $config['password'] !== '',
        'config_source' => $config['config_source'],
        'sources' => $config['sources'],
        'mismatches' => $config['mismatches'],
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
    return safe_send_email($to, $subject, '', $body, $options)['ok'];
}

function safe_send_email(string $to, string $subject, string $html, string $text = '', array $meta = []): array {
    try {
        $plain = trim($text) !== '' ? $text : mail_text_from_html($html);
        $options = $meta;
        if (trim($html) !== '') $options['html'] = $html;
        return send_email_result($to, $subject, $plain, $options);
    } catch (Throwable $e) {
        mail_log_attempt([
            'event_type' => $meta['event_type'] ?? 'safe_send_email',
            'recipient' => $to,
            'subject' => $subject,
            'status' => 'failed',
            'provider' => 'smtp',
            'error_message' => $e->getMessage(),
            'related_user_id' => $meta['related_user_id'] ?? null,
            'related_request_id' => $meta['related_request_id'] ?? null,
        ]);
        return [
            'ok' => false,
            'status' => 'failed',
            'provider' => 'smtp',
            'recipient' => $to,
            'subject' => $subject,
            'error' => mail_safe_error($e->getMessage()),
            'diagnostics' => mail_diagnostics(),
        ];
    }
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
    return safe_send_email($to, $subject, '', $body, $options);
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
    return safe_send_email($adminEmail, $subject, '', $body, [
        'event_type' => $eventType,
        'related_user_id' => $relatedUserId,
        'related_request_id' => $relatedRequestId,
    ]);
}
