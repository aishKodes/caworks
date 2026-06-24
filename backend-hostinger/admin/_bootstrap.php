<?php
$secureCookie = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/admin',
    'secure' => $secureCookie,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/cms.php';
require_once __DIR__ . '/../includes/upload.php';
require_once __DIR__ . '/../includes/audit.php';
require_once __DIR__ . '/../includes/rate_limit.php';
require_once __DIR__ . '/../includes/mailer.php';

const ADMIN_ROLES = ['super_admin', 'admin', 'staff', 'content_editor', 'accountant', 'viewer'];

function admin_role_permissions(): array {
    $all = [
        'view_dashboard', 'manage_users', 'manage_staff', 'view_leads', 'manage_leads',
        'view_requests', 'manage_requests', 'view_documents', 'download_documents',
        'delete_documents', 'view_payments', 'verify_payments', 'manage_pricing',
        'manage_site_settings', 'manage_homepage', 'manage_services', 'manage_blog',
        'manage_media', 'manage_seo', 'manage_integrations', 'export_data', 'view_audit_logs'
    ];
    return [
        'super_admin' => $all,
        'admin' => array_values(array_diff($all, ['delete_documents'])),
        'staff' => ['view_dashboard', 'view_leads', 'manage_leads', 'view_requests', 'manage_requests', 'view_documents', 'download_documents', 'view_payments'],
        'content_editor' => ['view_dashboard', 'manage_site_settings', 'manage_homepage', 'manage_services', 'manage_blog', 'manage_media', 'manage_seo', 'manage_pricing'],
        'accountant' => ['view_dashboard', 'view_requests', 'manage_requests', 'view_documents', 'download_documents', 'view_payments', 'verify_payments'],
        'viewer' => ['view_dashboard', 'view_leads', 'view_requests', 'view_documents', 'view_payments'],
    ];
}

function admin_logged_in(): bool {
    return isset($_SESSION['admin_id']);
}

function require_admin_page(): array {
    if (!admin_logged_in()) {
        header('Location: login.php');
        exit;
    }
    $config = app_config();
    $timeout = (int) ($config['admin_session_timeout'] ?? (60 * 60 * 8));
    if (!empty($_SESSION['admin_last_activity']) && time() - (int) $_SESSION['admin_last_activity'] > $timeout) {
        session_destroy();
        header('Location: login.php?expired=1');
        exit;
    }
    $_SESSION['admin_last_activity'] = time();

    $stmt = db()->prepare('SELECT * FROM admin_users WHERE id=?');
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    if (!$admin || (isset($admin['active']) && !(int) $admin['active'])) {
        session_destroy();
        header('Location: login.php');
        exit;
    }
    $admin['role'] = $admin['role'] ?? 'super_admin';
    $GLOBALS['current_admin'] = $admin;
    try {
        db()->prepare('UPDATE admin_users SET last_seen_at=NOW() WHERE id=?')->execute([(int) $admin['id']]);
    } catch (Throwable $ignored) {
    }
    return $admin;
}

function current_admin(): ?array {
    return $GLOBALS['current_admin'] ?? null;
}

function admin_has_permission(?array $admin, string $permission): bool {
    if (!$admin) {
        return false;
    }
    $role = $admin['role'] ?? 'viewer';
    if ($role === 'super_admin') {
        return true;
    }
    try {
        $stmt = db()->prepare('SELECT 1 FROM admin_user_permissions WHERE admin_id=? AND permission_key=? LIMIT 1');
        $stmt->execute([(int) $admin['id'], $permission]);
        if ($stmt->fetch()) {
            return true;
        }
        $stmt = db()->prepare('SELECT 1 FROM admin_role_permissions WHERE role_key=? AND permission_key=? LIMIT 1');
        $stmt->execute([$role, $permission]);
        if ($stmt->fetch()) {
            return true;
        }
    } catch (Throwable $ignored) {
    }
    return in_array($permission, admin_role_permissions()[$role] ?? [], true);
}

function can(string $permission): bool {
    return admin_has_permission(current_admin(), $permission);
}

function require_permission(string $permission): array {
    $admin = require_admin_page();
    if (!admin_has_permission($admin, $permission)) {
        http_response_code(403);
        admin_header('Access denied');
        echo '<div class="card"><h2>Access denied</h2><p class="muted">Your staff role cannot open this section.</p></div>';
        admin_footer();
        exit;
    }
    return $admin;
}

function e(?string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function csrf_token(): string {
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string {
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function require_post_csrf(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = (string) ($_POST['_csrf'] ?? '');
        if (!$token || !hash_equals((string) ($_SESSION['_csrf'] ?? ''), $token)) {
            http_response_code(403);
            exit('Invalid security token. Please go back and try again.');
        }
    }
}

function strong_password_message(string $password): ?string {
    if (strlen($password) < 10) {
        return 'Password must be at least 10 characters.';
    }
    if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
        return 'Password must contain at least one letter and one number.';
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        return 'Add at least one symbol for a stronger password.';
    }
    return null;
}

function admin_whatsapp_url(string $phone, string $message): string {
    $number = preg_replace('/\D+/', '', $phone);
    return $number ? 'https://wa.me/' . $number . '?text=' . urlencode($message) : '#';
}

function status_badge(string $status): string {
    $class = 'badge';
    $lower = strtolower($status);
    if (str_contains($lower, 'pending') || str_contains($lower, 'new')) $class .= ' warn';
    if (str_contains($lower, 'received') || str_contains($lower, 'completed') || str_contains($lower, 'converted')) $class .= ' ok';
    if (str_contains($lower, 'reject') || str_contains($lower, 'closed')) $class .= ' muted-badge';
    return '<span class="' . e($class) . '">' . e($status) . '</span>';
}

function admin_select_options(array $options, string $selected): string {
    $html = '';
    foreach ($options as $option) {
        $html .= '<option value="' . e($option) . '"' . ($option === $selected ? ' selected' : '') . '>' . e($option) . '</option>';
    }
    return $html;
}

function admin_count(string $sql, array $params = []): int {
    try {
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return (int) ($row['c'] ?? 0);
    } catch (Throwable $ignored) {
        return 0;
    }
}

function admin_db_column_exists(string $table, string $column): bool {
    static $cache = [];
    $key = $table . '.' . $column;
    if (array_key_exists($key, $cache)) {
        return $cache[$key];
    }
    try {
        $stmt = db()->prepare('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1');
        $stmt->execute([$table, $column]);
        $cache[$key] = (bool) $stmt->fetch();
    } catch (Throwable $ignored) {
        $cache[$key] = false;
    }
    return $cache[$key];
}

function admin_header(string $title): void {
    $admin = current_admin();
    $nav = [
        ['index.php', 'Dashboard', 'view_dashboard'],
        ['leads.php', 'Quick Leads', 'view_leads'],
        ['users.php', 'Users', 'manage_users'],
        ['requests.php', 'Requests', 'view_requests'],
        ['documents.php', 'Documents', 'view_documents'],
        ['payments.php', 'Payments', 'view_payments'],
        ['staff.php', 'Staff', 'manage_staff'],
        ['settings.php', 'Site Settings', 'manage_site_settings'],
        ['homepage.php', 'Homepage', 'manage_homepage'],
        ['services_content.php', 'Services', 'manage_services'],
        ['service-documents.php', 'Document Checklists', 'manage_services'],
        ['pricing.php', 'Pricing', 'manage_pricing'],
        ['blog.php', 'Blog', 'manage_blog'],
        ['media.php', 'Media', 'manage_media'],
        ['faqs.php', 'FAQs', 'manage_services'],
        ['testimonials.php', 'Testimonials', 'manage_homepage'],
        ['local_seo.php', 'Local SEO', 'manage_seo'],
        ['integrations.php', 'Integrations', 'manage_integrations'],
        ['email-settings.php', 'Email Settings', 'manage_integrations'],
        ['test-email.php', 'Test Email', 'manage_integrations'],
        ['email-logs.php', 'Email Logs', 'manage_integrations'],
        ['email_templates.php', 'Email Templates', 'manage_integrations'],
        ['system-check.php', 'System Check', 'view_dashboard'],
        ['audit_logs.php', 'Audit Logs', 'view_audit_logs'],
    ];
    echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>' . e($title) . '</title><style>:root{--brand:#a41624;--ink:#171717;--muted:#5c5f66;--paper:#fffaf7;--line:#e7e1dd;--ok:#0f766e;--warn:#b45309}*{box-sizing:border-box}body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;background:var(--paper);color:var(--ink)}a{color:var(--brand);text-decoration:none}.wrap{max-width:1240px;margin:auto;padding:18px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;box-shadow:0 14px 36px rgba(17,17,17,.08)}.grid{display:grid;gap:16px}.stats{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.two{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}.three{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}.table-wrap{width:100%;overflow:auto;border-radius:16px;border:1px solid #eee;background:#fff}table{width:100%;border-collapse:collapse;background:#fff}th,td{text-align:left;border-bottom:1px solid #eee;padding:12px;font-size:14px;vertical-align:top}th{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--brand);color:#fff;border-radius:999px;padding:10px 15px;font-weight:800;border:0;cursor:pointer;line-height:1.2}.btn.secondary{background:#171717}.btn.light{background:#fff;color:#171717;border:1px solid #ddd}.btn.danger{background:#7f1d1d}.btn.small{padding:7px 10px;font-size:12px}.muted{color:var(--muted)}.top{display:grid;gap:14px;margin-bottom:18px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.nav{display:flex;gap:8px;flex-wrap:wrap}.nav a{font-weight:800;font-size:13px;background:#fff;border:1px solid #eee;border-radius:999px;padding:9px 12px}.field{display:grid;gap:6px;margin:0 0 14px}.field input,.field textarea,.field select{width:100%;padding:12px;border:1px solid #ddd;border-radius:12px;font:inherit;background:#fff}.field textarea{min-height:110px}.notice{background:#fff2f1;border:1px solid #ffd6d2;color:#86111d;border-radius:14px;padding:12px;margin:12px 0}.success{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}.thumb{width:96px;height:68px;object-fit:cover;border-radius:10px;border:1px solid #eee}.badge{display:inline-flex;border-radius:999px;background:#f3f4f6;color:#374151;padding:5px 9px;font-size:12px;font-weight:800}.badge.ok{background:#ccfbf1;color:#115e59}.badge.warn{background:#fef3c7;color:#92400e}.badge.muted-badge{background:#e5e7eb;color:#4b5563}.actions{display:flex;gap:8px;flex-wrap:wrap}.toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin:0 0 14px}.toolbar .field{margin:0;min-width:180px}.empty{padding:22px;border:1px dashed #ddd;border-radius:16px;background:#fff;color:var(--muted)}code{background:#f3f4f6;padding:2px 5px;border-radius:6px}@media(max-width:680px){.wrap{padding:14px}.card{padding:15px}.nav{overflow:auto;flex-wrap:nowrap;padding-bottom:4px}.nav a{white-space:nowrap}h1{font-size:26px}.btn{width:100%;margin-top:4px}.actions .btn{width:auto}.toolbar{display:grid}.table-wrap table{min-width:720px}}</style></head><body><div class="wrap">';
    echo '<div class="top"><div class="topbar"><div><h1>' . e($title) . '</h1>';
    if ($admin) {
        echo '<p class="muted">Signed in as ' . e($admin['full_name'] ?? '') . ' · ' . e($admin['role'] ?? 'staff') . '</p>';
    }
    echo '</div>';
    if ($admin) {
        echo '<div class="actions"><a class="btn light" href="change_password.php">Change password</a><a class="btn secondary" href="logout.php">Logout</a></div>';
    }
    echo '</div>';
    if ($admin) {
        echo '<nav class="nav" aria-label="Admin navigation">';
        foreach ($nav as [$href, $label, $permission]) {
            if (can($permission)) {
                echo '<a href="' . e($href) . '">' . e($label) . '</a>';
            }
        }
        echo '</nav>';
        echo '<p class="muted">Public site content updates usually appear through Vercel revalidation, with a 300-second fallback window.</p>';
    }
    echo '</div>';
}

function admin_footer(): void {
    echo '</div></body></html>';
}
