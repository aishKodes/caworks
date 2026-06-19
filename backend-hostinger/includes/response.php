<?php
function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function ok(array $data = [], string $message = 'OK'): void {
    json_response(['ok' => true, 'message' => $message, 'data' => $data]);
}

function fail(string $message, int $status = 400): void {
    json_response(['ok' => false, 'message' => $message], $status);
}
