// @ts-nocheck  (legacy script below is plain JavaScript carried over from signup.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './signup.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class SignupPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of signup.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


const signupForm = document.getElementById('signupForm');
const signupPanel = document.querySelector('.panel');
const fullNameField = document.getElementById('name').closest('.field');
const formError = document.getElementById('formError');
const successMessage = document.getElementById('successMessage');
const submitBtn = signupForm.querySelector('button[type="submit"]');

// --- Google-style signup UI (name split, Google button) ---
document.querySelector('.panel h1').textContent = 'Create your account';
document.querySelector('.intro').textContent = 'Join FurryCorner to shop and book pet services';
submitBtn.textContent = 'Create account';
document.getElementById('email').placeholder = 'you@example.com';
document.getElementById('password').placeholder = 'Enter password';
document.getElementById('confirm').placeholder = 'Confirm password';
document.querySelector('.signin a').textContent = 'Sign in';
document.querySelector('.signin a').href = 'signin.html';
signupPanel.insertBefore(Object.assign(document.createElement('button'), {className: 'google-button', type: 'button', innerHTML: '<svg class="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.69 2.9-4.18 2.9-7.22Z"></path><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.15-2.45c-.87.58-1.98.93-3.3.93-2.54 0-4.69-1.72-5.46-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"></path><path fill="#FBBC05" d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.37l3.26-2.53Z"></path><path fill="#EA4335" d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.26 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"></path></svg>Continue with Google'}), signupForm);
signupPanel.insertBefore(Object.assign(document.createElement('div'), {className: 'or-divider', textContent: 'OR'}), signupForm);
fullNameField.innerHTML = '<input id="name" type="hidden">';
fullNameField.style.display = 'none';
const nameFields = document.createElement('div');
nameFields.className = 'name-fields';
nameFields.innerHTML = '<div class="field"><input id="firstName" placeholder="First name" autocomplete="given-name" required></div><div class="field"><input id="lastName" placeholder="Last name" autocomplete="family-name" required></div>';
signupForm.insertBefore(nameFields, fullNameField);
const syncFullName = () => { document.getElementById('name').value = `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`.trim(); };
document.querySelectorAll('#firstName, #lastName').forEach(input => input.addEventListener('input', syncFullName));

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function resetFormError() {
  formError.hidden = true;
  formError.textContent = '';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupFields() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm');

  confirm.setCustomValidity('');

  if (!firstName || !lastName) {
    return 'Please enter your first and last name.';
  }
  if (!email.value.trim()) {
    return 'Please enter your email address.';
  }
  if (!EMAIL_PATTERN.test(email.value.trim())) {
    return 'Please enter a valid email address.';
  }
  if (!password.value) {
    return 'Please enter a password.';
  }
  if (password.value.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (!confirm.value) {
    return 'Please confirm your password.';
  }
  if (password.value !== confirm.value) {
    confirm.setCustomValidity('Passwords do not match');
    return 'Passwords do not match.';
  }
  return null;
}


let otpRequested = false;
let pendingSignup = null;

const otpField = document.createElement('div');
otpField.className = 'field';
otpField.hidden = true;
otpField.innerHTML = `
  <label class="otp-label">Enter the verification code</label>
  <p class="otp-hint">Enter the 6-digit code sent to your email.</p>
  <div class="otp-boxes" role="group" aria-label="6-digit verification code">
    ${Array.from({ length: 6 }, (_, i) =>
      `<input class="otp-digit" type="text" inputmode="numeric"
        pattern="[0-9]*" maxlength="1" aria-label="Digit ${i + 1}"
        autocomplete="${i === 0 ? 'one-time-code' : 'off'}">`
    ).join('')}
  </div>
`;

const otpStyle = document.createElement('style');

otpStyle.textContent = `
  .otp-label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 800;
    text-align: left;
    color: #1F2430;
  }

  .otp-hint {
    margin-bottom: 12px;
    font-size: 12px;
    line-height: 1.4;
    color: #929caf;
    text-align: left;
  }

  .otp-boxes {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: clamp(5px, 2vw, 10px);
    width: 100%;
    max-width: 100%;
  }

  .otp-boxes .otp-digit {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: clamp(42px, 12vw, 50px);
    padding: 0;
    border: 1.5px solid #dce2ea;
    border-radius: 9px;
    background: #fff;
    color: #1F2430;
    font-size: clamp(18px, 5vw, 22px);
    font-weight: 800;
    text-align: center;
    outline: none;
  }

  .otp-boxes .otp-digit:focus {
    border-color: #5CA3E8;
    box-shadow: 0 0 0 2px rgba(92, 163, 232, .15);
  }

  @media (max-width: 360px) {
    .otp-boxes { gap: 4px; }
    .otp-boxes .otp-digit { border-radius: 7px; }
  }
`;

document.head.appendChild(otpStyle);

const otpDigits = Array.from(otpField.querySelectorAll('.otp-digit'));

otpDigits.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(-1);

    if (input.value && index < otpDigits.length - 1) {
      otpDigits[index + 1].focus();
    }
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      otpDigits[index - 1].focus();
    }
  });

  input.addEventListener('paste', event => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    pasted.split('').forEach((digit, i) => {
      if (otpDigits[i]) otpDigits[i].value = digit;
    });

    otpDigits[Math.min(pasted.length, 5)].focus();
  });
});

function getSignupOtp() {
  return otpDigits.map(input => input.value).join('');
}
signupForm.insertBefore(otpField, submitBtn);

const API_BASE = 'https://furrycorner.online/furrycorner_api';

async function callOtpEndpoint(endpoint, payload) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  return result;
}

function saveSignupSession(data, firstName, lastName, email) {
  const user = data.user;
  const name = `${firstName} ${lastName}`.trim();

  const loggedInUser = {
    id: user.id,
    user_id: user.id,
    firstName,
    lastName,
    email,
    role: 'customer'
  };

  localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  localStorage.setItem('loggedInUserId', user.id);
  localStorage.setItem('loggedInName', name);
  localStorage.setItem('loggedInEmail', email);
  localStorage.setItem('furryCornerUser', JSON.stringify({ name, email }));
  localStorage.setItem('profileName', name);
  localStorage.setItem('furryCornerAccount', JSON.stringify({ name, email }));
}

signupForm.addEventListener('submit', async event => {
  event.preventDefault();
  resetFormError();

  if (!otpRequested) {
    syncFullName();

    const validationError = validateSignupFields();
    if (validationError) {
      showFormError(validationError);
      return;
    }

    pendingSignup = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      password: document.getElementById('password').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending verification code...';

    try {
      await callOtpEndpoint('signup-otp-request.php', {
        email: pendingSignup.email
      });

      otpRequested = true;
      otpField.hidden = false;

      nameFields.hidden = true;
      document.getElementById('email').disabled = true;
      document.getElementById('password').closest('.field').hidden = true;
      document.getElementById('confirm').closest('.field').hidden = true;

      otpDigits[0].required = true;
      submitBtn.textContent = 'Verify code and create account';

      successMessage.textContent =
        `A verification code was sent to ${pendingSignup.email}. It expires in 10 minutes.`;
      successMessage.hidden = false;
      otpDigits[0].focus();
    } catch (error) {
      showFormError(error.message || 'Could not send the verification code.');
    } finally {
      submitBtn.disabled = false;
    }

    return;
  }

  const otp = getSignupOtp();

  if (!/^\d{6}$/.test(otp)) {
    showFormError('Enter the 6-digit verification code from your email.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying...';

  try {
    await callOtpEndpoint('signup-verify.php', {
      email: pendingSignup.email,
      otp,
      password: pendingSignup.password,
      first_name: pendingSignup.firstName,
      last_name: pendingSignup.lastName
    });

    // The PHP endpoint creates the account only after validating the OTP.
    // Now sign in through Supabase to obtain the normal customer session.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pendingSignup.email,
      password: pendingSignup.password
    });

    if (error) {
      throw new Error(
        'Your email is verified and your account was created, but automatic sign-in failed. Please sign in using your new account.'
      );
    }

    if (!data.user || !data.session) {
      throw new Error('Account created, but no sign-in session was returned. Please sign in.');
    }

    saveSignupSession(
      data,
      pendingSignup.firstName,
      pendingSignup.lastName,
      pendingSignup.email
    );

    signupForm.hidden = true;
    document.getElementById('signinRow').hidden = true;
    successMessage.textContent = 'Email verified! Your account was created successfully.';
    successMessage.hidden = false;

    location.href = 'index';
  } catch (error) {
    showFormError(error.message || 'Verification failed. Please try again.');
  } finally {
    submitBtn.disabled = false;
    if (!signupForm.hidden) {
      submitBtn.textContent = otpRequested
        ? 'Verify code and create account'
        : 'Create account';
    }
  }
});


    ;


  }
}
