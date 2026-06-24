<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_integrations');
require_post_csrf();

$result = null;
$recipient = mail_config()['admin_email'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recipient = trim((string) ($_POST['recipient'] ?? ''));
    $result = safe_send_email(
        $recipient,
        'VB Consultants SMTP diagnostic email',
        '',
        "This is a diagnostic email from VB Consultants.\n\nSMTP host: " . mail_config()['host'] . "\nPort: " . mail_config()['port'] . "\nEncryption: " . mail_config()['encryption'],
        ['event_type' => 'smtp_admin_test']
    );
}

admin_header('Test Email');
?>
<div class="grid two">
  <form method="post" class="card">
    <?= csrf_field() ?>
    <h2>Send SMTP test</h2>
    <label class="field"><span>Recipient email</span><input name="recipient" type="email" required value="<?= e($recipient) ?>"></label>
    <button class="btn">Send test email</button>
  </form>
  <div class="card">
    <h2>Current SMTP diagnostics</h2>
    <?php $diag = mail_diagnostics(); ?>
    <p>Config loaded: <?= $diag['config_loaded'] ? 'yes' : 'no' ?></p>
    <p>SMTP enabled: <?= $diag['smtp_enabled'] ? 'yes' : 'no' ?></p>
    <p>Host: <code><?= e($diag['host']) ?></code></p>
    <p>Port/encryption: <code><?= e((string) $diag['port']) ?> / <?= e($diag['encryption']) ?></code></p>
    <p>Username: <code><?= e($diag['username']) ?></code></p>
    <p>From: <code><?= e($diag['from_email']) ?></code></p>
    <p>Reply-to: <code><?= e($diag['reply_to']) ?></code></p>
    <p>Admin email: <code><?= e($diag['admin_email']) ?></code></p>
    <p>Public email: <code><?= e($diag['public_email']) ?></code></p>
    <p>Active source: <code><?= e($diag['config_source']) ?></code></p>
    <p>Password set: <?= $diag['password_set'] ? 'yes' : 'no' ?></p>
  </div>
</div>
<?php if ($result): ?>
  <div class="card" style="margin-top:18px">
    <h2>Result</h2>
    <p>Status: <?= status_badge($result['ok'] ? 'Sent' : 'Failed') ?></p>
    <p>Recipient: <?= e($result['recipient']) ?></p>
    <?php if (!$result['ok']): ?><p class="muted">Safe error: <?= e($result['error'] ?: 'Unknown SMTP error.') ?></p><?php endif; ?>
    <p class="muted">This result was also written to <code>email_logs</code>.</p>
  </div>
<?php endif; ?>
<?php admin_footer(); ?>
