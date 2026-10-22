
<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

function reply(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['error' => 'POST requests only']);
}

if (
    !defined('PAYMONGO_WEBHOOK_SECRET_TEST') ||
    PAYMONGO_WEBHOOK_SECRET_TEST === ''
) {
    error_log('PayMongo test webhook secret is not configured.');
    reply(500, ['error' => 'Test webhook secret is not configured']);
}
$rawBody = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '';

if ($rawBody === false || $signatureHeader === '') {
    reply(400, ['error' => 'Missing webhook body or signature']);
}

// Parse Paymongo-Signature: t=...,te=...,li=...
$signatureParts = [];

foreach (explode(',', $signatureHeader) as $part) {
    $pair = explode('=', trim($part), 2);

    if (count($pair) === 2) {
        $signatureParts[trim($pair[0])] = trim($pair[1]);
    }
}

$timestamp = $signatureParts['t'] ?? '';
$testSignature = $signatureParts['te'] ?? '';
$liveSignature = $signatureParts['li'] ?? '';

if (!ctype_digit($timestamp) ||
    abs(time() - (int)$timestamp) > 300) {
    reply(401, ['error' => 'Invalid or expired webhook timestamp']);
}

$signatureToVerify = hash_hmac(
    'sha256',
    $timestamp . '.' . $rawBody,
    PAYMONGO_WEBHOOK_SECRET
);

$payload = json_decode($rawBody, true);

if (!is_array($payload)) {
    reply(400, ['error' => 'Invalid JSON payload']);
}

$eventAttributes = $payload['data']['attributes'] ?? [];
$isLiveMode = $eventAttributes['livemode'] ?? null;

if (!is_bool($isLiveMode)) {
    reply(400, ['error' => 'Missing event mode']);
}

if ($isLiveMode) {
    if (
        !defined('PAYMONGO_WEBHOOK_SECRET_LIVE') ||
        PAYMONGO_WEBHOOK_SECRET_LIVE === ''
    ) {
        error_log('PayMongo live webhook secret is not configured.');
        reply(500, ['error' => 'Live webhook secret is not configured']);
    }

    $webhookSecret = PAYMONGO_WEBHOOK_SECRET_LIVE;
} else {
    $webhookSecret = PAYMONGO_WEBHOOK_SECRET_TEST;
}

$receivedSignature = $isLiveMode
    ? $liveSignature
    : $testSignature;

$signatureToVerify = hash_hmac(
    'sha256',
    $timestamp . '.' . $rawBody,
    $webhookSecret
);

if (
    $receivedSignature === '' ||
    !hash_equals($signatureToVerify, $receivedSignature)
) {
    reply(401, ['error' => 'Invalid PayMongo signature']);
}

$eventType = $eventAttributes['type'] ?? '';

if ($eventType !== 'checkout_session.payment.paid') {
    reply(200, ['received' => true, 'ignored' => true]);
}

$session = $eventAttributes['data'] ?? [];
$sessionId = $session['id'] ?? '';
$sessionAttributes = $session['attributes'] ?? [];
$payments = $sessionAttributes['payments'] ?? [];

if (!is_string($sessionId) ||
    !preg_match('/^cs_[A-Za-z0-9]+$/', $sessionId)) {
    reply(400, ['error' => 'Invalid checkout session ID']);
}

// Confirm that the session contains a successful payment.
$paidPaymentFound = false;

foreach ($payments as $payment) {
    $paymentAttributes = $payment['attributes'] ?? [];

    if (($paymentAttributes['status'] ?? '') === 'paid' ||
        ($payment['status'] ?? '') === 'paid') {
        $paidPaymentFound = true;
        break;
    }
}

if (!$paidPaymentFound) {
    reply(200, ['received' => true, 'ignored' => true]);
}

// Find the order using the session ID saved by create-checkout.php.
$filter = http_build_query([
    'paymongo_checkout_session_id' => 'eq.' . $sessionId,
    'select' => 'id,payment_status,status'
]);

$url = rtrim(SUPABASE_URL, '/') . '/rest/v1/orders?' . $filter;

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
$httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpStatus < 200 || $httpStatus >= 300) {
    error_log('PayMongo webhook: Supabase order lookup failed.');
    reply(500, ['error' => 'Unable to look up order']);
}

$orders = json_decode($response, true);

if (!is_array($orders) || count($orders) !== 1) {
    error_log('PayMongo webhook: No unique order found for session ' . $sessionId);
    reply(500, ['error' => 'Matching order not found']);
}

$order = $orders[0];

// Do not change a cancelled order automatically.
if (strtolower((string)($order['status'] ?? '')) === 'cancelled') {
    error_log('PayMongo webhook: Payment received for cancelled order ' . $order['id']);
    reply(200, ['received' => true, 'review_required' => true]);
}

// Update only payment_status. Do not change fulfillment/order status here.
if (($order['payment_status'] ?? '') !== 'paid') {
    $updateUrl = rtrim(SUPABASE_URL, '/') . '/rest/v1/orders?' .
        http_build_query([
            'id' => 'eq.' . $order['id'],
            'paymongo_checkout_session_id' => 'eq.' . $sessionId
        ]);

    $updatePayload = json_encode([
        'payment_status' => 'paid'
    ]);

    $ch = curl_init($updateUrl);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_POSTFIELDS => $updatePayload,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_SECRET_KEY,
            'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ],
        CURLOPT_TIMEOUT => 20
    ]);

    $updateResponse = curl_exec($ch);
    $updateStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($updateResponse === false ||
        $updateStatus < 200 ||
        $updateStatus >= 300) {
        error_log('PayMongo webhook: Failed to update order ' . $order['id']);
        reply(500, ['error' => 'Unable to update payment status']);
    }
}

reply(200, ['received' => true, 'payment_status' => 'paid']);