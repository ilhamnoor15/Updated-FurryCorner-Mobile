
<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

echo json_encode([
    'status' => 'ok',
    'service' => 'FurryCorner PayMongo API',
    'php_version' => PHP_VERSION,
    'paymongo_key_configured' =>
        str_starts_with(PAYMONGO_SECRET_KEY, 'sk_test_')
]);
