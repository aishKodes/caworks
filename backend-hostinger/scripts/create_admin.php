<?php
if (PHP_SAPI !== 'cli') {
    exit("Run from CLI only.\n");
}
require_once __DIR__ . '/../includes/db.php';
$email = $argv[1] ?? '';
$password = $argv[2] ?? '';
$name = $argv[3] ?? 'Admin';
$role = $argv[4] ?? 'super_admin';
if (!$email || !$password) {
    exit("Usage: php scripts/create_admin.php admin@example.com StrongPassword \"Admin Name\" super_admin\n");
}
if (strlen($password) < 10 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
    exit("Password must be at least 10 characters and include at least one letter and one number.\n");
}
$allowedRoles = ['super_admin', 'admin', 'staff', 'content_editor', 'accountant', 'viewer'];
if (!in_array($role, $allowedRoles, true)) {
    exit("Invalid role. Use: " . implode(', ', $allowedRoles) . "\n");
}
$stmt = db()->prepare('INSERT INTO admin_users (email, password_hash, full_name, role, active, force_password_change) VALUES (?, ?, ?, ?, 1, 0)');
$stmt->execute([strtolower($email), password_hash($password, PASSWORD_DEFAULT), $name, $role]);
echo "Admin created with role {$role}.\n";
