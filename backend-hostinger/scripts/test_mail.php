<?php
require_once __DIR__ . '/../includes/mail.php';

$to = $argv[1] ?? '';
if (!$to) {
    fwrite(STDERR, "Usage: php scripts/test_mail.php recipient@example.com\n");
    exit(1);
}

$diag = mail_diagnostics();
echo "Config loaded: " . ($diag['config_loaded'] ? 'yes' : 'no') . PHP_EOL;
echo "SMTP enabled: " . ($diag['smtp_enabled'] ? 'yes' : 'no') . PHP_EOL;
echo "Host: {$diag['host']}" . PHP_EOL;
echo "Port: {$diag['port']}" . PHP_EOL;
echo "Encryption: {$diag['encryption']}" . PHP_EOL;
echo "Username: {$diag['username']}" . PHP_EOL;
echo "From email: {$diag['from_email']}" . PHP_EOL;
echo "From name: {$diag['from_name']}" . PHP_EOL;
echo "Reply-To: {$diag['reply_to']}" . PHP_EOL;
echo "Admin email: {$diag['admin_email']}" . PHP_EOL;
echo "Password set: " . ($diag['password_set'] ? 'yes' : 'no') . PHP_EOL;
echo "Recipient: {$to}" . PHP_EOL;

$result = send_email_result(
    $to,
    'VB Consultants SMTP CLI test',
    "This is a CLI SMTP test email from VB Consultants.\n\nIf you received this, SMTP is working.",
    ['event_type' => 'smtp_cli_test']
);

echo "Result: " . ($result['ok'] ? 'sent' : 'failed') . PHP_EOL;
if (!$result['ok']) {
    echo "Error: " . ($result['error'] ?: 'Unknown SMTP error') . PHP_EOL;
    exit(2);
}
exit(0);
