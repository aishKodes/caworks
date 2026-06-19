<?php
session_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/cms.php';
require_once __DIR__ . '/../includes/upload.php';

function admin_logged_in(): bool {
    return isset($_SESSION['admin_id']);
}

function require_admin_page(): array {
    if (!admin_logged_in()) {
        header('Location: login.php');
        exit;
    }
    $stmt = db()->prepare('SELECT id, email, full_name FROM admin_users WHERE id=?');
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    if (!$admin) {
        session_destroy();
        header('Location: login.php');
        exit;
    }
    return $admin;
}

function e(?string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function admin_header(string $title): void {
    echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>' . e($title) . '</title><style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;background:#fffaf7;color:#171717}a{color:#a41624;text-decoration:none}.wrap{max-width:1180px;margin:auto;padding:24px}.card{background:#fff;border:1px solid #e7e1dd;border-radius:16px;padding:18px;box-shadow:0 14px 36px rgba(17,17,17,.08)}.grid{display:grid;gap:16px}.stats{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.two{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}table{width:100%;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden}th,td{text-align:left;border-bottom:1px solid #eee;padding:12px;font-size:14px;vertical-align:top}.btn{display:inline-block;background:#a41624;color:#fff;border-radius:999px;padding:9px 14px;font-weight:700;border:0;cursor:pointer}.btn.secondary{background:#171717}.muted{color:#5c5f66}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.nav{display:flex;gap:10px;flex-wrap:wrap}.nav a{font-weight:700;font-size:14px}.field{display:grid;gap:6px;margin:0 0 14px}.field input,.field textarea,.field select{width:100%;padding:11px 12px;border:1px solid #ddd;border-radius:12px;font:inherit}.field textarea{min-height:100px}.notice{background:#fff2f1;border:1px solid #ffd6d2;color:#86111d;border-radius:14px;padding:12px;margin:12px 0}.thumb{width:90px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #eee}</style></head><body><div class="wrap">';
    echo '<div class="top"><h1>' . e($title) . '</h1><nav class="nav"><a href="index.php">Dashboard</a><a href="leads.php">Leads</a><a href="requests.php">Requests</a><a href="users.php">Users</a><a href="settings.php">Site</a><a href="homepage.php">Homepage</a><a href="services_content.php">Services</a><a href="pricing.php">Pricing</a><a href="media.php">Media</a><a href="blog.php">Blog</a><a href="local_seo.php">Local SEO</a><a href="integrations.php">Integrations</a><a href="logout.php">Logout</a></nav></div>';
}

function admin_footer(): void {
    echo '</div></body></html>';
}
