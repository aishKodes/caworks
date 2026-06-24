<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_site_settings');
$message = '';
$fields = [
    'business_name' => ['Business name', 'site', 'text'],
    'registered_business_name' => ['Registered business name', 'site', 'text'],
    'tagline' => ['Tagline', 'site', 'text'],
    'logo_mark' => ['Logo mark path or URL', 'site', 'text'],
    'logo_horizontal' => ['Horizontal logo path or URL', 'site', 'text'],
    'favicon' => ['Favicon path or URL', 'site', 'text'],
    'apple_touch_icon' => ['Apple touch icon path or URL', 'site', 'text'],
    'default_og_image' => ['Default OG image path or URL', 'site', 'text'],
    'phone' => ['Phone', 'site', 'text'],
    'public_phone' => ['Public phone', 'site', 'text'],
    'whatsapp_number' => ['WhatsApp number', 'site', 'text'],
    'support_email' => ['Support email', 'site', 'text'],
    'public_email' => ['Public email', 'site', 'text'],
    'address' => ['Address', 'site', 'text'],
    'google_maps_link' => ['Google Maps link', 'site', 'text'],
    'business_hours' => ['Business hours', 'site', 'text'],
    'footer_text' => ['Footer text', 'site', 'text'],
    'social_links' => ['Social links JSON', 'site', 'json'],
    'default_seo_title' => ['Default SEO title', 'seo', 'text'],
    'default_seo_description' => ['Default SEO description', 'seo', 'text'],
    'google_analytics_id' => ['Google Analytics ID', 'analytics', 'text'],
    'google_ads_id' => ['Google Ads conversion ID', 'analytics', 'text'],
    'meta_pixel_id' => ['Meta Pixel ID', 'analytics', 'text'],
];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    foreach ($fields as $key => [, $group, $type]) {
        cms_upsert_setting($key, (string) ($_POST[$key] ?? ''), $type, $group);
    }
    audit_log((int) current_admin()['id'], null, 'site_settings_updated', 'Site settings updated.');
    cms_revalidate_paths(['/', '/pricing', '/blog', '/contact', '/about', '/sitemap.xml']);
    $message = 'Site settings saved.';
}
$settings = cms_settings();
admin_header('Site Settings');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
echo '<form method="post" class="card">' . csrf_field();
foreach ($fields as $key => [$label]) {
    $value = $settings[$key] ?? '';
    echo '<label class="field"><span>' . e($label) . '</span>';
    if (in_array($key, ['address', 'footer_text', 'social_links', 'default_seo_description'], true)) {
        echo '<textarea name="' . e($key) . '">' . e(is_array($value) ? json_encode($value) : (string) $value) . '</textarea>';
    } else {
        echo '<input name="' . e($key) . '" value="' . e((string) $value) . '">';
    }
    echo '</label>';
}
echo '<button class="btn">Save settings</button></form>';
$mail = mail_diagnostics();
$lastTest = null;
$lastEmailError = null;
try {
    $lastTest = db()->query("SELECT status, error_message, created_at FROM email_logs WHERE event_type IN ('smtp_admin_test','smtp_cli_test') ORDER BY created_at DESC LIMIT 1")->fetch() ?: null;
    $lastEmailError = db()->query("SELECT error_message, created_at FROM email_logs WHERE status <> 'sent' ORDER BY created_at DESC LIMIT 1")->fetch() ?: null;
} catch (Throwable $ignored) {
}
echo '<div class="card" style="margin-top:18px"><h2>Email configuration</h2>';
echo '<p class="muted">SMTP secrets are managed in Email Settings. Live <code>config.php</code> values take priority over database values.</p>';
echo '<p>SMTP enabled: ' . e($mail['smtp_enabled'] ? 'Yes' : 'No') . '</p>';
echo '<p>Host: <code>' . e($mail['host']) . ':' . e((string) $mail['port']) . ' / ' . e($mail['encryption']) . '</code></p>';
echo '<p>Username: <code>' . e($mail['username']) . '</code></p>';
echo '<p>From: <code>' . e($mail['from_email']) . '</code></p>';
echo '<p>Reply-to: <code>' . e($mail['reply_to']) . '</code></p>';
echo '<p>Admin notifications: <code>' . e($mail['admin_email']) . '</code></p>';
echo '<p>Public email: <code>' . e($mail['public_email']) . '</code></p>';
echo '<p>Last test: ' . ($lastTest ? status_badge((string) $lastTest['status']) . ' <span class="muted">' . e((string) $lastTest['created_at']) . '</span>' : '<span class="muted">Not tested</span>') . '</p>';
echo '<p>Last email error: <span class="muted">' . e($lastEmailError ? ((string) $lastEmailError['error_message'] . ' · ' . (string) $lastEmailError['created_at']) : 'None logged') . '</span></p>';
echo '<p><a class="btn small" href="email-settings.php">Manage email settings</a> <a class="btn small light" href="test-email.php">Send test email</a></p></div>';
admin_footer();
