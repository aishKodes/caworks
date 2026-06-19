<?php
if (PHP_SAPI !== 'cli') {
    exit("Run from CLI only.\n");
}
require_once __DIR__ . '/../includes/db.php';
$email = $argv[1] ?? '';
$password = $argv[2] ?? '';
$name = $argv[3] ?? 'Admin';
if (!$email || !$password) {
    exit("Usage: php scripts/create_admin.php admin@example.com StrongPassword \"Admin Name\"\n");
}
$stmt = db()->prepare('INSERT INTO admin_users (email, password_hash, full_name) VALUES (?, ?, ?)');
$stmt->execute([strtolower($email), password_hash($password, PASSWORD_DEFAULT), $name]);
echo "Admin created.\n";
