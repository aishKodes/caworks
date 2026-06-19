<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

function smtp_read($socket): string {
    $data = '';
    while ($line = fgets($socket, 515)) {
        $data .= $line;
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }
    return $data;
}

function smtp_cmd($socket, string $command): string {
    fwrite($socket, $command . "\r\n");
    return smtp_read($socket);
}

function send_email(string $to, string $subject, string $body): bool {
    $config = app_config()['smtp'];
    $host = $config['host'];
    $port = (int) $config['port'];
    $remote = $port === 465 ? "ssl://{$host}:{$port}" : "{$host}:{$port}";
    $error = null;
    $ok = false;
    try {
        $socket = stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
        if (!$socket) {
            throw new RuntimeException($errstr ?: 'SMTP connection failed.');
        }
        smtp_read($socket);
        smtp_cmd($socket, 'EHLO localhost');
        if ($port === 587) {
            smtp_cmd($socket, 'STARTTLS');
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            smtp_cmd($socket, 'EHLO localhost');
        }
        smtp_cmd($socket, 'AUTH LOGIN');
        smtp_cmd($socket, base64_encode($config['username']));
        smtp_cmd($socket, base64_encode($config['password']));
        smtp_cmd($socket, 'MAIL FROM:<' . $config['from_email'] . '>');
        smtp_cmd($socket, 'RCPT TO:<' . $to . '>');
        smtp_cmd($socket, 'DATA');
        $headers = [
            'From: ' . $config['from_name'] . ' <' . $config['from_email'] . '>',
            'To: ' . $to,
            'Subject: ' . $subject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
        ];
        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
        smtp_read($socket);
        smtp_cmd($socket, 'QUIT');
        fclose($socket);
        $ok = true;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
    try {
        $stmt = db()->prepare('INSERT INTO email_logs (recipient, subject, status, error_message) VALUES (?, ?, ?, ?)');
        $stmt->execute([$to, $subject, $ok ? 'sent' : 'failed', $error]);
    } catch (Throwable $ignored) {
    }
    return $ok;
}

function email_admin(string $subject, string $body): void {
    send_email(app_config()['admin_email'], $subject, $body);
}
