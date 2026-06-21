<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('view_audit_logs');

$action = trim((string) ($_GET['action'] ?? ''));
$adminId = (int) ($_GET['admin_id'] ?? 0);
$params = [];
$where = [];
if ($action !== '') {
    $where[] = 'al.action LIKE ?';
    $params[] = '%' . $action . '%';
}
if ($adminId > 0) {
    $where[] = 'al.admin_id = ?';
    $params[] = $adminId;
}
$sql = 'SELECT al.*, au.full_name admin_name, au.email admin_email FROM audit_logs al LEFT JOIN admin_users au ON au.id=al.admin_id';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY al.created_at DESC LIMIT 500';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Audit Logs');
?>
<form class="toolbar">
  <label class="field"><span>Action contains</span><input name="action" value="<?= e($action) ?>" placeholder="login, payment, staff"></label>
  <label class="field"><span>Admin ID</span><input name="admin_id" value="<?= $adminId ?: '' ?>" placeholder="Optional"></label>
  <button class="btn">Filter</button>
</form>
<div class="table-wrap">
  <table>
    <tr><th>Time</th><th>Action</th><th>Admin</th><th>User ID</th><th>IP</th><th>Details</th></tr>
    <?php foreach ($rows as $row): ?>
      <tr>
        <td><?= e($row['created_at']) ?></td>
        <td><?= status_badge($row['action']) ?></td>
        <td><?= e($row['admin_name'] ?: $row['admin_id']) ?><br><span class="muted"><?= e($row['admin_email'] ?? '') ?></span></td>
        <td><?= e($row['user_id']) ?></td>
        <td><?= e($row['ip_address']) ?></td>
        <td><?= e($row['details']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer(); ?>
