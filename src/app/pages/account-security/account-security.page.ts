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

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: `${firstName} ${lastName}`.trim()
            })
            .eq('id', userId);

        if (profileError) {
            throw profileError;
        }

        const { data: authData, error: authError } =
            await supabase.auth.getUser();

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



passwordForm.addEventListener('submit', async event => {
    event.preventDefault();

    const button = document.getElementById('savePassword');
    button.disabled = true;
    setStatus(passwordStatus, 'Updating password...');

    try {
        const currentPassword =
            document.getElementById('currentPassword').value;
        const newPassword =
            document.getElementById('newPassword').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error('Please complete all password fields.');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('The new passwords do not match.');
        }

        if (newPassword.length < 6) {
            throw new Error('Your new password must be at least 6 characters.');
        }

        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData.user?.email) {
            throw new Error('Unable to verify your signed-in account.');
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password: currentPassword
        });

        if (verifyError) {
            throw new Error('Your current password is incorrect.');
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            throw updateError;
        }

        passwordForm.reset();
        setStatus(passwordStatus, 'Password updated successfully.');

    } catch (error) {
        setStatus(
            passwordStatus,
            error.message || 'Unable to update password.',
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
