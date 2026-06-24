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

function auth_config_bool(string $key, bool $default): bool {
    $config = app_config();
    $value = $config[$key] ?? $config[strtolower($key)] ?? $default;
    if (is_bool($value)) {
        return $value;
    }
    return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
}

function auth_cookie_samesite(): string {
    $config = app_config();
    $value = ucfirst(strtolower((string) ($config['SESSION_SAMESITE'] ?? $config['session_samesite'] ?? 'Lax')));
    return in_array($value, ['Lax', 'Strict', 'None'], true) ? $value : 'Lax';
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

function column_exists_auth(string $table, string $column): bool {
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

function log_auth_issue(string $message, ?int $httpStatus = 401): void {
    if (!table_exists_auth('api_errors')) {
        return;
    }
    try {
        $columns = ['request_id', 'method', 'path', 'message', 'trace', 'ip_address', 'user_agent'];
        $values = [
            'AUTH-' . bin2hex(random_bytes(5)),
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/api/me'), PHP_URL_PATH),
            $message,
            null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        ];
        if (column_exists_auth('api_errors', 'http_status')) {
            $columns[] = 'http_status';
            $values[] = $httpStatus;
        }
        $stmt = db()->prepare('INSERT INTO api_errors (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')');
        $stmt->execute($values);
    } catch (Throwable $ignored) {
    }
}

function create_user_session(array $user): string {
    $rawToken = base64url_encode_text(random_bytes(32));
    if (table_exists_auth('user_sessions')) {
        $expires = (new DateTimeImmutable('+' . auth_session_days() . ' days'))->format('Y-m-d H:i:s');
        $agent = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255);
        $columns = ['user_id', 'token_hash', 'expires_at', 'last_used_at', 'user_agent', 'ip_hash'];
        $values = ['?', '?', '?', 'NOW()', '?', '?'];
        $params = [(int) $user['id'], hash('sha256', $rawToken), $expires, $agent, hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''))];
        if (column_exists_auth('user_sessions', 'last_seen_at')) {
            $columns[] = 'last_seen_at';
            $values[] = 'NOW()';
        }
        if (column_exists_auth('user_sessions', 'user_agent_hash')) {
            $columns[] = 'user_agent_hash';
            $values[] = '?';
            $params[] = hash('sha256', $agent);
        }
        $stmt = db()->prepare('INSERT INTO user_sessions (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $values) . ')');
        $stmt->execute($params);
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
            SELECT u.id, u.tax_help_id, u.full_name, u.phone, u.email, u.active,
                   s.id AS session_id, s.expires_at, s.revoked_at
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ?
            LIMIT 1
        ');
        $tokenHash = hash('sha256', $token);
        $stmt->execute([$tokenHash]);
        $user = $stmt->fetch();
        if (!$user) {
            log_auth_issue('Session token was not found.');
            return null;
        }
        if (!empty($user['revoked_at'])) {
            log_auth_issue('A revoked customer session was presented.');
            return null;
        }
        $expiresAt = strtotime((string) $user['expires_at']);
        if (!$expiresAt || $expiresAt <= time()) {
            log_auth_issue('An expired customer session was presented.');
            return null;
        }
        if (isset($user['active']) && !(int) $user['active']) {
            log_auth_issue('An inactive customer account attempted authentication.');
            return null;
        }

        $updates = ['last_used_at = NOW()'];
        if (column_exists_auth('user_sessions', 'last_seen_at')) {
            $updates[] = 'last_seen_at = NOW()';
        }
        if (($expiresAt - time()) < 7 * 86400) {
            $newExpiry = (new DateTimeImmutable('+' . auth_session_days() . ' days'))->format('Y-m-d H:i:s');
            $updates[] = 'expires_at = ' . db()->quote($newExpiry);
            set_auth_cookie(auth_cookie_name(), $token, 60 * 60 * 24 * auth_session_days());
        }
        db()->prepare('UPDATE user_sessions SET ' . implode(', ', $updates) . ' WHERE token_hash = ?')->execute([$tokenHash]);
        unset($user['session_id'], $user['expires_at'], $user['revoked_at'], $user['active']);
        return $user;
    } catch (Throwable $e) {
        log_auth_issue('Customer session lookup failed: ' . $e->getMessage());
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
        log_auth_issue('Authentication was required but no valid customer session was available.');
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
    $detectedSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || str_starts_with((string) ($config['app_url'] ?? ''), 'https://');
    $secure = auth_config_bool('SESSION_SECURE', $detectedSecure);
    $params = [
        'expires' => time() + $ttl,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => auth_cookie_samesite(),
    ];
    $domain = $name === auth_cookie_name() ? auth_cookie_domain() : (string) ($config['admin_cookie_domain'] ?? '');
    if ($domain !== '') {
        $params['domain'] = $domain;
    }
    if (!setcookie($name, $value, $params)) {
        log_auth_issue('Customer session cookie could not be set.', null);
    }
}

function clear_auth_cookie(string $name): void {
    $config = app_config();
    $detectedSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || str_starts_with((string) ($config['app_url'] ?? ''), 'https://');
    $secure = auth_config_bool('SESSION_SECURE', $detectedSecure);
    $params = [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => auth_cookie_samesite(),
    ];
    $domain = $name === auth_cookie_name() ? auth_cookie_domain() : (string) ($config['admin_cookie_domain'] ?? '');
    if ($domain !== '') {
        $params['domain'] = $domain;
    }
    if (!setcookie($name, '', $params)) {
        log_auth_issue('Customer session cookie could not be cleared.', null);
    }
}
