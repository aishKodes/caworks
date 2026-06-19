<?php
function rate_limit(string $key, int $limit = 10, int $windowSeconds = 300): void {
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', $key);
    $file = sys_get_temp_dir() . '/tax_help_rate_' . $safe . '.json';
    $now = time();
    $data = ['start' => $now, 'count' => 0];
    if (file_exists($file)) {
        $loaded = json_decode((string) file_get_contents($file), true);
        if (is_array($loaded)) {
            $data = $loaded;
        }
    }
    if ($now - (int) $data['start'] > $windowSeconds) {
        $data = ['start' => $now, 'count' => 0];
    }
    $data['count']++;
    file_put_contents($file, json_encode($data), LOCK_EX);
    if ($data['count'] > $limit) {
        fail('Too many attempts. Please try again later.', 429);
    }
}
