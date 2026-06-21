<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_services');
$message = '';
$editSlug = $_GET['slug'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $stmt = db()->prepare('INSERT INTO service_page_content (slug,title,subtitle,hero_image,sections_json,pricing_text,faqs_json,seo_title,seo_description,is_active,category,short_description,icon,og_image,sort_order,show_in_menu,show_on_homepage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), hero_image=VALUES(hero_image), sections_json=VALUES(sections_json), pricing_text=VALUES(pricing_text), faqs_json=VALUES(faqs_json), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), is_active=VALUES(is_active), category=VALUES(category), short_description=VALUES(short_description), icon=VALUES(icon), og_image=VALUES(og_image), sort_order=VALUES(sort_order), show_in_menu=VALUES(show_in_menu), show_on_homepage=VALUES(show_on_homepage), updated_at=NOW()');
    $stmt->execute([
        $_POST['slug'] ?? '',
        $_POST['title'] ?? '',
        $_POST['subtitle'] ?? '',
        $_POST['hero_image'] ?? '',
        $_POST['sections_json'] ?? '[]',
        $_POST['pricing_text'] ?? '',
        $_POST['faqs_json'] ?? '[]',
        $_POST['seo_title'] ?? '',
        $_POST['seo_description'] ?? '',
        isset($_POST['is_active']) ? 1 : 0,
        $_POST['category'] ?? '',
        $_POST['short_description'] ?? '',
        $_POST['icon'] ?? '',
        $_POST['og_image'] ?? '',
        (int) ($_POST['sort_order'] ?? 0),
        isset($_POST['show_in_menu']) ? 1 : 0,
        isset($_POST['show_on_homepage']) ? 1 : 0,
    ]);
    audit_log((int) current_admin()['id'], null, 'service_content_saved', 'Service ' . ($_POST['slug'] ?? '') . ' saved.');
    $savedSlug = trim((string) ($_POST['slug'] ?? ''));
    cms_revalidate_paths(array_filter(['/' . $savedSlug, '/', '/sitemap.xml']));
    $message = 'Service page content saved.';
    $editSlug = $_POST['slug'] ?? '';
}
$edit = [];
if ($editSlug) {
    $stmt = db()->prepare('SELECT * FROM service_page_content WHERE slug=? LIMIT 1');
    $stmt->execute([$editSlug]);
    $edit = $stmt->fetch() ?: ['slug' => $editSlug];
}
$rows = db()->query('SELECT slug,title,category,is_active,show_in_menu,show_on_homepage,updated_at FROM service_page_content ORDER BY sort_order ASC, updated_at DESC, slug')->fetchAll();
admin_header('Service Page Content');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2><?= $edit ? 'Edit service content' : 'Add service content' ?></h2>
    <label class="field"><span>Slug</span><input name="slug" required value="<?= e($edit['slug'] ?? '') ?>"></label>
    <label class="field"><span>Category</span><input name="category" value="<?= e($edit['category'] ?? '') ?>" placeholder="Individuals, Business, Local SEO"></label>
    <label class="field"><span>Title</span><input name="title" required value="<?= e($edit['title'] ?? '') ?>"></label>
    <label class="field"><span>Short description</span><textarea name="short_description"><?= e($edit['short_description'] ?? '') ?></textarea></label>
    <label class="field"><span>Subtitle</span><textarea name="subtitle"><?= e($edit['subtitle'] ?? '') ?></textarea></label>
    <label class="field"><span>Hero image path/URL</span><input name="hero_image" value="<?= e($edit['hero_image'] ?? '') ?>"></label>
    <label class="field"><span>Icon key / path</span><input name="icon" value="<?= e($edit['icon'] ?? '') ?>"></label>
    <label class="field"><span>Sections JSON</span><textarea name="sections_json"><?= e($edit['sections_json'] ?? '[]') ?></textarea></label>
    <label class="field"><span>Pricing text</span><textarea name="pricing_text"><?= e($edit['pricing_text'] ?? '') ?></textarea></label>
    <label class="field"><span>FAQs JSON</span><textarea name="faqs_json"><?= e($edit['faqs_json'] ?? '[]') ?></textarea></label>
    <label class="field"><span>SEO title</span><input name="seo_title" value="<?= e($edit['seo_title'] ?? '') ?>"></label>
    <label class="field"><span>SEO description</span><textarea name="seo_description"><?= e($edit['seo_description'] ?? '') ?></textarea></label>
    <label class="field"><span>OG image</span><input name="og_image" value="<?= e($edit['og_image'] ?? '') ?>"></label>
    <label class="field"><span>Sort order</span><input name="sort_order" type="number" value="<?= e($edit['sort_order'] ?? '0') ?>"></label>
    <label><input type="checkbox" name="is_active" <?= !isset($edit['is_active']) || (int)$edit['is_active'] ? 'checked' : '' ?>> Active</label><br><br>
    <label><input type="checkbox" name="show_in_menu" <?= !isset($edit['show_in_menu']) || (int)$edit['show_in_menu'] ? 'checked' : '' ?>> Show in menu</label><br>
    <label><input type="checkbox" name="show_on_homepage" <?= !empty($edit['show_on_homepage']) ? 'checked' : '' ?>> Show on homepage</label><br><br>
    <button class="btn">Save service content</button>
  </form>
  <div class="card">
    <h2>Editable service pages</h2>
    <table><tr><th>Slug</th><th>Title</th><th>Category</th><th>Active</th><th>Menu/Home</th><th>Edit</th></tr>
      <?php foreach ($rows as $row): ?>
        <tr><td><?= e($row['slug']) ?></td><td><?= e($row['title']) ?></td><td><?= e($row['category'] ?? '') ?></td><td><?= (int)$row['is_active'] ? 'Yes' : 'No' ?></td><td><?= !empty($row['show_in_menu']) ? 'Menu ' : '' ?><?= !empty($row['show_on_homepage']) ? 'Home' : '' ?></td><td><a href="?slug=<?= e($row['slug']) ?>">Edit</a></td></tr>
      <?php endforeach; ?>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
