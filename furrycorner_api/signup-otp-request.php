<?php
/* POST { "email": "..." }  ->  emails a 6-digit sign-up code (10 min, 60 s cooldown, 5/hour per email). */
require_once __DIR__ . '/otp_lib.php';

otp_cors();
otp_require_config();

$input = otp_input();
$email = otp_normalize_email($input['email'] ?? '');

// Same response whether or not an account already exists, so this cannot be used to discover accounts.
otp_issue('signup', $email, null, ['email_masked' => otp_mask_email($email)]);
