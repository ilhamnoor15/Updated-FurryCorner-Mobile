// @ts-nocheck  (legacy script below is plain JavaScript carried over from signin.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './signin.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class SigninPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of signin.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =========================
   RETURN LOCATION
========================= */

const returnParams = new URLSearchParams(location.search);

const returnTo =
    returnParams.get('return') || 'profile.html';

const safeReturnTo =
    window.FurryCornerAuth.getSafeReturnTarget(returnTo);


/* =========================
   SIGN UP LINK
========================= */

const signupLink =
    document.getElementById('signupLink');

signupLink.href =
    `signup.html?return=${encodeURIComponent(
        window.FurryCornerAuth.getSafeReturnTarget(
            returnTo || 'profile.html'
        )
    )}`;


/* =========================
   EMAIL LOGIN
   EMAIL ONLY
========================= */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.hidden = false;
}

function resetError() {
    const error = document.getElementById('error');
    error.hidden = true;
    error.textContent = '';
}

document
    .getElementById('loginForm')
    .addEventListener('submit', async event => {

        event.preventDefault();

        resetError();


        const emailValue =
            document
                .getElementById('email')
                .value
                .trim()
                .toLowerCase();


        const passwordValue =
            document
                .getElementById('password')
                .value;


        /* =================================================
           VALIDATION
        ================================================= */

        if (!emailValue) {

            showError(
                'Please enter your email address.'
            );

            return;
        }


        if (!EMAIL_PATTERN.test(emailValue)) {

            showError(
                'Please enter a valid email address.'
            );

            return;
        }


        if (!passwordValue) {

            showError(
                'Please enter your password.'
            );

            return;
        }


        /* =================================================
           DISABLE BUTTON
        ================================================= */

        const button =
            document.querySelector(
                '#loginForm .button'
            );


        const originalText =
            button.textContent;


        button.disabled = true;

        button.textContent =
            'Signing in...';



try {
    // Sign in using Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: passwordValue
    });

    if (error) {
        console.error('Supabase login failed:', error.message);
        showError(error.message);
        return;
    }

    if (!data.user || !data.session) {
        showError(
            'Login was not completed. Please check your email confirmation status.'
        );
        return;
    }

    const user = data.user;
    const metadata = user.user_metadata || {};

    const firstName = metadata.first_name || '';
    const lastName = metadata.last_name || '';
    const fullName =
        metadata.full_name ||
        `${firstName} ${lastName}`.trim() ||
        emailValue;

    const role = metadata.role || 'customer';

    // Preserve the guest cart before switching to the signed-in account.
const guestCart = localStorage.getItem('cart');

if (guestCart !== null) {
    try {
        const parsedGuestCart = JSON.parse(guestCart);

        if (Array.isArray(parsedGuestCart)) {
            localStorage.setItem(
                'furryCornerGuestCart',
                JSON.stringify(parsedGuestCart)
            );
        }
    } catch (error) {
        console.warn('Guest cart could not be preserved:', error);
    }
}

// Save the Supabase user ID (UUID)
localStorage.setItem('loggedInUserId', user.id);


const guestCartKey = 'furryCornerGuestCart';
const accountCartKey = `furryCornerCart:${user.id}`;

try {
    const guestCart = JSON.parse(
        localStorage.getItem(guestCartKey) || '[]'
    );
    const accountCart = JSON.parse(
        localStorage.getItem(accountCartKey) || '[]'
    );

    if (Array.isArray(guestCart) && Array.isArray(accountCart)) {
        const mergedCart = [...accountCart];

        guestCart.forEach(guestItem => {
            const guestId = String(guestItem.id ?? guestItem.product_id ?? '');
            if (!guestId) return;

            const existingItem = mergedCart.find(
                item => String(item.id ?? item.product_id ?? '') === guestId
            );

            if (existingItem) {
                existingItem.quantity =
                    Number(existingItem.quantity || 0) +
                    Number(guestItem.quantity || 0);
            } else {
                mergedCart.push(guestItem);
            }
        });

        localStorage.setItem(accountCartKey, JSON.stringify(mergedCart));
        localStorage.removeItem(guestCartKey);
    }
} catch (error) {
    console.error('Could not merge guest cart:', error);
}


    // Save the Supabase session token
    localStorage.setItem(
        'furryCornerAuthToken',
        data.session.access_token
    );

    // Save user information for the existing frontend
    localStorage.setItem(
        'loggedInUser',
        JSON.stringify({
            id: user.id,
            user_id: user.id,
            firstName,
            lastName,
            email: user.email || emailValue,
            role
        })
    );

    localStorage.setItem('loggedInName', fullName);
    localStorage.setItem('loggedInEmail', user.email || emailValue);
    localStorage.setItem(
        'furryCornerUser',
        JSON.stringify({
            name: fullName,
            email: user.email || emailValue
        })
    );

    localStorage.setItem('profileName', fullName);
    localStorage.setItem(
        'furryCornerAccount',
        JSON.stringify({
            name: fullName,
            email: user.email || emailValue
        })
    );

    // Preserve checkout items across sign-in.
const pendingCheckoutItems =
    localStorage.getItem('checkoutItems');

if (returnTo === 'checkout.html' && pendingCheckoutItems) {
    try {
        const parsedItems = JSON.parse(pendingCheckoutItems);

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            localStorage.setItem(
                'checkoutItems',
                JSON.stringify(parsedItems)
            );
        }
    } catch (error) {
        console.error('Could not preserve checkout items:', error);
    }
}

// Navigate using the LegacyPage router shim.
location.assign(safeReturnTo);

} catch (error) {
    console.error('Supabase login request failed:', error);

    showError(
        error instanceof Error
            ? error.message
            : 'Unable to sign in. Please try again.'
    );
}

        finally {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    });


;


  }
}
