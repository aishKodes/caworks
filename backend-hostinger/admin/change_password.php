<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_admin_page();
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $current = (string) ($_POST['current_password'] ?? '');
    $new = (string) ($_POST['new_password'] ?? '');
    $confirm = (string) ($_POST['confirm_password'] ?? '');
    $stmt = db()->prepare('SELECT password_hash FROM admin_users WHERE id=?');
    $stmt->execute([(int) $admin['id']]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($current, $row['password_hash'])) {
        $error = 'Current password is not correct.';
        audit_log((int) $admin['id'], null, 'admin_password_change_failed', 'Wrong current password.');
    } elseif ($new !== $confirm) {
        $error = 'New passwords do not match.';
    } elseif ($msg = strong_password_message($new)) {
        $error = $msg;
    } else {
        db()->prepare('UPDATE admin_users SET password_hash=?, force_password_change=0, updated_at=NOW() WHERE id=?')->execute([password_hash($new, PASSWORD_DEFAULT), (int) $admin['id']]);
        audit_log((int) $admin['id'], null, 'admin_password_changed', 'Password changed.');
        $message = 'Password changed.';
    }
}

admin_header('Change password');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
if ($error) echo '<div class="notice">' . e($error) . '</div>';
?>
<form method="post" class="card" style="max-width:560px">
  <?= csrf_field() ?>
  <label class="field"><span>Current password</span><input type="password" name="current_password" required></label>
  <label class="field"><span>New password</span><input type="password" name="new_password" minlength="10" required></label>
  <label class="field"><span>Confirm new password</span><input type="password" name="confirm_password" minlength="10" required></label>
  <button class="btn">Change password</button>
</form>
<?php admin_footer(); ?>
