
<?php
require_once __DIR__ . '/config.php';

function reply(int $status, string $message): void {
    http_response_code($status);
    header('Content-Type: text/plain; charset=utf-8');
    exit($message);
}

function supabaseRequest(string $url, string $method = 'GET', ?array $payload = null): array {
    $ch = curl_init($url);

    $headers = [
        'apikey: ' . SUPABASE_SECRET_KEY,
        'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
        'Accept: application/json',
        'Content-Type: application/json'
    ];

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20
    ]);

    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        error_log('Payment return: Supabase request failed: ' . $error);
        return ['status' => 0, 'body' => null];
    }

    return [
        'status' => $status,
        'body' => json_decode($body, true)
    ];
}

function returnToApp(string $orderId, string $status): void {
    $url = 'furrycorner://payment-success?order_id='
        . rawurlencode($orderId)
        . '&status=' . rawurlencode($status);

    header('Location: ' . $url, true, 302);
    exit;
}

$orderId = $_GET['order_id'] ?? '';

if (!is_string($orderId) || !preg_match('/^[0-9]+$/', $orderId)) {
    reply(400, 'Invalid or missing order ID.');
}

if (
    !defined('PAYMONGO_SECRET_KEY') ||
    PAYMONGO_SECRET_KEY === '' ||
    !defined('SUPABASE_URL') ||
    !defined('SUPABASE_SECRET_KEY')
) {
    error_log('Payment return: Required configuration is missing.');
    reply(500, 'Payment verification is not configured.');
}

// Find the order and its saved checkout session.
$query = http_build_query([
    'id' => 'eq.' . $orderId,
    'select' => 'id,status,payment_status,paymongo_checkout_session_id'
]);

$result = supabaseRequest(
    rtrim(SUPABASE_URL, '/') . '/rest/v1/orders?' . $query
);

if ($result['status'] < 200 || $result['status'] >= 300 ||
    !is_array($result['body']) || count($result['body']) !== 1) {
    error_log('Payment return: Order lookup failed for order ' . $orderId);
    reply(500, 'Unable to find the order.');
}

$order = $result['body'][0];
$sessionId = $order['paymongo_checkout_session_id'] ?? '';

if (
    !is_string($sessionId) ||
    trim($sessionId) === '' ||
    !preg_match('/^cs_[A-Za-z0-9]+$/', trim($sessionId))
) {
    error_log('Payment return: Invalid checkout session for order ' . $orderId);
    reply(409, 'No valid checkout session is saved for this order.');
}

$sessionId = trim($sessionId);
// Do not automatically update a cancelled order.
if (strtolower((string)($order['status'] ?? '')) === 'cancelled') {
    error_log('Payment return: Paid status needs review for cancelled order ' . $orderId);
    returnToApp($orderId, 'review');
}

// Ask PayMongo directly whether this saved session was paid.
$paymongoUrl = rtrim(PAYMONGO_API_URL, '/')
    . '/checkout_sessions/' . rawurlencode($sessionId);

$ch = curl_init($paymongoUrl);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
    CURLOPT_USERPWD => PAYMONGO_SECRET_KEY . ':',
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
    CURLOPT_TIMEOUT => 20
]);

$body = curl_exec($ch);
$httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($body === false || $httpStatus < 200 || $httpStatus >= 300) {
    error_log('Payment return: PayMongo session verification failed. HTTP '
        . $httpStatus . ' ' . $error);
    reply(502, 'Unable to verify payment with PayMongo. Please contact support.');
}

$sessionResponse = json_decode($body, true);
$session = $sessionResponse['data'] ?? [];
$attributes = $session['attributes'] ?? [];

if (($session['id'] ?? '') !== $sessionId) {
    reply(502, 'PayMongo returned an unexpected checkout session.');
}

// A checkout session can remain active even when its payment is paid.
// Verify the actual payment below instead of relying on session status.

$payments = $attributes['payments'] ?? [];
$paidPaymentFound = false;

foreach ($payments as $payment) {
    $paymentAttributes = $payment['attributes'] ?? [];

    if (($paymentAttributes['status'] ?? '') === 'paid') {
        $paidPaymentFound = true;
        break;
    }
}

if (!$paidPaymentFound) {
    returnToApp($orderId, 'pending');
}

// Only update payment_status after PayMongo confirms payment.
if (($order['payment_status'] ?? '') !== 'paid') {
    $updateQuery = http_build_query([
        'id' => 'eq.' . $orderId,
        'paymongo_checkout_session_id' => 'eq.' . $sessionId,
        'status' => 'neq.cancelled'
    ]);

    $update = supabaseRequest(
        rtrim(SUPABASE_URL, '/') . '/rest/v1/orders?' . $updateQuery,
        'PATCH',
        ['payment_status' => 'paid']
    );

    if ($update['status'] < 200 || $update['status'] >= 300) {
        error_log('Payment return: Supabase payment update failed for order ' . $orderId);
        reply(500, 'Payment was verified but the order update failed. Please contact support.');
    }
}

returnToApp($orderId, 'success');