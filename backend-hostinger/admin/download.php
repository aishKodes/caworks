<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM documents WHERE id=?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc || !is_file($doc['path'])) {
    http_response_code(404);
    exit('Document not found');
}
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($doc['original_name']) . '"');
header('Content-Length: ' . filesize($doc['path']));
readfile($doc['path']);
exit;
