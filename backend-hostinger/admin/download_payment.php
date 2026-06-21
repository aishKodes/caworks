<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('verify_payments');
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT mps.*, p.user_id FROM manual_payment_screenshots mps JOIN payments p ON p.id=mps.payment_id WHERE mps.id=?');
$stmt->execute([$id]);
$shot = $stmt->fetch();
if (!$shot || !is_file($shot['path'])) {
    http_response_code(404);
    exit('Screenshot not found');
}
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($shot['original_name']) . '"');
header('Content-Length: ' . filesize($shot['path']));
audit_log((int) $admin['id'], (int) ($shot['user_id'] ?? 0), 'manual_payment_screenshot_download', 'Screenshot ' . $id . ' downloaded.');
readfile($shot['path']);
exit;
