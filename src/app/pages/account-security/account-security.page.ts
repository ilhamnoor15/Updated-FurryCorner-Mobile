// @ts-nocheck  (legacy script below is plain JavaScript carried over from account-security.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './account-security.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-account-security',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class AccountSecurityPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of account-security.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {

const accountForm = document.getElementById('accountForm');
const passwordForm = document.getElementById('passwordForm');
const accountStatus = document.getElementById('accountStatus');
const passwordStatus = document.getElementById('passwordStatus');

function setStatus(element, message, isError = false){
    element.textContent = message;
    element.classList.toggle('error', isError);
}

async function loadAccount() {
    try {
        const current = JSON.parse(
            localStorage.getItem('loggedInUser') || '{}'
        );

        const userId = localStorage.getItem('loggedInUserId');

        if (!userId) {
            throw new Error('Please sign in again to load your account.');
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        const fullName = (profile?.full_name || '').trim();
        const nameParts = fullName ? fullName.split(/\s+/) : [];

        document.getElementById('firstName').value =
            nameParts.shift() || current.firstName || '';

        document.getElementById('lastName').value =
            nameParts.join(' ') || current.lastName || '';

        document.getElementById('email').value =
            current.email || localStorage.getItem('loggedInEmail') || '';

    } catch (error) {
        setStatus(accountStatus, error.message || 'Unable to load account details.', true);
    }
}


accountForm.addEventListener('submit', async event => {
    event.preventDefault();

    const button = document.getElementById('saveAccount');
    button.disabled = true;
    setStatus(accountStatus, 'Saving account details...');

    try {
        const userId = localStorage.getItem('loggedInUserId');
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const currentPassword = document.getElementById('profileCurrentPassword').value;

        if (!userId) {
            throw new Error('Please sign in again.');
        }

        if (!firstName || !lastName || !email) {
            throw new Error('Please complete all account fields.');
        }

        
let { data: authData, error: authError } =
    await supabase.auth.getUser();

if (authError || !authData.user?.email) {
    // Try refreshing the existing session before asking the user
    // to sign in again.
    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    if (!sessionError && sessionData.session) {
        const { data: refreshedData, error: refreshError } =
            await supabase.auth.refreshSession();

        if (!refreshError && refreshedData.user?.email) {
            authData = { user: refreshedData.user };
            authError = null;
        }
    }
}

if (authError || !authData.user?.email) {
    throw new Error(
        'Your login session could not be verified. Please sign in again.'
    );
}


// Require the current password before saving account changes.
if (!currentPassword) {
    throw new Error('Please enter your current password to save account details.');
}

const { error: verifyError } =
    await supabase.auth.signInWithPassword({
        email: authData.user.email,
        password: currentPassword
    });

        if (verifyError) {
            throw new Error('Your current password is incorrect. No account details were saved.');
        }

        // Only update the profile after password verification succeeds.
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: `${firstName} ${lastName}`.trim()
            })
            .eq('id', userId);

        if (profileError) {
            throw profileError;
        }

        if (authError || !authData.user) {
            throw new Error('Unable to verify your signed-in account.');
        }

        if (email !== (authData.user.email || '')) {
            const { error } = await supabase.auth.updateUser({ email });

            if (error) {
                throw error;
            }

            setStatus(
                accountStatus,
                'Name saved. Check your email if Supabase requests email confirmation.'
            );
        } else {
            setStatus(accountStatus, 'Account details saved.');
        }

        const current = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

        localStorage.setItem('loggedInUser', JSON.stringify({
            ...current,
            id: userId,
            user_id: userId,
            firstName,
            lastName,
            email
        }));

        localStorage.setItem('loggedInName', `${firstName} ${lastName}`.trim());
        localStorage.setItem('loggedInEmail', email);
        document.getElementById('profileCurrentPassword').value = '';

    } catch (error) {
        setStatus(
            accountStatus,
            error.message || 'Unable to save account details.',
            true
        );
    } finally {
        button.disabled = false;
    }
});




const sendPasswordOtp = document.getElementById('sendPasswordOtp');
const passwordOtpSection = document.getElementById('passwordOtpSection');
const passwordOtpInput = document.getElementById('passwordOtp');

sendPasswordOtp.addEventListener('click', async () => {
    sendPasswordOtp.disabled = true;
    setStatus(passwordStatus, 'Requesting email verification code...');

    try {
        const currentPassword =
            document.getElementById('currentPassword').value;
        const newPassword =
            document.getElementById('newPassword').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error('Please complete all password fields first.');
        }

        if (newPassword.length < 8 || newPassword.length > 72) {
            throw new Error('Your new password must be 8 to 72 characters long.');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('The new passwords do not match.');
        }

        if (newPassword === currentPassword) {
            throw new Error('Your new password must be different from your current password.');
        }

        const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError || !sessionData.session?.access_token) {
            throw new Error('Your session has expired. Please sign in again.');
        }

        const response = await fetch(
            'https://furrycorner.online/furrycorner_api/password-otp-request.php',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData.session.access_token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({})
            }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message || 'Unable to send the verification code.'
            );
        }

        passwordOtpSection.hidden = false;
        passwordOtpInput.required = true;
        passwordOtpInput.value = '';
        passwordOtpInput.focus();

        sendPasswordOtp.textContent = 'Send OTP Again';

        setStatus(
            passwordStatus,
            result.message || 'Verification code requested. Check your registered email.'
        );

    } catch (error) {
        setStatus(
            passwordStatus,
            error.message || 'Unable to request the verification code.',
            true
        );
    } finally {
        sendPasswordOtp.disabled = false;
    }
});


passwordForm.addEventListener('submit', async event => {
    event.preventDefault();

    const button = document.getElementById('savePassword');
    button.disabled = true;

    setStatus(passwordStatus, 'Verifying code and updating password...');

    try {
        const currentPassword =
            document.getElementById('currentPassword').value;
        const newPassword =
            document.getElementById('newPassword').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;
        const otp = passwordOtpInput.value.trim();

        if (!currentPassword || !newPassword || !confirmPassword || !otp) {
            throw new Error('Please complete all fields, including the verification code.');
        }

        if (!/^\d{6}$/.test(otp)) {
            throw new Error('Please enter the complete six-digit verification code.');
        }

        if (newPassword.length < 8 || newPassword.length > 72) {
            throw new Error('Your new password must be 8 to 72 characters long.');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('The new passwords do not match.');
        }

        if (newPassword === currentPassword) {
            throw new Error('Your new password must be different from your current password.');
        }

        const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError || !sessionData.session?.access_token) {
            throw new Error('Your session has expired. Please sign in again.');
        }

        const response = await fetch(
            'https://furrycorner.online/furrycorner_api/password-change.php',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData.session.access_token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    otp: otp,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            }
        );

        const result = await response.json();

        
if (!response.ok || result.success !== true) {
    throw new Error(
        result.message || 'Unable to update your password.'
    );
}

// The backend changed the password. Re-authenticate to refresh
// the Supabase session using the new password.
const signedInEmail = sessionData.session.user.email;

const { data: refreshedSession, error: refreshError } =
    await supabase.auth.signInWithPassword({
        email: signedInEmail,
        password: newPassword
    });

if (refreshError || !refreshedSession.session) {
    passwordForm.reset();
    passwordOtpSection.hidden = true;
    passwordOtpInput.required = false;

    setStatus(
        passwordStatus,
        'Your password was changed, but your session could not be refreshed. Please sign in again.',
        true
    );
    return;
}

passwordForm.reset();
passwordOtpSection.hidden = true;
passwordOtpInput.required = false;
sendPasswordOtp.textContent = 'Send OTP to Email';

setStatus(
    passwordStatus,
    'Password updated successfully. You can continue using your account.'
);


    } catch (error) {
        setStatus(
            passwordStatus,
            error.message || 'Unable to update your password.',
            true
        );
    } finally {
        button.disabled = false;
    }
});



loadAccount();

;


  }
}
