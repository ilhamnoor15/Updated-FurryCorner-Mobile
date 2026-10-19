
<?php
// Return the customer to the installed FurryCorner app after checkout.
$orderId = $_GET['order_id'] ?? '';

if (
    !is_string($orderId) ||
    $orderId === '' ||
    !preg_match('/^[A-Za-z0-9_-]+$/', $orderId)
) {
    http_response_code(400);
    exit('Invalid or missing order ID.');
}

$appUrl = 'furrycorner://payment-success?order_id='
    . rawurlencode($orderId)
    . '&status=success';

header('Location: ' . $appUrl, true, 302);
exit;
