
<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:8100');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST requests only']);
    exit;
}

require_once __DIR__ . '/config.php';

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    respond(400, ['error' => 'Invalid JSON request']);
}

$orderId = filter_var($input['order_id'] ?? null, FILTER_VALIDATE_INT);
$userId = trim((string)($input['user_id'] ?? ''));
$paymentMethod = trim((string)($input['payment_method'] ?? ''));

if (!$orderId || $orderId < 1 || $userId === '') {
    respond(400, ['error' => 'Order ID and user ID are required']);
}

if (!filter_var($userId, FILTER_VALIDATE_REGEXP, [
    'options' => ['regexp' => '/^[0-9a-fA-F-]{36}$/']
])) {
    respond(400, ['error' => 'Invalid user ID']);
}

$allowedMethods = ['gcash', 'card', 'paymaya'];

if (!in_array($paymentMethod, $allowedMethods, true)) {
    respond(400, ['error' => 'Unsupported payment method']);
}

function supabaseRequest(string $path): array {
    $url = rtrim(SUPABASE_URL, '/') . '/rest/v1/' . $path;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_SECRET_KEY,
            'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
            'Accept: application/json'
        ],
        CURLOPT_TIMEOUT => 20
    ]);

    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $status < 200 || $status >= 300) {
        throw new RuntimeException('Unable to verify order with Supabase');
    }

    $data = json_decode($response, true);

    if (!is_array($data)) {
        throw new RuntimeException('Invalid Supabase response');
    }

    return $data;
}

try {
    $query = http_build_query([
        'id' => 'eq.' . $orderId,
        'user_id' => 'eq.' . $userId,
        'select' => 'id,user_id,order_number,total,payment_status,status,payment_method'
    ]);

    $orders = supabaseRequest('orders?' . $query);

    if (count($orders) !== 1) {
        respond(404, ['error' => 'Order not found for this customer']);
    }

    $order = $orders[0];

    if ($order['payment_status'] !== 'pending') {
        respond(409, ['error' => 'This order is not awaiting payment']);
    }

    if ($order['status'] === 'cancelled') {
        respond(409, ['error' => 'This order has been cancelled']);
    }

    $amountCentavos = (int)round(((float)$order['total']) * 100);

    if ($amountCentavos < 100) {
        respond(400, ['error' => 'Invalid order total']);
    }

    $customerName = trim((string)($input['customer_name'] ?? 'FurryCorner Customer'));
    $customerEmail = trim((string)($input['customer_email'] ?? ''));
    $customerPhone = trim((string)($input['customer_phone'] ?? ''));

    $payload = [
        'data' => [
            'attributes' => [
                'billing' => array_filter([
                    'name' => $customerName !== '' ? $customerName : 'FurryCorner Customer',
                    'email' => $customerEmail !== '' ? $customerEmail : null,
                    'phone' => $customerPhone !== '' ? $customerPhone : null
                ]),
                'line_items' => [[
                    'currency' => 'PHP',
                    'amount' => $amountCentavos,
                    'name' => 'FurryCorner Order ' . ($order['order_number'] ?? $orderId),
                    'quantity' => 1
                ]],
                'payment_method_types' => [$paymentMethod],
                'description' => 'FurryCorner PH order ' . ($order['order_number'] ?? $orderId),
                'reference_number' => (string)$orderId,
                
                'success_url' => 'https://providing-glacial-gradually.ngrok-free.dev/payment-return.php?order_id=' . rawurlencode((string)$orderId),
                'cancel_url' => 'https://providing-glacial-gradually.ngrok-free.dev/checkout',

                'send_email_receipt' => false,
                'show_description' => true,
                'show_line_items' => true
            ]
        ]
    ];

    $ch = curl_init(PAYMONGO_API_URL . '/checkout_sessions');

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Basic ' . base64_encode(PAYMONGO_SECRET_KEY . ':')
        ],
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $status < 200 || $status >= 300) {
        error_log('PayMongo checkout creation failed. HTTP status: ' . $status);
        respond(502, ['error' => 'Unable to create PayMongo checkout session']);
    }

    $result = json_decode($response, true);
    $attributes = $result['data']['attributes'] ?? [];
    $checkoutUrl = $attributes['checkout_url'] ?? null;
    $sessionId = $result['data']['id'] ?? null;

    
    if (!$checkoutUrl || !$sessionId) {
        respond(502, ['error' => 'PayMongo returned an incomplete checkout session']);
    }

    // Save the PayMongo session ID on the matching order.
    $updateUrl = rtrim(SUPABASE_URL, '/') .
        '/rest/v1/orders?id=eq.' . urlencode((string)$orderId) .
        '&user_id=eq.' . urlencode($userId);

    $updatePayload = json_encode([
        'paymongo_checkout_session_id' => $sessionId
    ]);

    $updateCh = curl_init($updateUrl);

    curl_setopt_array($updateCh, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_POSTFIELDS => $updatePayload,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_SECRET_KEY,
            'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ],
        CURLOPT_TIMEOUT => 15
    ]);

    $updateResponse = curl_exec($updateCh);
    $updateStatus = (int)curl_getinfo($updateCh, CURLINFO_HTTP_CODE);
    curl_close($updateCh);

    if ($updateResponse === false || $updateStatus < 200 || $updateStatus >= 300) {
        error_log('Failed to save PayMongo session ID for order ' . $orderId);
        respond(502, ['error' => 'Checkout was created but could not be linked to the order']);
    }

    respond(200, [

        'success' => true,
        'checkout_url' => $checkoutUrl,
        'checkout_session_id' => $sessionId,
        'order_id' => $orderId
    ]);

} catch (Throwable $error) {
    error_log('Checkout backend error: ' . $error->getMessage());
    respond(500, ['error' => 'Unable to verify the order or start checkout']);
}
