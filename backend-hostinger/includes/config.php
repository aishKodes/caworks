<?php
function app_config(): array {
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $path = __DIR__ . '/../config.php';
    if (!file_exists($path)) {
        $path = __DIR__ . '/../config.example.php';
    }
    $config = require $path;
    if (!is_dir($config['upload_dir'])) {
        mkdir($config['upload_dir'], 0750, true);
    }
    if (!empty($config['media_dir']) && !is_dir($config['media_dir'])) {
        mkdir($config['media_dir'], 0755, true);
    }
    return $config;
}
