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
    $cookieToken = $_COOKIE[auth_cookie_name()] ?? ($_COOKIE['tax_help_token'] ?? null);
    if ($cookieToken) {
        return $cookieToken;
    }
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return null;
}

function auth_cookie_name(): string {
    $config = app_config();
    return (string) ($config['SESSION_COOKIE_NAME'] ?? $config['session_cookie_name'] ?? 'vbc_session');
}

function auth_cookie_domain(): string {
    $config = app_config();
    return (string) ($config['SESSION_COOKIE_DOMAIN'] ?? $config['session_cookie_domain'] ?? '');
}

function auth_session_days(): int {
    $config = app_config();
    return max(1, (int) ($config['SESSION_DAYS'] ?? $config['session_days'] ?? 30));
}

function current_request_token_hash(?string $token = null): ?string {
    $token = $token ?? bearer_token();
    return $token ? hash('sha256', $token) : null;
}

function table_exists_auth(string $table): bool {
    static $cache = [];
    if (array_key_exists($table, $cache)) {
        return $cache[$table];
    }
    try {
        $stmt = db()->prepare('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1');
        $stmt->execute([$table]);
        $cache[$table] = (bool) $stmt->fetch();
    } catch (Throwable $ignored) {
        $cache[$table] = false;
    }
    return $cache[$table];
}

function create_user_session(array $user): string {
    $rawToken = base64url_encode_text(random_bytes(32));
    if (table_exists_auth('user_sessions')) {
        $expires = (new DateTimeImmutable('+' . auth_session_days() . ' days'))->format('Y-m-d H:i:s');
        $stmt = db()->prepare('INSERT INTO user_sessions (user_id, token_hash, expires_at, last_used_at, user_agent, ip_hash) VALUES (?, ?, ?, NOW(), ?, ?)');
        $stmt->execute([
            (int) $user['id'],
            hash('sha256', $rawToken),
            $expires,
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
            hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '')),
        ]);
    }
    set_auth_cookie(auth_cookie_name(), $rawToken, 60 * 60 * 24 * auth_session_days());
    return $rawToken;
}

function user_from_session_token(?string $token): ?array {
    if (!$token || !table_exists_auth('user_sessions')) {
        return null;
    }
    try {
        $stmt = db()->prepare('
            SELECT u.id, u.tax_help_id, u.full_name, u.phone, u.email
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ?
              AND s.revoked_at IS NULL
              AND s.expires_at > NOW()
              AND COALESCE(u.active, 1) = 1
            LIMIT 1
        ');
        $stmt->execute([hash('sha256', $token)]);
        $user = $stmt->fetch();
        if ($user) {
            db()->prepare('UPDATE user_sessions SET last_used_at = NOW() WHERE token_hash = ?')->execute([hash('sha256', $token)]);
            return $user;
        }
    } catch (Throwable $ignored) {
    }
    return null;
}

function revoke_current_user_session(): void {
    $hash = current_request_token_hash();
    if ($hash && table_exists_auth('user_sessions')) {
        try {
            db()->prepare('UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = ?')->execute([$hash]);
        } catch (Throwable $ignored) {
        }
    }
}

function require_user(): array {
    $user = optional_user();
    if (!$user) {
        fail('Please login first.', 401);
    }
    return $user;
}

function optional_user(): ?array {
    $token = bearer_token();
    $sessionUser = user_from_session_token($token);
    if ($sessionUser) {
        return $sessionUser;
    }

    $payload = verify_token($token, 'user');
    if (!$payload) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, tax_help_id, full_name, phone, email FROM users WHERE id = ?');
    $stmt->execute([(int) $payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) {
        return null;
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
    $config = app_config();
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || str_starts_with((string) ($config['app_url'] ?? ''), 'https://');
    $params = [
        'expires' => time() + $ttl,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
    $domain = $name === auth_cookie_name() ? auth_cookie_domain() : (string) ($config['admin_cookie_domain'] ?? '');
    if ($domain !== '') {
        $params['domain'] = $domain;
    }
    setcookie($name, $value, $params);
}

function clear_auth_cookie(string $name): void {
    $config = app_config();
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || str_starts_with((string) ($config['app_url'] ?? ''), 'https://');
    $params = [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
    $domain = $name === auth_cookie_name() ? auth_cookie_domain() : (string) ($config['admin_cookie_domain'] ?? '');
    if ($domain !== '') {
        $params['domain'] = $domain;
    }
    setcookie($name, '', $params);
}
