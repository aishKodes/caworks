<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_pricing');
$message = '';
$editId = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    if ($id > 0) {
        $stmt = db()->prepare('UPDATE pricing_items SET service_name=?, amount_text=?, starting_price=?, billing_type=?, note=?, features_json=?, visible_order=?, active=?, show_on_homepage=?, cta_link=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$_POST['service_name'] ?? '', $_POST['amount_text'] ?? '', $_POST['starting_price'] !== '' ? (float) $_POST['starting_price'] : null, $_POST['billing_type'] ?? '', $_POST['note'] ?? '', $_POST['features_json'] ?? '[]', (int)($_POST['visible_order'] ?? 0), isset($_POST['active']) ? 1 : 0, isset($_POST['show_on_homepage']) ? 1 : 0, $_POST['cta_link'] ?? '', $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO pricing_items (service_name, amount_text, starting_price, billing_type, note, features_json, visible_order, active, show_on_homepage, cta_link) VALUES (?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$_POST['service_name'] ?? '', $_POST['amount_text'] ?? '', $_POST['starting_price'] !== '' ? (float) $_POST['starting_price'] : null, $_POST['billing_type'] ?? '', $_POST['note'] ?? '', $_POST['features_json'] ?? '[]', (int)($_POST['visible_order'] ?? 0), isset($_POST['active']) ? 1 : 0, isset($_POST['show_on_homepage']) ? 1 : 0, $_POST['cta_link'] ?? '']);
    }
    audit_log((int) current_admin()['id'], null, 'pricing_saved', 'Pricing item saved: ' . ($_POST['service_name'] ?? ''));
    cms_revalidate_paths(['/pricing', '/', '/sitemap.xml']);
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
    <?= csrf_field() ?>
    <h2><?= $edit ? 'Edit price' : 'Add price' ?></h2>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <label class="field"><span>Service name</span><input name="service_name" required value="<?= e($edit['service_name'] ?? '') ?>"></label>
    <label class="field"><span>Amount text</span><input name="amount_text" required value="<?= e($edit['amount_text'] ?? '') ?>"></label>
    <label class="field"><span>Starting price numeric (optional)</span><input name="starting_price" type="number" step="0.01" value="<?= e($edit['starting_price'] ?? '') ?>"></label>
    <label class="field"><span>Billing type</span><input name="billing_type" placeholder="one_time, monthly, custom" value="<?= e($edit['billing_type'] ?? '') ?>"></label>
    <label class="field"><span>Note / description</span><textarea name="note"><?= e($edit['note'] ?? '') ?></textarea></label>
    <label class="field"><span>Features JSON</span><textarea name="features_json"><?= e($edit['features_json'] ?? '[]') ?></textarea></label>
    <label class="field"><span>Visible order</span><input name="visible_order" type="number" value="<?= e($edit['visible_order'] ?? '0') ?>"></label>
    <label class="field"><span>CTA link</span><input name="cta_link" value="<?= e($edit['cta_link'] ?? '') ?>"></label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int)$edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <label><input type="checkbox" name="show_on_homepage" <?= !empty($edit['show_on_homepage']) ? 'checked' : '' ?>> Show on homepage</label><br><br>
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
