<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
$fields = [
    'business_name' => ['Business name', 'site', 'text'],
    'logo' => ['Logo path or URL', 'site', 'text'],
    'favicon' => ['Favicon path or URL', 'site', 'text'],
    'tagline' => ['Tagline', 'site', 'text'],
    'phone' => ['Phone', 'site', 'text'],
    'whatsapp_number' => ['WhatsApp number', 'site', 'text'],
    'support_email' => ['Support email', 'site', 'text'],
    'address' => ['Address', 'site', 'text'],
    'footer_text' => ['Footer text', 'site', 'text'],
    'social_links' => ['Social links JSON', 'site', 'json'],
];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($fields as $key => [, $group, $type]) {
        cms_upsert_setting($key, (string) ($_POST[$key] ?? ''), $type, $group);
    }
    $message = 'Site settings saved.';
}
$settings = cms_settings('site');
admin_header('Site Settings');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
echo '<form method="post" class="card">';
foreach ($fields as $key => [$label]) {
    $value = $settings[$key] ?? '';
    echo '<label class="field"><span>' . e($label) . '</span>';
    if ($key === 'address' || $key === 'footer_text' || $key === 'social_links') {
        echo '<textarea name="' . e($key) . '">' . e(is_array($value) ? json_encode($value) : (string) $value) . '</textarea>';
    } else {
        echo '<input name="' . e($key) . '" value="' . e((string) $value) . '">';
    }
    echo '</label>';
}
echo '<button class="btn">Save settings</button></form>';
admin_footer();
