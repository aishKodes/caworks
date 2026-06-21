<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

function base64url_encode_text(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode_text(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function create_auth_token(array $user): string {
    $config = app_config();
    $payload = [
        'sub' => (int) $user['id'],
        'type' => 'user',
        'exp' => time() + 60 * 60 * 24 * 30,
    ];
    $body = base64url_encode_text(json_encode($payload));
    $sig = hash_hmac('sha256', $body, $config['app_secret']);
    return $body . '.' . $sig;
}

function create_admin_token(array $admin): string {
    $config = app_config();
    $payload = [
        'sub' => (int) $admin['id'],
        'type' => 'admin',
        'exp' => time() + 60 * 60 * 12,
    ];
    $body = base64url_encode_text(json_encode($payload));
    $sig = hash_hmac('sha256', $body, $config['app_secret']);
    return $body . '.' . $sig;
}

function verify_token(?string $token, string $type): ?array {
    if (!$token || !str_contains($token, '.')) {
        return null;
    }
    [$body, $sig] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $body, app_config()['app_secret']);
    if (!hash_equals($expected, $sig)) {
        return null;
    }
    $payload = json_decode(base64url_decode_text($body), true);
    if (!is_array($payload) || ($payload['type'] ?? '') !== $type || (int) ($payload['exp'] ?? 0) < time()) {
        return null;
    }
    return $payload;
}

function bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return $_COOKIE['tax_help_token'] ?? null;
}

function require_user(): array {
    $payload = verify_token(bearer_token(), 'user');
    if (!$payload) {
        fail('Please login first.', 401);
    }
    $stmt = db()->prepare('SELECT id, tax_help_id, full_name, phone, email FROM users WHERE id = ?');
    $stmt->execute([(int) $payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) {
        fail('User not found.', 401);
    }
    return $user;
}

function admin_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return $_COOKIE['admin_token'] ?? null;
}

function require_admin(): array {
    $payload = verify_token(admin_token(), 'admin');
    if (!$payload) {
        fail('Admin login required.', 401);
    }
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE id = ?');
    $stmt->execute([(int) $payload['sub']]);
    $admin = $stmt->fetch();
    if (!$admin || (isset($admin['active']) && !(int) $admin['active'])) {
        fail('Admin not found.', 401);
    }
    $admin['role'] = $admin['role'] ?? 'super_admin';
    return $admin;
}

function admin_api_permissions(): array {
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

function admin_can_api(array $admin, string $permission): bool {
    $role = $admin['role'] ?? 'viewer';
    if ($role === 'super_admin') return true;
    try {
        $stmt = db()->prepare('SELECT 1 FROM admin_user_permissions WHERE admin_id=? AND permission_key=? LIMIT 1');
        $stmt->execute([(int) $admin['id'], $permission]);
        if ($stmt->fetch()) return true;
        $stmt = db()->prepare('SELECT 1 FROM admin_role_permissions WHERE role_key=? AND permission_key=? LIMIT 1');
        $stmt->execute([$role, $permission]);
        if ($stmt->fetch()) return true;
    } catch (Throwable $ignored) {
    }
    return in_array($permission, admin_api_permissions()[$role] ?? [], true);
}

function require_admin_permission(string $permission): array {
    $admin = require_admin();
    if (!admin_can_api($admin, $permission)) {
        fail('Access denied.', 403);
    }
    return $admin;
}

function set_auth_cookie(string $name, string $value, int $ttl): void {
    setcookie($name, $value, [
        'expires' => time() + $ttl,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);
}
