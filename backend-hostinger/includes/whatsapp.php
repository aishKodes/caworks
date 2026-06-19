<?php
require_once __DIR__ . '/db.php';

function whatsapp_template(string $key, array $vars): string {
    $templates = [
        'signup' => 'Hello {name}, your request has been received. Your Tax Help ID is {tax_id}. You can upload documents and track status on our website.',
        'documents_pending' => 'Hello {name}, please upload the required documents for your {service_name} request. Request ID: {request_id}.',
        'payment_pending' => 'Hello {name}, your documents are received. Please complete payment to start processing. Request ID: {request_id}.',
        'manual_payment_verification' => 'Hello {name}, your payment screenshot is received. We will verify and update your status.',
        'work_in_progress' => 'Hello {name}, your request is under review. We will contact you if more details are needed.',
        'completed' => 'Hello {name}, your request is completed. Please login to check status and details.',
    ];
    $text = $templates[$key] ?? '';
    foreach ($vars as $name => $value) {
        $text = str_replace('{' . $name . '}', (string) $value, $text);
    }
    return $text;
}

function queueWhatsAppMessage(?int $userId, ?int $requestId, string $phone, string $templateKey, string $messageText): void {
    $stmt = db()->prepare('INSERT INTO whatsapp_messages (user_id, request_id, phone, template_key, message_text, status) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$userId, $requestId, $phone, $templateKey, $messageText, 'queued']);
}
