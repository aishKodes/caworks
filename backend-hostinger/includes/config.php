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
    $aliases = [
        'app_url' => 'APP_URL',
        'frontend_url' => 'FRONTEND_URL',
        'allowed_origin' => 'ALLOWED_ORIGIN',
        'brand_name' => 'BRAND_NAME',
        'registered_business_name' => 'REGISTERED_BUSINESS_NAME',
        'office_address' => 'OFFICE_ADDRESS',
        'public_phone' => 'PUBLIC_PHONE',
        'whatsapp_number' => 'WHATSAPP_NUMBER',
        'admin_email' => 'ADMIN_EMAIL',
        'media_base_url' => 'MEDIA_BASE_URL',
        'razorpay_enabled' => 'RAZORPAY_ENABLED',
        'manual_payment_enabled' => 'MANUAL_PAYMENT_ENABLED',
        'upi_id' => 'MANUAL_UPI_ID',
        'frontend_revalidate_url' => 'FRONTEND_REVALIDATE_URL',
        'frontend_revalidate_secret' => 'FRONTEND_REVALIDATE_SECRET',
    ];
    foreach ($aliases as $internal => $external) {
        if (array_key_exists($external, $config)) {
            $config[$internal] = $config[$external];
        }
    }
    $smtpAliases = [
        'enabled' => 'SMTP_ENABLED',
        'host' => 'SMTP_HOST',
        'port' => 'SMTP_PORT',
        'encryption' => 'SMTP_ENCRYPTION',
        'username' => 'SMTP_USERNAME',
        'password' => 'SMTP_PASSWORD',
        'from_email' => 'SMTP_FROM_EMAIL',
        'from_name' => 'SMTP_FROM_NAME',
        'reply_to' => 'SMTP_REPLY_TO',
        'debug' => 'MAIL_DEBUG',
    ];
    $config['smtp'] = is_array($config['smtp'] ?? null) ? $config['smtp'] : [];
    foreach ($smtpAliases as $internal => $external) {
        if (array_key_exists($external, $config)) {
            $config['smtp'][$internal] = $config[$external];
        }
    }
    if (!is_dir($config['upload_dir'])) {
        mkdir($config['upload_dir'], 0750, true);
    }
    if (!empty($config['media_dir']) && !is_dir($config['media_dir'])) {
        mkdir($config['media_dir'], 0755, true);
    }
    return $config;
}
