<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_requests');
admin_header('Service Requests');
$q = trim($_GET['q'] ?? '');
$status = trim($_GET['status'] ?? '');
$service = trim($_GET['service'] ?? '');
$source = trim($_GET['source'] ?? '');
$params = [];
$whereParts = [];
if ($q !== '') {
    $whereParts[] = '(sr.request_code LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.tax_help_id LIKE ? OR u.full_name LIKE ?)';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like, $like];
}
if ($status !== '') {
    $whereParts[] = 'sr.status = ?';
    $params[] = $status;
}
if ($service !== '') {
    $whereParts[] = 'sr.service_type LIKE ?';
    $params[] = '%' . $service . '%';
}
if ($source !== '') {
    if (in_array($source, ['insurance', 'itr', 'gst', 'loan'], true)) {
        $whereParts[] = 'sr.service_type LIKE ?';
        $params[] = '%' . ($source === 'loan' ? 'loan' : $source) . '%';
    } elseif (admin_db_column_exists('service_requests', 'lead_source') && $source === 'google_ads') {
        $whereParts[] = "(sr.lead_source = 'google_ads' OR COALESCE(sr.gclid,'') <> '' OR COALESCE(sr.gbraid,'') <> '' OR COALESCE(sr.wbraid,'') <> '')";
    } elseif (admin_db_column_exists('service_requests', 'lead_source') && $source === 'organic') {
        $whereParts[] = "sr.lead_source IN ('organic','referral')";
    } elseif (admin_db_column_exists('service_requests', 'lead_source') && $source === 'direct') {
        $whereParts[] = "sr.lead_source = 'direct'";
    } elseif (admin_db_column_exists('service_requests', 'lead_source')) {
        $whereParts[] = 'sr.lead_source = ?';
        $params[] = $source;
    }
}
$where = $whereParts ? 'WHERE ' . implode(' AND ', $whereParts) : '';
$stmt = db()->prepare("SELECT sr.*, u.tax_help_id, u.full_name, u.phone, au.full_name assigned_name FROM service_requests sr JOIN users u ON u.id=sr.user_id LEFT JOIN admin_users au ON au.id=sr.assigned_admin_id {$where} ORDER BY sr.created_at DESC LIMIT 300");
$stmt->execute($params);
$rows = $stmt->fetchAll();
?>
<form class="toolbar">
  <label class="field"><span>Search</span><input name="q" value="<?= e($q) ?>" placeholder="Phone, email, Tax Help ID, request ID"></label>
  <label class="field"><span>Status</span><select name="status"><option value="">All</option><?= admin_select_options(['Request received','Documents pending','Documents received','Payment pending','Payment verification pending','Payment received','Under review','More details required','Filing in progress','Completed','Closed'], $status) ?></select></label>
  <label class="field"><span>Service</span><input name="service" value="<?= e($service) ?>" placeholder="ITR, GST, loan"></label>
  <label class="field"><span>Source / type</span><select name="source"><option value="">All leads</option><?= admin_select_options(['google_ads','organic','direct','whatsapp','insurance','itr','gst','loan'], $source) ?></select></label>
  <button class="btn">Search</button>
</form>
<div class="table-wrap"><table><tr><th>Request</th><th>User</th><th>Service</th><th>Status</th><th>Attribution</th><th>Assigned</th><th>Amount</th><th>Actions</th><th>Date</th></tr>
<?php
foreach ($rows as $row) {
    $wa = admin_whatsapp_url($row['phone'], 'Hello ' . $row['full_name'] . ', update for Request ID ' . $row['request_code'] . '.');
    $attr = trim(($row['lead_source'] ?? '') . ' ' . ($row['utm_campaign'] ?? '') . ' ' . ($row['utm_term'] ?? ''));
    $attrHtml = $attr !== '' ? e($attr) . '<br><span class="muted">' . e($row['landing_page'] ?? '') . '</span>' : '<span class="muted">Not captured</span>';
    echo '<tr><td><a href="request.php?id=' . e($row['id']) . '">' . e($row['request_code']) . '</a></td><td>' . e($row['full_name']) . '<br><span class="muted">' . e($row['tax_help_id']) . ' · ' . e($row['phone']) . '</span></td><td>' . e($row['service_type']) . '</td><td>' . status_badge($row['status']) . '</td><td>' . $attrHtml . '</td><td>' . e($row['assigned_name'] ?? 'Unassigned') . '</td><td>' . e($row['quoted_amount']) . '</td><td><div class="actions"><a class="btn small light" href="request.php?id=' . e($row['id']) . '">View</a><a class="btn small" target="_blank" rel="noopener noreferrer" href="' . e($wa) . '">WhatsApp</a></div></td><td>' . e($row['created_at']) . '</td></tr>';
}
?>
</table></div>
<?php
admin_footer();
