<?php
function read_json(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function clean_string(?string $value, int $max = 500): string {
    $value = trim((string) $value);
    $value = preg_replace('/\s+/', ' ', $value);
    return mb_substr($value, 0, $max);
}

function valid_phone(string $phone): bool {
    return (bool) preg_match('/^[0-9+\s-]{8,16}$/', $phone);
}

function valid_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function require_fields(array $data, array $fields): void {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            fail("Missing field: {$field}", 422);
        }
    }
}
