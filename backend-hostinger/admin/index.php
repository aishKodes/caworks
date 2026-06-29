<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_dashboard');
admin_header('Admin Dashboard');
$stats = [
  'New leads today' => "SELECT COUNT(*) c FROM quick_leads WHERE DATE(created_at)=CURDATE()",
  'Total leads' => "SELECT COUNT(*) c FROM quick_leads",
  'New service requests' => "SELECT COUNT(*) c FROM service_requests WHERE DATE(created_at)=CURDATE()",
  'Documents pending' => "SELECT COUNT(*) c FROM service_requests WHERE status='Documents pending'",
  'Documents uploaded today' => "SELECT COUNT(*) c FROM documents WHERE DATE(created_at)=CURDATE()",
  'Manual payments to verify' => "SELECT COUNT(*) c FROM manual_payment_screenshots WHERE status='Payment verification pending'",
  'Razorpay payments received' => "SELECT COUNT(*) c FROM payments WHERE method='razorpay' AND status='Payment received'",
  'Requests under review' => "SELECT COUNT(*) c FROM service_requests WHERE status IN ('Under review','Filing in progress')",
  'Completed' => "SELECT COUNT(*) c FROM service_requests WHERE status='Completed'",
  'Blog posts published' => "SELECT COUNT(*) c FROM blog_posts_cms WHERE published=1",
  'Draft blog posts' => "SELECT COUNT(*) c FROM blog_posts_cms WHERE published=0",
];
if (admin_db_column_exists('service_requests', 'lead_source')) {
  $stats['Google Ads requests'] = "SELECT COUNT(*) c FROM service_requests WHERE lead_source='google_ads' OR COALESCE(gclid,'') <> '' OR COALESCE(gbraid,'') <> '' OR COALESCE(wbraid,'') <> ''";
  $stats['Insurance claim requests'] = "SELECT COUNT(*) c FROM service_requests WHERE service_type LIKE '%insurance%' OR service_type LIKE '%claim%' OR service_type LIKE '%mediclaim%'";
}
echo '<div class="grid stats">';
foreach ($stats as $label => $sql) {
    $count = admin_count($sql);
    echo '<div class="card"><p class="muted">' . e($label) . '</p><h2>' . e((string) $count) . '</h2></div>';
}
echo '</div>';

$latestLeads = db()->query('SELECT * FROM quick_leads ORDER BY created_at DESC LIMIT 8')->fetchAll();
$latestRequests = db()->query('SELECT sr.*, u.full_name, u.phone, u.tax_help_id FROM service_requests sr JOIN users u ON u.id=sr.user_id ORDER BY sr.created_at DESC LIMIT 8')->fetchAll();
$manualPayments = db()->query("SELECT p.id payment_id, p.amount, p.status, sr.request_code, u.full_name, u.phone FROM payments p JOIN service_requests sr ON sr.id=p.request_id JOIN users u ON u.id=p.user_id WHERE p.method='manual' AND p.status='Payment verification pending' ORDER BY p.created_at DESC LIMIT 8")->fetchAll();
$recentDocs = db()->query('SELECT d.*, sr.request_code, u.full_name FROM documents d LEFT JOIN service_requests sr ON sr.id=d.request_id JOIN users u ON u.id=d.user_id ORDER BY d.created_at DESC LIMIT 8')->fetchAll();
$latestLeadEvents = [];
try {
  if (admin_db_column_exists('lead_events', 'event_type')) {
    $latestLeadEvents = db()->query("SELECT * FROM lead_events WHERE event_type IN ('phone_click','whatsapp_click','insurance_lead_submit','guest_request_submit','document_upload_submit') ORDER BY created_at DESC LIMIT 8")->fetchAll();
  }
} catch (Throwable $ignored) {
  $latestLeadEvents = [];
}
$contentAlerts = [];
foreach (db()->query("SELECT slug,title FROM service_page_content WHERE is_active=1 AND (seo_title IS NULL OR seo_title='' OR hero_image IS NULL OR hero_image='') LIMIT 10")->fetchAll() as $row) {
    $contentAlerts[] = 'Service page needs SEO/image: ' . $row['slug'];
}
?>
<div class="grid two" style="margin-top:18px">
  <div class="card">
    <h2>Latest quick leads</h2>
    <?php if (!$latestLeads): ?><p class="empty">No quick leads yet.</p><?php endif; ?>
    <?php foreach ($latestLeads as $lead): ?>
      <p><strong><?= e($lead['phone']) ?></strong> · <?= e($lead['service']) ?><br><span class="muted"><?= e($lead['name']) ?> · <?= e($lead['lead_source'] ?? $lead['source_page'] ?? '') ?> · <?= e($lead['created_at']) ?></span></p>
      <p class="actions"><a class="btn small light" href="leads.php?q=<?= urlencode($lead['phone']) ?>">View</a><a class="btn small" target="_blank" rel="noopener noreferrer" href="<?= e(admin_whatsapp_url($lead['phone'], 'Hello, you requested help from VB Consultants.')) ?>">Open WhatsApp</a></p>
    <?php endforeach; ?>
  </div>
  <div class="card">
    <h2>Latest service requests</h2>
    <?php if (!$latestRequests): ?><p class="empty">No requests yet.</p><?php endif; ?>
    <?php foreach ($latestRequests as $request): ?>
      <p><strong><?= e($request['request_code']) ?></strong> · <?= e($request['service_type']) ?><br><?= status_badge($request['status']) ?> <span class="muted"><?= e($request['full_name']) ?> · <?= e($request['phone']) ?> · <?= e($request['lead_source'] ?? '') ?></span></p>
      <p class="actions"><a class="btn small light" href="request.php?id=<?= e($request['id']) ?>">View</a><a class="btn small" target="_blank" rel="noopener noreferrer" href="<?= e(admin_whatsapp_url($request['phone'], 'Hello ' . $request['full_name'] . ', update for Request ID ' . $request['request_code'])) ?>">Open WhatsApp</a></p>
    <?php endforeach; ?>
  </div>
  <div class="card">
    <h2>Manual payments to verify</h2>
    <?php if (!$manualPayments): ?><p class="empty">No manual payments waiting.</p><?php endif; ?>
    <?php foreach ($manualPayments as $pay): ?>
      <p><strong><?= e($pay['request_code']) ?></strong> · ₹<?= e($pay['amount']) ?><br><span class="muted"><?= e($pay['full_name']) ?> · <?= e($pay['phone']) ?></span></p>
      <p><a class="btn small" href="payments.php?q=<?= urlencode((string) $pay['payment_id']) ?>">Verify payment</a></p>
    <?php endforeach; ?>
  </div>
  <div class="card">
    <h2>Recently uploaded documents</h2>
    <?php if (!$recentDocs): ?><p class="empty">No documents uploaded yet.</p><?php endif; ?>
    <?php foreach ($recentDocs as $doc): ?>
      <p><strong><?= e($doc['original_name']) ?></strong><br><span class="muted"><?= e($doc['full_name']) ?> · <?= e($doc['request_code'] ?? 'No request') ?> · <?= e($doc['created_at']) ?></span></p>
      <?php if (can('download_documents')): ?><p><a class="btn small light" href="download.php?id=<?= e($doc['id']) ?>">Download</a></p><?php endif; ?>
    <?php endforeach; ?>
  </div>
  <?php if ($latestLeadEvents): ?>
  <div class="card">
    <h2>Latest ad/click events</h2>
    <?php foreach ($latestLeadEvents as $event): ?>
      <p><strong><?= e($event['event_type']) ?></strong> · <?= e($event['service'] ?? '') ?><br><span class="muted"><?= e($event['lead_source'] ?? '') ?> · <?= e($event['utm_campaign'] ?? '') ?> · <?= e($event['created_at']) ?></span></p>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>
<div class="card" style="margin-top:18px">
  <h2>Content alerts</h2>
  <?php if (!$contentAlerts): ?>
    <p class="empty">No immediate content alerts.</p>
  <?php else: ?>
    <ul><?php foreach ($contentAlerts as $alert): ?><li><?= e($alert) ?></li><?php endforeach; ?></ul>
  <?php endif; ?>
  <p class="actions"><a class="btn" href="homepage.php">Edit homepage</a><a class="btn secondary" href="pricing.php">Edit pricing</a><a class="btn light" href="media.php">Open media library</a></p>
</div>
<?php
admin_footer();
