<?php
require_once __DIR__ . '/db.php';

function audit_log(?int $adminId, ?int $userId, string $action, ?string $details = null): void {
    try {
        $stmt = db()->prepare('INSERT INTO audit_logs (admin_id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$adminId, $userId, $action, $details, $_SERVER['REMOTE_ADDR'] ?? null]);
    } catch (Throwable $ignored) {
    }
}
