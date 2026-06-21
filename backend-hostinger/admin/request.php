<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_requests');
$id = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    if (!can('manage_requests') && !can('verify_payments')) {
        http_response_code(403);
        exit('Access denied');
    }
    if (isset($_POST['status'])) {
        if (!can('manage_requests')) exit('Access denied');
        db()->prepare('UPDATE service_requests SET status=? WHERE id=?')->execute([$_POST['status'], $id]);
        db()->prepare('INSERT INTO status_updates (request_id,status,note,visible_to_user) VALUES (?,?,?,1)')->execute([$id, $_POST['status'], $_POST['note'] ?? '']);
        audit_log((int) $admin['id'], null, 'request_status_update', 'Request ' . $id . ': ' . $_POST['status']);
        if ($_POST['status'] === 'Completed') {
            $mailStmt = db()->prepare('SELECT sr.request_code, u.id user_id, u.full_name, u.email FROM service_requests sr JOIN users u ON u.id=sr.user_id WHERE sr.id=?');
            $mailStmt->execute([$id]);
            $mailUser = $mailStmt->fetch();
            if ($mailUser) {
                send_template_email(
                    $mailUser['email'],
                    'status_completed',
                    ['name' => $mailUser['full_name'], 'request_id' => $mailUser['request_code']],
                    'Request completed',
                    "Hello {$mailUser['full_name']},\n\nYour request {$mailUser['request_code']} is completed. Please login to check status and details.",
                    ['related_user_id' => (int) $mailUser['user_id'], 'related_request_id' => $id]
                );
            }
        }
    }
    if (isset($_POST['admin_note'])) {
        if (!can('manage_requests')) exit('Access denied');
        db()->prepare('INSERT INTO admin_notes (request_id,admin_id,note) VALUES (?,?,?)')->execute([$id, $admin['id'], $_POST['admin_note']]);
        audit_log((int) $admin['id'], null, 'request_note_added', 'Request ' . $id);
    }
    if (isset($_POST['assign_request'])) {
        if (!can('manage_requests')) exit('Access denied');
        db()->prepare('UPDATE service_requests SET assigned_admin_id=?, quoted_amount=? WHERE id=?')->execute([(int) ($_POST['assigned_admin_id'] ?? 0) ?: null, $_POST['quoted_amount'] !== '' ? (float) $_POST['quoted_amount'] : null, $id]);
        audit_log((int) $admin['id'], null, 'request_assignment_update', 'Request ' . $id);
    }
    if (isset($_POST['document_id'])) {
        if (!can('manage_requests')) exit('Access denied');
        db()->prepare('UPDATE documents SET status=?, admin_note=? WHERE id=?')->execute([$_POST['document_status'] ?? 'Received', $_POST['document_note'] ?? '', (int) $_POST['document_id']]);
        audit_log((int) $admin['id'], null, 'document_status_update', 'Document ' . (int) $_POST['document_id']);
    }
    if (isset($_POST['verify_payment'])) {
        if (!can('verify_payments')) exit('Access denied');
        $paymentId = (int) $_POST['verify_payment'];
        db()->prepare('UPDATE payments SET status=?, admin_note=? WHERE id=?')->execute(['Payment received', $_POST['payment_note'] ?? '', $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, admin_note=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment received', $_POST['payment_note'] ?? '', $paymentId]);
        audit_log((int) $admin['id'], null, 'manual_payment_verified', 'Payment ' . $paymentId);
    }
    if (isset($_POST['reject_payment'])) {
        if (!can('verify_payments')) exit('Access denied');
        $paymentId = (int) $_POST['reject_payment'];
        db()->prepare('UPDATE payments SET status=?, admin_note=? WHERE id=?')->execute(['Payment rejected', $_POST['reject_note'] ?? 'Screenshot unclear', $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, admin_note=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment rejected', $_POST['reject_note'] ?? 'Screenshot unclear', $paymentId]);
        audit_log((int) $admin['id'], null, 'manual_payment_rejected', 'Payment ' . $paymentId);
    }
}
$stmt = db()->prepare('SELECT sr.*,u.full_name,u.phone,u.email,u.tax_help_id, au.full_name assigned_name FROM service_requests sr JOIN users u ON u.id=sr.user_id LEFT JOIN admin_users au ON au.id=sr.assigned_admin_id WHERE sr.id=?');
$stmt->execute([$id]);
$request = $stmt->fetch();
if (!$request) { http_response_code(404); exit('Request not found'); }
$hasDocumentLabel = admin_db_column_exists('documents', 'document_label');
$hasUploadedAt = admin_db_column_exists('documents', 'uploaded_at');
$labelSelect = $hasDocumentLabel ? 'document_label' : 'document_type';
$uploadedSelect = $hasUploadedAt ? 'uploaded_at' : 'created_at';
$docs = db()->prepare("SELECT *, {$labelSelect} AS display_label, {$uploadedSelect} AS display_uploaded_at FROM documents WHERE request_id=? ORDER BY display_label ASC, created_at DESC");
$docs->execute([$id]);
$payments = db()->prepare('SELECT p.*, mps.id screenshot_id, mps.original_name screenshot_name, mps.status screenshot_status FROM payments p LEFT JOIN manual_payment_screenshots mps ON mps.payment_id=p.id WHERE p.request_id=? ORDER BY p.created_at DESC');
$payments->execute([$id]);
$updates = db()->prepare('SELECT * FROM status_updates WHERE request_id=? ORDER BY created_at ASC');
$updates->execute([$id]);
$notes = db()->prepare('SELECT an.*, au.full_name admin_name FROM admin_notes an LEFT JOIN admin_users au ON au.id=an.admin_id WHERE an.request_id=? ORDER BY an.created_at DESC');
$notes->execute([$id]);
$staff = db()->query("SELECT id, full_name, role FROM admin_users WHERE active=1 AND role IN ('super_admin','admin','staff','accountant') ORDER BY full_name")->fetchAll();
admin_header('Request ' . $request['request_code']);
$wa = admin_whatsapp_url($request['phone'], 'Hello ' . $request['full_name'] . ', update for Request ID ' . $request['request_code']);
?>
<div class="grid two">
  <div class="card">
    <h2><?= e($request['service_type']) ?></h2>
    <p>Status: <?= status_badge($request['status']) ?></p>
    <p>User: <?= e($request['full_name']) ?> · <?= e($request['tax_help_id']) ?></p>
    <p>Phone: <?= e($request['phone']) ?> · Email: <?= e($request['email']) ?></p>
    <p>Assigned: <strong><?= e($request['assigned_name'] ?? 'Unassigned') ?></strong></p>
    <p>Quoted amount: <strong><?= e($request['quoted_amount'] ?? '') ?></strong></p>
    <p><a class="btn" target="_blank" href="<?= e($wa) ?>">Open WhatsApp</a></p>
  </div>
  <div class="card">
    <form method="post">
      <?= csrf_field() ?>
      <label>Status<br>
        <select name="status" style="width:100%;padding:12px;border-radius:12px;border:1px solid #ddd">
          <?php foreach (['Request received','Documents pending','Documents received','Payment pending','Payment verification pending','Payment received','Under review','More details required','Filing in progress','Completed','Closed'] as $status): ?>
            <option <?= $status === $request['status'] ? 'selected' : '' ?>><?= e($status) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <p><textarea name="note" placeholder="Visible note" style="width:100%;min-height:80px;padding:12px;border-radius:12px;border:1px solid #ddd"></textarea></p>
      <button class="btn">Update status</button>
    </form>
  </div>
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2>Assignment and fee</h2>
    <label class="field"><span>Assigned staff</span><select name="assigned_admin_id"><option value="">Unassigned</option><?php foreach ($staff as $person): ?><option value="<?= e($person['id']) ?>" <?= (int)($request['assigned_admin_id'] ?? 0) === (int)$person['id'] ? 'selected' : '' ?>><?= e($person['full_name'] . ' · ' . $person['role']) ?></option><?php endforeach; ?></select></label>
    <label class="field"><span>Quoted amount</span><input name="quoted_amount" type="number" step="0.01" value="<?= e($request['quoted_amount'] ?? '') ?>"></label>
    <button class="btn" name="assign_request" value="1">Save assignment</button>
  </form>
</div>
<h2>Documents</h2>
<div class="table-wrap"><table><tr><th>Document slot</th><th>Name</th><th>Status</th><th>Size</th><th>Uploaded</th><th>Action</th></tr>
<?php foreach ($docs as $doc): ?>
  <tr><td><strong><?= e($doc['display_label'] ?? $doc['document_type']) ?></strong><br><span class="muted"><?= e($doc['document_type']) ?></span></td><td><?= e($doc['original_name']) ?></td><td><?= status_badge($doc['status'] ?? 'Received') ?><br><span class="muted"><?= e($doc['admin_note'] ?? '') ?></span></td><td><?= e((string)$doc['size']) ?></td><td><?= e($doc['display_uploaded_at'] ?? $doc['created_at']) ?></td><td><div class="actions"><?php if (can('download_documents')): ?><a class="btn small" href="download.php?id=<?= e($doc['id']) ?>">Download</a><?php endif; ?><form method="post"><?= csrf_field() ?><input type="hidden" name="document_id" value="<?= e($doc['id']) ?>"><select name="document_status"><?= admin_select_options(['Received','Needs clarification','Rejected'], $doc['status'] ?? 'Received') ?></select><input name="document_note" placeholder="Note" value="<?= e($doc['admin_note'] ?? '') ?>"><button class="btn small light">Save</button></form></div></td></tr>
<?php endforeach; ?>
</table></div>
<h2>Payments</h2>
<div class="table-wrap"><table><tr><th>ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Manual screenshot</th><th>Action</th></tr>
<?php foreach ($payments as $pay): ?>
  <tr>
    <td><?= e($pay['id']) ?></td>
    <td><?= e($pay['amount']) ?></td>
    <td><?= e($pay['method']) ?></td>
    <td><?= e($pay['status']) ?></td>
    <td><?php if (!empty($pay['screenshot_id'])): ?><a href="download_payment.php?id=<?= e($pay['screenshot_id']) ?>"><?= e($pay['screenshot_name'] ?? 'Download screenshot') ?></a><?php endif; ?></td>
    <td>
      <?php if ($pay['method'] === 'manual' && can('verify_payments')): ?>
        <form method="post" class="actions"><?= csrf_field() ?><input name="payment_note" placeholder="Note"><button class="btn small" name="verify_payment" value="<?= e($pay['id']) ?>">Verify</button><button class="btn small danger" name="reject_payment" value="<?= e($pay['id']) ?>">Reject</button><input type="hidden" name="reject_note" value="Screenshot unclear"></form>
      <?php endif; ?>
    </td>
  </tr>
<?php endforeach; ?>
</table></div>
<div class="grid two" style="margin-top:18px">
  <div class="card">
    <h2>Status timeline</h2>
    <?php foreach ($updates as $update): ?>
      <p><?= status_badge($update['status']) ?><br><span class="muted"><?= e($update['note']) ?> · <?= e($update['created_at']) ?></span></p>
    <?php endforeach; ?>
  </div>
  <div class="card">
    <h2>Admin notes</h2>
    <form method="post"><?= csrf_field() ?><textarea name="admin_note" required style="width:100%;min-height:90px;padding:12px;border-radius:12px;border:1px solid #ddd"></textarea><br><br><button class="btn">Add note</button></form>
    <?php foreach ($notes as $note): ?>
      <p><strong><?= e($note['admin_name'] ?? 'Admin') ?></strong><br><?= e($note['note']) ?><br><span class="muted"><?= e($note['created_at']) ?></span></p>
    <?php endforeach; ?>
  </div>
</div>
<?php admin_footer(); ?>
