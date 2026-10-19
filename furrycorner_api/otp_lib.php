<?php
/*
 * Shared helpers for the EmailJS OTP endpoints (sign-up and password change).
 * OTPs are generated, hashed, rate-limited and verified HERE on the server.
 * The app never sees the code, the EmailJS private key, or the Supabase secret key.
 */

// config.php starts with a blank line; buffer it so our headers and status codes still work.
ob_start();
require_once __DIR__ . '/config.php';
ob_clean();

const OTP_TTL_SECONDS        = 600;  // a code is valid for 10 minutes
const OTP_COOLDOWN_SECONDS   = 60;   // minimum gap between two sent codes for the same email
const OTP_MAX_PER_HOUR_EMAIL = 5;    // codes per email per hour
const OTP_MAX_PER_HOUR_IP    = 20;   // codes per IP address per hour
const OTP_MAX_ATTEMPTS       = 5;    // wrong guesses allowed per code

function otp_config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $file = __DIR__ . '/emailjs_config.php';
        $cfg = is_file($file) ? (array)(require $file) : [];
    }
    return $cfg;
}

function otp_respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function otp_fail(int $status, string $code, string $message, array $extra = []): void
{
    otp_respond($status, array_merge(['success' => false, 'code' => $code, 'message' => $message], $extra));
}

function otp_cors(): void
{
    $allowed = [
        'http://localhost', 'https://localhost', 'capacitor://localhost',
        'http://localhost:8080', 'http://localhost:8100', 'https://localhost:8100',
        'http://localhost:4200', 'https://furrycorner.online',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Cache-Control: no-store');

    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($method === 'OPTIONS') { http_response_code(204); exit; }
    if ($method !== 'POST') {
        header('Allow: POST, OPTIONS');
        otp_fail(405, 'method_not_allowed', 'Method not allowed.');
    }
}

/** Stops with 503 if the EmailJS / OTP settings were not filled in. Returns the settings. */
function otp_require_config(bool $needSupabaseKey = false): array
{
    $cfg = otp_config();
    $keys = ['service_id', 'otp_template_id', 'public_key', 'private_key', 'otp_pepper'];
    if ($needSupabaseKey) { $keys[] = 'supabase_publishable_key'; }
    foreach ($keys as $k) {
        $v = trim((string)($cfg[$k] ?? ''));
        if ($v === '' || stripos($v, 'PASTE') === 0) {
            error_log('[FurryCorner OTP] emailjs_config.php is missing a value for: ' . $k);
            otp_fail(503, 'not_configured', 'The email service is not set up yet. Please try again later.');
        }
    }
    return $cfg;
}

function otp_input(): array
{
    $data = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($data)) {
        otp_fail(400, 'invalid_request', 'Invalid request.');
    }
    return $data;
}

function otp_normalize_email($value): string
{
    $email = strtolower(trim((string)$value));
    if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        otp_fail(400, 'invalid_email', 'Please enter a valid email address.');
    }
    return $email;
}

function otp_mask_email(string $email): string
{
    [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
    return substr($local, 0, 1) . str_repeat('*', max(2, min(6, strlen($local) - 1))) . '@' . $domain;
}

function otp_client_ip(): string
{
    return substr(preg_replace('/[^0-9a-fA-F:.]/', '', (string)($_SERVER['REMOTE_ADDR'] ?? '')), 0, 45);
}

function otp_iso(int $timestamp): string
{
    return gmdate('Y-m-d\TH:i:s\Z', $timestamp);
}

/* ------------------------------------------------------------------ HTTP / Supabase */

/** Returns [httpStatus, decodedJsonOrNull]. Status 0 means the request itself failed. */
function otp_http(string $method, string $url, ?array $body, array $headers, int $timeout = 15): array
{
    $ch = curl_init($url);
    $options = [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_HTTPHEADER     => $headers,
    ];
    if ($body !== null) {
        $options[CURLOPT_POSTFIELDS] = json_encode($body, JSON_UNESCAPED_UNICODE);
    }
    curl_setopt_array($ch, $options);
    $raw    = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        error_log('[FurryCorner OTP] HTTP request failed: ' . $error);
        return [0, null];
    }
    return [$status, json_decode((string)$raw, true)];
}

function otp_secret_headers(array $extra = []): array
{
    return array_merge([
        'apikey: ' . SUPABASE_SECRET_KEY,
        'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
        'Content-Type: application/json',
        'Accept: application/json',
    ], $extra);
}

/** Supabase REST (PostgREST) call with the server-side secret key. */
function otp_db(string $method, string $path, ?array $body = null, bool $returnRows = false): array
{
    $prefer = $returnRows ? 'Prefer: return=representation' : 'Prefer: return=minimal';
    return otp_http($method, rtrim(SUPABASE_URL, '/') . '/rest/v1/' . $path, $body, otp_secret_headers([$prefer]));
}

/** Supabase Auth Admin API call (creates users / changes passwords) with the server-side secret key. */
function otp_admin(string $method, string $path, array $body): array
{
    return otp_http($method, rtrim(SUPABASE_URL, '/') . '/auth/v1/admin/' . $path, $body, otp_secret_headers());
}

function otp_q(string $value): string
{
    return rawurlencode($value);
}

/* ------------------------------------------------------------------ OTP core */

function otp_new_code(): string
{
    return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function otp_hash(string $purpose, string $email, string $code): string
{
    $pepper = (string)(otp_config()['otp_pepper'] ?? '');
    return hash_hmac('sha256', $purpose . '|' . $email . '|' . $code, $pepper);
}

function otp_send_email(string $to, string $code, int $expiresAt): bool
{
    $cfg  = otp_config();
    $when = (new DateTime('@' . $expiresAt))
        ->setTimezone(new DateTimeZone('Asia/Manila'))
        ->format('g:i A') . ' (Philippine time)';

    $payload = [
        'service_id'  => $cfg['service_id'],
        'template_id' => $cfg['otp_template_id'],
        'user_id'     => $cfg['public_key'],
        'accessToken' => $cfg['private_key'],
        'template_params' => [
            'passcode' => $code,
            'time'     => $when,
            // Different templates name the recipient differently; fill every common name.
            'email' => $to, 'to_email' => $to, 'user_email' => $to, 'recipient_email' => $to,
        ],
    ];

    // The code is never written to the log.
    [$status] = otp_http('POST', 'https://api.emailjs.com/api/v1.0/email/send', $payload, ['Content-Type: application/json'], 15);
    if ($status !== 200) {
        error_log('[FurryCorner OTP] EmailJS send failed, HTTP ' . $status);
        return false;
    }
    return true;
}

/**
 * Creates and emails a new OTP, enforcing the cooldown and hourly limits.
 * Always ends the request with a JSON response.
 */
function otp_issue(string $purpose, string $email, ?string $userId = null, array $extraResponse = []): void
{
    $now     = time();
    $hourAgo = otp_iso($now - 3600);
    $ip      = otp_client_ip();

    // Per-email limits (cooldown + hourly cap).
    [$s, $rows] = otp_db('GET', 'email_otps?email=eq.' . otp_q($email) . '&purpose=eq.' . otp_q($purpose)
        . '&created_at=gte.' . otp_q($hourAgo) . '&select=created_at,send_status&order=created_at.desc&limit=50');
    if ($s < 200 || $s >= 300 || !is_array($rows)) {
        error_log('[FurryCorner OTP] Could not read email_otps (HTTP ' . $s . '). Was supabase_otp.sql run?');
        otp_fail(503, 'unavailable', 'The verification service is temporarily unavailable. Please try again later.');
    }

    foreach ($rows as $row) {
        if (($row['send_status'] ?? '') === 'sent') {
            $age = $now - (int)strtotime((string)$row['created_at']);
            if ($age < OTP_COOLDOWN_SECONDS) {
                otp_fail(429, 'cooldown', 'Please wait before requesting another code.',
                    ['retry_after' => OTP_COOLDOWN_SECONDS - $age]);
            }
            break;
        }
    }

    if (count($rows) >= OTP_MAX_PER_HOUR_EMAIL) {
        $anchor = (int)strtotime((string)$rows[OTP_MAX_PER_HOUR_EMAIL - 1]['created_at']);
        otp_fail(429, 'rate_limited', 'Too many codes were requested. Please try again later.',
            ['retry_after' => max(1, 3600 - ($now - $anchor))]);
    }

    // Per-IP hourly cap.
    if ($ip !== '') {
        [$s, $ipRows] = otp_db('GET', 'email_otps?ip=eq.' . otp_q($ip) . '&created_at=gte.' . otp_q($hourAgo)
            . '&select=id&limit=' . (OTP_MAX_PER_HOUR_IP + 1));
        if (is_array($ipRows) && count($ipRows) >= OTP_MAX_PER_HOUR_IP) {
            otp_fail(429, 'rate_limited', 'Too many requests from this device. Please try again later.', ['retry_after' => 600]);
        }
    }

    // Older unused codes for this email + purpose stop working as soon as a new one is issued.
    otp_db('PATCH', 'email_otps?email=eq.' . otp_q($email) . '&purpose=eq.' . otp_q($purpose) . '&used_at=is.null',
        ['used_at' => otp_iso($now)]);

    $code      = otp_new_code();
    $expiresAt = $now + OTP_TTL_SECONDS;

    [$s, $inserted] = otp_db('POST', 'email_otps', [
        'purpose'     => $purpose,
        'email'       => $email,
        'user_id'     => $userId,
        'code_hash'   => otp_hash($purpose, $email, $code),
        'expires_at'  => otp_iso($expiresAt),
        'ip'          => $ip,
        'send_status' => 'pending',
    ], true);
    $id = (is_array($inserted) && isset($inserted[0]['id'])) ? (int)$inserted[0]['id'] : 0;
    if ($s < 200 || $s >= 300 || $id < 1) {
        error_log('[FurryCorner OTP] Could not save the OTP (HTTP ' . $s . ').');
        otp_fail(503, 'unavailable', 'The verification service is temporarily unavailable. Please try again later.');
    }

    if (!otp_send_email($email, $code, $expiresAt)) {
        // Keep the row (it still counts toward the limits) but make the code unusable.
        otp_db('PATCH', 'email_otps?id=eq.' . $id, ['send_status' => 'failed', 'used_at' => otp_iso($now)]);
        otp_fail(502, 'email_failed', 'We could not send the email right now. Please try again in a moment.');
    }

    otp_db('PATCH', 'email_otps?id=eq.' . $id, ['send_status' => 'sent']);

    otp_respond(200, array_merge([
        'success'    => true,
        'expires_in' => OTP_TTL_SECONDS,
        'cooldown'   => OTP_COOLDOWN_SECONDS,
    ], $extraResponse));
}

/**
 * Checks a submitted code. A wrong guess uses up one of the OTP_MAX_ATTEMPTS slots (claimed atomically,
 * so parallel guesses cannot exceed the limit). A correct code is marked used in the same step.
 * Returns ['ok'=>true,'id'=>int] or ['ok'=>false,'status'=>int,'code'=>string,'message'=>string].
 */
function otp_check(string $purpose, string $email, string $code): array
{
    $bad = function (int $status, string $c, string $m): array {
        return ['ok' => false, 'status' => $status, 'code' => $c, 'message' => $m];
    };

    if (!preg_match('/^[0-9]{6}$/', $code)) {
        return $bad(400, 'invalid_code', 'Enter the 6-digit code from your email.');
    }

    $now = time();
    for ($i = 0; $i < 5; $i++) {
        [$s, $rows] = otp_db('GET', 'email_otps?email=eq.' . otp_q($email) . '&purpose=eq.' . otp_q($purpose)
            . '&used_at=is.null&order=created_at.desc&limit=1&select=id,code_hash,expires_at,attempts');
        if ($s < 200 || $s >= 300 || !is_array($rows)) {
            error_log('[FurryCorner OTP] Could not read the OTP (HTTP ' . $s . ').');
            return $bad(503, 'unavailable', 'The verification service is temporarily unavailable. Please try again later.');
        }
        if (count($rows) === 0) {
            return $bad(400, 'no_code', 'This code is no longer valid. Please request a new one.');
        }

        $row      = $rows[0];
        $id       = (int)$row['id'];
        $attempts = (int)$row['attempts'];

        if ((int)strtotime((string)$row['expires_at']) <= $now) {
            otp_db('PATCH', 'email_otps?id=eq.' . $id . '&used_at=is.null', ['used_at' => otp_iso($now)]);
            return $bad(400, 'expired', 'This code has expired. Please request a new one.');
        }
        if ($attempts >= OTP_MAX_ATTEMPTS) {
            otp_db('PATCH', 'email_otps?id=eq.' . $id . '&used_at=is.null', ['used_at' => otp_iso($now)]);
            return $bad(429, 'too_many_attempts', 'Too many incorrect attempts. Please request a new code.');
        }

        // Claim one attempt slot (fails if another request changed the row meanwhile -> re-read and retry).
        [, $claimed] = otp_db('PATCH', 'email_otps?id=eq.' . $id . '&attempts=eq.' . $attempts . '&used_at=is.null',
            ['attempts' => $attempts + 1], true);
        if (!is_array($claimed) || count($claimed) !== 1) {
            continue;
        }

        if (hash_equals((string)$row['code_hash'], otp_hash($purpose, $email, $code))) {
            [, $used] = otp_db('PATCH', 'email_otps?id=eq.' . $id . '&used_at=is.null', ['used_at' => otp_iso($now)], true);
            if (is_array($used) && count($used) === 1) {
                return ['ok' => true, 'id' => $id];
            }
            return $bad(400, 'no_code', 'This code was already used. Please request a new one.');
        }

        $left = OTP_MAX_ATTEMPTS - ($attempts + 1);
        if ($left <= 0) {
            otp_db('PATCH', 'email_otps?id=eq.' . $id . '&used_at=is.null', ['used_at' => otp_iso($now)]);
            return $bad(429, 'too_many_attempts', 'Too many incorrect attempts. Please request a new code.');
        }
        return $bad(400, 'incorrect', 'Incorrect code. ' . $left . ' attempt' . ($left === 1 ? '' : 's') . ' left.');
    }

    return $bad(429, 'busy', 'Please try again in a moment.');
}

/** Gives a consumed code back (used when a later step failed for a reason that is not the customer's code). */
function otp_release(int $id): void
{
    otp_db('PATCH', 'email_otps?id=eq.' . $id, ['used_at' => null]);
}

/* ------------------------------------------------------------------ Logged-in customer */

/**
 * Validates the customer's Supabase login token with Supabase Auth and returns their id and VERIFIED email.
 * The email always comes from Supabase, never from the request.
 */
function otp_auth_user(array $input): array
{
    $header = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    $token  = '';
    if (preg_match('/^Bearer\s+([A-Za-z0-9\-_\.]+)$/', $header, $m)) {
        $token = $m[1];
    } elseif (isset($input['access_token']) && is_string($input['access_token'])
        && preg_match('/^[A-Za-z0-9\-_\.]+$/', $input['access_token'])) {
        $token = $input['access_token'];   // fallback for hosts that strip the Authorization header
    }
    if ($token === '') {
        otp_fail(401, 'not_signed_in', 'Please sign in again.');
    }

    $key = (string)(otp_config()['supabase_publishable_key'] ?? '');
    [$status, $user] = otp_http('GET', rtrim(SUPABASE_URL, '/') . '/auth/v1/user', null, [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
    ]);

    if ($status !== 200 || !is_array($user) || empty($user['id']) || empty($user['email'])) {
        otp_fail(401, 'not_signed_in', 'Your session has expired. Please sign in again.');
    }
    if (empty($user['email_confirmed_at'])) {
        otp_fail(403, 'email_not_verified', 'Your email address is not verified yet.');
    }

    return ['id' => (string)$user['id'], 'email' => strtolower((string)$user['email'])];
}
