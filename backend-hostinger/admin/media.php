<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('manage_media');
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    try {
        if (isset($_POST['delete_id'])) {
            $id = (int) $_POST['delete_id'];
            $stmt = db()->prepare('SELECT * FROM media_library WHERE id=?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row && is_file($row['path'])) {
                @unlink($row['path']);
            }
            db()->prepare('DELETE FROM media_library WHERE id=?')->execute([$id]);
            audit_log((int) $admin['id'], null, 'media_deleted', 'Media ID ' . $id);
            $message = 'Media deleted.';
        } else {
            $info = save_media_file($_FILES['file'] ?? [], 'site');
            $stmt = db()->prepare('INSERT INTO media_library (original_name, stored_name, mime_type, size, path, public_url, alt_text, title, caption, usage_key) VALUES (?,?,?,?,?,?,?,?,?,?)');
            $stmt->execute([$info['original_name'], $info['stored_name'], $info['mime_type'], $info['size'], $info['path'], $info['public_url'], $_POST['alt_text'] ?? '', $_POST['title'] ?? '', $_POST['caption'] ?? '', $_POST['usage_key'] ?? '']);
            audit_log((int) $admin['id'], null, 'media_uploaded', 'Media uploaded: ' . $info['original_name']);
            $message = 'Media uploaded.';
        }
    } catch (Throwable $e) {
        $message = 'Upload failed: ' . $e->getMessage();
    }
}
$rows = db()->query('SELECT * FROM media_library ORDER BY created_at DESC LIMIT 200')->fetchAll();
admin_header('Media Library');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<form method="post" enctype="multipart/form-data" class="card">
  <?= csrf_field() ?>
  <h2>Upload image</h2>
  <p class="muted">Public website media is stored separately from private customer documents.</p>
  <label class="field"><span>Image file</span><input type="file" name="file" required accept=".jpg,.jpeg,.png,.webp,.svg,image/*"></label>
  <label class="field"><span>Title</span><input name="title" placeholder="Homepage hero, blog thumbnail"></label>
  <label class="field"><span>Alt text</span><input name="alt_text" placeholder="Hero image, logo, office photo"></label>
  <label class="field"><span>Caption</span><input name="caption" placeholder="Optional caption"></label>
  <label class="field"><span>Usage key</span><input name="usage_key" placeholder="hero, logo, blog, service-salary"></label>
  <button class="btn">Upload media</button>
</form>
<h2>Uploaded media</h2>
<table>
  <tr><th>Preview</th><th>Name</th><th>Usage</th><th>Public URL</th><th>Action</th><th>Date</th></tr>
  <?php foreach ($rows as $row): ?>
    <tr>
      <td><img class="thumb" src="<?= e($row['public_url']) ?>" alt=""></td>
      <td><?= e($row['original_name']) ?><br><span class="muted"><?= e($row['title'] ?? '') ?> · <?= e($row['mime_type']) ?> · <?= e((string)$row['size']) ?> bytes</span></td>
      <td><?= e($row['usage_key']) ?></td>
      <td><input readonly value="<?= e($row['public_url']) ?>" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:10px"></td>
      <td><form method="post" onsubmit="return confirm('Delete this media file?')"><?= csrf_field() ?><button class="btn small danger" name="delete_id" value="<?= e($row['id']) ?>">Delete</button></form></td>
      <td><?= e($row['created_at']) ?></td>
    </tr>
  <?php endforeach; ?>
</table>
<?php admin_footer(); ?>
