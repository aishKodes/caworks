<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('export_data');
audit_log((int) $admin['id'], null, 'lead_export', 'Leads CSV exported.');
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="leads.csv"');
$out = fopen('php://output', 'w');

$columns = ['id', 'name', 'phone', 'service', 'message', 'status', 'source_page'];
$trackingColumns = [
    'lead_source',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'wbraid',
    'msclkid',
    'landing_page',
    'referrer',
];
foreach ($trackingColumns as $column) {
    if (admin_db_column_exists('quick_leads', $column)) {
        $columns[] = $column;
    }
}
$columns[] = 'created_at';

fputcsv($out, $columns);
$sql = 'SELECT ' . implode(',', array_map(fn($column) => '`' . str_replace('`', '', $column) . '`', $columns)) . ' FROM quick_leads ORDER BY created_at DESC';
foreach (db()->query($sql) as $row) {
    $line = [];
    foreach ($columns as $column) {
        $line[] = $row[$column] ?? '';
    }
    fputcsv($out, $line);
}
fclose($out);
exit;
