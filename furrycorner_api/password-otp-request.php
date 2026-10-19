<?php
/*
 * POST (Authorization: Bearer <customer's Supabase access token>)  ->  emails a password-change code.
 * The recipient is ALWAYS the verified email Supabase has for the signed-in customer.
 * No email address is accepted from the request, so a code cannot be sent to an arbitrary address.
 */
require_once __DIR__ . '/otp_lib.php';

otp_cors();
otp_require_config(true);

$input = otp_input();
$user  = otp_auth_user($input);

otp_issue('password_change', $user['email'], $user['id'], ['email_masked' => otp_mask_email($user['email'])]);
