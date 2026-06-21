<?php
require_once __DIR__ . '/config.php';

function save_uploaded_file(array $file, string $prefix = 'doc'): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed.');
    }
    $allowed = [
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $tmp = $file['tmp_name'];
    $mime = mime_content_type($tmp) ?: '';
    if (!isset($allowed[$mime])) {
        throw new RuntimeException('File type is not allowed.');
    }
    $maxSize = (int) (app_config()['max_upload_size'] ?? (8 * 1024 * 1024));
    if ((int) $file['size'] > $maxSize) {
        throw new RuntimeException('File is too large.');
    }
    $stored = $prefix . '_' . bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
    $dir = app_config()['upload_dir'];
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }
    $path = $dir . '/' . $stored;
    if (!move_uploaded_file($tmp, $path)) {
        throw new RuntimeException('Could not save file.');
    }
    chmod($path, 0640);
    return [
        'original_name' => basename((string) $file['name']),
        'stored_name' => $stored,
        'mime_type' => $mime,
        'size' => (int) $file['size'],
        'path' => $path,
    ];
}

function save_media_file(array $file, string $prefix = 'media'): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed.');
    }
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
    ];
    $tmp = $file['tmp_name'];
    $mime = mime_content_type($tmp) ?: '';
    if (!isset($allowed[$mime])) {
        throw new RuntimeException('Only image files are allowed for media library.');
    }
    $maxSize = (int) (app_config()['max_media_size'] ?? (4 * 1024 * 1024));
    if ((int) $file['size'] > $maxSize) {
        throw new RuntimeException('Media file is too large.');
    }
    if ($mime === 'image/svg+xml') {
        $svg = file_get_contents($tmp) ?: '';
        if (preg_match('/<\s*(script|iframe|object|embed|foreignObject)\b/i', $svg) || preg_match('/on[a-z]+\s*=/i', $svg) || stripos($svg, 'javascript:') !== false) {
            throw new RuntimeException('SVG contains unsafe content.');
        }
    }
    $stored = $prefix . '_' . bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
    $config = app_config();
    $dir = $config['media_dir'] ?? (__DIR__ . '/../media');
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $path = $dir . '/' . $stored;
    if (!move_uploaded_file($tmp, $path)) {
        throw new RuntimeException('Could not save media file.');
    }
    chmod($path, 0644);
    $base = rtrim((string) ($config['media_base_url'] ?? ''), '/');
    return [
        'original_name' => basename((string) $file['name']),
        'stored_name' => $stored,
        'mime_type' => $mime,
        'size' => (int) $file['size'],
        'path' => $path,
        'public_url' => $base ? $base . '/' . $stored : '/media/' . $stored,
    ];
}

function normalize_files_array(array $files): array {
    $normalized = [];
    if (!isset($files['name'])) {
        return $normalized;
    }
    if (is_array($files['name'])) {
        foreach ($files['name'] as $index => $name) {
            $normalized[] = [
                'name' => $name,
                'type' => $files['type'][$index] ?? '',
                'tmp_name' => $files['tmp_name'][$index] ?? '',
                'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $files['size'][$index] ?? 0,
            ];
        }
    } else {
        $normalized[] = $files;
    }
    return $normalized;
}
