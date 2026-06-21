<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('download_documents');
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
audit_log((int) $admin['id'], (int) ($doc['user_id'] ?? 0), 'document_download', 'Document ' . $id . ' downloaded.');
readfile($doc['path']);
exit;
