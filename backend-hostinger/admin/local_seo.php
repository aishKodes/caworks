<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
$editId = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id > 0) {
        $stmt = db()->prepare('UPDATE local_seo_pages SET city=?, slug=?, title=?, body_content=?, meta_title=?, meta_description=?, image_path=?, active=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$_POST['city'] ?? '', $_POST['slug'] ?? '', $_POST['title'] ?? '', $_POST['body_content'] ?? '', $_POST['meta_title'] ?? '', $_POST['meta_description'] ?? '', $_POST['image_path'] ?? '', isset($_POST['active']) ? 1 : 0, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO local_seo_pages (city,slug,title,body_content,meta_title,meta_description,image_path,active) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$_POST['city'] ?? '', $_POST['slug'] ?? '', $_POST['title'] ?? '', $_POST['body_content'] ?? '', $_POST['meta_title'] ?? '', $_POST['meta_description'] ?? '', $_POST['image_path'] ?? '', isset($_POST['active']) ? 1 : 0]);
    }
    $message = 'Local SEO page saved.';
}
$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM local_seo_pages WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT id,city,slug,title,active FROM local_seo_pages ORDER BY city, slug')->fetchAll();
admin_header('Local SEO Pages');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <h2><?= $edit ? 'Edit local page' : 'Add local page' ?></h2>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <label class="field"><span>City</span><input name="city" required value="<?= e($edit['city'] ?? '') ?>"></label>
    <label class="field"><span>Slug</span><input name="slug" required value="<?= e($edit['slug'] ?? '') ?>"></label>
    <label class="field"><span>Title</span><input name="title" required value="<?= e($edit['title'] ?? '') ?>"></label>
    <label class="field"><span>Body content</span><textarea name="body_content" style="min-height:220px"><?= e($edit['body_content'] ?? '') ?></textarea></label>
    <label class="field"><span>Meta title</span><input name="meta_title" value="<?= e($edit['meta_title'] ?? '') ?>"></label>
    <label class="field"><span>Meta description</span><textarea name="meta_description"><?= e($edit['meta_description'] ?? '') ?></textarea></label>
    <label class="field"><span>Image path/URL</span><input name="image_path" value="<?= e($edit['image_path'] ?? '') ?>"></label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int)$edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <button class="btn">Save local page</button>
  </form>
  <div class="card">
    <h2>Pages</h2>
    <table><tr><th>City</th><th>Slug</th><th>Active</th><th>Edit</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['city']) ?></td><td><?= e($row['slug']) ?></td><td><?= (int)$row['active'] ? 'Yes' : 'No' ?></td><td><a href="?id=<?= e($row['id']) ?>">Edit</a></td></tr>
      <?php endforeach; ?>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
