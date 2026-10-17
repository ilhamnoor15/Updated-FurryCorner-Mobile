
<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

$url = rtrim(SUPABASE_URL, '/') . '/rest/v1/orders?select=id&limit=1';

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'apikey: ' . SUPABASE_SECRET_KEY,
        'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
        'Accept: application/json'
    ],
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    error_log('Supabase connection test failed: ' . curl_error($ch));
    curl_close($ch);

    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

curl_close($ch);

if ($status < 200 || $status >= 300) {
    error_log('Supabase connection test returned HTTP ' . $status);
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Supabase rejected the request',
        'http_status' => $status
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'PHP connected to Supabase successfully',
    'http_status' => $status
]);
