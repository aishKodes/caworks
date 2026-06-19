<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
$editId = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id > 0) {
        $stmt = db()->prepare('UPDATE pricing_items SET service_name=?, amount_text=?, note=?, features_json=?, visible_order=?, active=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$_POST['service_name'] ?? '', $_POST['amount_text'] ?? '', $_POST['note'] ?? '', $_POST['features_json'] ?? '[]', (int)($_POST['visible_order'] ?? 0), isset($_POST['active']) ? 1 : 0, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO pricing_items (service_name, amount_text, note, features_json, visible_order, active) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$_POST['service_name'] ?? '', $_POST['amount_text'] ?? '', $_POST['note'] ?? '', $_POST['features_json'] ?? '[]', (int)($_POST['visible_order'] ?? 0), isset($_POST['active']) ? 1 : 0]);
    }
    $message = 'Pricing saved.';
    $editId = $id;
}
$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM pricing_items WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT * FROM pricing_items ORDER BY visible_order ASC, id ASC')->fetchAll();
admin_header('Pricing Management');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <h2><?= $edit ? 'Edit price' : 'Add price' ?></h2>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <label class="field"><span>Service name</span><input name="service_name" required value="<?= e($edit['service_name'] ?? '') ?>"></label>
    <label class="field"><span>Amount text</span><input name="amount_text" required value="<?= e($edit['amount_text'] ?? '') ?>"></label>
    <label class="field"><span>Note / description</span><textarea name="note"><?= e($edit['note'] ?? '') ?></textarea></label>
    <label class="field"><span>Features JSON</span><textarea name="features_json"><?= e($edit['features_json'] ?? '[]') ?></textarea></label>
    <label class="field"><span>Visible order</span><input name="visible_order" type="number" value="<?= e($edit['visible_order'] ?? '0') ?>"></label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int)$edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <button class="btn">Save pricing</button>
  </form>
  <div class="card">
    <h2>Pricing items</h2>
    <table><tr><th>Service</th><th>Amount</th><th>Active</th><th>Edit</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['service_name']) ?></td><td><?= e($row['amount_text']) ?></td><td><?= (int)$row['active'] ? 'Yes' : 'No' ?></td><td><a href="?id=<?= e($row['id']) ?>">Edit</a></td></tr>
      <?php endforeach; ?>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
