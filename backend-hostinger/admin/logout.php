<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = current_admin();
if (!$admin && admin_logged_in()) {
    try {
        $stmt = db()->prepare('SELECT * FROM admin_users WHERE id=?');
        $stmt->execute([$_SESSION['admin_id']]);
        $admin = $stmt->fetch() ?: null;
    } catch (Throwable $ignored) {
    }
}
if ($admin) {
    audit_log((int) $admin['id'], null, 'admin_logout', 'Admin logged out.');
}
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
}
session_destroy();
header('Location: login.php');
exit;
