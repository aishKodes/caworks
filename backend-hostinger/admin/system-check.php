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
$recentAuthFailures = [];
$sessionStats = ['active_count' => 0, 'expired_count' => 0, 'last_seen_at' => null, 'last_login_at' => null];
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
    $authStatusSelect = admin_db_column_exists('api_errors', 'http_status') ? 'http_status' : 'NULL AS http_status';
    $recentAuthFailures = db()->query("SELECT request_id, path, {$authStatusSelect}, message, created_at FROM api_errors WHERE request_id LIKE 'AUTH-%' ORDER BY created_at DESC LIMIT 5")->fetchAll();
} catch (Throwable $ignored) {
}
try {
    $recentEmailErrors = db()->query("SELECT event_type, recipient, subject, error_message, created_at FROM email_logs WHERE status <> 'sent' ORDER BY created_at DESC LIMIT 5")->fetchAll();
} catch (Throwable $ignored) {
}
try {
    $lastSeenColumn = admin_db_column_exists('user_sessions', 'last_seen_at') ? 'MAX(last_seen_at)' : 'MAX(last_used_at)';
    $sessionStats = db()->query("SELECT SUM(revoked_at IS NULL AND expires_at > NOW()) active_count, SUM(expires_at <= NOW()) expired_count, {$lastSeenColumn} last_seen_at FROM user_sessions")->fetch() ?: $sessionStats;
    if (admin_db_column_exists('users', 'last_login_at')) {
        $sessionStats['last_login_at'] = db()->query('SELECT MAX(last_login_at) FROM users')->fetchColumn() ?: null;
    }
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
      <tr><td>Session duration</td><td><?= check_status((int) ($config['SESSION_DAYS'] ?? $config['session_days'] ?? 0) >= 30) ?></td><td><?= e((string) ($config['SESSION_DAYS'] ?? $config['session_days'] ?? '')) ?> days</td></tr>
      <tr><td>Cookie security</td><td><?= check_status(($config['SESSION_SAMESITE'] ?? 'Lax') === 'Lax') ?></td><td>HttpOnly · Secure <?= e((string) ($config['SESSION_SECURE'] ?? 'auto')) ?> · SameSite <?= e((string) ($config['SESSION_SAMESITE'] ?? 'Lax')) ?></td></tr>
      <tr><td>CORS credentials</td><td><?= check_status(true) ?></td><td>API sends credentials for the allowed origin</td></tr>
      <tr><td>Public signup route</td><td><?= check_status(true) ?></td><td><code>POST /api/signup</code> is registered independently of admin setup</td></tr>
      <tr><td>Guest request route</td><td><?= check_status(true) ?></td><td><code>POST /api/guest-request</code> is registered independently of admin setup</td></tr>
      <tr><td>Admin setup</td><td><?= check_status($superAdminExists) ?></td><td><?= e($superAdminExists ? 'Super admin created' : 'Open /admin/setup.php') ?></td></tr>
      <tr><td>Public phone</td><td><?= check_status($publicPhone !== '') ?></td><td><?= e($publicPhone) ?></td></tr>
      <tr><td>Active sessions</td><td><?= check_status(true) ?></td><td><?= e((string) ($sessionStats['active_count'] ?? 0)) ?> active · <?= e((string) ($sessionStats['expired_count'] ?? 0)) ?> expired</td></tr>
      <tr><td>Last customer activity</td><td><?= check_status(!empty($sessionStats['last_seen_at'])) ?></td><td><?= e((string) ($sessionStats['last_seen_at'] ?? 'No activity yet')) ?></td></tr>
      <tr><td>Last customer login</td><td><?= check_status(!empty($sessionStats['last_login_at'])) ?></td><td><?= e((string) ($sessionStats['last_login_at'] ?? 'No login yet')) ?></td></tr>
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
      <tr><td>Reply-to</td><td><?= e($mail['reply_to']) ?></td></tr>
      <tr><td>Admin alert email</td><td><?= e($mail['admin_email']) ?></td></tr>
      <tr><td>Public email</td><td><?= e($mail['public_email'] ?: 'Not set') ?></td></tr>
      <tr><td>Active source</td><td><?= e($mail['config_source']) ?></td></tr>
      <tr><td>Password set</td><td><?= e($mail['password_set'] ? 'Yes' : 'No') ?></td></tr>
    </table>
    <?php if (!$mail['password_set']): ?><p class="notice">SMTP password is missing. Public actions remain available, but email cannot send.</p><?php endif; ?>
    <?php if (trim((string) $mail['public_email']) === ''): ?><p class="notice">Public email is blank. The website will hide the email and keep phone/WhatsApp visible.</p><?php endif; ?>
    <?php if ($mail['mismatches']): ?><p class="notice">Saved database mail values differ from live <code>config.php</code>. Live config values are active.</p><?php endif; ?>
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
<section class="card" style="margin-top:16px">
  <h2>Recent authentication failures</h2>
  <?php if (!$recentAuthFailures): ?><p class="empty">No recent authentication or CORS failures.</p><?php endif; ?>
  <?php foreach ($recentAuthFailures as $row): ?>
    <p><strong><?= e($row['request_id']) ?></strong> · HTTP <?= e((string) ($row['http_status'] ?? 'n/a')) ?> · <?= e($row['path']) ?><br><span class="muted"><?= e($row['message']) ?> · <?= e($row['created_at']) ?></span></p>
  <?php endforeach; ?>
</section>
<?php admin_footer(); ?>
