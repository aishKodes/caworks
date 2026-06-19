<?php
require_once __DIR__ . '/_bootstrap.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE email=? LIMIT 1');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_id'] = (int) $admin['id'];
        header('Location: index.php');
        exit;
    }
    $error = 'Invalid login.';
}
admin_header('Admin Login');
?>
<div class="card" style="max-width:420px">
  <?php if ($error): ?><p style="color:#a41624"><?= e($error) ?></p><?php endif; ?>
  <form method="post">
    <p><label>Email<br><input name="email" type="email" required style="width:100%;padding:12px;border-radius:12px;border:1px solid #ddd"></label></p>
    <p><label>Password<br><input name="password" type="password" required style="width:100%;padding:12px;border-radius:12px;border:1px solid #ddd"></label></p>
    <button class="btn">Login</button>
  </form>
</div>
<?php admin_footer(); ?>
