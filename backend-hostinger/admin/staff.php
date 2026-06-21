<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('manage_staff');
$message = '';
$error = '';
$editId = (int) ($_GET['id'] ?? 0);

function super_admin_count(): int {
    return admin_count("SELECT COUNT(*) c FROM admin_users WHERE role='super_admin' AND active=1");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $action = (string) ($_POST['action'] ?? 'save');
    $id = (int) ($_POST['id'] ?? 0);
    $name = trim((string) ($_POST['full_name'] ?? ''));
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $role = in_array((string) ($_POST['role'] ?? 'staff'), ADMIN_ROLES, true) ? (string) $_POST['role'] : 'staff';
    $active = isset($_POST['active']) ? 1 : 0;
    $force = isset($_POST['force_password_change']) ? 1 : 0;

    if (($admin['role'] ?? '') !== 'super_admin' && $role === 'super_admin') {
        $error = 'Only a super admin can create or assign a super admin role.';
    } elseif ($action === 'save') {
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Enter a valid name and email.';
        } else {
            if ($id > 0) {
                $stmt = db()->prepare('SELECT role, active FROM admin_users WHERE id=?');
                $stmt->execute([$id]);
                $existing = $stmt->fetch();
                if (!$existing) {
                    $error = 'Staff user not found.';
                } elseif ($existing['role'] === 'super_admin' && (!$active || $role !== 'super_admin') && super_admin_count() <= 1) {
                    $error = 'You cannot deactivate or demote the last super admin.';
                } else {
                    db()->prepare('UPDATE admin_users SET full_name=?, email=?, role=?, active=?, force_password_change=?, updated_at=NOW() WHERE id=?')->execute([$name, $email, $role, $active, $force, $id]);
                    audit_log((int) $admin['id'], null, 'staff_updated', 'Staff ID ' . $id . ' updated.');
                    $message = 'Staff user updated.';
                    $editId = $id;
                }
            } else {
                $password = (string) ($_POST['password'] ?? '');
                if ($msg = strong_password_message($password)) {
                    $error = $msg;
                } else {
                    db()->prepare('INSERT INTO admin_users (email, password_hash, full_name, role, active, force_password_change) VALUES (?, ?, ?, ?, ?, ?)')->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name, $role, $active, 1]);
                    $newId = (int) db()->lastInsertId();
                    audit_log((int) $admin['id'], null, 'staff_created', 'Staff ID ' . $newId . ' created with role ' . $role . '.');
                    $message = 'Staff user created. Ask them to change password after login.';
                }
            }
        }
    } elseif ($action === 'reset_password') {
        $password = (string) ($_POST['new_password'] ?? '');
        if ($msg = strong_password_message($password)) {
            $error = $msg;
        } else {
            db()->prepare('UPDATE admin_users SET password_hash=?, force_password_change=1, updated_at=NOW() WHERE id=?')->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
            audit_log((int) $admin['id'], null, 'staff_password_reset', 'Staff ID ' . $id . ' password reset.');
            $message = 'Password reset. Staff must change it after login.';
            $editId = $id;
        }
    }
}

$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT id, full_name, email, role, active, force_password_change, last_login_at, last_seen_at, login_count, created_at FROM admin_users ORDER BY role, full_name')->fetchAll();

admin_header('Staff Management');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
if ($error) echo '<div class="notice">' . e($error) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <h2><?= $edit ? 'Edit staff user' : 'Create staff user' ?></h2>
    <label class="field"><span>Name</span><input name="full_name" required value="<?= e($edit['full_name'] ?? '') ?>"></label>
    <label class="field"><span>Email</span><input name="email" type="email" required value="<?= e($edit['email'] ?? '') ?>"></label>
    <?php if (!$edit): ?>
      <label class="field"><span>Temporary password</span><input name="password" type="password" minlength="10" required></label>
    <?php endif; ?>
    <label class="field"><span>Role</span>
      <select name="role">
        <?= admin_select_options(ADMIN_ROLES, $edit['role'] ?? 'staff') ?>
      </select>
    </label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int) $edit['active'] ? 'checked' : '' ?>> Active</label><br>
    <label><input type="checkbox" name="force_password_change" <?= !empty($edit['force_password_change']) ? 'checked' : '' ?>> Force password change</label><br><br>
    <button class="btn">Save staff</button>
  </form>

  <div class="card">
    <h2>Role permissions</h2>
    <?php foreach (admin_role_permissions() as $role => $permissions): ?>
      <details style="margin-bottom:10px">
        <summary><strong><?= e($role) ?></strong> · <?= e((string) count($permissions)) ?> permissions</summary>
        <p class="muted"><?= e(implode(', ', $permissions)) ?></p>
      </details>
    <?php endforeach; ?>
    <?php if ($edit): ?>
      <form method="post" class="notice">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="reset_password">
        <input type="hidden" name="id" value="<?= e($edit['id']) ?>">
        <label class="field"><span>New temporary password</span><input name="new_password" type="password" minlength="10" required></label>
        <button class="btn danger">Reset password</button>
      </form>
    <?php endif; ?>
  </div>
</div>

<h2>Staff users</h2>
<div class="table-wrap">
  <table>
    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th>Login count</th><th>Actions</th></tr>
    <?php foreach ($rows as $row): ?>
      <tr>
        <td><?= e($row['full_name']) ?></td>
        <td><?= e($row['email']) ?></td>
        <td><?= status_badge($row['role']) ?></td>
        <td><?= (int) $row['active'] ? status_badge('Active') : status_badge('Inactive') ?> <?= !empty($row['force_password_change']) ? status_badge('Password change required') : '' ?></td>
        <td><?= e($row['last_login_at'] ?? 'Never') ?></td>
        <td><?= e((string) ($row['login_count'] ?? 0)) ?></td>
        <td><a class="btn small light" href="?id=<?= e($row['id']) ?>">Edit</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer(); ?>
