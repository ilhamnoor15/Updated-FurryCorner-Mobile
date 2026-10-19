<?php
/*
 * POST { otp, current_password, new_password }  (Authorization: Bearer <access token>)
 * The password is changed server-side, only after: valid login token -> correct code -> correct current password.
 */
require_once __DIR__ . '/otp_lib.php';

otp_cors();
$cfg = otp_require_config(true);

$input       = otp_input();
$user        = otp_auth_user($input);
$code        = trim((string)($input['otp'] ?? ''));
$current     = (string)($input['current_password'] ?? '');
$newPassword = (string)($input['new_password'] ?? '');

// Validate before using up a code attempt.
if ($current === '') {
    otp_fail(400, 'missing_current_password', 'Please enter your current password.');
}
if (strlen($newPassword) < 8 || strlen($newPassword) > 72) {
    otp_fail(400, 'invalid_password', 'Your new password must be 8 to 72 characters long.');
}
if ($newPassword === $current) {
    otp_fail(400, 'same_password', 'Your new password must be different from the current one.');
}

// 1) The emailed code (also enforces expiry, single use and the attempt limit).
$check = otp_check('password_change', $user['email'], $code);
if (!$check['ok']) {
    otp_fail($check['status'], $check['code'], $check['message']);
}

// 2) The current password, checked by Supabase Auth.
[$status] = otp_http('POST', rtrim(SUPABASE_URL, '/') . '/auth/v1/token?grant_type=password',
    ['email' => $user['email'], 'password' => $current],
    ['apikey: ' . $cfg['supabase_publishable_key'], 'Content-Type: application/json', 'Accept: application/json']);

if ($status === 400 || $status === 401 || $status === 422) {
    otp_release((int)$check['id']);   // the code was right; let them fix the typo without a new email
    otp_fail(403, 'wrong_current_password', 'Your current password is incorrect.');
}
if ($status !== 200) {
    otp_release((int)$check['id']);
    error_log('[FurryCorner OTP] Current-password check failed, HTTP ' . $status);
    otp_fail(502, 'verify_failed', 'We could not verify your password right now. Please try again.');
}

// 3) Change the password (server-side, with the admin API).
[$status, $result] = otp_admin('PUT', 'users/' . rawurlencode($user['id']), ['password' => $newPassword]);
if ($status === 200) {
    otp_respond(200, ['success' => true, 'message' => 'Your password was updated.']);
}

otp_release((int)$check['id']);
$errorCode = is_array($result) ? (string)($result['error_code'] ?? '') : '';
if ($errorCode === 'weak_password') {
    otp_fail(422, 'weak_password', 'Please choose a stronger password.');
}
if ($errorCode === 'same_password') {
    otp_fail(400, 'same_password', 'Your new password must be different from the current one.');
}
error_log('[FurryCorner OTP] Password update failed, HTTP ' . $status . ', error_code=' . $errorCode);
otp_fail(502, 'update_failed', 'We could not update your password right now. Please try again.');
