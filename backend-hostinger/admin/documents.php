<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_documents');
$message = '';
$q = trim((string) ($_GET['q'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));
$hasDocumentLabel = admin_db_column_exists('documents', 'document_label');
$hasUploadedAt = admin_db_column_exists('documents', 'uploaded_at');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    if (isset($_POST['delete_document'])) {
        if (!can('delete_documents')) {
            http_response_code(403);
            exit('Access denied');
        }
        $docId = (int) ($_POST['document_id'] ?? 0);
        $stmt = db()->prepare('SELECT * FROM documents WHERE id=?');
        $stmt->execute([$docId]);
        $doc = $stmt->fetch();
        if ($doc && is_file($doc['path'])) {
            @unlink($doc['path']);
        }
        db()->prepare('DELETE FROM documents WHERE id=?')->execute([$docId]);
        audit_log((int) $admin['id'], (int) ($doc['user_id'] ?? 0), 'document_deleted', 'Document ' . $docId . ' deleted.');
        $message = 'Document deleted.';
    } else {
    if (!can('manage_requests')) {
        http_response_code(403);
        exit('Access denied');
    }
    $docId = (int) ($_POST['document_id'] ?? 0);
    $docStatus = trim((string) ($_POST['document_status'] ?? 'Received'));
    $note = trim((string) ($_POST['admin_note'] ?? ''));
    db()->prepare('UPDATE documents SET status=?, admin_note=? WHERE id=?')->execute([$docStatus, $note, $docId]);
    audit_log((int) $admin['id'], null, 'document_status_update', 'Document ' . $docId . ': ' . $docStatus);
    $message = 'Document status updated.';
    }
}

$where = [];
$params = [];
if ($q !== '') {
    $where[] = $hasDocumentLabel
        ? '(d.original_name LIKE ? OR d.document_type LIKE ? OR d.document_label LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.tax_help_id LIKE ? OR sr.request_code LIKE ?)'
        : '(d.original_name LIKE ? OR d.document_type LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.tax_help_id LIKE ? OR sr.request_code LIKE ?)';
    $like = '%' . $q . '%';
    $params = $hasDocumentLabel ? [$like, $like, $like, $like, $like, $like, $like] : [$like, $like, $like, $like, $like, $like];
}
if ($status !== '') {
    $where[] = 'COALESCE(d.status, "Received") = ?';
    $params[] = $status;
}
$labelSelect = $hasDocumentLabel ? 'd.document_label' : 'd.document_type';
$uploadedSelect = $hasUploadedAt ? 'd.uploaded_at' : 'd.created_at';
$sql = "SELECT d.*, {$labelSelect} AS display_label, {$uploadedSelect} AS display_uploaded_at, u.full_name, u.phone, u.email, u.tax_help_id, sr.request_code FROM documents d JOIN users u ON u.id=d.user_id LEFT JOIN service_requests sr ON sr.id=d.request_id";
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY COALESCE(sr.request_code, ""), display_label, d.created_at DESC LIMIT 300';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Documents');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<form class="toolbar">
  <label class="field"><span>Search</span><input name="q" value="<?= e($q) ?>" placeholder="Phone, Tax Help ID, request, file name"></label>
  <label class="field"><span>Status</span><select name="status"><option value="">All</option><?= admin_select_options(['Received','Needs clarification','Rejected'], $status) ?></select></label>
  <button class="btn">Filter</button>
</form>
<div class="table-wrap">
  <table>
    <tr><th>Document</th><th>User</th><th>Request</th><th>Status</th><th>Uploaded</th><th>Action</th></tr>
    <?php foreach ($rows as $row): ?>
      <tr>
        <td><strong><?= e($row['display_label'] ?? $row['document_type']) ?></strong><br><span class="muted"><?= e($row['document_type']) ?></span><br><?= e($row['original_name']) ?><br><span class="muted"><?= e($row['mime_type']) ?> · <?= e((string) $row['size']) ?> bytes</span></td>
        <td><?= e($row['full_name']) ?><br><span class="muted"><?= e($row['tax_help_id']) ?> · <?= e($row['phone']) ?></span></td>
        <td><?= e($row['request_code'] ?? 'No request') ?></td>
        <td><?= status_badge($row['status'] ?? 'Received') ?><br><span class="muted"><?= e($row['admin_note'] ?? '') ?></span></td>
        <td><?= e($row['display_uploaded_at'] ?? $row['created_at']) ?></td>
        <td>
          <div class="actions">
            <?php if (can('download_documents')): ?><a class="btn small" href="download.php?id=<?= e($row['id']) ?>">Download</a><?php endif; ?>
            <?php if (can('manage_requests')): ?>
              <form method="post">
                <?= csrf_field() ?>
                <input type="hidden" name="document_id" value="<?= e($row['id']) ?>">
                <select name="document_status"><?= admin_select_options(['Received','Needs clarification','Rejected'], $row['status'] ?? 'Received') ?></select>
                <input name="admin_note" placeholder="Note" value="<?= e($row['admin_note'] ?? '') ?>">
                <button class="btn small light">Save</button>
              </form>
            <?php endif; ?>
            <?php if (can('delete_documents')): ?>
              <form method="post" onsubmit="return confirm('Delete this private document record and file?')">
                <?= csrf_field() ?>
                <input type="hidden" name="document_id" value="<?= e($row['id']) ?>">
                <button class="btn small danger" name="delete_document" value="1">Delete</button>
              </form>
            <?php endif; ?>
          </div>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer(); ?>
