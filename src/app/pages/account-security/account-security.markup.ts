// Page markup + CSS carried over unchanged from account-security.html.
// Migrate this to a real Angular template (.html) / .scss one page at a time.
export const TITLE = `Account &amp; Security - FurryCorner PH`;
export const BODY_CLASS = ``;

export const HTML = `<header class="page-header">
                        <div class="header-inner">
                            <a class="back-link" href="profile.html" aria-label="Back to My Account">
                                <span aria-hidden="true">←</span>
                                <span>Back</span>
                            </a>
                            <h1 class="page-title">My Addresses</h1>
                        </div>
                    </header>
<main>
    <section class="account-section" aria-labelledby="accountDetailsTitle">
        <h2 id="accountDetailsTitle">Account details</h2>
        <form class="account-form" id="accountForm">
            <div class="field-grid">
                <div class="field"><label for="firstName">First name</label><input id="firstName" maxlength="50" autocomplete="given-name" required></div>
                <div class="field"><label for="lastName">Last name</label><input id="lastName" maxlength="50" autocomplete="family-name" required></div>
            </div>
            <div class="field"><label for="email">Email address</label><input id="email" type="email" maxlength="100" autocomplete="email" required></div>
            <div class="field"><label for="profileCurrentPassword">Current password</label><input id="profileCurrentPassword" type="password" autocomplete="current-password"><span class="field-help">Required only when changing your email address.</span></div>
            <button class="button" id="saveAccount" type="submit">Save account details</button>
            <p class="status" id="accountStatus" role="status" aria-live="polite"></p>
        </form>
    </section>
   
<section class="account-section" aria-labelledby="passwordTitle">
    <h2 id="passwordTitle">Change password</h2>
    <p>We'll send a verification code to your registered email.</p>

    <form class="account-form" id="passwordForm">
        <div class="field">
            <label for="currentPassword">Current password</label>
            <input id="currentPassword" type="password"
                   autocomplete="current-password" required>
        </div>

        <div class="field-grid">
            <div class="field">
                <label for="newPassword">New password</label>
                <input id="newPassword" type="password"
                       minlength="8" maxlength="72"
                       autocomplete="new-password" required>
            </div>

            <div class="field">
                <label for="confirmPassword">Confirm new password</label>
                <input id="confirmPassword" type="password"
                       minlength="8" maxlength="72"
                       autocomplete="new-password" required>
            </div>
        </div>

        <button class="button" id="sendPasswordOtp" type="button">
            Send OTP to Email
        </button>

        <div id="passwordOtpSection" hidden>
            <div class="field">
                <label for="passwordOtp">Email verification code</label>
                <input
                    id="passwordOtp"
                    class="otp-input"
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    placeholder="• • • • • •"
                    aria-label="Six-digit email verification code"
                >
            </div>

            <button class="button" id="savePassword" type="submit">
                Verify OTP &amp; Update Password
            </button>
        </div>

        <p class="status" id="passwordStatus"
           role="status" aria-live="polite"></p>
    </form>
</section>

</main>`;

export const CSS = `
:root{--blue:#7BB8F0;--blue-dark:#5CA3E8;--cream:#FCE3C0;--cream-light:#FDEEDA;--ink:#1F2430;--muted:#8b929e;--border:#e2e6ec;--white:#fff;--danger:#c9554d}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;background:var(--cream);color:var(--ink);font:600 15px 'Nunito',sans-serif;line-height:1.5;padding-bottom:36px}
a{color:inherit;text-decoration:none}
.page-header{background:var(--white);border-bottom:1px solid var(--border)}
.header-inner{
    max-width:760px;
    min-height:64px;
    margin:auto;
    padding:10px 20px;
    display:flex;
    align-items:center;
    justify-content:flex-start;
    gap:14px;
}
.back-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    min-height: 40px;
    padding: 0 8px;
    border-radius: 10px;
    color: var(--blue-dark);
    font-size: 14px;
    font-weight: 800;
    white-space: nowrap;
}

.back-link span:first-child {
    font-size: 24px;
    line-height: 1;
}

.back-link:hover {
    background: var(--cream-light);
}

.page-title{
    font:800 22px 'Baloo 2',cursive;
    color:var(--blue-dark);
    text-align:left;
}
main{max-width:760px;margin:26px auto;padding:0 20px;display:grid;gap:20px}
.account-section{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:22px}
.account-section h2{font:800 20px 'Baloo 2',cursive;margin-bottom:15px}
.account-form{display:grid;gap:13px}
.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:grid;gap:5px}
.field label{font-size:12px;font-weight:800;color:#626b79}
.field input{width:100%;height:43px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:#fff;font:600 14px 'Nunito',sans-serif;color:var(--ink)}
.field input:focus{outline:2px solid rgba(92,163,232,.25);border-color:var(--blue-dark)}
.field-help{font-size:12px;color:var(--muted)}
.button{min-height:43px;justify-self:start;padding:0 18px;border:0;border-radius:8px;background:var(--blue-dark);color:#fff;font:800 14px 'Nunito',sans-serif;cursor:pointer}
.button:disabled{opacity:.6;cursor:wait}
.status{min-height:20px;color:#39784c;font-size:13px;font-weight:800}
.status.error{color:var(--danger)}

/* Password change email OTP */
#passwordOtpSection {
    margin-top: 20px;
}

#passwordOtpSection .field {
    margin-bottom: 24px;
}

#passwordOtp.otp-input {
    width: 100%;
    max-width: 320px;
    box-sizing: border-box;
    padding: 16px 18px;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    background: #ffffff;
    color: #1f2937;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 10px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

#passwordOtp.otp-input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

#passwordOtpSection #savePassword {
    margin-top: 8px;
}

#passwordOtpSection #savePassword:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 380px) {
    #passwordOtp.otp-input {
        max-width: 100%;
        font-size: 21px;
        letter-spacing: 7px;
    }
}

@media(max-width:560px){.header-inner{padding:9px 14px}.page-title{font-size:19px}main{margin-top:17px;padding:0 14px}.account-section{padding:17px}}
@media(max-width:380px){.field-grid{grid-template-columns:1fr}}
`;
