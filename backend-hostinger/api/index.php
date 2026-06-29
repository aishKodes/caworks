<?php
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('html_errors', '0');

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/rate_limit.php';
require_once __DIR__ . '/../includes/upload.php';
require_once __DIR__ . '/../includes/mailer.php';
require_once __DIR__ . '/../includes/razorpay.php';
require_once __DIR__ . '/../includes/whatsapp.php';
require_once __DIR__ . '/../includes/audit.php';
require_once __DIR__ . '/../includes/cms.php';

$config = app_config();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = rtrim((string) ($config['allowed_origin'] ?? 'https://www.vbcbharat.com'), '/');
if ($origin && rtrim($origin, '/') === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
} elseif ($origin !== '') {
    log_auth_issue('CORS blocked request from origin: ' . substr($origin, 0, 180), 403);
    json_response(['ok' => false, 'message' => 'Origin is not allowed.'], 403);
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '';
$path = preg_replace('#^.*?/api#', '', $uri);
$path = '/' . trim((string) $path, '/');
if ($path === '/') {
    ok(['status' => 'online']);
}

try {
    route($method, $path);
} catch (Throwable $e) {
    $requestId = 'ERR-' . bin2hex(random_bytes(5));
    try {
        if (db_column_exists('api_errors', 'request_id')) {
            db()->prepare('INSERT INTO api_errors (request_id, method, path, message, trace, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)')->execute([
                $requestId,
                $method,
                $path,
                $e->getMessage(),
                $e->getTraceAsString(),
                $_SERVER['REMOTE_ADDR'] ?? null,
                substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
            ]);
        }
    } catch (Throwable $ignored) {
    }
    if (($config['app_env'] ?? 'production') !== 'production') {
        json_response(['ok' => false, 'message' => $e->getMessage(), 'request_id' => $requestId], 500);
    }
    json_response(['ok' => false, 'message' => 'Something went wrong. Please try again or use WhatsApp.', 'request_id' => $requestId], 500);
}

function route(string $method, string $path): void {
    if ($method === 'GET' && $path === '/health') ok(['status' => 'online', 'time' => date('c')]);
    if ($method === 'POST' && $path === '/lead-event') handle_lead_event();
    if ($method === 'POST' && $path === '/quick-lead') handle_quick_lead();
    if ($method === 'POST' && $path === '/contact') handle_contact();
    if ($method === 'POST' && $path === '/signup') handle_signup();
    if ($method === 'POST' && $path === '/login') handle_login();
    if ($method === 'POST' && $path === '/logout') handle_logout();
    if ($method === 'GET' && $path === '/me') handle_me();
    if ($method === 'POST' && $path === '/guest-request') handle_guest_request();
    if ($method === 'POST' && $path === '/service-request') handle_service_request();
    if ($method === 'GET' && $path === '/my-requests') handle_my_requests();
    if ($method === 'GET' && preg_match('#^/request/(\d+)$#', $path, $m)) handle_request_detail((int) $m[1]);
    if ($method === 'POST' && $path === '/upload-documents') handle_upload_documents();
    if ($method === 'POST' && $path === '/create-razorpay-order') handle_create_razorpay_order();
    if ($method === 'POST' && $path === '/verify-razorpay-payment') handle_verify_razorpay_payment();
    if ($method === 'POST' && $path === '/manual-payment-screenshot') handle_manual_payment_screenshot();
    if ($method === 'POST' && $path === '/razorpay-webhook') handle_razorpay_webhook();

    if ($method === 'GET' && ($path === '/content/site' || $path === '/content/site-settings')) handle_content_site();
    if ($method === 'GET' && $path === '/content/homepage') handle_content_homepage();
    if ($method === 'GET' && $path === '/content/pricing') handle_content_pricing();
    if ($method === 'GET' && $path === '/content/services') handle_content_services();
    if ($method === 'GET' && preg_match('#^/content/service/([a-z0-9-]+)$#', $path, $m)) handle_content_service($m[1]);
    if ($method === 'GET' && preg_match('#^/content/services/([a-z0-9-]+)$#', $path, $m)) handle_content_service($m[1]);
    if ($method === 'GET' && $path === '/content/blog') handle_content_blog();
    if ($method === 'GET' && preg_match('#^/content/blog/([a-z0-9-]+)$#', $path, $m)) handle_content_blog_post($m[1]);
    if ($method === 'GET' && $path === '/content/faqs') handle_content_faqs();
    if ($method === 'GET' && $path === '/content/testimonials') handle_content_testimonials();
    if ($method === 'GET' && $path === '/content/local-pages') handle_content_local_pages();
    if ($method === 'GET' && preg_match('#^/content/local-pages/([a-z0-9-]+)$#', $path, $m)) handle_content_local_page($m[1]);
    if ($method === 'GET' && $path === '/content/service-document-requirements') handle_content_service_document_requirements();

    if ($method === 'POST' && $path === '/admin/login') handle_admin_login();
    if ($method === 'GET' && $path === '/admin/stats') handle_admin_stats();
    if ($method === 'GET' && $path === '/admin/leads') handle_admin_leads();
    if ($method === 'GET' && $path === '/admin/users') handle_admin_users();
    if ($method === 'GET' && $path === '/admin/requests') handle_admin_requests();
    if ($method === 'GET' && preg_match('#^/admin/request/(\d+)$#', $path, $m)) handle_admin_request_detail((int) $m[1]);
    if ($method === 'POST' && preg_match('#^/admin/request/(\d+)/status$#', $path, $m)) handle_admin_request_status((int) $m[1]);
    if ($method === 'POST' && preg_match('#^/admin/request/(\d+)/note$#', $path, $m)) handle_admin_note((int) $m[1]);
    if ($method === 'POST' && preg_match('#^/admin/payment/(\d+)/verify-manual$#', $path, $m)) handle_admin_manual_payment((int) $m[1], true);
    if ($method === 'POST' && preg_match('#^/admin/payment/(\d+)/reject-manual$#', $path, $m)) handle_admin_manual_payment((int) $m[1], false);
    if ($method === 'GET' && preg_match('#^/admin/document/(\d+)/download$#', $path, $m)) handle_admin_document_download((int) $m[1]);
    if ($method === 'GET' && $path === '/admin/export/leads') handle_admin_export_leads();
    if ($method === 'GET' && $path === '/admin/settings') handle_admin_settings_get();
    if ($method === 'POST' && $path === '/admin/settings') handle_admin_settings_post();
    if ($method === 'GET' && $path === '/admin/homepage') handle_admin_homepage_get();
    if ($method === 'POST' && $path === '/admin/homepage') handle_admin_homepage_post();
    if ($method === 'GET' && $path === '/admin/service-content') handle_admin_service_content_get();
    if ($method === 'POST' && $path === '/admin/service-content') handle_admin_service_content_post();
    if ($method === 'GET' && $path === '/admin/pricing') handle_admin_pricing_get();
    if ($method === 'POST' && $path === '/admin/pricing') handle_admin_pricing_post();
    if ($method === 'GET' && $path === '/admin/media') handle_admin_media_get();
    if ($method === 'POST' && $path === '/admin/media') handle_admin_media_post();
    if ($method === 'GET' && $path === '/admin/blog') handle_admin_blog_get();
    if ($method === 'POST' && $path === '/admin/blog') handle_admin_blog_post();
    if ($method === 'GET' && $path === '/admin/local-seo') handle_admin_local_seo_get();
    if ($method === 'POST' && $path === '/admin/local-seo') handle_admin_local_seo_post();
    if ($method === 'GET' && $path === '/admin/integrations') handle_admin_integrations_get();
    if ($method === 'POST' && $path === '/admin/integrations') handle_admin_integrations_post();

    fail('Endpoint not found.', 404);
}

function generate_code(string $prefix): string {
    return $prefix . '-' . random_int(100000, 999999);
}

function db_column_exists(string $table, string $column): bool {
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

function db_table_exists(string $table): bool {
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

function client_hash(?string $value): ?string {
    $value = trim((string) $value);
    return $value === '' ? null : hash('sha256', $value);
}

function attribution_from_payload(array $data): array {
    $source = is_array($data['attribution'] ?? null) ? $data['attribution'] : [];
    $keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'landing_page', 'referrer'];
    $result = [];
    foreach ($keys as $key) {
        $value = $source[$key] ?? $data[$key] ?? ($data['utm'][$key] ?? null);
        $result[$key] = clean_string($value ?? '', $key === 'landing_page' || $key === 'referrer' ? 500 : 180);
    }
    $sourceName = 'direct';
    $utmSource = strtolower($result['utm_source']);
    if ($result['gclid'] || $result['gbraid'] || $result['wbraid'] || str_contains($utmSource, 'google')) {
        $sourceName = 'google_ads';
    } elseif ($result['msclkid']) {
        $sourceName = 'microsoft_ads';
    } elseif ($utmSource) {
        $sourceName = $utmSource;
    } elseif ($result['referrer']) {
        $sourceName = 'referral';
    }
    $result['lead_source'] = clean_string($sourceName, 80);
    $result['user_agent_hash'] = client_hash($_SERVER['HTTP_USER_AGENT'] ?? '');
    $result['ip_hash'] = client_hash($_SERVER['REMOTE_ADDR'] ?? '');
    return $result;
}

function add_optional_tracking_columns(string $table, array &$columns, array &$values, array $attribution): void {
    $fieldMap = [
        'utm_source' => 'utm_source',
        'utm_medium' => 'utm_medium',
        'utm_campaign' => 'utm_campaign',
        'utm_term' => 'utm_term',
        'utm_content' => 'utm_content',
        'gclid' => 'gclid',
        'gbraid' => 'gbraid',
        'wbraid' => 'wbraid',
        'msclkid' => 'msclkid',
        'landing_page' => 'landing_page',
        'referrer' => 'referrer',
        'lead_source' => 'lead_source',
        'user_agent_hash' => 'user_agent_hash',
        'ip_hash' => 'ip_hash',
    ];
    foreach ($fieldMap as $column => $key) {
        if (db_column_exists($table, $column)) {
            $columns[] = $column;
            $values[] = $attribution[$key] ?: null;
        }
    }
}

function insert_row_dynamic(string $table, array $columns, array $values): void {
    $safeColumns = array_map(fn($column) => '`' . str_replace('`', '``', $column) . '`', $columns);
    $placeholders = implode(',', array_fill(0, count($safeColumns), '?'));
    db()->prepare('INSERT INTO `' . str_replace('`', '``', $table) . '` (' . implode(',', $safeColumns) . ') VALUES (' . $placeholders . ')')->execute($values);
}

function record_lead_event(string $eventName, array $payload, ?int $userId = null, ?int $requestId = null): void {
    if (!db_table_exists('lead_events')) return;
    $attribution = attribution_from_payload($payload);
    $columns = ['event_type', 'service', 'request_code', 'request_id', 'user_id', 'event_label', 'link_url', 'page_path'];
    $values = [
        clean_string($eventName, 120),
        clean_string($payload['service'] ?? $payload['service_slug'] ?? '', 160),
        clean_string($payload['request_id'] ?? $payload['request_code'] ?? '', 40),
        $requestId,
        $userId,
        clean_string($payload['event_label'] ?? '', 180),
        clean_string($payload['link_url'] ?? '', 500),
        clean_string($payload['page_path'] ?? '', 500),
    ];
    add_optional_tracking_columns('lead_events', $columns, $values, $attribution);
    best_effort(fn() => insert_row_dynamic('lead_events', $columns, $values));
}

function best_effort(callable $callback): void {
    try {
        $callback();
    } catch (Throwable $ignored) {
    }
}

function unique_public_code(string $prefix, string $table, string $column): string {
    do {
        $code = generate_code($prefix);
        $check = db()->prepare("SELECT id FROM {$table} WHERE {$column} = ? LIMIT 1");
        $check->execute([$code]);
    } while ($check->fetch());
    return $code;
}

function public_user_summary(array $user): array {
    return [
        'id' => (int) $user['id'],
        'tax_help_id' => (string) $user['tax_help_id'],
        'full_name' => (string) $user['full_name'],
        'name' => (string) $user['full_name'],
        'phone' => (string) $user['phone'],
        'email' => (string) ($user['email'] ?? ''),
    ];
}

function create_request_upload_access(int $requestId): array {
    $rawToken = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $expiresAt = (new DateTimeImmutable('+30 days'))->format('Y-m-d H:i:s');
    db()->prepare('UPDATE service_requests SET upload_token_hash=?, upload_token_expires_at=? WHERE id=?')->execute([
        hash('sha256', $rawToken),
        $expiresAt,
        $requestId,
    ]);
    return ['token' => $rawToken, 'expires_at' => $expiresAt];
}

function guest_request_user(string $name, string $phone, string $email): array {
    $stmt = db()->prepare('SELECT * FROM users WHERE phone=? LIMIT 1');
    $stmt->execute([$phone]);
    $existing = $stmt->fetch();
    if ($existing) {
        return $existing;
    }

    if ($email !== '') {
        $emailCheck = db()->prepare('SELECT id FROM users WHERE email=? LIMIT 1');
        $emailCheck->execute([$email]);
        if ($emailCheck->fetch()) {
            $email = '';
        }
    }

    $taxId = unique_public_code('TAX', 'users', 'tax_help_id');
    $columns = ['tax_help_id', 'full_name', 'phone', 'email', 'password_hash'];
    $values = [$taxId, $name, $phone, $email !== '' ? $email : null, null];
    if (db_column_exists('users', 'account_enabled')) {
        $columns[] = 'account_enabled';
        $values[] = 0;
    }
    $placeholders = implode(',', array_fill(0, count($columns), '?'));
    db()->prepare('INSERT INTO users (' . implode(',', $columns) . ') VALUES (' . $placeholders . ')')->execute($values);
    return [
        'id' => (int) db()->lastInsertId(),
        'tax_help_id' => $taxId,
        'full_name' => $name,
        'phone' => $phone,
        'email' => $email,
        'account_enabled' => 0,
    ];
}

function handle_lead_event(): void {
    $data = read_json();
    $eventName = clean_string($data['event_name'] ?? $data['event'] ?? '', 120);
    if ($eventName === '') {
        ok([], 'Ignored.');
    }
    $user = optional_user();
    $userId = $user ? (int) $user['id'] : null;
    $requestId = null;
    $requestCode = clean_string($data['request_id'] ?? $data['request_code'] ?? '', 40);
    if ($requestCode !== '') {
        $stmt = db()->prepare('SELECT id, user_id FROM service_requests WHERE request_code=? LIMIT 1');
        $stmt->execute([$requestCode]);
        $request = $stmt->fetch();
        if ($request) {
            $requestId = (int) $request['id'];
            $userId = $userId ?: (int) $request['user_id'];
        }
    }
    record_lead_event($eventName, $data, $userId, $requestId);
    ok([], 'Event recorded.');
}

function handle_quick_lead(): void {
    rate_limit('quick_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 8, 300);
    $data = read_json();
    if (clean_string($data['honeypot'] ?? '') !== '') ok([], 'Thank you.');
    require_fields($data, ['phone']);
    $phone = clean_string($data['phone'], 30);
    if (!valid_phone($phone)) fail('Please enter a valid phone number.', 422);
    $attribution = attribution_from_payload($data);
    $columns = ['name', 'phone', 'service', 'message', 'source_page'];
    $values = [
        clean_string($data['name'] ?? '', 160),
        $phone,
        clean_string($data['service'] ?? '', 120),
        clean_string($data['message'] ?? '', 1000),
        clean_string($data['sourcePage'] ?? '', 160),
    ];
    add_optional_tracking_columns('quick_leads', $columns, $values, $attribution);
    insert_row_dynamic('quick_leads', $columns, $values);
    $leadId = (int) db()->lastInsertId();
    record_lead_event('quick_lead_submit', ['service' => $values[2], 'event_label' => 'quick_lead', 'attribution' => $attribution], null, null);
    email_admin_template(
        'quick_lead_admin',
        [
            'name' => clean_string($data['name'] ?? 'Not shared', 160),
            'phone' => $phone,
            'service_name' => clean_string($data['service'] ?? 'Not shared', 120),
            'message' => clean_string($data['message'] ?? '', 1000),
        ],
        'New quick lead',
        "A new quick lead was submitted.\n\nPhone: {$phone}\nService: " . clean_string($data['service'] ?? 'Not shared')
    );
    ok([], 'Thank you. Our team will contact you on phone or WhatsApp.');
}

function handle_contact(): void {
    $data = read_json();
    if (clean_string($data['honeypot'] ?? '') !== '') ok([], 'Thank you.');
    require_fields($data, ['name', 'phone', 'message']);
    $phone = clean_string($data['phone'], 30);
    if (!valid_phone($phone)) fail('Please enter a valid phone number.', 422);
    $attribution = attribution_from_payload($data);
    $columns = ['name', 'phone', 'service', 'message', 'source_page'];
    $values = [clean_string($data['name'], 160), $phone, clean_string($data['service'] ?? '', 120), clean_string($data['message'], 1000), 'contact'];
    add_optional_tracking_columns('quick_leads', $columns, $values, $attribution);
    insert_row_dynamic('quick_leads', $columns, $values);
    email_admin_template(
        'contact_admin',
        [
            'name' => clean_string($data['name'], 160),
            'phone' => $phone,
            'service_name' => clean_string($data['service'] ?? 'Not shared', 120),
            'message' => clean_string($data['message'], 1000),
        ],
        'Contact form submission',
        "A contact form was submitted.\n\nPhone: {$phone}"
    );
    ok([], 'Thank you. We will contact you shortly.');
}

function handle_signup(): void {
    rate_limit('signup_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 600);
    $data = read_json();
    if (clean_string($data['honeypot'] ?? '') !== '') ok([], 'Thank you.');
    $fullName = clean_string($data['fullName'] ?? $data['name'] ?? '', 160);
    $data['fullName'] = $fullName;
    require_fields($data, ['fullName', 'phone', 'password']);
    $phone = clean_string($data['phone'], 30);
    $email = strtolower(clean_string($data['email'] ?? '', 180));
    $password = (string) $data['password'];
    $minimumPasswordLength = max(4, (int) (app_config()['MIN_PASSWORD_LENGTH'] ?? 4));
    if (!valid_phone($phone)) {
        fail('Please enter a valid phone number.', 422);
    }
    if ($email !== '' && !valid_email($email)) {
        fail('Please enter a valid email address or leave it blank.', 422);
    }
    if (strlen($password) < $minimumPasswordLength) {
        fail("Password or PIN must be at least {$minimumPasswordLength} characters.", 422);
    }

    $existing = db()->prepare('SELECT * FROM users WHERE phone = ? LIMIT 1');
    $existing->execute([$phone]);
    $existingUser = $existing->fetch();
    $emailOwner = null;
    if ($email !== '') {
        $emailCheck = db()->prepare('SELECT id, phone FROM users WHERE email = ? LIMIT 1');
        $emailCheck->execute([$email]);
        $emailOwner = $emailCheck->fetch();
        if ($emailOwner && (!$existingUser || (int) $emailOwner['id'] !== (int) $existingUser['id'])) {
            fail('An account already exists with this email. Please login to continue.', 409);
        }
    }

    if ($existingUser) {
        $accountEnabled = !db_column_exists('users', 'account_enabled') || (int) ($existingUser['account_enabled'] ?? 1) === 1;
        if ($accountEnabled && !empty($existingUser['password_hash'])) {
            fail('An account already exists with this phone/email. Please login to continue.', 409);
        }
        $emailValue = $email !== '' ? $email : ($existingUser['email'] ?: null);
        db()->prepare('UPDATE users SET full_name=?, email=?, password_hash=?, account_enabled=1, active=1, updated_at=NOW() WHERE id=?')->execute([
            $fullName,
            $emailValue,
            password_hash($password, PASSWORD_DEFAULT),
            (int) $existingUser['id'],
        ]);
        $userId = (int) $existingUser['id'];
        $taxId = (string) $existingUser['tax_help_id'];
    } else {
        $taxId = unique_public_code('TAX', 'users', 'tax_help_id');
        try {
            $stmt = db()->prepare('INSERT INTO users (tax_help_id, full_name, phone, email, password_hash, account_enabled) VALUES (?, ?, ?, ?, ?, 1)');
            $stmt->execute([$taxId, $fullName, $phone, $email !== '' ? $email : null, password_hash($password, PASSWORD_DEFAULT)]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                fail('An account already exists with this phone/email. Please login to continue.', 409);
            }
            throw $e;
        }
        $userId = (int) db()->lastInsertId();
    }
    $user = ['id' => $userId, 'tax_help_id' => $taxId, 'full_name' => $fullName, 'name' => $fullName, 'phone' => $phone, 'email' => $email];
    create_user_session($user);
    if (db_column_exists('users', 'last_login_at')) {
        db()->prepare('UPDATE users SET last_login_at=NOW() WHERE id=?')->execute([$userId]);
    }
    best_effort(fn() => queueWhatsAppMessage($userId, null, $phone, 'signup', whatsapp_template('signup', ['name' => $user['full_name'], 'tax_id' => $taxId])));
    best_effort(fn() => email_admin_template(
        'signup_admin',
        ['name' => $user['full_name'], 'phone' => $phone, 'email' => $email ?: 'Not shared', 'tax_id' => $taxId],
        'New signup',
        "A new user signed up.\n\nName: {$user['full_name']}\nTax Help ID: {$taxId}",
        $userId
    ));
    if ($email !== '') {
        best_effort(fn() => send_template_email(
            $email,
            'signup_user',
            ['name' => $user['full_name'], 'tax_id' => $taxId],
            'Your Tax Help ID',
            "Hello {$user['full_name']},\n\nYour Tax Help ID is {$taxId}.\nLogin to upload documents and track requests.",
            ['related_user_id' => $userId]
        ));
    }
    ok(['user' => $user], 'Account created successfully.');
}

function handle_login(): void {
    rate_limit('login_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 8, 300);
    $data = read_json();
    require_fields($data, ['identifier', 'password']);
    $id = clean_string($data['identifier'], 180);
    $stmt = db()->prepare('SELECT * FROM users WHERE phone = ? OR email = ? OR tax_help_id = ? LIMIT 1');
    $stmt->execute([$id, strtolower($id), strtoupper($id)]);
    $user = $stmt->fetch();
    if (
        !$user
        || (db_column_exists('users', 'account_enabled') && !(int) ($user['account_enabled'] ?? 0))
        || empty($user['password_hash'])
        || !password_verify((string) $data['password'], (string) $user['password_hash'])
    ) {
        fail('Invalid login details.', 401);
    }
    $summary = ['id' => (int) $user['id'], 'tax_help_id' => $user['tax_help_id'], 'full_name' => $user['full_name'], 'name' => $user['full_name'], 'phone' => $user['phone'], 'email' => $user['email']];
    create_user_session($summary);
    if (db_column_exists('users', 'last_login_at')) {
        db()->prepare('UPDATE users SET last_login_at=NOW() WHERE id=?')->execute([(int) $user['id']]);
    }
    ok(['user' => $summary], 'Welcome back. You are logged in.');
}

function handle_logout(): void {
    revoke_current_user_session();
    clear_auth_cookie(auth_cookie_name());
    clear_auth_cookie('tax_help_token');
    ok([], 'Logged out.');
}

function handle_me(): void {
    $user = require_user();
    $user['name'] = $user['full_name'] ?? '';
    ok($user);
}

function handle_guest_request(): void {
    rate_limit('guest_request_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 600);
    $data = read_json();
    if (clean_string($data['honeypot'] ?? '') !== '') ok([], 'Thank you.');
    require_fields($data, ['name', 'phone', 'service_slug']);

    $name = clean_string($data['name'], 160);
    $phone = clean_string($data['phone'], 30);
    $email = strtolower(clean_string($data['email'] ?? '', 180));
    $serviceSlug = clean_string($data['service_slug'], 120);
    $claimType = clean_string($data['claim_type'] ?? $data['claimType'] ?? '', 120);
    $message = clean_string($data['message'] ?? '', 2000);
    if (!valid_phone($phone)) fail('Please enter a valid phone number.', 422);
    if ($email !== '' && !valid_email($email)) fail('Please enter a valid email address or leave it blank.', 422);

    $user = guest_request_user($name, $phone, $email);
    $requestCode = unique_public_code('REQ', 'service_requests', 'request_code');
    $attribution = attribution_from_payload($data);
    $columns = ['request_code', 'user_id', 'service_type', 'status', 'details'];
    $values = [
        $requestCode,
        (int) $user['id'],
        $serviceSlug,
        'Request received',
        $message,
    ];
    if (db_column_exists('service_requests', 'claim_type')) {
        $columns[] = 'claim_type';
        $values[] = $claimType ?: null;
    }
    add_optional_tracking_columns('service_requests', $columns, $values, $attribution);
    insert_row_dynamic('service_requests', $columns, $values);
    $requestId = (int) db()->lastInsertId();
    record_lead_event($serviceSlug === 'insurance-claim-support' || str_contains($serviceSlug, 'insurance') || str_contains($serviceSlug, 'claim') ? 'insurance_lead_submit' : 'guest_request_submit', [
        'service' => $serviceSlug,
        'request_id' => $requestCode,
        'event_label' => $claimType ?: 'guest_request',
        'attribution' => $attribution,
    ], (int) $user['id'], $requestId);
    $access = create_request_upload_access($requestId);
    db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([
        $requestId,
        'Request received',
        'Request received. Documents can be uploaded now or later.',
    ]);
    best_effort(fn() => db()->prepare('INSERT INTO request_status_history (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([
        $requestId,
        'Request received',
        'Request received. Documents can be uploaded now or later.',
    ]));
    best_effort(fn() => email_admin_template(
        'service_request_admin',
        ['name' => $name, 'tax_id' => $user['tax_help_id'], 'request_id' => $requestCode, 'service_name' => $serviceSlug],
        'New guest service request',
        "A new guest request was created.\n\nRequest ID: {$requestCode}\nPhone: {$phone}\nService: {$serviceSlug}",
        (int) $user['id'],
        $requestId
    ));
    best_effort(fn() => queueWhatsAppMessage(
        (int) $user['id'],
        $requestId,
        $phone,
        'guest_request',
        "Hello {$name}, your request {$requestCode} has been received. You can upload documents using the secure link."
    ));

    $frontendUrl = rtrim((string) (app_config()['frontend_url'] ?? 'https://www.vbcbharat.com'), '/');
    $uploadPath = '/upload-documents?request=' . rawurlencode($requestCode) . '&token=' . rawurlencode($access['token']) . '&service=' . rawurlencode($serviceSlug);
    ok([
        'request_id' => $requestCode,
        'request_db_id' => $requestId,
        'upload_token' => $access['token'],
        'upload_url' => $frontendUrl . $uploadPath,
        'upload_path' => $uploadPath,
    ], 'Thank you. Your request has been received. Our team will contact you on phone or WhatsApp.');
}

function handle_service_request(): void {
    $user = require_user();
    $data = read_json();
    require_fields($data, ['serviceType']);
    $code = generate_code('REQ');
    $serviceType = clean_string($data['serviceType'], 120);
    $attribution = attribution_from_payload($data);
    $columns = ['request_code', 'user_id', 'service_type', 'status', 'city', 'details'];
    $values = [$code, $user['id'], $serviceType, 'Request received', clean_string($data['city'] ?? '', 120), clean_string($data['details'] ?? '', 2000)];
    if (db_column_exists('service_requests', 'claim_type')) {
        $columns[] = 'claim_type';
        $values[] = clean_string($data['claimType'] ?? $data['claim_type'] ?? '', 120) ?: null;
    }
    add_optional_tracking_columns('service_requests', $columns, $values, $attribution);
    insert_row_dynamic('service_requests', $columns, $values);
    $requestId = (int) db()->lastInsertId();
    db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([$requestId, 'Request received', 'Request created.']);
    record_lead_event(str_contains($serviceType, 'insurance') || str_contains($serviceType, 'claim') ? 'insurance_lead_submit' : 'service_request_submit', [
        'service' => $serviceType,
        'request_id' => $code,
        'event_label' => 'account_request',
        'attribution' => $attribution,
    ], (int) $user['id'], $requestId);
    email_admin_template(
        'service_request_admin',
        ['name' => $user['full_name'], 'tax_id' => $user['tax_help_id'], 'request_id' => $code, 'service_name' => $serviceType],
        'New service request',
        "A new service request was created.\n\nRequest ID: {$code}\nService: {$serviceType}",
        (int) $user['id'],
        $requestId
    );
    send_template_email(
        $user['email'],
        'service_request_user',
        ['name' => $user['full_name'], 'request_id' => $code, 'service_name' => $serviceType],
        'Request received',
        "Hello {$user['full_name']},\n\nYour request {$code} has been received. We will check the details and update you.",
        ['related_user_id' => (int) $user['id'], 'related_request_id' => $requestId]
    );
    ok(['request' => ['id' => $requestId, 'request_code' => $code, 'service_type' => clean_string($data['serviceType'], 120), 'status' => 'Request received', 'created_at' => date('c')]], 'Request created.');
}

function handle_my_requests(): void {
    $user = require_user();
    $stmt = db()->prepare('SELECT sr.*, COALESCE(MAX(p.status), "Payment pending") payment_status FROM service_requests sr LEFT JOIN payments p ON p.request_id = sr.id WHERE sr.user_id = ? GROUP BY sr.id ORDER BY sr.created_at DESC');
    $stmt->execute([$user['id']]);
    ok($stmt->fetchAll());
}

function handle_request_detail(int $id): void {
    $user = require_user();
    $stmt = db()->prepare('SELECT * FROM service_requests WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    $request = $stmt->fetch();
    if (!$request) fail('Request not found.', 404);
    $docLabelSelect = db_column_exists('documents', 'document_label') ? 'document_label,' : 'document_type AS document_label,';
    $uploadedSelect = db_column_exists('documents', 'uploaded_at') ? 'uploaded_at,' : 'created_at AS uploaded_at,';
    $docs = db()->prepare("SELECT id, document_type, {$docLabelSelect} original_name, size, {$uploadedSelect} created_at FROM documents WHERE request_id = ? ORDER BY created_at DESC");
    $docs->execute([$id]);
    $payments = db()->prepare('SELECT id, amount, method, status, created_at FROM payments WHERE request_id = ? ORDER BY created_at DESC');
    $payments->execute([$id]);
    $updates = db()->prepare('SELECT status, note, created_at FROM status_updates WHERE request_id = ? AND visible_to_user = 1 ORDER BY created_at ASC');
    $updates->execute([$id]);
    $request['documents'] = $docs->fetchAll();
    $request['payments'] = $payments->fetchAll();
    $request['status_updates'] = $updates->fetchAll();
    ok($request);
}

function handle_upload_documents(): void {
    $user = optional_user();
    $requestId = (int) ($_POST['request_id'] ?? 0);
    $requestCode = clean_string($_POST['request_code'] ?? $_POST['request'] ?? '', 40);
    $uploadToken = clean_string($_POST['upload_token'] ?? $_POST['token'] ?? '', 200);
    $guestTokenAuthorized = false;
    if (!$user && $requestCode !== '' && $uploadToken !== '') {
        $tokenHash = hash('sha256', $uploadToken);
        $guest = db()->prepare('
            SELECT sr.id request_id, u.id, u.tax_help_id, u.full_name, u.phone, u.email
            FROM service_requests sr
            JOIN users u ON u.id=sr.user_id
            WHERE sr.request_code=?
              AND sr.upload_token_hash=?
              AND (sr.upload_token_expires_at IS NULL OR sr.upload_token_expires_at > NOW())
            LIMIT 1
        ');
        $guest->execute([$requestCode, $tokenHash]);
        $guestRow = $guest->fetch();
        if ($guestRow) {
            $requestId = (int) $guestRow['request_id'];
            unset($guestRow['request_id']);
            $user = $guestRow;
            $guestTokenAuthorized = true;
        }
    }
    if (!$user) {
        fail('Please use the secure upload link from your request or login first.', 401);
    }
    if ($requestId > 0 && !$guestTokenAuthorized) {
        $check = db()->prepare('SELECT id FROM service_requests WHERE id = ? AND user_id = ?');
        $check->execute([$requestId, $user['id']]);
        if (!$check->fetch()) fail('Request not found.', 404);
    }
    $files = normalize_files_array($_FILES['files'] ?? []);
    $serviceSlug = clean_string($_POST['service_slug'] ?? '', 160);
    $uploadMessage = clean_string($_POST['message'] ?? '', 2000);
    $serviceLabel = clean_string($_POST['service_label'] ?? $serviceSlug, 160);
    $attribution = attribution_from_payload($_POST);
    if ($requestId <= 0 && $serviceSlug !== '') {
        $code = generate_code('REQ');
        $columns = ['request_code', 'user_id', 'service_type', 'status', 'city', 'details'];
        $values = [
            $code,
            $user['id'],
            $serviceSlug,
            $files ? 'Documents pending' : 'Draft',
            '',
            $uploadMessage ?: 'Document upload started.',
        ];
        add_optional_tracking_columns('service_requests', $columns, $values, $attribution);
        insert_row_dynamic('service_requests', $columns, $values);
        $requestId = (int) db()->lastInsertId();
        db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([
            $requestId,
            'Draft',
            'Request created from document upload.',
        ]);
    }
    if (!$files) {
        if ($serviceSlug === 'not-sure' && $uploadMessage !== '') {
            if ($requestId > 0) {
                db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([$requestId, 'More details required', 'Message received. The team will contact you for documents.']);
            }
            email_admin_template(
                'document_upload_admin',
                ['name' => $user['full_name'], 'tax_id' => $user['tax_help_id'], 'request_id' => $requestId ?: 'not linked', 'service_name' => 'Not sure', 'message' => $uploadMessage],
                'Document upload note received',
                "A document upload note was received.\n\nUser: {$user['tax_help_id']}",
                (int) $user['id'],
                $requestId ?: null
            );
            ok(['files' => [], 'errors' => [], 'request' => ['id' => $requestId]], 'Thank you. Your message has been received. Our team will contact you.');
        }
        fail('Please select files.', 422);
    }
    $documentTypes = array_values(is_array($_POST['document_types'] ?? null) ? $_POST['document_types'] : [$_POST['document_type'] ?? 'document']);
    $documentLabels = array_values(is_array($_POST['document_labels'] ?? null) ? $_POST['document_labels'] : [$_POST['document_label'] ?? $_POST['document_type'] ?? 'Document']);
    $saved = [];
    $errors = [];
    foreach ($files as $index => $file) {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) continue;
        try {
            $info = save_uploaded_file($file, 'doc');
            $type = clean_string($documentTypes[$index] ?? 'document', 120);
            $label = clean_string($documentLabels[$index] ?? $type, 180);
            $columns = ['user_id', 'request_id', 'document_type', 'document_label', 'original_name', 'stored_name', 'mime_type', 'size', 'path'];
            $values = [$user['id'], $requestId ?: null, $type, $label, $info['original_name'], $info['stored_name'], $info['mime_type'], $info['size'], $info['path']];
            add_optional_tracking_columns('uploaded_documents', $columns, $values, $attribution);
            insert_row_dynamic('uploaded_documents', $columns, $values);
            $uploadedDocumentId = (int) db()->lastInsertId();
            $docColumns = ['user_id', 'request_id', 'document_type', 'document_label', 'original_name', 'stored_name', 'mime_type', 'size', 'path'];
            $docValues = [$user['id'], $requestId ?: null, $type, $label, $info['original_name'], $info['stored_name'], $info['mime_type'], $info['size'], $info['path']];
            add_optional_tracking_columns('documents', $docColumns, $docValues, $attribution);
            insert_row_dynamic('documents', $docColumns, $docValues);
            $saved[] = [
                'id' => $uploadedDocumentId,
                'name' => $info['original_name'],
                'document_type' => $type,
                'document_label' => $label,
            ];
        } catch (Throwable $e) {
            $errors[] = [
                'name' => clean_string($file['name'] ?? 'File', 255),
                'message' => $e->getMessage(),
            ];
        }
    }
    if (!$saved && $errors) {
        fail('Upload failed: ' . implode('; ', array_map(fn($error) => $error['name'] . ' - ' . $error['message'], $errors)), 422);
    }
    if ($requestId > 0) {
        db()->prepare('UPDATE service_requests SET status = ? WHERE id = ?')->execute(['Documents received', $requestId]);
        db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([$requestId, 'Documents received', 'Documents uploaded.']);
    }
    record_lead_event('document_upload_submit', [
        'service' => $serviceSlug,
        'request_id' => $requestCode,
        'event_label' => count($saved) . ' files',
        'attribution' => $attribution,
    ], (int) $user['id'], $requestId ?: null);
    best_effort(fn() => email_admin_template(
        'document_upload_admin',
        [
            'name' => $user['full_name'],
            'tax_id' => $user['tax_help_id'],
            'request_id' => $requestId ?: 'not linked',
            'service_name' => $serviceLabel ?: 'Document upload',
            'message' => implode(', ', array_map(fn($file) => $file['document_label'] . ': ' . $file['name'], $saved)),
        ],
        'New documents uploaded',
        "Documents were uploaded.\n\nUser: {$user['tax_help_id']}",
        (int) $user['id'],
        $requestId ?: null
    ));
    if (!empty($user['email']) && valid_email((string) $user['email'])) {
        best_effort(fn() => send_template_email(
            $user['email'],
            'document_upload_user',
            ['name' => $user['full_name'], 'request_id' => $requestCode ?: ($requestId ?: 'new request'), 'service_name' => $serviceLabel ?: 'your service'],
            'Documents received',
            "Hello {$user['full_name']},\n\nYour documents have been received. We will check them and update your request status.",
            ['related_user_id' => (int) $user['id'], 'related_request_id' => $requestId ?: null]
        ));
    }
    $message = $errors ? 'Some files uploaded. Please check failed files and try again.' : 'Documents uploaded.';
    ok(['files' => $saved, 'errors' => $errors, 'request' => ['id' => $requestId]], $message);
}

function handle_create_razorpay_order(): void {
    $user = require_user();
    $data = read_json();
    $requestId = (int) ($data['request_id'] ?? 0);
    $amount = max(1, (float) ($data['amount'] ?? 0));
    $amountPaise = (int) round($amount * 100);
    $order = razorpay_create_order($amountPaise, 'REQ-' . $requestId);
    $stmt = db()->prepare('INSERT INTO payments (user_id, request_id, amount, method, status, razorpay_order_id) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$user['id'], $requestId, $amount, 'razorpay', 'Payment pending', $order['id']]);
    ok(['order_id' => $order['id'], 'amount' => $order['amount'], 'currency' => $order['currency']]);
}

function handle_verify_razorpay_payment(): void {
    $user = require_user();
    $data = read_json();
    require_fields($data, ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']);
    if (!razorpay_verify_signature($data['razorpay_order_id'], $data['razorpay_payment_id'], $data['razorpay_signature'])) {
        fail('Payment signature could not be verified.', 422);
    }
    $stmt = db()->prepare('UPDATE payments SET status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ? AND user_id = ?');
    $stmt->execute(['Payment received', $data['razorpay_payment_id'], $data['razorpay_order_id'], $user['id']]);
    email_admin_template(
        'payment_received_admin',
        ['name' => $user['full_name'], 'tax_id' => $user['tax_help_id'], 'request_id' => clean_string($data['razorpay_order_id'], 120), 'payment_id' => clean_string($data['razorpay_payment_id'], 120)],
        'Payment received',
        "Payment has been received.\n\nUser: {$user['tax_help_id']}",
        (int) $user['id']
    );
    send_template_email(
        $user['email'],
        'payment_received_user',
        ['name' => $user['full_name'], 'request_id' => clean_string($data['razorpay_order_id'], 120)],
        'Payment received',
        "Hello {$user['full_name']},\n\nYour payment has been received. Work will proceed as per the request status.",
        ['related_user_id' => (int) $user['id']]
    );
    ok([], 'Payment received.');
}

function handle_manual_payment_screenshot(): void {
    $user = require_user();
    $requestId = (int) ($_POST['request_id'] ?? 0);
    $amount = max(1, (float) ($_POST['amount'] ?? 0));
    $stmt = db()->prepare('INSERT INTO payments (user_id, request_id, amount, method, status) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$user['id'], $requestId, $amount, 'manual', 'Payment verification pending']);
    $paymentId = (int) db()->lastInsertId();
    $info = save_uploaded_file($_FILES['screenshot'] ?? [], 'payment');
    db()->prepare('INSERT INTO manual_payment_screenshots (payment_id, original_name, stored_name, path, status) VALUES (?, ?, ?, ?, ?)')->execute([$paymentId, $info['original_name'], $info['stored_name'], $info['path'], 'Payment verification pending']);
    email_admin_template(
        'manual_payment_pending_admin',
        ['name' => $user['full_name'], 'tax_id' => $user['tax_help_id'], 'request_id' => $requestId ?: 'not linked', 'amount' => $amount],
        'Manual payment screenshot pending verification',
        "A manual payment screenshot was uploaded.\n\nUser: {$user['tax_help_id']}\nAmount: {$amount}",
        (int) $user['id'],
        $requestId ?: null
    );
    queueWhatsAppMessage($user['id'], $requestId, $user['phone'], 'manual_payment_verification', whatsapp_template('manual_payment_verification', ['name' => $user['full_name']]));
    ok([], 'Payment screenshot received.');
}

function handle_razorpay_webhook(): void {
    $body = file_get_contents('php://input') ?: '';
    $signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
    if (!razorpay_verify_webhook($body, $signature)) fail('Invalid webhook.', 401);
    $event = json_decode($body, true);
    $paymentId = $event['payload']['payment']['entity']['id'] ?? null;
    $orderId = $event['payload']['payment']['entity']['order_id'] ?? null;
    if ($paymentId && $orderId) {
        db()->prepare('UPDATE payments SET status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ?')->execute(['Payment received', $paymentId, $orderId]);
        $stmt = db()->prepare('SELECT p.id payment_row_id, p.request_id, u.id user_id, u.full_name, u.email, u.tax_help_id, sr.request_code FROM payments p JOIN users u ON u.id=p.user_id LEFT JOIN service_requests sr ON sr.id=p.request_id WHERE p.razorpay_order_id=? LIMIT 1');
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        if ($row) {
            $requestLabel = $row['request_code'] ?: $orderId;
            email_admin_template(
                'payment_received_admin',
                ['name' => $row['full_name'], 'tax_id' => $row['tax_help_id'], 'request_id' => $requestLabel, 'payment_id' => $paymentId],
                'Payment received',
                "Razorpay webhook confirmed payment.\n\nUser: {$row['tax_help_id']}\nPayment: {$paymentId}",
                (int) $row['user_id'],
                $row['request_id'] ? (int) $row['request_id'] : null
            );
            send_template_email(
                $row['email'],
                'payment_received_user',
                ['name' => $row['full_name'], 'request_id' => $requestLabel],
                'Payment received',
                "Hello {$row['full_name']},\n\nYour payment has been received. Work will proceed as per the request status.",
                ['related_user_id' => (int) $row['user_id'], 'related_request_id' => $row['request_id'] ? (int) $row['request_id'] : null]
            );
        }
    }
    ok([], 'Webhook processed.');
}

function handle_content_site(): void {
    cms_public_cache_headers();
    $settings = cms_settings();
    $config = app_config();
    if (trim((string) ($settings['address'] ?? '')) === '') {
        $settings['address'] = trim((string) ($config['office_address'] ?? ''));
    }
    if (trim((string) ($settings['phone'] ?? '')) === '') {
        $settings['phone'] = trim((string) ($config['public_phone'] ?? '+91 73278 54329'));
    }
    if (trim((string) ($settings['public_email'] ?? '')) === '') {
        $settings['public_email'] = trim((string) ($config['public_email'] ?? ''));
    }
    if (trim((string) ($settings['support_email'] ?? '')) === '') {
        $settings['support_email'] = $settings['public_email'];
    }
    if (trim((string) ($settings['google_business_profile_url'] ?? '')) === '') {
        $settings['google_business_profile_url'] = trim((string) ($config['google_business_profile_url'] ?? ''));
    }
    if (trim((string) ($settings['google_maps_url'] ?? $settings['google_maps_link'] ?? '')) === '') {
        $settings['google_maps_url'] = trim((string) ($config['google_maps_url'] ?? ''));
    } elseif (!isset($settings['google_maps_url']) && isset($settings['google_maps_link'])) {
        $settings['google_maps_url'] = $settings['google_maps_link'];
    }
    if (trim((string) ($settings['google_review_url'] ?? '')) === '') {
        $settings['google_review_url'] = trim((string) ($config['google_review_url'] ?? ''));
    }
    ok($settings);
}

function handle_content_homepage(): void {
    cms_public_cache_headers();
    ok(cms_homepage_payload());
}

function handle_content_pricing(): void {
    cms_public_cache_headers();
    ok(cms_pricing_payload());
}

function handle_content_services(): void {
    cms_public_cache_headers();
    ok(cms_service_payload());
}

function handle_content_service(string $slug): void {
    cms_public_cache_headers();
    $rows = cms_service_payload($slug);
    if (!$rows) fail('Content not found.', 404);
    ok($rows[0]);
}

function handle_content_blog(): void {
    cms_public_cache_headers();
    ok(cms_blog_payload());
}

function handle_content_blog_post(string $slug): void {
    cms_public_cache_headers();
    $rows = cms_blog_payload($slug);
    if (!$rows) fail('Post not found.', 404);
    ok($rows[0]);
}

function handle_content_faqs(): void {
    cms_public_cache_headers();
    ok(cms_faq_payload($_GET['page'] ?? null, $_GET['service'] ?? null));
}

function handle_content_testimonials(): void {
    cms_public_cache_headers();
    ok(cms_testimonial_payload());
}

function handle_content_local_pages(): void {
    cms_public_cache_headers();
    ok(cms_local_page_payload());
}

function handle_content_local_page(string $slug): void {
    cms_public_cache_headers();
    $rows = cms_local_page_payload($slug);
    if (!$rows) fail('Content not found.', 404);
    ok($rows[0]);
}

function handle_content_service_document_requirements(): void {
    cms_public_cache_headers();
    $service = clean_string($_GET['service'] ?? '', 160);
    ok(cms_document_requirements_payload($service ?: null));
}

function handle_admin_settings_get(): void {
    require_admin_permission('manage_site_settings');
    ok(cms_settings());
}

function handle_admin_settings_post(): void {
    $admin = require_admin_permission('manage_site_settings');
    $data = read_json();
    foreach (($data['settings'] ?? []) as $key => $setting) {
        $value = is_array($setting['value'] ?? null) ? json_encode($setting['value']) : (string) ($setting['value'] ?? '');
        cms_upsert_setting(clean_string((string) $key, 120), $value, clean_string($setting['type'] ?? 'text', 40), clean_string($setting['group'] ?? 'site', 80));
    }
    audit_log((int) $admin['id'], null, 'api_settings_updated', 'Settings updated through API.');
    cms_revalidate_paths(['/', '/pricing', '/blog', '/sitemap.xml']);
    ok([], 'Settings saved.');
}

function handle_admin_homepage_get(): void {
    require_admin_permission('manage_homepage');
    ok(cms_homepage_payload());
}

function handle_admin_homepage_post(): void {
    $admin = require_admin_permission('manage_homepage');
    $data = read_json();
    $stmt = db()->prepare('INSERT INTO homepage_sections (section_key,title,subtitle,image_path,cta_primary_label,cta_primary_url,cta_secondary_label,cta_secondary_url,content_json,is_visible,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), image_path=VALUES(image_path), cta_primary_label=VALUES(cta_primary_label), cta_primary_url=VALUES(cta_primary_url), cta_secondary_label=VALUES(cta_secondary_label), cta_secondary_url=VALUES(cta_secondary_url), content_json=VALUES(content_json), is_visible=VALUES(is_visible), sort_order=VALUES(sort_order), updated_at=NOW()');
    $stmt->execute([
        'homepage',
        clean_string($data['heroTitle'] ?? '', 255),
        clean_string($data['heroSubtitle'] ?? '', 1000),
        clean_string($data['heroImage'] ?? '', 500),
        clean_string($data['primaryCtaLabel'] ?? '', 120),
        clean_string($data['primaryCtaHref'] ?? '', 255),
        clean_string($data['secondaryCtaLabel'] ?? '', 120),
        clean_string($data['secondaryCtaHref'] ?? '', 255),
        json_encode($data['content'] ?? []),
        !empty($data['isVisible']) ? 1 : 0,
        1,
    ]);
    audit_log((int) $admin['id'], null, 'api_homepage_updated', 'Homepage content updated through API.');
    cms_revalidate_paths(['/', '/sitemap.xml']);
    ok([], 'Homepage saved.');
}

function handle_admin_service_content_get(): void {
    require_admin_permission('manage_services');
    ok(cms_service_payload(null));
}

function handle_admin_service_content_post(): void {
    $admin = require_admin_permission('manage_services');
    $data = read_json();
    require_fields($data, ['slug', 'title']);
    $stmt = db()->prepare('INSERT INTO service_page_content (slug,title,subtitle,hero_image,sections_json,pricing_text,faqs_json,seo_title,seo_description,is_active) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), hero_image=VALUES(hero_image), sections_json=VALUES(sections_json), pricing_text=VALUES(pricing_text), faqs_json=VALUES(faqs_json), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), is_active=VALUES(is_active), updated_at=NOW()');
    $stmt->execute([
        clean_string($data['slug'], 160),
        clean_string($data['title'], 255),
        clean_string($data['subtitle'] ?? '', 2000),
        clean_string($data['heroImage'] ?? '', 500),
        json_encode($data['sections'] ?? []),
        clean_string($data['pricingText'] ?? '', 1000),
        json_encode($data['faqs'] ?? []),
        clean_string($data['seoTitle'] ?? '', 255),
        clean_string($data['seoDescription'] ?? '', 1000),
        !isset($data['isActive']) || $data['isActive'] ? 1 : 0,
    ]);
    audit_log((int) $admin['id'], null, 'api_service_content_saved', 'Service content saved: ' . clean_string($data['slug'], 160));
    cms_revalidate_paths(['/' . clean_string($data['slug'], 160), '/', '/sitemap.xml']);
    ok([], 'Service content saved.');
}

function handle_admin_pricing_get(): void {
    require_admin_permission('manage_pricing');
    $rows = db()->query('SELECT * FROM pricing_items ORDER BY visible_order ASC, id ASC')->fetchAll();
    ok($rows);
}

function handle_admin_pricing_post(): void {
    $admin = require_admin_permission('manage_pricing');
    $data = read_json();
    require_fields($data, ['serviceName', 'amountText']);
    $id = (int) ($data['id'] ?? 0);
    if ($id > 0) {
        $stmt = db()->prepare('UPDATE pricing_items SET service_name=?, amount_text=?, note=?, features_json=?, visible_order=?, active=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([clean_string($data['serviceName'], 180), clean_string($data['amountText'], 80), clean_string($data['note'] ?? '', 2000), json_encode($data['features'] ?? []), (int) ($data['visibleOrder'] ?? 0), !empty($data['active']) ? 1 : 0, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO pricing_items (service_name, amount_text, note, features_json, visible_order, active) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([clean_string($data['serviceName'], 180), clean_string($data['amountText'], 80), clean_string($data['note'] ?? '', 2000), json_encode($data['features'] ?? []), (int) ($data['visibleOrder'] ?? 0), !empty($data['active']) ? 1 : 0]);
    }
    audit_log((int) $admin['id'], null, 'api_pricing_saved', 'Pricing saved.');
    cms_revalidate_paths([
        '/pricing',
        '/',
        '/salary-itr-filing',
        '/itr-1-filing',
        '/itr-2-capital-gains-filing',
        '/freelancer-business-itr',
        '/gst-services',
        '/gst-registration',
        '/gst-return-filing',
        '/bookkeeping',
        '/tds-return-filing',
        '/payroll-compliance',
        '/tax-notice-help',
        '/business-registration',
        '/msme-udyam-registration',
        '/loan-project-report',
        '/subsidy-scheme-guidance',
        '/insurance-claim-support',
        '/insurance-claim-documentation-support',
        '/insurance-claim-rejected',
        '/health-insurance-claim-help',
        '/life-insurance-claim-assistance',
        '/motor-insurance-claim-support',
        '/personal-accident-insurance-claim',
        '/claim-form-preparation-support',
        '/insurance-claim-follow-up',
        '/settlement-documentation-assistance',
        '/nominee-claim-assistance',
        '/mediclaim-reimbursement-help',
        '/cashless-claim-denied',
        '/life-insurance-claim-dispute',
        '/motor-insurance-claim-dispute',
        '/property-insurance-claim-help',
        '/insurance-legal-escalation-support',
        '/sitemap.xml'
    ]);
    ok([], 'Pricing saved.');
}

function handle_admin_media_get(): void {
    require_admin_permission('manage_media');
    ok(db()->query('SELECT * FROM media_library ORDER BY created_at DESC LIMIT 200')->fetchAll());
}

function handle_admin_media_post(): void {
    $admin = require_admin_permission('manage_media');
    $info = save_media_file($_FILES['file'] ?? [], 'site');
    $stmt = db()->prepare('INSERT INTO media_library (original_name, stored_name, mime_type, size, path, public_url, alt_text, usage_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$info['original_name'], $info['stored_name'], $info['mime_type'], $info['size'], $info['path'], $info['public_url'], clean_string($_POST['alt_text'] ?? '', 255), clean_string($_POST['usage_key'] ?? '', 120)]);
    audit_log((int) $admin['id'], null, 'api_media_uploaded', 'Media uploaded: ' . $info['original_name']);
    ok($info, 'Media uploaded.');
}

function handle_admin_blog_get(): void {
    require_admin_permission('manage_blog');
    ok(db()->query('SELECT * FROM blog_posts_cms ORDER BY updated_at DESC LIMIT 200')->fetchAll());
}

function handle_admin_blog_post(): void {
    $admin = require_admin_permission('manage_blog');
    $data = read_json();
    require_fields($data, ['slug', 'title']);
    $stmt = db()->prepare('INSERT INTO blog_posts_cms (slug,title,summary,featured_image,content,seo_title,seo_description,published) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), featured_image=VALUES(featured_image), content=VALUES(content), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), published=VALUES(published), updated_at=NOW()');
    $stmt->execute([clean_string($data['slug'], 180), clean_string($data['title'], 255), clean_string($data['summary'] ?? '', 2000), clean_string($data['featuredImage'] ?? '', 500), (string) ($data['content'] ?? ''), clean_string($data['seoTitle'] ?? '', 255), clean_string($data['seoDescription'] ?? '', 1000), !empty($data['published']) ? 1 : 0]);
    $slug = clean_string($data['slug'], 180);
    audit_log((int) $admin['id'], null, 'api_blog_saved', 'Blog saved: ' . $slug);
    cms_revalidate_paths(['/blog', '/blog/' . $slug, '/sitemap.xml']);
    ok([], 'Blog post saved.');
}

function handle_admin_local_seo_get(): void {
    require_admin_permission('manage_seo');
    ok(db()->query('SELECT * FROM local_seo_pages ORDER BY city, slug')->fetchAll());
}

function handle_admin_local_seo_post(): void {
    $admin = require_admin_permission('manage_seo');
    $data = read_json();
    require_fields($data, ['city', 'slug', 'title']);
    $stmt = db()->prepare('INSERT INTO local_seo_pages (city,slug,title,body_content,meta_title,meta_description,image_path,active) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE city=VALUES(city), title=VALUES(title), body_content=VALUES(body_content), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), image_path=VALUES(image_path), active=VALUES(active), updated_at=NOW()');
    $stmt->execute([clean_string($data['city'], 120), clean_string($data['slug'], 180), clean_string($data['title'], 255), (string) ($data['bodyContent'] ?? ''), clean_string($data['metaTitle'] ?? '', 255), clean_string($data['metaDescription'] ?? '', 1000), clean_string($data['imagePath'] ?? '', 500), !empty($data['active']) ? 1 : 0]);
    $slug = clean_string($data['slug'], 180);
    audit_log((int) $admin['id'], null, 'api_local_seo_saved', 'Local SEO saved: ' . $slug);
    cms_revalidate_paths(['/' . $slug, '/sitemap.xml']);
    ok([], 'Local SEO page saved.');
}

function handle_admin_integrations_get(): void {
    require_admin_permission('manage_integrations');
    ok(db()->query('SELECT setting_key, setting_value, setting_group, is_secret, updated_at FROM integration_settings ORDER BY setting_group, setting_key')->fetchAll());
}

function handle_admin_integrations_post(): void {
    $admin = require_admin_permission('manage_integrations');
    $data = read_json();
    foreach (($data['settings'] ?? []) as $setting) {
        $stmt = db()->prepare('INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), setting_group=VALUES(setting_group), is_secret=VALUES(is_secret), updated_at=NOW()');
        $stmt->execute([clean_string($setting['key'] ?? '', 140), (string) ($setting['value'] ?? ''), clean_string($setting['group'] ?? 'general', 80), !empty($setting['secret']) ? 1 : 0]);
    }
    audit_log((int) $admin['id'], null, 'api_integrations_updated', 'Integration settings updated through API.');
    ok([], 'Integration settings saved.');
}

function handle_admin_login(): void {
    rate_limit('admin_login_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 8, 300);
    $data = read_json();
    require_fields($data, ['email', 'password']);
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE email = ? LIMIT 1');
    $stmt->execute([strtolower(clean_string($data['email'], 180))]);
    $admin = $stmt->fetch();
    if (!$admin || (isset($admin['active']) && !(int) $admin['active']) || !password_verify((string) $data['password'], $admin['password_hash'])) {
        audit_log($admin['id'] ?? null, null, 'api_admin_login_failed', 'Failed API admin login for ' . clean_string($data['email'], 180));
        fail('Invalid admin login.', 401);
    }
    db()->prepare('UPDATE admin_users SET last_login_at=NOW(), login_count=COALESCE(login_count,0)+1 WHERE id=?')->execute([(int) $admin['id']]);
    audit_log((int) $admin['id'], null, 'api_admin_login', 'Admin API login.');
    $summary = ['id' => (int) $admin['id'], 'email' => $admin['email'], 'full_name' => $admin['full_name'], 'role' => $admin['role'] ?? 'admin'];
    $token = create_admin_token($summary);
    set_auth_cookie('admin_token', $token, 60 * 60 * 12);
    ok(['token' => $token, 'admin' => $summary]);
}

function handle_admin_stats(): void {
    require_admin_permission('view_dashboard');
    $queries = [
        'new_leads_today' => "SELECT COUNT(*) c FROM quick_leads WHERE DATE(created_at)=CURDATE()",
        'new_itr_requests' => "SELECT COUNT(*) c FROM service_requests WHERE service_type LIKE '%itr%' AND DATE(created_at)=CURDATE()",
        'documents_pending' => "SELECT COUNT(*) c FROM service_requests WHERE status='Documents pending'",
        'payments_pending' => "SELECT COUNT(*) c FROM payments WHERE status='Payment pending'",
        'manual_payments_to_verify' => "SELECT COUNT(*) c FROM manual_payment_screenshots WHERE status='Payment verification pending'",
        'in_progress' => "SELECT COUNT(*) c FROM service_requests WHERE status IN ('Under review','Filing in progress')",
        'completed' => "SELECT COUNT(*) c FROM service_requests WHERE status='Completed'",
        'quick_phone_leads' => "SELECT COUNT(*) c FROM quick_leads"
    ];
    $stats = [];
    foreach ($queries as $key => $sql) {
        $stats[$key] = (int) db()->query($sql)->fetch()['c'];
    }
    ok($stats);
}

function handle_admin_leads(): void {
    require_admin_permission('view_leads');
    $stmt = db()->query('SELECT * FROM quick_leads ORDER BY created_at DESC LIMIT 200');
    ok($stmt->fetchAll());
}

function handle_admin_users(): void {
    require_admin_permission('manage_users');
    $stmt = db()->query('SELECT id, tax_help_id, full_name, phone, email, created_at FROM users ORDER BY created_at DESC LIMIT 200');
    ok($stmt->fetchAll());
}

function handle_admin_requests(): void {
    require_admin_permission('view_requests');
    $stmt = db()->query('SELECT sr.*, u.tax_help_id, u.full_name, u.phone FROM service_requests sr JOIN users u ON u.id=sr.user_id ORDER BY sr.created_at DESC LIMIT 300');
    ok($stmt->fetchAll());
}

function handle_admin_request_detail(int $id): void {
    require_admin_permission('view_requests');
    $stmt = db()->prepare('SELECT sr.*, u.tax_help_id, u.full_name, u.phone, u.email FROM service_requests sr JOIN users u ON u.id=sr.user_id WHERE sr.id=?');
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    if (!$request) fail('Request not found.', 404);
    $docs = db()->prepare('SELECT * FROM documents WHERE request_id=? ORDER BY created_at DESC');
    $docs->execute([$id]);
    $request['documents'] = $docs->fetchAll();
    ok($request);
}

function handle_admin_request_status(int $id): void {
    $admin = require_admin_permission('manage_requests');
    $data = read_json();
    require_fields($data, ['status']);
    $status = clean_string($data['status'], 80);
    db()->prepare('UPDATE service_requests SET status=? WHERE id=?')->execute([$status, $id]);
    db()->prepare('INSERT INTO status_updates (request_id, status, note, visible_to_user) VALUES (?, ?, ?, 1)')->execute([$id, $status, clean_string($data['note'] ?? '', 1000)]);
    audit_log($admin['id'], null, 'request_status_update', "Request {$id}: {$status}");
    ok([], 'Status updated.');
}

function handle_admin_note(int $id): void {
    $admin = require_admin_permission('manage_requests');
    $data = read_json();
    require_fields($data, ['note']);
    db()->prepare('INSERT INTO admin_notes (request_id, admin_id, note) VALUES (?, ?, ?)')->execute([$id, $admin['id'], clean_string($data['note'], 2000)]);
    ok([], 'Note added.');
}

function handle_admin_manual_payment(int $paymentId, bool $verified): void {
    $admin = require_admin_permission('verify_payments');
    $status = $verified ? 'Payment received' : 'Payment rejected';
    db()->prepare('UPDATE payments SET status=? WHERE id=?')->execute([$status, $paymentId]);
    db()->prepare('UPDATE manual_payment_screenshots SET status=?, verified_at=NOW() WHERE payment_id=?')->execute([$status, $paymentId]);
    audit_log($admin['id'], null, 'manual_payment_' . ($verified ? 'verified' : 'rejected'), "Payment {$paymentId}");
    ok([], 'Payment updated.');
}

function handle_admin_document_download(int $id): void {
    $admin = require_admin_permission('download_documents');
    $stmt = db()->prepare('SELECT * FROM documents WHERE id=?');
    $stmt->execute([$id]);
    $doc = $stmt->fetch();
    if (!$doc || !is_file($doc['path'])) fail('Document not found.', 404);
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($doc['original_name']) . '"');
    header('Content-Length: ' . filesize($doc['path']));
    audit_log((int) $admin['id'], (int) ($doc['user_id'] ?? 0), 'api_document_download', 'Document ' . $id . ' downloaded.');
    readfile($doc['path']);
    exit;
}

function handle_admin_export_leads(): void {
    $admin = require_admin_permission('export_data');
    audit_log((int) $admin['id'], null, 'api_lead_export', 'Leads CSV exported through API.');
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="leads.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['id', 'name', 'phone', 'service', 'message', 'status', 'created_at']);
    foreach (db()->query('SELECT id, name, phone, service, message, status, created_at FROM quick_leads ORDER BY created_at DESC') as $row) {
        fputcsv($out, $row);
    }
    fclose($out);
    exit;
}
