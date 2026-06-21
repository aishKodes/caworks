<?php
require_once __DIR__ . '/_bootstrap.php';

$config = app_config();
$installerSecret = (string) ($config['INSTALLER_SECRET'] ?? $config['installer_secret'] ?? '');
$adminCount = admin_count('SELECT COUNT(*) c FROM admin_users');
$completed = false;
$error = '';

if ($adminCount > 0) {
    admin_header('Admin setup');
    echo '<div class="card"><h2>Admin setup is already completed.</h2><p class="muted">For security, this setup page cannot create another admin after the first admin exists.</p><p><a class="btn" href="login.php">Go to admin login</a></p></div>';
    admin_footer();
    exit;
}

if ($installerSecret === '' || str_contains($installerSecret, 'change-this')) {
    admin_header('Admin setup');
    echo '<div class="card"><h2>Installer secret missing</h2><p class="muted">Add <code>INSTALLER_SECRET</code> to <code>config.php</code> before opening this setup page.</p></div>';
    admin_footer();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    rate_limit('admin_setup_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 600);
    $name = trim((string) ($_POST['full_name'] ?? ''));
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm_password'] ?? '');
    $secret = (string) ($_POST['installer_secret'] ?? '');

    if (!hash_equals($installerSecret, $secret)) {
        $error = 'Installer secret is not correct.';
        audit_log(null, null, 'admin_setup_failed', 'Invalid installer secret for ' . $email);
    } elseif ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Enter a valid name and email.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } elseif ($message = strong_password_message($password)) {
        $error = $message;
    } else {
        $stmt = db()->prepare('INSERT INTO admin_users (email, password_hash, full_name, role, active, force_password_change) VALUES (?, ?, ?, ?, 1, 0)');
        $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name, 'super_admin']);
        $adminId = (int) db()->lastInsertId();
        try {
            cms_upsert_setting('setup_completed', '1', 'boolean', 'system');
        } catch (Throwable $ignored) {
        }
        audit_log($adminId, null, 'admin_setup_completed', 'First super admin created.');
        $completed = true;
    }
}

admin_header('Create first admin');
if ($completed): ?>
  <div class="card">
    <h2>First admin created successfully.</h2>
    <p class="notice">For security, delete or disable <code>admin/setup.php</code> now.</p>
    <p><a class="btn" href="login.php">Go to admin login</a></p>
  </div>
<?php else: ?>
  <?php if ($error): ?><div class="notice"><?= e($error) ?></div><?php endif; ?>
  <form method="post" class="card" style="max-width:560px">
    <?= csrf_field() ?>
    <p class="muted">Create the first <strong>super admin</strong>. This page automatically blocks itself after an admin exists.</p>
    <label class="field"><span>Admin name</span><input name="full_name" required value="<?= e($_POST['full_name'] ?? '') ?>"></label>
    <label class="field"><span>Admin email</span><input name="email" type="email" required value="<?= e($_POST['email'] ?? '') ?>"></label>
    <label class="field"><span>Password</span><input name="password" type="password" minlength="10" required></label>
    <label class="field"><span>Confirm password</span><input name="confirm_password" type="password" minlength="10" required></label>
    <label class="field"><span>Installer secret</span><input name="installer_secret" type="password" required></label>
    <button class="btn">Create super admin</button>
  </form>
<?php endif;
admin_footer();
