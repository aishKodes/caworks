<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_integrations');
$message = '';
$defaults = [
    ['razorpay_key_id', 'razorpay', 0],
    ['razorpay_key_secret', 'razorpay', 1],
    ['razorpay_webhook_secret', 'razorpay', 1],
    ['manual_upi_id', 'payments', 0],
    ['smtp_enabled', 'smtp', 0],
    ['smtp_host', 'smtp', 0],
    ['smtp_port', 'smtp', 0],
    ['smtp_encryption', 'smtp', 0],
    ['smtp_username', 'smtp', 0],
    ['smtp_password', 'smtp', 1],
    ['smtp_from_email', 'smtp', 0],
    ['smtp_from_name', 'smtp', 0],
    ['smtp_reply_to', 'smtp', 0],
    ['admin_email', 'smtp', 0],
    ['mail_debug', 'smtp', 0],
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
    require_post_csrf();
    foreach ($defaults as [$key, $group, $secret]) {
        $value = (string) ($_POST[$key] ?? '');
        if ($secret && $value === '' && isset($_POST[$key . '_keep'])) {
            continue;
        }
        $stmt = db()->prepare('INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), setting_group=VALUES(setting_group), is_secret=VALUES(is_secret), updated_at=NOW()');
        $stmt->execute([$key, $value, $group, $secret]);
    }
    audit_log((int) current_admin()['id'], null, 'integrations_updated', 'Integration settings updated.');
    $message = 'Integration settings saved.';
}
$rows = db()->query('SELECT * FROM integration_settings')->fetchAll();
$settings = [];
foreach ($rows as $row) $settings[$row['setting_key']] = $row;
admin_header('Integrations and Automation Settings');
if ($message) echo '<div class="notice">' . e($message) . '</div>';
echo '<form method="post" class="grid two">' . csrf_field();
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
    } elseif ($secret) {
        echo '<input name="' . e($key) . '" value="" placeholder="' . ($value !== '' ? 'Saved. Enter new value to replace.' : 'Not set') . '"><input type="hidden" name="' . e($key) . '_keep" value="1">';
    } else {
        echo '<input name="' . e($key) . '" value="' . e($value) . '">';
    }
    echo '</label>';
}
if ($currentGroup !== '') echo '</div>';
echo '<div class="card"><h2>Future automation notes</h2><p class="muted">These settings prepare WhatsApp Business API templates, AI chatbot toggles, floating lead widget controls and scheduled email follow-ups. Live sending can be connected later without changing the database shape.</p><button class="btn">Save integrations</button></div></form>';
$messages = db()->query('SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 100')->fetchAll();
echo '<div class="card" style="margin-top:18px"><h2>Queued WhatsApp messages</h2><p class="muted">If API sending is not enabled, open WhatsApp and send/copy these manually.</p>';
if (!$messages) {
    echo '<p class="empty">No queued WhatsApp messages.</p>';
} else {
    echo '<div class="table-wrap"><table><tr><th>Phone</th><th>Template</th><th>Message</th><th>Status</th><th>Action</th></tr>';
    foreach ($messages as $msg) {
        echo '<tr><td>' . e($msg['phone']) . '</td><td>' . e($msg['template_key']) . '</td><td><textarea readonly style="width:100%;min-height:70px">' . e($msg['message_text']) . '</textarea></td><td>' . status_badge($msg['status']) . '</td><td><a class="btn small" target="_blank" rel="noopener noreferrer" href="' . e(admin_whatsapp_url($msg['phone'], $msg['message_text'])) . '">Open WhatsApp</a></td></tr>';
    }
    echo '</table></div>';
}
echo '</div>';
admin_footer();
