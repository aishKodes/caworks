<?php
require_once __DIR__ . '/config.php';

function razorpay_create_order(int $amountPaise, string $receipt): array {
    $config = app_config()['razorpay'];
    $payload = json_encode([
        'amount' => $amountPaise,
        'currency' => 'INR',
        'receipt' => $receipt,
        'payment_capture' => 1,
    ]);
    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_USERPWD => $config['key_id'] . ':' . $config['key_secret'],
    ]);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode((string) $response, true);
    if ($status >= 400 || !is_array($data)) {
        throw new RuntimeException('Could not create Razorpay order.');
    }
    return $data;
}

function razorpay_verify_signature(string $orderId, string $paymentId, string $signature): bool {
    $secret = app_config()['razorpay']['key_secret'];
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $secret);
    return hash_equals($expected, $signature);
}

function razorpay_verify_webhook(string $body, string $signature): bool {
    $secret = app_config()['razorpay']['webhook_secret'];
    $expected = hash_hmac('sha256', $body, $secret);
    return hash_equals($expected, $signature);
}
