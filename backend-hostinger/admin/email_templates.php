<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_integrations');
$message = '';
$editKey = (string) ($_GET['key'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $key = trim((string) ($_POST['template_key'] ?? ''));
    if ($key !== '') {
        db()->prepare('INSERT INTO email_templates (template_key, subject, body, active) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE subject=VALUES(subject), body=VALUES(body), active=VALUES(active), updated_at=NOW()')
            ->execute([$key, $_POST['subject'] ?? '', $_POST['body'] ?? '', isset($_POST['active']) ? 1 : 0]);
        audit_log((int) current_admin()['id'], null, 'email_template_saved', 'Email template saved: ' . $key);
        $message = 'Email template saved.';
        $editKey = $key;
    }
}

$edit = [];
if ($editKey !== '') {
    $stmt = db()->prepare('SELECT * FROM email_templates WHERE template_key=?');
    $stmt->execute([$editKey]);
    $edit = $stmt->fetch() ?: ['template_key' => $editKey];
}
$rows = db()->query('SELECT template_key, subject, active, updated_at FROM email_templates ORDER BY template_key')->fetchAll();
admin_header('Email Templates');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2><?= $edit ? 'Edit template' : 'Add template' ?></h2>
    <label class="field"><span>Template key</span><input name="template_key" required value="<?= e($edit['template_key'] ?? '') ?>"></label>
    <label class="field"><span>Subject</span><input name="subject" required value="<?= e($edit['subject'] ?? '') ?>"></label>
    <label class="field"><span>Body</span><textarea name="body" style="min-height:220px" required><?= e($edit['body'] ?? '') ?></textarea></label>
    <p class="muted">Useful variables: <code>{name}</code>, <code>{tax_id}</code>, <code>{request_id}</code>, <code>{service_name}</code>.</p>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int)$edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <button class="btn">Save template</button>
  </form>
  <div class="card">
    <h2>Templates</h2>
    <div class="table-wrap"><table><tr><th>Key</th><th>Subject</th><th>Active</th><th>Edit</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['template_key']) ?></td><td><?= e($row['subject']) ?></td><td><?= (int)$row['active'] ? 'Yes' : 'No' ?></td><td><a href="?key=<?= e($row['template_key']) ?>">Edit</a></td></tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php admin_footer(); ?>
