<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
$editId = (int) ($_GET['id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete_id'])) {
        db()->prepare('DELETE FROM blog_posts_cms WHERE id=?')->execute([(int) $_POST['delete_id']]);
        $message = 'Post deleted.';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        if ($id > 0) {
            $stmt = db()->prepare('UPDATE blog_posts_cms SET slug=?, title=?, summary=?, featured_image=?, content=?, seo_title=?, seo_description=?, published=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([$_POST['slug'] ?? '', $_POST['title'] ?? '', $_POST['summary'] ?? '', $_POST['featured_image'] ?? '', $_POST['content'] ?? '', $_POST['seo_title'] ?? '', $_POST['seo_description'] ?? '', isset($_POST['published']) ? 1 : 0, $id]);
        } else {
            $stmt = db()->prepare('INSERT INTO blog_posts_cms (slug,title,summary,featured_image,content,seo_title,seo_description,published) VALUES (?,?,?,?,?,?,?,?)');
            $stmt->execute([$_POST['slug'] ?? '', $_POST['title'] ?? '', $_POST['summary'] ?? '', $_POST['featured_image'] ?? '', $_POST['content'] ?? '', $_POST['seo_title'] ?? '', $_POST['seo_description'] ?? '', isset($_POST['published']) ? 1 : 0]);
        }
        $message = 'Blog post saved.';
    }
}
$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM blog_posts_cms WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT id,slug,title,published,updated_at FROM blog_posts_cms ORDER BY updated_at DESC LIMIT 200')->fetchAll();
admin_header('Blog CMS');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <h2><?= $edit ? 'Edit post' : 'Create post' ?></h2>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <label class="field"><span>Slug</span><input name="slug" required value="<?= e($edit['slug'] ?? '') ?>"></label>
    <label class="field"><span>Title</span><input name="title" required value="<?= e($edit['title'] ?? '') ?>"></label>
    <label class="field"><span>Summary</span><textarea name="summary"><?= e($edit['summary'] ?? '') ?></textarea></label>
    <label class="field"><span>Featured image path/URL</span><input name="featured_image" value="<?= e($edit['featured_image'] ?? '') ?>"></label>
    <label class="field"><span>Content</span><textarea name="content" style="min-height:240px"><?= e($edit['content'] ?? '') ?></textarea></label>
    <label class="field"><span>SEO title</span><input name="seo_title" value="<?= e($edit['seo_title'] ?? '') ?>"></label>
    <label class="field"><span>SEO description</span><textarea name="seo_description"><?= e($edit['seo_description'] ?? '') ?></textarea></label>
    <label><input type="checkbox" name="published" <?= !empty($edit['published']) ? 'checked' : '' ?>> Published</label><br><br>
    <button class="btn">Save post</button>
  </form>
  <div class="card">
    <h2>Posts</h2>
    <table><tr><th>Title</th><th>Slug</th><th>Published</th><th>Actions</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr>
          <td><?= e($row['title']) ?></td><td><?= e($row['slug']) ?></td><td><?= (int)$row['published'] ? 'Yes' : 'No' ?></td>
          <td><a href="?id=<?= e($row['id']) ?>">Edit</a>
            <form method="post" style="display:inline" onsubmit="return confirm('Delete this post?')"><button class="btn secondary" name="delete_id" value="<?= e($row['id']) ?>">Delete</button></form>
          </td>
        </tr>
      <?php endforeach; ?>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
