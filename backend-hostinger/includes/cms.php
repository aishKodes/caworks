<?php
require_once __DIR__ . '/db.php';

function cms_decode_json(?string $value, array $fallback = []): array {
    if (!$value) return $fallback;
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function cms_settings(?string $group = null): array {
    $sql = 'SELECT setting_key, setting_value, setting_type, group_name FROM site_settings';
    $params = [];
    if ($group) {
        $sql .= ' WHERE group_name = ?';
        $params[] = $group;
    }
    $sql .= ' ORDER BY group_name, setting_key';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $value = $row['setting_value'];
        if ($row['setting_type'] === 'json') {
            $value = cms_decode_json($value);
        } elseif ($row['setting_type'] === 'boolean') {
            $value = $value === '1';
        }
        $settings[$row['setting_key']] = $value;
    }
    return $settings;
}

function cms_upsert_setting(string $key, string $value, string $type = 'text', string $group = 'site'): void {
    $stmt = db()->prepare('INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), setting_type=VALUES(setting_type), group_name=VALUES(group_name), updated_at=NOW()');
    $stmt->execute([$key, $value, $type, $group]);
}

function cms_homepage_payload(): array {
    $stmt = db()->prepare('SELECT * FROM homepage_sections WHERE section_key = ? LIMIT 1');
    $stmt->execute(['homepage']);
    $row = $stmt->fetch();
    $content = $row ? cms_decode_json($row['content_json'] ?? null) : [];

    return [
        'heroTitle' => $row['title'] ?? ($content['heroTitle'] ?? null),
        'heroSubtitle' => $row['subtitle'] ?? ($content['heroSubtitle'] ?? null),
        'heroImage' => $row['image_path'] ?? ($content['heroImage'] ?? null),
        'primaryCtaLabel' => $row['cta_primary_label'] ?? ($content['primaryCtaLabel'] ?? null),
        'primaryCtaHref' => $row['cta_primary_url'] ?? ($content['primaryCtaHref'] ?? null),
        'secondaryCtaLabel' => $row['cta_secondary_label'] ?? ($content['secondaryCtaLabel'] ?? null),
        'secondaryCtaHref' => $row['cta_secondary_url'] ?? ($content['secondaryCtaHref'] ?? null),
        'trustBadges' => $content['trustBadges'] ?? [],
        'featuredServices' => $content['featuredServices'] ?? [],
        'sectionVisibility' => $content['sectionVisibility'] ?? [],
        'testimonials' => $content['testimonials'] ?? [],
        'faqs' => $content['faqs'] ?? [],
        'finalCtaTitle' => $content['finalCtaTitle'] ?? null,
        'finalCtaDescription' => $content['finalCtaDescription'] ?? null,
    ];
}

function cms_pricing_payload(): array {
    $rows = db()->query('SELECT * FROM pricing_items WHERE active = 1 ORDER BY visible_order ASC, id ASC')->fetchAll();
    return array_map(function (array $row): array {
        $features = cms_decode_json($row['features_json'] ?? null, []);
        return [
            'name' => $row['service_name'],
            'price' => $row['amount_text'],
            'description' => $row['note'] ?: 'Final fee depends on documents, income type and complexity.',
            'features' => $features ?: ['Clear fee before work', 'Secure upload', 'Status tracking'],
        ];
    }, $rows);
}

function cms_service_payload(?string $slug = null): array {
    $sql = 'SELECT * FROM service_page_content WHERE is_active = 1';
    $params = [];
    if ($slug) {
        $sql .= ' AND slug = ?';
        $params[] = $slug;
    }
    $sql .= ' ORDER BY slug';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    return array_map(function (array $row): array {
        return [
            'slug' => $row['slug'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'],
            'heroImage' => $row['hero_image'],
            'sections' => cms_decode_json($row['sections_json'] ?? null, []),
            'pricingText' => $row['pricing_text'],
            'faqs' => cms_decode_json($row['faqs_json'] ?? null, []),
            'seoTitle' => $row['seo_title'],
            'seoDescription' => $row['seo_description'],
        ];
    }, $rows);
}

function cms_blog_payload(?string $slug = null): array {
    $sql = 'SELECT * FROM blog_posts_cms WHERE published = 1';
    $params = [];
    if ($slug) {
        $sql .= ' AND slug = ?';
        $params[] = $slug;
    }
    $sql .= ' ORDER BY updated_at DESC';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}
