<?php
return [
    'app_env' => 'production',
    'app_secret' => 'change-this-long-random-secret',
    'allowed_origin' => 'https://www.vbcbharat.com',
    'mysql' => [
        'host' => 'localhost',
        'database' => 'hostinger_database',
        'user' => 'hostinger_user',
        'password' => 'hostinger_password',
        'charset' => 'utf8mb4',
    ],
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'username' => 'support@vbcbharat.com',
        'password' => 'smtp_password',
        'port' => 465,
        'from_email' => 'support@vbcbharat.com',
        'from_name' => 'VB Consultants',
    ],
    'razorpay' => [
        'key_id' => 'rzp_test_xxxxxxxxxxxxx',
        'key_secret' => 'razorpay_secret',
        'webhook_secret' => 'razorpay_webhook_secret',
    ],
    'whatsapp_number' => '919000000000',
    'admin_email' => 'admin@example.com',
    'upi_id' => 'payments@exampleupi',
    'upload_dir' => __DIR__ . '/uploads',
    'media_dir' => __DIR__ . '/media',
    'media_base_url' => 'https://api.vbcbharat.com/media',
];
