<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
admin_header('Service Requests');
$q = trim($_GET['q'] ?? '');
$params = [];
$where = '';
if ($q !== '') {
    $where = 'WHERE sr.request_code LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.tax_help_id LIKE ?';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like];
}
$stmt = db()->prepare("SELECT sr.*, u.tax_help_id, u.full_name, u.phone FROM service_requests sr JOIN users u ON u.id=sr.user_id {$where} ORDER BY sr.created_at DESC LIMIT 300");
$stmt->execute($params);
$rows = $stmt->fetchAll();
echo '<form><input name="q" value="' . e($q) . '" placeholder="Search phone, email, Tax Help ID, request ID" style="padding:12px;border-radius:12px;border:1px solid #ddd;width:min(100%,460px)"> <button class="btn">Search</button></form><br>';
echo '<table><tr><th>Request</th><th>User</th><th>Service</th><th>Status</th><th>Amount</th><th>Date</th></tr>';
foreach ($rows as $row) {
    echo '<tr><td><a href="request.php?id=' . e($row['id']) . '">' . e($row['request_code']) . '</a></td><td>' . e($row['full_name']) . '<br><span class="muted">' . e($row['tax_help_id']) . '</span></td><td>' . e($row['service_type']) . '</td><td>' . e($row['status']) . '</td><td>' . e($row['quoted_amount']) . '</td><td>' . e($row['created_at']) . '</td></tr>';
}
echo '</table>';
admin_footer();
