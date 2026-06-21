<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('manage_services');
require_post_csrf();

$message = '';
$services = db()->query('SELECT slug, title FROM service_page_content WHERE is_active=1 ORDER BY sort_order ASC, title ASC')->fetchAll();
if (!$services) {
    $services = [
        ['slug' => 'salary-itr-filing', 'title' => 'Salary ITR Filing'],
        ['slug' => 'gst-return-filing', 'title' => 'GST Return Filing'],
        ['slug' => 'tax-notice-help', 'title' => 'Tax Notice Help'],
        ['slug' => 'loan-project-report', 'title' => 'Loan Project Report'],
    ];
}
$serviceSlug = trim((string) ($_GET['service'] ?? ($_POST['service_slug'] ?? ($services[0]['slug'] ?? 'salary-itr-filing'))));
$editId = (int) ($_GET['edit'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['deactivate_id'])) {
        db()->prepare('UPDATE service_document_requirements SET active=0, updated_at=NOW() WHERE id=?')->execute([(int) $_POST['deactivate_id']]);
        audit_log((int) $admin['id'], null, 'document_requirement_deactivated', 'Document requirement ' . (int) $_POST['deactivate_id']);
        $message = 'Checklist item deactivated.';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        $slug = trim((string) ($_POST['service_slug'] ?? $serviceSlug));
        $title = trim((string) ($_POST['title'] ?? ''));
        $documentKey = trim((string) ($_POST['document_key'] ?? ''));
        if ($title === '' || $documentKey === '') {
            $message = 'Title and document key are required.';
        } elseif ($id > 0) {
            $stmt = db()->prepare('UPDATE service_document_requirements SET service_slug=?, document_key=?, title=?, description=?, required=?, allow_multiple=?, sort_order=?, active=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([
                $slug,
                $documentKey,
                $title,
                trim((string) ($_POST['description'] ?? '')),
                !empty($_POST['required']) ? 1 : 0,
                !empty($_POST['allow_multiple']) ? 1 : 0,
                (int) ($_POST['sort_order'] ?? 0),
                !empty($_POST['active']) ? 1 : 0,
                $id,
            ]);
            audit_log((int) $admin['id'], null, 'document_requirement_updated', $slug . ': ' . $title);
            $message = 'Checklist item updated.';
            $serviceSlug = $slug;
        } else {
            $stmt = db()->prepare('INSERT INTO service_document_requirements (service_slug, document_key, title, description, required, allow_multiple, sort_order, active) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), required=VALUES(required), allow_multiple=VALUES(allow_multiple), sort_order=VALUES(sort_order), active=VALUES(active), updated_at=NOW()');
            $stmt->execute([
                $slug,
                $documentKey,
                $title,
                trim((string) ($_POST['description'] ?? '')),
                !empty($_POST['required']) ? 1 : 0,
                !empty($_POST['allow_multiple']) ? 1 : 0,
                (int) ($_POST['sort_order'] ?? 0),
                !empty($_POST['active']) ? 1 : 0,
            ]);
            audit_log((int) $admin['id'], null, 'document_requirement_created', $slug . ': ' . $title);
            $message = 'Checklist item saved.';
            $serviceSlug = $slug;
        }
    }
}

$stmt = db()->prepare('SELECT * FROM service_document_requirements WHERE service_slug=? ORDER BY sort_order ASC, id ASC');
$stmt->execute([$serviceSlug]);
$rows = $stmt->fetchAll();
$edit = null;
if ($editId > 0) {
    $stmt = db()->prepare('SELECT * FROM service_document_requirements WHERE id=?');
    $stmt->execute([$editId]);
    $edit = $stmt->fetch() ?: null;
}

admin_header('Document Checklists');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<div class="grid two">
  <div class="card">
    <h2>Choose service</h2>
    <form method="get" class="toolbar">
      <label class="field"><span>Service</span><select name="service">
        <?php foreach ($services as $service): ?>
          <option value="<?= e($service['slug']) ?>" <?= $serviceSlug === $service['slug'] ? 'selected' : '' ?>><?= e($service['title']) ?></option>
        <?php endforeach; ?>
        <option value="not-sure" <?= $serviceSlug === 'not-sure' ? 'selected' : '' ?>>Not Sure</option>
      </select></label>
      <button class="btn">Open checklist</button>
    </form>
    <p class="muted">These active checklist items are returned by <code>/api/content/service-document-requirements?service=...</code>.</p>
  </div>
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2><?= $edit ? 'Edit checklist item' : 'Add checklist item' ?></h2>
    <input type="hidden" name="id" value="<?= e($edit['id'] ?? '') ?>">
    <label class="field"><span>Service slug</span><input name="service_slug" required value="<?= e($edit['service_slug'] ?? $serviceSlug) ?>"></label>
    <label class="field"><span>Document key</span><input name="document_key" required placeholder="form_16" value="<?= e($edit['document_key'] ?? '') ?>"></label>
    <label class="field"><span>Title</span><input name="title" required placeholder="Form 16" value="<?= e($edit['title'] ?? '') ?>"></label>
    <label class="field"><span>Description</span><textarea name="description"><?= e($edit['description'] ?? '') ?></textarea></label>
    <div class="grid two">
      <label><input type="checkbox" name="required" value="1" <?= !empty($edit['required']) ? 'checked' : '' ?>> Required</label>
      <label><input type="checkbox" name="allow_multiple" value="1" <?= !empty($edit['allow_multiple']) ? 'checked' : '' ?>> Allow multiple files</label>
      <label><input type="checkbox" name="active" value="1" <?= !$edit || !empty($edit['active']) ? 'checked' : '' ?>> Active</label>
      <label class="field"><span>Sort order</span><input type="number" name="sort_order" value="<?= e((string) ($edit['sort_order'] ?? 0)) ?>"></label>
    </div>
    <button class="btn"><?= $edit ? 'Update item' : 'Save item' ?></button>
  </form>
</div>

<div class="table-wrap" style="margin-top:18px">
  <table>
    <tr><th>Order</th><th>Document</th><th>Rules</th><th>Status</th><th>Actions</th></tr>
    <?php foreach ($rows as $row): ?>
      <tr>
        <td><?= e((string) $row['sort_order']) ?></td>
        <td><strong><?= e($row['title']) ?></strong><br><code><?= e($row['document_key']) ?></code><br><span class="muted"><?= e($row['description']) ?></span></td>
        <td><?= $row['required'] ? status_badge('Required') : status_badge('Optional') ?><br><?= $row['allow_multiple'] ? status_badge('Multiple') : status_badge('Single') ?></td>
        <td><?= $row['active'] ? status_badge('Active') : status_badge('Inactive') ?></td>
        <td class="actions">
          <a class="btn small light" href="?service=<?= e($serviceSlug) ?>&edit=<?= e($row['id']) ?>">Edit</a>
          <?php if ($row['active']): ?>
            <form method="post" onsubmit="return confirm('Deactivate this checklist item?')">
              <?= csrf_field() ?>
              <input type="hidden" name="service_slug" value="<?= e($serviceSlug) ?>">
              <button class="btn small danger" name="deactivate_id" value="<?= e($row['id']) ?>">Deactivate</button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer(); ?>
