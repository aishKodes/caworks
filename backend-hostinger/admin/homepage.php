<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = [
        'trustBadges' => cms_decode_json($_POST['trust_badges'] ?? '[]', []),
        'featuredServices' => cms_decode_json($_POST['featured_services'] ?? '[]', []),
        'sectionVisibility' => cms_decode_json($_POST['section_visibility'] ?? '{}', []),
        'testimonials' => cms_decode_json($_POST['testimonials'] ?? '[]', []),
        'faqs' => cms_decode_json($_POST['faqs'] ?? '[]', []),
        'finalCtaTitle' => (string) ($_POST['final_cta_title'] ?? ''),
        'finalCtaDescription' => (string) ($_POST['final_cta_description'] ?? ''),
    ];
    $stmt = db()->prepare('INSERT INTO homepage_sections (section_key,title,subtitle,image_path,cta_primary_label,cta_primary_url,cta_secondary_label,cta_secondary_url,content_json,is_visible,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), image_path=VALUES(image_path), cta_primary_label=VALUES(cta_primary_label), cta_primary_url=VALUES(cta_primary_url), cta_secondary_label=VALUES(cta_secondary_label), cta_secondary_url=VALUES(cta_secondary_url), content_json=VALUES(content_json), is_visible=VALUES(is_visible), updated_at=NOW()');
    $stmt->execute([
        'homepage',
        $_POST['hero_title'] ?? '',
        $_POST['hero_subtitle'] ?? '',
        $_POST['hero_image'] ?? '',
        $_POST['primary_label'] ?? '',
        $_POST['primary_url'] ?? '',
        $_POST['secondary_label'] ?? '',
        $_POST['secondary_url'] ?? '',
        json_encode($content),
        isset($_POST['is_visible']) ? 1 : 0,
    ]);
    $message = 'Homepage content saved.';
}
$stmt = db()->prepare('SELECT * FROM homepage_sections WHERE section_key=? LIMIT 1');
$stmt->execute(['homepage']);
$row = $stmt->fetch() ?: [];
$content = cms_decode_json($row['content_json'] ?? null, []);
admin_header('Homepage Settings');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
?>
<form method="post" class="grid two">
  <div class="card">
    <label class="field"><span>Hero title</span><textarea name="hero_title"><?= e($row['title'] ?? '') ?></textarea></label>
    <label class="field"><span>Hero subtitle</span><textarea name="hero_subtitle"><?= e($row['subtitle'] ?? '') ?></textarea></label>
    <label class="field"><span>Hero image path/URL</span><input name="hero_image" value="<?= e($row['image_path'] ?? '') ?>"></label>
    <label class="field"><span>Primary CTA label</span><input name="primary_label" value="<?= e($row['cta_primary_label'] ?? '') ?>"></label>
    <label class="field"><span>Primary CTA URL</span><input name="primary_url" value="<?= e($row['cta_primary_url'] ?? '') ?>"></label>
    <label class="field"><span>Secondary CTA label</span><input name="secondary_label" value="<?= e($row['cta_secondary_label'] ?? '') ?>"></label>
    <label class="field"><span>Secondary CTA URL</span><input name="secondary_url" value="<?= e($row['cta_secondary_url'] ?? '') ?>"></label>
    <label><input type="checkbox" name="is_visible" <?= !isset($row['is_visible']) || (int)$row['is_visible'] ? 'checked' : '' ?>> Homepage visible</label>
  </div>
  <div class="card">
    <label class="field"><span>Section visibility JSON</span><textarea name="section_visibility"><?= e(json_encode($content['sectionVisibility'] ?? new stdClass(), JSON_PRETTY_PRINT)) ?></textarea></label>
    <label class="field"><span>Trust badges JSON</span><textarea name="trust_badges"><?= e(json_encode($content['trustBadges'] ?? [], JSON_PRETTY_PRINT)) ?></textarea></label>
    <label class="field"><span>Featured services JSON</span><textarea name="featured_services"><?= e(json_encode($content['featuredServices'] ?? [], JSON_PRETTY_PRINT)) ?></textarea></label>
    <label class="field"><span>Testimonials JSON</span><textarea name="testimonials"><?= e(json_encode($content['testimonials'] ?? [], JSON_PRETTY_PRINT)) ?></textarea></label>
    <label class="field"><span>Homepage FAQs JSON</span><textarea name="faqs"><?= e(json_encode($content['faqs'] ?? [], JSON_PRETTY_PRINT)) ?></textarea></label>
    <label class="field"><span>Final CTA title</span><input name="final_cta_title" value="<?= e($content['finalCtaTitle'] ?? '') ?>"></label>
    <label class="field"><span>Final CTA description</span><textarea name="final_cta_description"><?= e($content['finalCtaDescription'] ?? '') ?></textarea></label>
    <button class="btn">Save homepage</button>
  </div>
</form>
<?php admin_footer(); ?>
