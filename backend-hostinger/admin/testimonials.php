<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_homepage');
$message = '';
$editId = (int) ($_GET['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    if (isset($_POST['delete_id'])) {
        db()->prepare('DELETE FROM testimonials WHERE id=?')->execute([(int) $_POST['delete_id']]);
        audit_log((int) current_admin()['id'], null, 'testimonial_deleted', 'Testimonial ' . (int) $_POST['delete_id']);
        cms_revalidate_paths(['/']);
        $message = 'Testimonial deleted.';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        $params = [$_POST['name'] ?? '', $_POST['context'] ?? '', $_POST['quote'] ?? '', $_POST['avatar_image'] ?? '', $_POST['rating'] !== '' ? (int) $_POST['rating'] : null, (int) ($_POST['sort_order'] ?? 0), isset($_POST['active']) ? 1 : 0];
        if ($id > 0) {
            $stmt = db()->prepare('UPDATE testimonials SET name=?, context=?, quote=?, avatar_image=?, rating=?, sort_order=?, active=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([...$params, $id]);
        } else {
            $stmt = db()->prepare('INSERT INTO testimonials (name, context, quote, avatar_image, rating, sort_order, active) VALUES (?,?,?,?,?,?,?)');
            $stmt->execute($params);
        }
        audit_log((int) current_admin()['id'], null, 'testimonial_saved', 'Testimonial saved.');
        cms_revalidate_paths(['/']);
        $message = 'Testimonial saved.';
    }
}

$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM testimonials WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT * FROM testimonials ORDER BY sort_order, id')->fetchAll();
admin_header('Testimonials CMS');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <h2><?= $edit ? 'Edit testimonial' : 'Add testimonial' ?></h2>
    <label class="field"><span>Name</span><input name="name" required value="<?= e($edit['name'] ?? '') ?>"></label>
    <label class="field"><span>Role / context</span><input name="context" value="<?= e($edit['context'] ?? '') ?>"></label>
    <label class="field"><span>Quote</span><textarea name="quote" required><?= e($edit['quote'] ?? '') ?></textarea></label>
    <label class="field"><span>Avatar image</span><input name="avatar_image" value="<?= e($edit['avatar_image'] ?? '') ?>"></label>
    <label class="field"><span>Rating optional</span><input type="number" min="1" max="5" name="rating" value="<?= e($edit['rating'] ?? '') ?>"></label>
    <label class="field"><span>Sort order</span><input type="number" name="sort_order" value="<?= e($edit['sort_order'] ?? '0') ?>"></label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int) $edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <button class="btn">Save testimonial</button>
  </form>
  <div class="card">
    <h2>Testimonials</h2>
    <div class="table-wrap"><table><tr><th>Name</th><th>Quote</th><th>Active</th><th>Action</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['name']) ?><br><span class="muted"><?= e($row['context']) ?></span></td><td><?= e($row['quote']) ?></td><td><?= (int)$row['active'] ? 'Yes' : 'No' ?></td><td><a href="?id=<?= e($row['id']) ?>">Edit</a><form method="post" onsubmit="return confirm('Delete testimonial?')" style="display:inline"><?= csrf_field() ?><button class="btn small danger" name="delete_id" value="<?= e($row['id']) ?>">Delete</button></form></td></tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php admin_footer(); ?>
