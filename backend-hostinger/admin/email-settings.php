<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('manage_integrations');
require_post_csrf();

$fields = [
    'smtp_enabled' => ['SMTP enabled', 'smtp', 0, 'select'],
    'smtp_host' => ['SMTP host', 'smtp', 0, 'text'],
    'smtp_port' => ['SMTP port', 'smtp', 0, 'number'],
    'smtp_encryption' => ['Encryption', 'smtp', 0, 'select'],
    'smtp_username' => ['SMTP username', 'smtp', 0, 'email'],
    'smtp_password' => ['SMTP password', 'smtp', 1, 'password'],
    'smtp_from_email' => ['From email', 'smtp', 0, 'email'],
    'smtp_from_name' => ['From name', 'smtp', 0, 'text'],
    'smtp_reply_to' => ['Reply-to email', 'smtp', 0, 'email'],
    'admin_email' => ['Admin alert email', 'smtp', 0, 'email'],
    'public_email' => ['Public email', 'smtp', 0, 'email'],
    'mail_debug' => ['Mail debug', 'smtp', 0, 'select'],
];

$message = '';
$testResult = null;

function email_settings_save(string $key, string $value, string $group, int $secret): void {
    db()->prepare('INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), setting_group=VALUES(setting_group), is_secret=VALUES(is_secret), updated_at=NOW()')
        ->execute([$key, $value, $group, $secret]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['save_smtp'])) {
        foreach ($fields as $key => [$label, $group, $secret]) {
            if ($key === 'smtp_password' && trim((string) ($_POST[$key] ?? '')) === '') {
                continue;
            }
            email_settings_save($key, trim((string) ($_POST[$key] ?? '')), $group, (int) $secret);
        }
        audit_log((int) $admin['id'], null, 'smtp_settings_updated', 'SMTP settings updated.');
        $message = 'SMTP settings saved.';
    }
    if (isset($_POST['send_test'])) {
        $recipient = trim((string) ($_POST['test_recipient'] ?? ''));
        $testResult = safe_send_email($recipient, 'VB Consultants SMTP test', '', "This is a test email from VB Consultants.\n\nIf you received this, Hostinger SMTP is working.", ['event_type' => 'smtp_admin_test']);
        $message = $testResult['ok'] ? 'Test email sent.' : 'Test email failed. See details below.';
    }
}

$config = mail_config();
$lastLogs = [];
try {
    $lastLogs = db()->query("SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 8")->fetchAll();
} catch (Throwable $ignored) {
}

admin_header('Email Settings');
if ($message) echo '<div class="notice ' . ($testResult && !$testResult['ok'] ? '' : 'success') . '">' . e($message) . '</div>';
if ($testResult) {
    echo '<div class="card"><h2>Latest test result</h2><p>Status: ' . status_badge($testResult['ok'] ? 'Sent' : 'Failed') . '</p>';
    if (!$testResult['ok']) echo '<p class="muted">Error: ' . e($testResult['error'] ?: 'Unknown SMTP error.') . '</p>';
    echo '</div><br>';
}
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2>Hostinger SMTP</h2>
    <p class="muted">Active values prefer <code>config.php</code>, then non-empty database values. Password is never shown.</p>
    <label class="field"><span>SMTP enabled</span><select name="smtp_enabled">
      <option value="true" <?= $config['enabled'] ? 'selected' : '' ?>>Enabled</option>
      <option value="false" <?= !$config['enabled'] ? 'selected' : '' ?>>Disabled</option>
    </select></label>
    <label class="field"><span>SMTP host</span><input name="smtp_host" value="<?= e($config['host']) ?>" placeholder="smtp.hostinger.com"></label>
    <label class="field"><span>SMTP port</span><input name="smtp_port" type="number" value="<?= e((string) $config['port']) ?>" placeholder="465"></label>
    <label class="field"><span>Encryption</span><select name="smtp_encryption">
      <option value="ssl" <?= $config['encryption'] === 'ssl' ? 'selected' : '' ?>>SSL (465)</option>
      <option value="tls" <?= $config['encryption'] === 'tls' ? 'selected' : '' ?>>TLS / STARTTLS (587)</option>
      <option value="none" <?= $config['encryption'] === 'none' ? 'selected' : '' ?>>None</option>
    </select></label>
    <label class="field"><span>SMTP username</span><input name="smtp_username" type="email" value="<?= e($config['username']) ?>" placeholder="consult@api.vbcbharat.com"></label>
    <label class="field"><span>Replace SMTP password</span><input name="smtp_password" type="password" value="" placeholder="<?= $config['password'] ? 'Saved. Enter new password to replace.' : 'Not set' ?>"></label>
    <label class="field"><span>From email</span><input name="smtp_from_email" type="email" value="<?= e($config['from_email']) ?>" placeholder="consult@api.vbcbharat.com"></label>
    <label class="field"><span>From name</span><input name="smtp_from_name" value="<?= e($config['from_name']) ?>" placeholder="VB Consultants"></label>
    <label class="field"><span>Reply-to</span><input name="smtp_reply_to" type="email" value="<?= e($config['reply_to']) ?>" placeholder="consult@api.vbcbharat.com"></label>
    <label class="field"><span>Admin alert email</span><input name="admin_email" type="email" value="<?= e($config['admin_email']) ?>" placeholder="consult@api.vbcbharat.com"></label>
    <label class="field"><span>Public email</span><input name="public_email" type="email" value="<?= e($config['public_email']) ?>" placeholder="consult@api.vbcbharat.com"></label>
    <label class="field"><span>Mail debug</span><select name="mail_debug">
      <option value="false" <?= !$config['debug'] ? 'selected' : '' ?>>Off</option>
      <option value="true" <?= $config['debug'] ? 'selected' : '' ?>>On</option>
    </select></label>
    <button class="btn" name="save_smtp" value="1">Save SMTP settings</button>
  </form>

  <div class="grid">
    <form method="post" class="card">
      <?= csrf_field() ?>
      <h2>Send test email</h2>
      <label class="field"><span>Recipient</span><input name="test_recipient" type="email" required value="<?= e($config['admin_email']) ?>"></label>
      <button class="btn" name="send_test" value="1">Send test email</button>
    </form>
    <div class="card">
      <h2>Common Hostinger checks</h2>
      <ul class="muted" style="line-height:1.8">
        <li>Make sure the mailbox exists in Hostinger Email.</li>
        <li>Use <code>consult@api.vbcbharat.com</code> only when that exact Hostinger mailbox exists.</li>
        <li>The SMTP username and From email should normally match.</li>
        <li>Hostinger SMTP host: <code>smtp.hostinger.com</code>.</li>
        <li>Use SSL port <code>465</code> or TLS port <code>587</code>.</li>
        <li>From email should usually match the SMTP username.</li>
        <li>Check mailbox password, MX, SPF, DKIM and spam folder.</li>
      </ul>
    </div>
  </div>
</div>

<div class="card" style="margin-top:18px">
  <h2>Active source</h2>
  <p>Configuration loaded from: <code><?= e($config['config_source']) ?></code></p>
  <?php foreach ($config['sources'] as $key => $source): ?>
    <p><code><?= e($key) ?></code>: <?= e($source) ?></p>
  <?php endforeach; ?>
  <?php if ($config['mismatches']): ?><p class="notice">Database values differ from live <code>config.php</code>. The live config values are active.</p><?php endif; ?>
</div>

<div class="card" style="margin-top:18px">
  <h2>Recent email logs</h2>
  <?php if (!$lastLogs): ?>
    <p class="empty">No email logs yet.</p>
  <?php else: ?>
    <div class="table-wrap"><table><tr><th>Time</th><th>Event</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Error</th></tr>
      <?php foreach ($lastLogs as $log): ?>
        <tr>
          <td><?= e($log['created_at'] ?? '') ?></td>
          <td><?= e($log['event_type'] ?? 'general') ?></td>
          <td><?= e($log['recipient'] ?? '') ?></td>
          <td><?= e($log['subject'] ?? '') ?></td>
          <td><?= status_badge($log['status'] ?? '') ?></td>
          <td><?= e($log['error_message'] ?? '') ?></td>
        </tr>
      <?php endforeach; ?>
    </table></div>
  <?php endif; ?>
</div>
<?php admin_footer(); ?>
