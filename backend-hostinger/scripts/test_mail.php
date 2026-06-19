<?php
if (PHP_SAPI !== 'cli') {
    exit("Run from CLI only.\n");
}
require_once __DIR__ . '/../includes/mail.php';
$to = $argv[1] ?? app_config()['admin_email'];
send_email($to, 'SMTP test', 'This is a test email from the Hostinger backend.');
echo "Mail test attempted. Check email_logs table.\n";
