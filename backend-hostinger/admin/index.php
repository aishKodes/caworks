<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
admin_header('Admin Dashboard');
$stats = [
  'New leads today' => "SELECT COUNT(*) c FROM quick_leads WHERE DATE(created_at)=CURDATE()",
  'Quick phone leads' => "SELECT COUNT(*) c FROM quick_leads",
  'New ITR requests' => "SELECT COUNT(*) c FROM service_requests WHERE service_type LIKE '%itr%' AND DATE(created_at)=CURDATE()",
  'Documents pending' => "SELECT COUNT(*) c FROM service_requests WHERE status='Documents pending'",
  'Payments pending' => "SELECT COUNT(*) c FROM payments WHERE status='Payment pending'",
  'Manual payments to verify' => "SELECT COUNT(*) c FROM manual_payment_screenshots WHERE status='Payment verification pending'",
  'In progress' => "SELECT COUNT(*) c FROM service_requests WHERE status IN ('Under review','Filing in progress')",
  'Completed' => "SELECT COUNT(*) c FROM service_requests WHERE status='Completed'",
  'Pricing items' => "SELECT COUNT(*) c FROM pricing_items",
  'Media assets' => "SELECT COUNT(*) c FROM media_library",
  'CMS blog posts' => "SELECT COUNT(*) c FROM blog_posts_cms",
];
echo '<div class="grid stats">';
foreach ($stats as $label => $sql) {
    $count = db()->query($sql)->fetch()['c'];
    echo '<div class="card"><p class="muted">' . e($label) . '</p><h2>' . e((string) $count) . '</h2></div>';
}
echo '</div>';
echo '<div class="card" style="margin-top:18px"><h2>Website content</h2><p class="muted">Edit homepage, pricing, services, media, blog, local SEO pages and future integrations from the admin navigation.</p><p><a class="btn" href="homepage.php">Edit homepage</a> <a class="btn secondary" href="pricing.php">Edit pricing</a> <a class="btn secondary" href="media.php">Open media library</a></p></div>';
admin_footer();
