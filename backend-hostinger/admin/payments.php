<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_payments');
$message = '';
$q = trim((string) ($_GET['q'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    if (!can('verify_payments')) {
        http_response_code(403);
        exit('Access denied');
    }
    $paymentId = (int) ($_POST['payment_id'] ?? 0);
    $action = (string) ($_POST['action'] ?? '');
    $note = trim((string) ($_POST['admin_note'] ?? ''));
    if ($action === 'verify') {
        db()->prepare('UPDATE payments SET status=?, admin_note=?, updated_at=NOW() WHERE id=?')->execute(['Payment received', $note, $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, admin_note=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment received', $note, $paymentId]);
        audit_log((int) $admin['id'], null, 'manual_payment_verified', 'Payment ' . $paymentId);
        $message = 'Payment marked received.';
    } elseif ($action === 'reject') {
        db()->prepare('UPDATE payments SET status=?, admin_note=?, updated_at=NOW() WHERE id=?')->execute(['Payment rejected', $note ?: 'Screenshot unclear', $paymentId]);
        db()->prepare('UPDATE manual_payment_screenshots SET status=?, admin_note=?, verified_at=NOW() WHERE payment_id=?')->execute(['Payment rejected', $note ?: 'Screenshot unclear', $paymentId]);
        audit_log((int) $admin['id'], null, 'manual_payment_rejected', 'Payment ' . $paymentId);
        $message = 'Payment rejected.';
    }
}

$where = [];
$params = [];
if ($q !== '') {
    $where[] = '(CAST(p.id AS CHAR) LIKE ? OR sr.request_code LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.tax_help_id LIKE ? OR p.razorpay_payment_id LIKE ?)';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like, $like, $like];
}
if ($status !== '') {
    $where[] = 'p.status = ?';
    $params[] = $status;
}
$sql = 'SELECT p.*, sr.request_code, sr.service_type, u.full_name, u.phone, u.tax_help_id, mps.id screenshot_id, mps.original_name screenshot_name, mps.status screenshot_status FROM payments p JOIN service_requests sr ON sr.id=p.request_id JOIN users u ON u.id=p.user_id LEFT JOIN manual_payment_screenshots mps ON mps.payment_id=p.id';
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY p.created_at DESC LIMIT 300';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Payments');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<form class="toolbar">
  <label class="field"><span>Search</span><input name="q" value="<?= e($q) ?>" placeholder="Payment ID, request, phone, Tax Help ID"></label>
  <label class="field"><span>Status</span><select name="status"><option value="">All</option><?= admin_select_options(['Payment pending','Payment verification pending','Payment received','Payment rejected'], $status) ?></select></label>
  <button class="btn">Filter</button>
</form>
<div class="table-wrap">
  <table>
    <tr><th>Payment</th><th>User</th><th>Request</th><th>Status</th><th>Screenshot</th><th>Action</th></tr>
    <?php foreach ($rows as $row): ?>
      <tr>
        <td>#<?= e($row['id']) ?><br><strong>₹<?= e($row['amount']) ?></strong><br><span class="muted"><?= e($row['method']) ?> · <?= e($row['created_at']) ?></span></td>
        <td><?= e($row['full_name']) ?><br><span class="muted"><?= e($row['tax_help_id']) ?> · <?= e($row['phone']) ?></span></td>
        <td><a href="request.php?id=<?= e($row['request_id']) ?>"><?= e($row['request_code']) ?></a><br><span class="muted"><?= e($row['service_type']) ?></span></td>
        <td><?= status_badge($row['status']) ?><br><span class="muted"><?= e($row['admin_note'] ?? '') ?></span></td>
        <td><?php if (!empty($row['screenshot_id'])): ?><a href="download_payment.php?id=<?= e($row['screenshot_id']) ?>"><?= e($row['screenshot_name'] ?? 'Download screenshot') ?></a><?php endif; ?></td>
        <td>
          <?php if (can('verify_payments') && $row['method'] === 'manual'): ?>
            <form method="post" class="actions">
              <?= csrf_field() ?>
              <input type="hidden" name="payment_id" value="<?= e($row['id']) ?>">
              <input name="admin_note" placeholder="Optional note">
              <button class="btn small" name="action" value="verify">Verify</button>
              <button class="btn small danger" name="action" value="reject">Reject</button>
            </form>
          <?php else: ?>
            <span class="muted">No action</span>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer(); ?>
