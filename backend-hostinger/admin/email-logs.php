<?php
require_once __DIR__ . '/_bootstrap.php';
require_permission('manage_integrations');

$rows = [];
try {
    $rows = db()->query('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 300')->fetchAll();
} catch (Throwable $ignored) {
}

admin_header('Email Logs');
?>
<section class="card">
  <h2>Recent email attempts</h2>
  <p class="muted">Passwords are never logged. Failed SMTP details are masked where possible.</p>
  <?php if (!$rows): ?><p class="empty">No email logs yet.</p><?php endif; ?>
  <?php if ($rows): ?>
    <div class="table-wrap">
      <table>
        <tr><th>Time</th><th>Event</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Error</th></tr>
        <?php foreach ($rows as $row): ?>
          <tr>
            <td><?= e($row['created_at'] ?? '') ?></td>
            <td><?= e($row['event_type'] ?? '') ?></td>
            <td><?= e($row['recipient'] ?? '') ?></td>
            <td><?= e($row['subject'] ?? '') ?></td>
            <td><?= status_badge($row['status'] ?? '') ?></td>
            <td><?= e($row['error_message'] ?? '') ?></td>
          </tr>
        <?php endforeach; ?>
      </table>
    </div>
  <?php endif; ?>
</section>
<?php admin_footer(); ?>
