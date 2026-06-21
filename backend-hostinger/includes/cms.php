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

function cms_public_cache_headers(int $seconds = 300): void {
    if (!headers_sent()) {
        header('Cache-Control: public, max-age=' . $seconds . ', stale-while-revalidate=600');
    }
}

function cms_revalidate_paths(array $paths): bool {
    $config = app_config();
    $url = trim((string) ($config['frontend_revalidate_url'] ?? ''));
    $secret = trim((string) ($config['frontend_revalidate_secret'] ?? ''));
    $cleanPaths = array_values(array_unique(array_filter(array_map('strval', $paths), fn($path) => str_starts_with($path, '/') && !str_starts_with($path, '//'))));
    if (!$url || !$secret || !$cleanPaths) {
        return false;
    }
    $endpoint = $url . (str_contains($url, '?') ? '&' : '?') . 'secret=' . rawurlencode($secret);
    $payload = json_encode(['paths' => $cleanPaths]);
    try {
        if (function_exists('curl_init')) {
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_TIMEOUT => 4,
            ]);
            curl_exec($ch);
            $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return $status >= 200 && $status < 300;
        }
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $payload,
                'timeout' => 4,
            ],
        ]);
        $result = @file_get_contents($endpoint, false, $context);
        return $result !== false;
    } catch (Throwable $ignored) {
        return false;
    }
}

function cms_safe_content(?string $content): string {
    $content = (string) $content;
    $content = preg_replace('#<\s*(script|iframe|object|embed|form|input|button|style)\b[^>]*>.*?<\s*/\s*\1\s*>#is', '', $content);
    $content = preg_replace('#<\s*(script|iframe|object|embed|form|input|button|style)\b[^>]*>#is', '', $content);
    $content = preg_replace('/\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $content);
    $content = preg_replace('/javascript:/i', '', $content);
    return $content ?? '';
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
    $sql .= ' ORDER BY sort_order ASC, slug';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    return array_map(function (array $row): array {
        return [
            'slug' => $row['slug'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'],
            'category' => $row['category'] ?? null,
            'shortDescription' => $row['short_description'] ?? null,
            'heroImage' => $row['hero_image'],
            'icon' => $row['icon'] ?? null,
            'ogImage' => $row['og_image'] ?? null,
            'sections' => cms_decode_json($row['sections_json'] ?? null, []),
            'pricingText' => $row['pricing_text'],
            'faqs' => cms_decode_json($row['faqs_json'] ?? null, []),
            'seoTitle' => $row['seo_title'],
            'seoDescription' => $row['seo_description'],
            'sortOrder' => (int) ($row['sort_order'] ?? 0),
            'showInMenu' => !isset($row['show_in_menu']) || (bool) $row['show_in_menu'],
            'showOnHomepage' => !empty($row['show_on_homepage']),
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
    return array_map(function (array $row): array {
        $row['content'] = cms_safe_content($row['content'] ?? '');
        return $row;
    }, $stmt->fetchAll());
}

function cms_faq_payload(?string $pageKey = null, ?string $serviceSlug = null): array {
    $sql = 'SELECT page_key, service_slug, question, answer, sort_order FROM faqs WHERE active=1';
    $params = [];
    if ($pageKey) {
        $sql .= ' AND page_key = ?';
        $params[] = $pageKey;
    }
    if ($serviceSlug) {
        $sql .= ' AND service_slug = ?';
        $params[] = $serviceSlug;
    }
    $sql .= ' ORDER BY sort_order ASC, id ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function cms_testimonial_payload(): array {
    $rows = db()->query('SELECT name, context, quote, avatar_image, rating FROM testimonials WHERE active=1 ORDER BY sort_order ASC, id ASC')->fetchAll();
    return array_map(function (array $row): array {
        return [
            'name' => $row['name'],
            'role' => $row['context'],
            'quote' => $row['quote'],
            'avatar' => $row['avatar_image'],
            'rating' => $row['rating'] !== null ? (int) $row['rating'] : null,
        ];
    }, $rows);
}

function cms_local_page_payload(?string $slug = null): array {
    $sql = 'SELECT city, state, slug, title, hero_title, body_content, related_services_json, faqs_json, meta_title, meta_description, image_path FROM local_seo_pages WHERE active=1';
    $params = [];
    if ($slug) {
        $sql .= ' AND slug = ?';
        $params[] = $slug;
    }
    $sql .= ' ORDER BY city, slug';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return array_map(function (array $row): array {
        return [
            'city' => $row['city'],
            'state' => $row['state'] ?? '',
            'slug' => $row['slug'],
            'title' => $row['title'],
            'heroTitle' => $row['hero_title'] ?? $row['title'],
            'bodyContent' => cms_safe_content($row['body_content'] ?? ''),
            'relatedServices' => cms_decode_json($row['related_services_json'] ?? null, []),
            'faqs' => cms_decode_json($row['faqs_json'] ?? null, []),
            'metaTitle' => $row['meta_title'],
            'metaDescription' => $row['meta_description'],
            'imagePath' => $row['image_path'],
        ];
    }, $stmt->fetchAll());
}

function cms_document_requirements_payload(?string $serviceSlug = null): array {
    $sql = 'SELECT service_slug, document_key, title, description, required, allow_multiple, sort_order, updated_at FROM service_document_requirements WHERE active=1';
    $params = [];
    if ($serviceSlug) {
        $sql .= ' AND service_slug = ?';
        $params[] = $serviceSlug;
    }
    $sql .= ' ORDER BY service_slug, sort_order ASC, id ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return array_map(function (array $row): array {
        return [
            'serviceSlug' => $row['service_slug'],
            'documentKey' => $row['document_key'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'required' => (bool) $row['required'],
            'allowMultiple' => (bool) $row['allow_multiple'],
            'sortOrder' => (int) $row['sort_order'],
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }, $stmt->fetchAll());
}
