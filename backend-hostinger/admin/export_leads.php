<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('export_data');
audit_log((int) $admin['id'], null, 'lead_export', 'Leads CSV exported.');
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="leads.csv"');
$out = fopen('php://output', 'w');
fputcsv($out, ['id', 'name', 'phone', 'service', 'message', 'status', 'created_at']);
foreach (db()->query('SELECT id,name,phone,service,message,status,created_at FROM quick_leads ORDER BY created_at DESC') as $row) {
    fputcsv($out, $row);
}
fclose($out);
exit;
