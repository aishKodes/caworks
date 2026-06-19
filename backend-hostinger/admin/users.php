<?php
require_once __DIR__ . '/_bootstrap.php';
require_admin_page();
admin_header('Users');
$rows = db()->query('SELECT id,tax_help_id,full_name,phone,email,created_at FROM users ORDER BY created_at DESC LIMIT 300')->fetchAll();
echo '<table><tr><th>ID</th><th>Tax Help ID</th><th>Name</th><th>Phone</th><th>Email</th><th>WhatsApp</th><th>Date</th></tr>';
foreach ($rows as $row) {
    $wa = 'https://wa.me/' . preg_replace('/\D/', '', $row['phone']) . '?text=' . urlencode('Hello ' . $row['full_name'] . ', your Tax Help ID is ' . $row['tax_help_id']);
    echo '<tr><td>' . e($row['id']) . '</td><td>' . e($row['tax_help_id']) . '</td><td>' . e($row['full_name']) . '</td><td>' . e($row['phone']) . '</td><td>' . e($row['email']) . '</td><td><a href="' . e($wa) . '" target="_blank">Open WhatsApp</a></td><td>' . e($row['created_at']) . '</td></tr>';
}
echo '</table>';
admin_footer();
