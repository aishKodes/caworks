<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_dashboard');

function check_table_exists(string $table): bool {
    try {
        $stmt = db()->prepare('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1');
        $stmt->execute([$table]);
        return (bool) $stmt->fetch();
    } catch (Throwable $ignored) {
        return false;
    }
}

function check_status(bool $ok): string {
    return $ok ? '<span class="badge ok">OK</span>' : '<span class="badge warn">Check</span>';
}

function is_placeholder_address(string $address): bool {
    if (trim($address) === '') return false;
    return (bool) preg_match('/your address here|add your address|office address placeholder|rayagada placeholder|123 business street|sample address|put address here/i', $address);
}

$config = app_config();
$requiredTables = [
    'users',
    'user_sessions',
    'admin_users',
    'admin_roles',
    'admin_permissions',
    'quick_leads',
    'service_requests',
    'documents',
    'uploaded_documents',
    'service_document_requirements',
    'payments',
    'manual_payment_screenshots',
    'site_settings',
    'homepage_sections',
    'service_page_content',
    'services',
    'service_sections',
    'service_faqs',
    'pricing_items',
    'blog_posts_cms',
    'blog_posts',
    'faqs',
    'testimonials',
    'local_seo_pages',
    'local_pages',
    'media_library',
    'integration_settings',
    'email_templates',
    'email_logs',
    'whatsapp_messages',
    'api_errors',
    'app_settings',
    'revalidation_logs',
];
$tableRows = [];
foreach ($requiredTables as $table) {
    $tableRows[] = [$table, check_table_exists($table)];
}
$uploadDir = (string) ($config['upload_dir'] ?? '');
$mediaDir = (string) ($config['media_dir'] ?? '');
$recentApiErrors = [];
$recentEmailErrors = [];
$settings = [];
try {
    $settings = cms_settings();
} catch (Throwable $ignored) {
}
$publicPhone = trim((string) ($settings['phone'] ?? $config['public_phone'] ?? ''));
$officeAddress = trim((string) ($settings['address'] ?? $config['office_address'] ?? ''));
$addressIsPlaceholder = is_placeholder_address($officeAddress);
$superAdminExists = admin_count("SELECT COUNT(*) c FROM admin_users WHERE role='super_admin'") > 0;
try {
    $recentApiErrors = db()->query('SELECT request_id, path, message, created_at FROM api_errors ORDER BY created_at DESC LIMIT 5')->fetchAll();
} catch (Throwable $ignored) {
}
try {
    $recentEmailErrors = db()->query("SELECT event_type, recipient, subject, error_message, created_at FROM email_logs WHERE status <> 'sent' ORDER BY created_at DESC LIMIT 5")->fetchAll();
} catch (Throwable $ignored) {
}

admin_header('System Check');
?>
<div class="grid two">
  <section class="card">
    <h2>Core configuration</h2>
    <table>
      <tr><th>Item</th><th>Status</th><th>Value</th></tr>
      <tr><td>DB connection</td><td><?= check_status(true) ?></td><td>Connected</td></tr>
      <tr><td>Frontend URL</td><td><?= check_status(!empty($config['frontend_url'])) ?></td><td><?= e($config['frontend_url'] ?? '') ?></td></tr>
      <tr><td>Allowed origin</td><td><?= check_status(!empty($config['allowed_origin'])) ?></td><td><?= e($config['allowed_origin'] ?? '') ?></td></tr>
      <tr><td>Cookie name</td><td><?= check_status(!empty($config['SESSION_COOKIE_NAME'] ?? $config['session_cookie_name'] ?? '')) ?></td><td><?= e($config['SESSION_COOKIE_NAME'] ?? $config['session_cookie_name'] ?? '') ?></td></tr>
      <tr><td>Cookie domain</td><td><?= check_status(!empty($config['SESSION_COOKIE_DOMAIN'] ?? $config['session_cookie_domain'] ?? '')) ?></td><td><?= e($config['SESSION_COOKIE_DOMAIN'] ?? $config['session_cookie_domain'] ?? '') ?></td></tr>
      <tr><td>CORS credentials</td><td><?= check_status(true) ?></td><td>API sends credentials for the allowed origin</td></tr>
      <tr><td>Public signup route</td><td><?= check_status(true) ?></td><td><code>POST /api/signup</code> is registered independently of admin setup</td></tr>
      <tr><td>Guest request route</td><td><?= check_status(true) ?></td><td><code>POST /api/guest-request</code> is registered independently of admin setup</td></tr>
      <tr><td>Admin setup</td><td><?= check_status($superAdminExists) ?></td><td><?= e($superAdminExists ? 'Super admin created' : 'Open /admin/setup.php') ?></td></tr>
      <tr><td>Public phone</td><td><?= check_status($publicPhone !== '') ?></td><td><?= e($publicPhone) ?></td></tr>
      <tr><td>Office address</td><td><?= check_status(!$addressIsPlaceholder) ?></td><td><?= e($officeAddress !== '' ? $officeAddress : 'Not set; public address block will be hidden') ?></td></tr>
      <?php if ($addressIsPlaceholder): ?><tr><td>Address warning</td><td><?= check_status(false) ?></td><td>Remove the placeholder address in Site Settings.</td></tr><?php endif; ?>
      <tr><td>Upload directory</td><td><?= check_status($uploadDir !== '' && is_dir($uploadDir) && is_writable($uploadDir)) ?></td><td><?= e($uploadDir) ?></td></tr>
      <tr><td>Media directory</td><td><?= check_status($mediaDir !== '' && is_dir($mediaDir) && is_writable($mediaDir)) ?></td><td><?= e($mediaDir) ?></td></tr>
    </table>
  </section>
  <section class="card">
    <h2>SMTP status</h2>
    <?php $mail = mail_diagnostics(); ?>
    <table>
      <tr><th>Item</th><th>Value</th></tr>
      <tr><td>Enabled</td><td><?= e($mail['smtp_enabled'] ? 'Yes' : 'No') ?></td></tr>
      <tr><td>Host</td><td><?= e($mail['host']) ?></td></tr>
      <tr><td>Port / encryption</td><td><?= e((string) $mail['port']) ?> / <?= e($mail['encryption']) ?></td></tr>
      <tr><td>Username</td><td><?= e($mail['username']) ?></td></tr>
      <tr><td>From email</td><td><?= e($mail['from_email']) ?></td></tr>
      <tr><td>Password set</td><td><?= e($mail['password_set'] ? 'Yes' : 'No') ?></td></tr>
    </table>
    <p><a class="btn small" href="test-email.php">Send test email</a> <a class="btn small light" href="email-logs.php">View email logs</a></p>
  </section>
</div>

<section class="card" style="margin-top:16px">
  <h2>Required tables</h2>
  <div class="table-wrap">
    <table>
      <tr><th>Table</th><th>Status</th></tr>
      <?php foreach ($tableRows as [$table, $ok]): ?>
        <tr><td><?= e($table) ?></td><td><?= check_status($ok) ?></td></tr>
      <?php endforeach; ?>
    </table>
  </div>
</section>

<div class="grid two" style="margin-top:16px">
  <section class="card">
    <h2>Recent API errors</h2>
    <?php if (!$recentApiErrors): ?><p class="empty">No recent API errors.</p><?php endif; ?>
    <?php foreach ($recentApiErrors as $row): ?>
      <p><strong><?= e($row['request_id']) ?></strong> · <?= e($row['path']) ?><br><span class="muted"><?= e($row['message']) ?> · <?= e($row['created_at']) ?></span></p>
    <?php endforeach; ?>
  </section>
  <section class="card">
    <h2>Recent email errors</h2>
    <?php if (!$recentEmailErrors): ?><p class="empty">No recent email errors.</p><?php endif; ?>
    <?php foreach ($recentEmailErrors as $row): ?>
      <p><strong><?= e($row['event_type']) ?></strong> · <?= e($row['recipient']) ?><br><span class="muted"><?= e($row['error_message']) ?> · <?= e($row['created_at']) ?></span></p>
    <?php endforeach; ?>
  </section>
</div>
<?php admin_footer(); ?>
