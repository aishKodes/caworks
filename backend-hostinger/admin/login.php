<?php
require_once __DIR__ . '/_bootstrap.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    rate_limit('admin_page_login_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 8, 300);
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE email=? LIMIT 1');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    if ($admin && (!isset($admin['active']) || (int) $admin['active']) && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_last_activity'] = time();
        db()->prepare('UPDATE admin_users SET last_login_at=NOW(), login_count=COALESCE(login_count,0)+1 WHERE id=?')->execute([(int) $admin['id']]);
        audit_log((int) $admin['id'], null, 'admin_login', 'Admin logged in.');
        header('Location: ' . (!empty($admin['force_password_change']) ? 'change_password.php' : 'index.php'));
        exit;
    }
    audit_log($admin['id'] ?? null, null, 'admin_login_failed', 'Failed login for ' . $email);
    $error = 'Invalid login.';
}
admin_header('Admin Login');
?>
<div class="card" style="max-width:420px">
  <?php if (isset($_GET['expired'])): ?><p class="notice">Session expired. Please login again.</p><?php endif; ?>
  <?php if ($error): ?><p style="color:#a41624"><?= e($error) ?></p><?php endif; ?>
  <form method="post">
    <?= csrf_field() ?>
    <label class="field"><span>Email</span><input name="email" type="email" required></label>
    <label class="field"><span>Password</span><input name="password" type="password" required></label>
    <button class="btn">Login</button>
  </form>
  <p class="muted">First time? Open <code>setup.php</code> only if no admin user exists.</p>
</div>
<?php admin_footer(); ?>
