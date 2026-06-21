<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('manage_users');
$message = '';
$q = trim((string) ($_GET['q'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $userId = (int) ($_POST['user_id'] ?? 0);
    if (isset($_POST['reset_password'])) {
        $password = (string) ($_POST['new_password'] ?? '');
        if ($msg = strong_password_message($password)) {
            $message = $msg;
        } else {
            db()->prepare('UPDATE users SET password_hash=?, updated_at=NOW() WHERE id=?')->execute([password_hash($password, PASSWORD_DEFAULT), $userId]);
            audit_log((int) $admin['id'], $userId, 'user_password_reset', 'User password reset manually.');
            $message = 'User password reset.';
        }
    } else {
        db()->prepare('UPDATE users SET active=?, internal_note=?, updated_at=NOW() WHERE id=?')->execute([isset($_POST['active']) ? 1 : 0, trim((string) ($_POST['internal_note'] ?? '')), $userId]);
        audit_log((int) $admin['id'], $userId, 'user_updated', 'User active/note updated.');
        $message = 'User updated.';
    }
}

$where = '';
$params = [];
if ($q !== '') {
    $where = 'WHERE tax_help_id LIKE ? OR full_name LIKE ? OR phone LIKE ? OR email LIKE ?';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like];
}
$stmt = db()->prepare("SELECT id,tax_help_id,full_name,phone,email,active,internal_note,created_at FROM users {$where} ORDER BY created_at DESC LIMIT 300");
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Users');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<form class="toolbar">
  <label class="field"><span>Search</span><input name="q" value="<?= e($q) ?>" placeholder="Name, phone, email, Tax Help ID"></label>
  <button class="btn">Search</button>
</form>
<div class="table-wrap"><table><tr><th>ID</th><th>Tax Help ID</th><th>Name</th><th>Contact</th><th>Status</th><th>WhatsApp</th><th>Admin action</th><th>Date</th></tr>
<?php
foreach ($rows as $row) {
    $wa = admin_whatsapp_url($row['phone'], 'Hello ' . $row['full_name'] . ', your Tax Help ID is ' . $row['tax_help_id'] . '.');
    echo '<tr><td>' . e($row['id']) . '</td><td>' . e($row['tax_help_id']) . '</td><td>' . e($row['full_name']) . '<br><span class="muted">' . e($row['internal_note'] ?? '') . '</span></td><td>' . e($row['phone']) . '<br>' . e($row['email']) . '</td><td>' . ((int) ($row['active'] ?? 1) ? status_badge('Active') : status_badge('Inactive')) . '</td><td><a class="btn small" href="' . e($wa) . '" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></td><td><form method="post">' . csrf_field() . '<input type="hidden" name="user_id" value="' . e($row['id']) . '"><label><input type="checkbox" name="active" ' . ((int) ($row['active'] ?? 1) ? 'checked' : '') . '> Active</label><input name="internal_note" placeholder="Internal note" value="' . e($row['internal_note'] ?? '') . '"><button class="btn small light">Save</button></form><form method="post" style="margin-top:8px">' . csrf_field() . '<input type="hidden" name="user_id" value="' . e($row['id']) . '"><input type="password" name="new_password" placeholder="New password"><button class="btn small danger" name="reset_password" value="1">Reset password</button></form></td><td>' . e($row['created_at']) . '</td></tr>';
}
?>
</table></div>
<?php
admin_footer();
