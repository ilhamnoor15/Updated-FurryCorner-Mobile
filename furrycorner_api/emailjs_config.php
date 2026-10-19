<?php
/*
 * EmailJS + OTP settings. Keep this file on the PHP backend ONLY (never in the app).
 * Do not commit it to git and do not paste the private key anywhere public.
 *
 * Fill in the three PASTE_... values on the server (Hostinger File Manager):
 *   public_key  : EmailJS dashboard -> Account -> General -> Public Key
 *   private_key : EmailJS dashboard -> Account -> Security -> Private Key
 *                 (also turn ON "Allow EmailJS API for non-browser applications" on that page)
 *   otp_pepper  : any long random secret, e.g. generate one with:  openssl rand -hex 32
 *                 It protects stored OTP hashes. Do not change it while codes are active.
 */
return [
    'service_id'      => 'service_ai9gzjz',
    'otp_template_id' => 'template_cj7mgvh',
    'public_key'      => '7UAkyBiNuMO3Hhj37',
    'private_key'     => 'xh0lPDOvBaUfb1C5ElXC5',
    'otp_pepper'      => '6ddf57ca81ca6efd2a470bb66cec33d29bf998e2c2e92649a330cd3b115e51e8',

    // Public by design (same value as the app's supabase.service.ts). Used to ask Supabase Auth to
    // validate a customer's login token and to check a current password.
    'supabase_publishable_key' => 'sb_publishable_-8lnd11Ufx2lrpX5ARh4bA_F59WPGNB',
];
