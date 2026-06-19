<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_admin_page();
$id = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['status'])) {
        db()->prepare('UPDATE service_requests SET status=? WHERE id=?')->execute([$_POST['status'], $id]);
        db()->prepare('INSERT INTO status_updates (request_id,status,note,visible_to_user) VALUES (?,?,?,1)')->execute([$id, $_POST['status'], $_POST['note'] ?? '']);
    }
    if (isset($_POST['admin_note'])) {
        db()->prepare('INSERT INTO admin_notes (request_id,admin_id,note) VALUES (?,?,?)')->execute([$id, $admin['id'], $_POST['admin_note']]);
    }
    if (isset($_POST['verify_payment'])) {
        $paymentId = (int) $_POST['verify_payment'];
        db()->prepare('UPDATE payments SET status=? WHERE id=?')->execute(['Payment received', $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment received', $paymentId]);
    }
    if (isset($_POST['reject_payment'])) {
        $paymentId = (int) $_POST['reject_payment'];
        db()->prepare('UPDATE payments SET status=? WHERE id=?')->execute(['Payment rejected', $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, admin_note=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment rejected', $_POST['reject_note'] ?? 'Screenshot unclear', $paymentId]);
    }
}
$stmt = db()->prepare('SELECT sr.*,u.full_name,u.phone,u.email,u.tax_help_id FROM service_requests sr JOIN users u ON u.id=sr.user_id WHERE sr.id=?');
$stmt->execute([$id]);
$request = $stmt->fetch();
if (!$request) { http_response_code(404); exit('Request not found'); }
$docs = db()->prepare('SELECT * FROM documents WHERE request_id=? ORDER BY created_at DESC');
$docs->execute([$id]);
$payments = db()->prepare('SELECT p.*, mps.id screenshot_id, mps.original_name screenshot_name, mps.status screenshot_status FROM payments p LEFT JOIN manual_payment_screenshots mps ON mps.payment_id=p.id WHERE p.request_id=? ORDER BY p.created_at DESC');
$payments->execute([$id]);
admin_header('Request ' . $request['request_code']);
$wa = 'https://wa.me/' . preg_replace('/\D/', '', $request['phone']) . '?text=' . urlencode('Hello ' . $request['full_name'] . ', update for Request ID ' . $request['request_code']);
?>
<div class="grid" style="grid-template-columns:1fr 1fr">
  <div class="card">
    <h2><?= e($request['service_type']) ?></h2>
    <p>Status: <strong><?= e($request['status']) ?></strong></p>
    <p>User: <?= e($request['full_name']) ?> · <?= e($request['tax_help_id']) ?></p>
    <p>Phone: <?= e($request['phone']) ?> · Email: <?= e($request['email']) ?></p>
    <p><a class="btn" target="_blank" href="<?= e($wa) ?>">Open WhatsApp</a></p>
  </div>
  <div class="card">
    <form method="post">
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
</div>
<h2>Documents</h2>
<table><tr><th>Type</th><th>Name</th><th>Size</th><th>Download</th></tr>
<?php foreach ($docs as $doc): ?>
  <tr><td><?= e($doc['document_type']) ?></td><td><?= e($doc['original_name']) ?></td><td><?= e((string)$doc['size']) ?></td><td><a href="download.php?id=<?= e($doc['id']) ?>">Download</a></td></tr>
<?php endforeach; ?>
</table>
<h2>Payments</h2>
<table><tr><th>ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Manual screenshot</th><th>Action</th></tr>
<?php foreach ($payments as $pay): ?>
  <tr>
    <td><?= e($pay['id']) ?></td>
    <td><?= e($pay['amount']) ?></td>
    <td><?= e($pay['method']) ?></td>
    <td><?= e($pay['status']) ?></td>
    <td><?= e($pay['screenshot_name'] ?? '') ?></td>
    <td>
      <?php if ($pay['method'] === 'manual'): ?>
        <form method="post" style="display:inline"><button class="btn" name="verify_payment" value="<?= e($pay['id']) ?>">Verify</button></form>
        <form method="post" style="display:inline"><input type="hidden" name="reject_note" value="Screenshot unclear"><button class="btn" style="background:#555" name="reject_payment" value="<?= e($pay['id']) ?>">Reject</button></form>
      <?php endif; ?>
    </td>
  </tr>
<?php endforeach; ?>
</table>
<h2>Admin note</h2>
<form method="post" class="card"><textarea name="admin_note" required style="width:100%;min-height:90px;padding:12px;border-radius:12px;border:1px solid #ddd"></textarea><br><br><button class="btn">Add note</button></form>
<?php admin_footer(); ?>
