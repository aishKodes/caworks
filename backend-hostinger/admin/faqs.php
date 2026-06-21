<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_services');
$message = '';
$editId = (int) ($_GET['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $pathsToRevalidate = ['/', '/sitemap.xml'];
    if (isset($_POST['delete_id'])) {
        $existing = db()->prepare('SELECT page_key, service_slug FROM faqs WHERE id=?');
        $existing->execute([(int) $_POST['delete_id']]);
        $deleted = $existing->fetch() ?: [];
        db()->prepare('DELETE FROM faqs WHERE id=?')->execute([(int) $_POST['delete_id']]);
        audit_log((int) current_admin()['id'], null, 'faq_deleted', 'FAQ ' . (int) $_POST['delete_id']);
        if (!empty($deleted['service_slug'])) $pathsToRevalidate[] = '/' . $deleted['service_slug'];
        if (($deleted['page_key'] ?? '') === 'pricing') $pathsToRevalidate[] = '/pricing';
        $message = 'FAQ deleted.';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        $params = [$_POST['page_key'] ?? 'global', $_POST['service_slug'] ?? '', $_POST['question'] ?? '', $_POST['answer'] ?? '', (int) ($_POST['sort_order'] ?? 0), isset($_POST['active']) ? 1 : 0];
        if ($id > 0) {
            $stmt = db()->prepare('UPDATE faqs SET page_key=?, service_slug=?, question=?, answer=?, sort_order=?, active=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([...$params, $id]);
        } else {
            $stmt = db()->prepare('INSERT INTO faqs (page_key, service_slug, question, answer, sort_order, active) VALUES (?,?,?,?,?,?)');
            $stmt->execute($params);
        }
        audit_log((int) current_admin()['id'], null, 'faq_saved', 'FAQ saved.');
        if (!empty($_POST['service_slug'])) $pathsToRevalidate[] = '/' . trim((string) $_POST['service_slug']);
        if (($_POST['page_key'] ?? '') === 'pricing') $pathsToRevalidate[] = '/pricing';
        $message = 'FAQ saved.';
    }
    cms_revalidate_paths($pathsToRevalidate);
}

$edit = [];
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM faqs WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: [];
}
$rows = db()->query('SELECT * FROM faqs ORDER BY page_key, service_slug, sort_order, id')->fetchAll();
admin_header('FAQ CMS');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <h2><?= $edit ? 'Edit FAQ' : 'Add FAQ' ?></h2>
    <label class="field"><span>Page key</span><input name="page_key" value="<?= e($edit['page_key'] ?? 'global') ?>" placeholder="global, homepage, pricing"></label>
    <label class="field"><span>Service slug</span><input name="service_slug" value="<?= e($edit['service_slug'] ?? '') ?>" placeholder="salary-itr-filing"></label>
    <label class="field"><span>Question</span><input name="question" required value="<?= e($edit['question'] ?? '') ?>"></label>
    <label class="field"><span>Answer</span><textarea name="answer" required><?= e($edit['answer'] ?? '') ?></textarea></label>
    <label class="field"><span>Sort order</span><input type="number" name="sort_order" value="<?= e($edit['sort_order'] ?? '0') ?>"></label>
    <label><input type="checkbox" name="active" <?= !isset($edit['active']) || (int) $edit['active'] ? 'checked' : '' ?>> Active</label><br><br>
    <button class="btn">Save FAQ</button>
  </form>
  <div class="card">
    <h2>FAQs</h2>
    <div class="table-wrap"><table><tr><th>Question</th><th>Page</th><th>Active</th><th>Action</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['question']) ?></td><td><?= e($row['page_key']) ?><br><span class="muted"><?= e($row['service_slug']) ?></span></td><td><?= (int)$row['active'] ? 'Yes' : 'No' ?></td><td><a href="?id=<?= e($row['id']) ?>">Edit</a><form method="post" onsubmit="return confirm('Delete FAQ?')" style="display:inline"><?= csrf_field() ?><button class="btn small danger" name="delete_id" value="<?= e($row['id']) ?>">Delete</button></form></td></tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php admin_footer(); ?>
