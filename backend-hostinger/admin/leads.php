<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
admin_header('Quick Phone Leads');
$rows = db()->query('SELECT * FROM quick_leads ORDER BY created_at DESC LIMIT 300')->fetchAll();
echo '<p><a class="btn" href="export_leads.php">Export leads CSV</a></p>';
echo '<table><tr><th>ID</th><th>Name</th><th>Phone</th><th>Service</th><th>Status</th><th>WhatsApp</th><th>Date</th></tr>';
foreach ($rows as $row) {
    $wa = 'https://wa.me/' . preg_replace('/\D/', '', $row['phone']) . '?text=' . urlencode('Hello, you requested help for ' . $row['service']);
    echo '<tr><td>' . e($row['id']) . '</td><td>' . e($row['name']) . '</td><td>' . e($row['phone']) . '</td><td>' . e($row['service']) . '</td><td>' . e($row['status']) . '</td><td><a href="' . e($wa) . '" target="_blank">Open WhatsApp</a></td><td>' . e($row['created_at']) . '</td></tr>';
}
echo '</table>';
admin_footer();
