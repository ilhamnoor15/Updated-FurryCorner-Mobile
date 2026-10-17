
<?php
require_once __DIR__ . '/config.php';

$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://192.168.1.9:4200',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['success' => false, 'error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
    respond(400, ['success' => false, 'error' => 'Invalid JSON request']);
}

$userId = $input['user_id'] ?? '';
$serviceId = filter_var($input['service_id'] ?? null, FILTER_VALIDATE_INT);
$addressId = filter_var($input['address_id'] ?? null, FILTER_VALIDATE_INT);
$bookingDate = $input['booking_date'] ?? '';
$bookingTime = $input['booking_time'] ?? null;
$petName = trim((string)($input['pet_name'] ?? ''));

if (!is_string($userId) ||
    !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $userId)) {
    respond(400, ['success' => false, 'error' => 'Invalid user ID']);
}

if (!$serviceId || $serviceId < 1) {
    respond(400, ['success' => false, 'error' => 'Invalid service']);
}

if (!$addressId || $addressId < 1) {
    respond(400, ['success' => false, 'error' => 'Please select a valid address']);
}

$date = DateTime::createFromFormat('!Y-m-d', (string)$bookingDate);
if (!$date || $date->format('Y-m-d') !== $bookingDate) {
    respond(400, ['success' => false, 'error' => 'Invalid booking date']);
}

if ($bookingTime !== null &&
    $bookingTime !== '' &&
    !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/', (string)$bookingTime)) {
    respond(400, ['success' => false, 'error' => 'Invalid booking time']);
}

if ($petName === '') {
    respond(400, ['success' => false, 'error' => 'Pet name is required']);
}

/*
 * IMPORTANT:
 * This endpoint uses the Supabase secret key to perform server-side
 * database requests. Never move that key into Angular/frontend code.
 *
 * This prototype validates the UUID format but does not independently
 * authenticate the caller. Before production, verify a Supabase access
 * token and derive the user ID from that verified token.
 */

function supabaseRequest(string $method, string $path, ?array $body = null): array {
    $url = rtrim(SUPABASE_URL, '/') . $path;
    $ch = curl_init($url);

    $headers = [
        'apikey: ' . SUPABASE_SECRET_KEY,
        'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
        'Accept: application/json',
    ];

    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Prefer: return=representation';
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $body !== null ? json_encode($body) : null,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException('Supabase connection failed: ' . $error);
    }

    $decoded = json_decode($response, true);

    if ($status < 200 || $status >= 300) {
        $message = is_array($decoded)
            ? ($decoded['message'] ?? $decoded['hint'] ?? 'Supabase request failed')
            : 'Supabase request failed';

        throw new RuntimeException($message . ' (HTTP ' . $status . ')');
    }

    return is_array($decoded) ? $decoded : [];
}

try {
    // Confirm the service exists and is active; use its database price.
    $services = supabaseRequest(
        'GET',
        '/rest/v1/services?id=eq.' . $serviceId .
        '&is_active=eq.true&select=id,price&limit=1'
    );

    if (!$services) {
        respond(400, ['success' => false, 'error' => 'This service is unavailable']);
    }

    // Confirm that the address belongs to this user.
    $addresses = supabaseRequest(
        'GET',
        '/rest/v1/user_addresses?id=eq.' . $addressId .
        '&user_id=eq.' . rawurlencode($userId) .
        '&select=id&limit=1'
    );

    if (!$addresses) {
        respond(400, ['success' => false, 'error' => 'Selected address was not found for this account']);
    }

    $payload = [
        'user_id' => $userId,
        'service_id' => $serviceId,
        'address_id' => $addressId,
        'pet_name' => $petName,
        'booking_date' => $bookingDate,
        'booking_time' => ($bookingTime === '' ? null : $bookingTime),
        'status' => 'pending',
        'price' => (float)$services[0]['price'],
        'created_at' => gmdate('c'),
    ];

    $created = supabaseRequest(
        'POST',
        '/rest/v1/bookings',
        $payload
    );

    if (!$created) {
        respond(500, ['success' => false, 'error' => 'Booking was not returned by the database']);
    }

    respond(201, [
        'success' => true,
        'message' => 'Booking created successfully',
        'booking' => $created[0],
    ]);

} catch (Throwable $e) {
    error_log('createBooking.php: ' . $e->getMessage());

    respond(500, [
        'success' => false,
        'error' => 'Unable to create booking. Please check the server log.',
    ]);
}
