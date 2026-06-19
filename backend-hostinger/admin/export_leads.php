<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="leads.csv"');
$out = fopen('php://output', 'w');
fputcsv($out, ['id', 'name', 'phone', 'service', 'message', 'status', 'created_at']);
foreach (db()->query('SELECT id,name,phone,service,message,status,created_at FROM quick_leads ORDER BY created_at DESC') as $row) {
    fputcsv($out, $row);
}
fclose($out);
exit;
