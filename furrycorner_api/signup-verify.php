<?php
/*
 * POST { email, otp, password, first_name, last_name }
 * Checks the code and ONLY THEN creates the account (email already confirmed) through Supabase's admin API.
 * Registration is never completed without a valid, unexpired, unused code.
 */
require_once __DIR__ . '/otp_lib.php';

otp_cors();
otp_require_config();

$input     = otp_input();
$email     = otp_normalize_email($input['email'] ?? '');
$code      = trim((string)($input['otp'] ?? ''));
$password  = (string)($input['password'] ?? '');
$firstName = trim((string)($input['first_name'] ?? ''));
$lastName  = trim((string)($input['last_name'] ?? ''));

// Validate everything BEFORE using up a code attempt.
if ($firstName === '' || $lastName === '' || mb_strlen($firstName) > 60 || mb_strlen($lastName) > 60) {
    otp_fail(400, 'invalid_name', 'Please enter your first and last name.');
}
if (strlen($password) < 6 || strlen($password) > 72) {
    otp_fail(400, 'invalid_password', 'Password must be 6 to 72 characters long.');
}

$check = otp_check('signup', $email, $code);
if (!$check['ok']) {
    otp_fail($check['status'], $check['code'], $check['message']);
}

[$status, $user] = otp_admin('POST', 'users', [
    'email'         => $email,
    'password'      => $password,
    'email_confirm' => true,
    'user_metadata' => [
        'first_name' => $firstName,
        'last_name'  => $lastName,
        'full_name'  => trim($firstName . ' ' . $lastName),
        'role'       => 'customer',
    ],
]);

if ($status === 200 || $status === 201) {
    otp_respond(200, ['success' => true, 'message' => 'Your email is verified and your account is ready.']);
}

$errorCode = is_array($user) ? (string)($user['error_code'] ?? '') : '';
$errorText = is_array($user) ? strtolower((string)($user['msg'] ?? $user['message'] ?? '')) : '';

if ($errorCode === 'email_exists' || $errorCode === 'user_already_exists' || strpos($errorText, 'already') !== false) {
    // The code stays used. No duplicate account is created.
    otp_fail(409, 'account_exists', 'An account with this email already exists. Please sign in instead.');
}

// Any other failure is not the customer's fault: give the code back so they can retry without a new email.
otp_release((int)$check['id']);

if ($errorCode === 'weak_password') {
    otp_fail(422, 'weak_password', 'Please choose a stronger password.');
}

error_log('[FurryCorner OTP] Account creation failed, HTTP ' . $status . ', error_code=' . $errorCode);
otp_fail(502, 'create_failed', 'We could not create your account right now. Please try again.');
