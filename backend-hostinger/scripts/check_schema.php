<?php
if (PHP_SAPI !== 'cli') {
    exit("Run from CLI only.\n");
}
require_once __DIR__ . '/../includes/db.php';

$required = [
    'users',
    'user_sessions',
    'admin_users',
    'admin_roles',
    'admin_permissions',
    'quick_leads',
    'service_requests',
    'documents',
    'service_document_requirements',
    'payments',
    'manual_payment_screenshots',
    'site_settings',
    'homepage_sections',
    'service_page_content',
    'services',
    'service_sections',
    'service_faqs',
    'pricing_items',
    'blog_posts_cms',
    'blog_posts',
    'faqs',
    'testimonials',
    'local_seo_pages',
    'local_pages',
    'media_library',
    'integration_settings',
    'email_templates',
    'email_logs',
    'whatsapp_messages',
    'api_errors',
    'app_settings',
    'revalidation_logs',
];

$missing = [];
foreach ($required as $table) {
    $stmt = db()->prepare('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1');
    $stmt->execute([$table]);
    if (!$stmt->fetch()) {
        $missing[] = $table;
    }
}

if ($missing) {
    echo "Missing tables:\n";
    foreach ($missing as $table) {
        echo "- {$table}\n";
    }
    exit(1);
}

echo "Schema check passed. Required tables exist.\n";
