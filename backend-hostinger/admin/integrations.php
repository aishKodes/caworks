<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
$message = '';
$defaults = [
    ['razorpay_key_id', 'razorpay', 0],
    ['razorpay_key_secret', 'razorpay', 1],
    ['razorpay_webhook_secret', 'razorpay', 1],
    ['manual_upi_id', 'payments', 0],
    ['smtp_host', 'smtp', 0],
    ['smtp_username', 'smtp', 0],
    ['smtp_password', 'smtp', 1],
    ['smtp_port', 'smtp', 0],
    ['google_analytics_id', 'analytics', 0],
    ['google_ads_conversion_id', 'analytics', 0],
    ['meta_pixel_id', 'analytics', 0],
    ['whatsapp_api_phone_number_id', 'whatsapp', 0],
    ['whatsapp_api_access_token', 'whatsapp', 1],
    ['whatsapp_api_templates_json', 'whatsapp', 0],
    ['ai_chatbot_enabled', 'chatbot', 0],
    ['ai_chatbot_provider', 'chatbot', 0],
    ['ai_chatbot_api_key', 'chatbot', 1],
    ['floating_lead_widget_enabled', 'lead_widget', 0],
    ['email_followup_enabled', 'email_followup', 0],
    ['lead_followup_schedule_json', 'email_followup', 0],
];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($defaults as [$key, $group, $secret]) {
        $stmt = db()->prepare('INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), setting_group=VALUES(setting_group), is_secret=VALUES(is_secret), updated_at=NOW()');
        $stmt->execute([$key, $_POST[$key] ?? '', $group, $secret]);
    }
    $message = 'Integration settings saved.';
}
$rows = db()->query('SELECT * FROM integration_settings')->fetchAll();
$settings = [];
foreach ($rows as $row) $settings[$row['setting_key']] = $row;
admin_header('Integrations and Automation Settings');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
echo '<form method="post" class="grid two">';
$currentGroup = '';
foreach ($defaults as [$key, $group, $secret]) {
    if ($group !== $currentGroup) {
        if ($currentGroup !== '') echo '</div>';
        $currentGroup = $group;
        echo '<div class="card"><h2>' . e(ucwords(str_replace('_', ' ', $group))) . '</h2>';
    }
    $value = $settings[$key]['setting_value'] ?? '';
    echo '<label class="field"><span>' . e(str_replace('_', ' ', $key)) . ($secret ? ' (secret)' : '') . '</span>';
    if (str_contains($key, 'json')) {
        echo '<textarea name="' . e($key) . '">' . e($value) . '</textarea>';
    } else {
        echo '<input name="' . e($key) . '" value="' . e($value) . '">';
    }
    echo '</label>';
}
if ($currentGroup !== '') echo '</div>';
echo '<div class="card"><h2>Future automation notes</h2><p class="muted">These settings prepare WhatsApp Business API templates, AI chatbot toggles, floating lead widget controls and scheduled email follow-ups. Live sending can be connected later without changing the database shape.</p><button class="btn">Save integrations</button></div></form>';
admin_footer();
