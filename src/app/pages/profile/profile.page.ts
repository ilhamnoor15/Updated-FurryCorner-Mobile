// @ts-nocheck  (legacy script below is plain JavaScript carried over from profile.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './profile.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class ProfilePage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of profile.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let user = null;

const account =
    document.getElementById('accountSection');

const returnTo =
    new URLSearchParams(
        location.search
    ).get('return');


/* =====================================================
   LOAD USER PROFILE FROM DATABASE
===================================================== */

async function loadProfile() {

    const userId =
        localStorage.getItem('loggedInUserId');

    /*
     * No logged-in user
     */
    if (!userId) {

        handleLoggedOutProfile();

        return;
    }


    /*
     * Signed in on this phone -> show the signed-in profile (with Sign out) right away from the saved
     * session, then refresh it from the server. A slow or unreachable server must never turn a signed-in
     * user into the "Welcome" screen.
     */
    let cachedUser = null;

    try {
        cachedUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    } catch (error) {
        cachedUser = null;
    }

    if (cachedUser) {
        renderSignedIn({
            first_name: cachedUser.firstName || cachedUser.first_name || '',
            last_name: cachedUser.lastName || cachedUser.last_name || '',
            email: cachedUser.email || ''
        });
    }


try {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!profile) {
        if (cachedUser) {
            user = cachedUser;
            renderSignedIn(user);
        } else {
            handleLoggedOutProfile();
        }
        return;
    }

    const nameParts = (profile.full_name || '').trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    user = {
        ...cachedUser,
        id: profile.id,
        user_id: profile.id,
        firstName,
        lastName,
        email: cachedUser?.email || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url,
        role: cachedUser?.role || ''
    };

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('loggedInName', profile.full_name || '');
    localStorage.setItem('loggedInEmail', user.email);

    renderSignedIn(user);

    window.dispatchEvent(
    new CustomEvent('furrycorner:profile-updated', {
        detail: {
            ...user,
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            avatar_url: profile.avatar_url || ''
        }
    })
);

} catch (error) {
    console.error('Profile loading failed:', error);

    if (cachedUser) {
        user = cachedUser;
        renderSignedIn(user);
    } else {
        handleLoggedOutProfile();
    }
}


}


/* =====================================================
   SIGNED IN PROFILE
===================================================== */

function renderSignedIn(u) {
    user = u;

    account.style.display = 'none';

    const firstName = u.first_name || u.firstName || '';
    const lastName = u.last_name || u.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById('profileName').textContent =
        fullName || 'My Profile';

    document.getElementById('profileSubtitle').textContent =
        u.email || '';

    const actions = document.getElementById('profileActions');

    actions.innerHTML = `
        <button
            class="button secondary logout"
            id="logout"
            type="button">
            Sign out
        </button>
    `;

    document
        .getElementById('logout')
        .addEventListener('click', logoutUser);

    updateProfileAvatar();
}



/* =====================================================
   LOGGED OUT PROFILE
===================================================== */

function handleLoggedOutProfile() {

    user = null;

    account.style.display = '';


    if (returnTo === 'checkout') {

        document.getElementById(
            'signupLink'
        ).href =
            'signup.html?return=checkout';


        account.querySelector('h2')
            .textContent =
            'Sign in to checkout';


        account.querySelector('.muted')
            .textContent =
            'Create an account first to continue with your order.';

    }


    /*
     * Add login button
     */

    if (
        !document.getElementById('profileLoginButton')
    ) {

        const loginLink =
            document.createElement('a');

        loginLink.id =
            'profileLoginButton';

        loginLink.className =
            'button secondary';

        loginLink.textContent =
            'Log in';

        loginLink.href =
            returnTo === 'checkout'
                ? 'signin.html?return=checkout'
                : 'signin.html';


        account.insertBefore(
            loginLink,
            document.getElementById('signupLink')
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {
    window.FurryCornerAuth.logout();
}


/* =====================================================
   AVATAR
===================================================== */


async function updateProfileAvatar() {
    const avatar = document.getElementById('profileAvatar');
    if (!avatar) return;

    const firstName = user?.first_name || user?.firstName || '';
    const lastName = user?.last_name || user?.lastName || '';

    const nameParts = `${firstName} ${lastName}`
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const initials = nameParts.length
        ? nameParts[0][0] +
          (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '')
        : 'FC';

    avatar.textContent = initials.toUpperCase();

    const photoPath = user?.avatar_url;

    if (!photoPath) return;

    try {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(photoPath, 3600);

        if (error) throw error;

        if (data?.signedUrl) {
            avatar.innerHTML = '';

            const img = document.createElement('img');
            img.src = data.signedUrl;
            img.alt = 'Profile picture';

            avatar.appendChild(img);
        }
    } catch (error) {
        console.error('Unable to load profile photo:', error);
    }
}


/* =====================================================
   PROFILE PHOTO UPLOAD
===================================================== */

const changePhotoButton =
    document.getElementById('changeProfilePhoto') as HTMLButtonElement | null;

const profilePhotoInput =
    document.getElementById('profilePhotoInput') as HTMLInputElement | null;

changePhotoButton?.addEventListener('click', () => {
    profilePhotoInput?.click();
});

profilePhotoInput?.addEventListener('change', async () => {
    const file = profilePhotoInput.files?.[0];

    if (!file) return;

    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
        changePhotoButton!.textContent =
            'Use JPG, PNG, or WebP';
        profilePhotoInput.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        changePhotoButton!.textContent =
            'Photo must be under 5 MB';
        profilePhotoInput.value = '';
        return;
    }

    changePhotoButton!.disabled = true;
    changePhotoButton!.textContent = 'Uploading...';

    try {
        const {
            data: { user: authUser },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!authUser) {
            throw new Error('Please sign in again before uploading a photo.');
        }

        const savedUserId =
            localStorage.getItem('loggedInUserId');

        if (savedUserId && savedUserId !== authUser.id) {
            throw new Error('Your login session does not match. Please sign in again.');
        }

        const extensionByType: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        };

        const extension = extensionByType[file.type];
        const photoPath =
            `${authUser.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(photoPath, file, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: photoPath })
            .eq('id', authUser.id);

        if (profileError) throw profileError;

        user = {
            ...user,
            id: authUser.id,
            user_id: authUser.id,
            avatar_url: photoPath
        };

        localStorage.setItem(
            'loggedInUser',
            JSON.stringify(user)
        );

        await updateProfileAvatar();

        window.dispatchEvent(
            new CustomEvent('furrycorner:profile-updated', {
                detail: {
                    ...user,
                    full_name:
                        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    phone: user.phone || '',
                    avatar_url: photoPath
                }
            })
        );

        changePhotoButton!.textContent = 'Photo Updated!';
    } catch (error) {
        console.error('Profile photo upload failed:', error);

const errorMessage = (error as any)?.message || String(error);
changePhotoButton!.textContent = errorMessage.slice(0, 45);
        changePhotoButton!.textContent = 'Upload failed — try again';
    } finally {
        changePhotoButton!.disabled = false;
        profilePhotoInput!.value = '';

        setTimeout(() => {
            if (changePhotoButton) {
                changePhotoButton.textContent = 'Change Photo';
            }
        }, 2500);
    }
});



/* =====================================================
   MOVE PROFILE ACTIONS
===================================================== */

function moveProfileActions() {

    /*
     * Prevent duplicate profile actions
     */

    if (
        document.querySelector('.profile-actions')
    ) {

        return;
    }


    const profileHead =
        document.querySelector('.profile-head');


    if (!profileHead) return;


    const profileActions =
        document.createElement('div');


    profileActions.className =
        'profile-actions';


    const logoutButton =
        document.querySelector(
            '#accountSection .logout'
        );


    if (logoutButton) {

        profileActions.appendChild(
            logoutButton
        );

    }


    profileHead.appendChild(
        profileActions
    );

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


/* =====================================================
   PURCHASE SECTION
===================================================== */

const purchaseSection =
    document.createElement('section');


purchaseSection.className =
    'purchase-section';


purchaseSection.innerHTML = `

    <div class="purchase-header">

        <h2>
            My Purchases
        </h2>

        <a
            class="history-link"
            href="purchase-status.html?status=history">

            View Purchase History
            <span aria-hidden="true">›</span>

        </a>

    </div>


    <div class="purchase-statuses">

        <!-- TO PAY -->

        <a
    class="purchase-status"
    href="purchase-status.html?status=pay">

    <span class="purchase-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="15" rx="2"/>
                <path d="M3 9h18"/>
                <circle cx="16" cy="14" r="1"/>
            </svg>

        <span class="purchase-count-badge" data-purchase-count="pay" style="display:none">0</span>
    </span>

    <span>To Pay</span>
</a>


        <!-- TO SHIP -->

        <a
    class="purchase-status"
    href="purchase-status.html?status=ship">

    <span class="purchase-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7h18v13H3z"/>
                <path d="M3 7l4-4h10l4 4"/>
                <path d="M7 3l3 4 4-4"/>
                <path d="M7 12h5M7 15h3"/>
            </svg>

        <span class="purchase-count-badge" data-purchase-count="ship" style="display:none">0</span>
    </span>

    <span>To Ship</span>
</a>


        <!-- TO RECEIVE -->

         <a
    class="purchase-status"
    href="purchase-status.html?status=receive">

    <span class="purchase-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 7h12v11H2z"/>
                <path d="M14 11h4l4 4v3h-8z"/>
                <circle cx="6" cy="19" r="2"/>
                <circle cx="18" cy="19" r="2"/>
                <path d="M5 4h6M3 2h6"/>
            </svg>

        <span class="purchase-count-badge" data-purchase-count="receive" style="display:none">0</span>
    </span>

    <span>To Receive</span>
</a>


        <!-- TO RATE -->

        <a
    class="purchase-status"
    href="purchase-status.html?status=rate">

    <span class="purchase-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>
            </svg>

        <span class="purchase-count-badge" data-purchase-count="rate" style="display:none">0</span>
    </span>

    <span>To Rate</span>
</a>

    </div>

`;


/*
 * Insert purchases section
 */

account.insertAdjacentElement(
    'afterend',
    purchaseSection
);


/* NAVBAR and MOBILE BOTTOM NAVIGATION are written directly into the page markup (profile.markup.ts).
   The old code moved the header with document.body.insertBefore(), which fails inside the Angular app because
   the page is not a direct child of <body>; that error stopped the rest of this script (profile never loaded). */


/* =====================================================
   PROFILE TITLE
===================================================== */

const profileTitle =
    document.querySelector(
        '.profile-head h1'
    );


if (profileTitle) {

    profileTitle.textContent =
        'My Profile';

}


/* =====================================================
   START
===================================================== */

async function updateProfileNotificationBadge(): Promise<void> {
    const badge = document.getElementById('bottomNotifBadge');
    if (!badge) return;

    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            badge.textContent = '';
            badge.style.display = 'none';
            return;
        }

        let unreadCount = 0;

        // Count unread notifications stored in Supabase.
        const { data: notifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!notificationsError && notifications) {
            unreadCount += notifications.length;
        }

        // Count unread order and booking notifications using the
        // same local read-state storage used by the Notifications page.
        const readStateKey = `furrycornerNotificationRead:${user.id}`;
        let readState: Record<string, boolean> = {};

        try {
            readState = JSON.parse(localStorage.getItem(readStateKey) || '{}');
        } catch {
            readState = {};
        }

        const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id);

        const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', user.id);

        const unreadOrders = (orders || []).filter(
            (item: { id: string | number }) =>
                !readState[`order-${item.id}`]
        ).length;

        const unreadBookings = (bookings || []).filter(
            (item: { id: string | number }) =>
                !readState[`booking-${item.id}`]
        ).length;

        unreadCount += unreadOrders + unreadBookings;

        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error('Failed to update profile notification badge:', error);
        badge.style.display = 'none';
    }
}


async function updatePurchaseCountBadges() {
    const badgeElements = document.querySelectorAll(
        '[data-purchase-count]'
    );

    badgeElements.forEach(badge => {
        badge.textContent = '0';
        badge.style.display = 'none';
    });

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        const { data: orders, error } = await supabase
            .from('orders')
            .select('status, payment_status')
            .eq('user_id', user.id);

        if (error) throw error;

        const counts = {
            pay: 0,
            ship: 0,
            receive: 0,
            rate: 0
        };

        (orders || []).forEach(order => {
            const status = String(order.status || '')
                .toLowerCase()
                .trim();

            const paymentStatus = String(order.payment_status || '')
                .toLowerCase()
                .trim();

            if (status === 'pending' && paymentStatus !== 'paid') {
                counts.pay++;
            }

           if (
                (status === 'pending' || status === 'processing') &&
                paymentStatus === 'paid'
            ) {
                counts.ship++;
            }

            if (status === 'shipped') {
                counts.receive++;
            }

            if (status === 'delivered') {
                counts.rate++;
            }
        });

        Object.entries(counts).forEach(([status, count]) => {
            const badge = document.querySelector(
                `[data-purchase-count="${status}"]`
            );

            if (!badge) return;

            badge.textContent = count > 99 ? '99+' : String(count);
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch (error) {
        console.error('Purchase count badge error:', error);
    }
}

updatePurchaseCountBadges();
loadProfile();
updateProfileNotificationBadge();


;

/* =====================================================
   PROFILE CART DRAWER — MATCH HOME CART BEHAVIOR
===================================================== */

const cartToggle = document.getElementById('cartToggle');
const cartOverlay = document.getElementById('profileCartOverlay');
const cartDrawer = document.getElementById('profileCartDrawer');
const cartBody = document.getElementById('profileCartBody');
const cartTotal = document.getElementById('profileCartTotal');
const cartCheckout = document.getElementById('profileCartCheckout');
const cartEdit = document.getElementById('profileCartEdit');
const cartSelectAll = document.getElementById('profileCartSelectAll');
const cartDeleteSelected = document.getElementById('profileCartDeleteSelected');

let profileCartEditMode = false;
let profileCartSelected = new Set();

function getProfileCart() {
    const userId = localStorage.getItem('loggedInUserId');
    const cartKey = userId ? `furryCornerCart:${userId}` : 'cart';

    try {
        const items = JSON.parse(localStorage.getItem(cartKey) || '[]');
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error('Unable to load profile cart:', error);
        return [];
    }
}

function getProfileCartItemId(item, index) {
    return String(
        item.id ??
        item.product_id ??
        item.productId ??
        item.id_product ??
        `profile-cart-item-${index}`
    );
}

function getProfileCartPrice(item) {
    return Number(
        item.price ??
        item.product_price ??
        item.unit_price ??
        item.selling_price ??
        0
    );
}

function getProfileCartQuantity(item) {
    return Math.max(1, Number(item.quantity || 1));
}

function updateProfileCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    const quantity = getProfileCart().reduce(
        (sum, item) => sum + Math.max(0, Number(item.quantity || 0)),
        0
    );

    badge.textContent = quantity > 99 ? '99+' : String(quantity);
    badge.style.display = quantity > 0 ? 'flex' : 'none';
}

function openProfileCart() {
    cartOverlay?.classList.add('is-open');
    cartDrawer?.classList.add('is-open');
    document.body.classList.add('profile-cart-open');
    renderProfileCart();
}

function closeProfileCart() {
    cartOverlay?.classList.remove('is-open');
    cartDrawer?.classList.remove('is-open');
    document.body.classList.remove('profile-cart-open');

    profileCartEditMode = false;
    profileCartSelected.clear();
    cartDrawer?.classList.remove('edit-mode');

    if (cartEdit) cartEdit.textContent = 'Edit';

    if (cartSelectAll) {
        cartSelectAll.checked = false;
        cartSelectAll.indeterminate = false;
    }

    renderProfileCart();
}

function updateProfileSelectAll() {
    if (!cartSelectAll) return;

    const items = getProfileCart();

    const allSelected = items.length > 0 && items.every(
        (item, index) => profileCartSelected.has(getProfileCartItemId(item, index))
    );

    const someSelected = items.some(
        (item, index) => profileCartSelected.has(getProfileCartItemId(item, index))
    );

    cartSelectAll.checked = allSelected;
    cartSelectAll.indeterminate = someSelected && !allSelected;
}

function updateProfileSelectedTotal() {
    const items = getProfileCart();

    const selectedItems = items.filter(
        (item, index) => profileCartSelected.has(getProfileCartItemId(item, index))
    );

    const total = selectedItems.reduce(
        (sum, item) => sum + getProfileCartPrice(item) * getProfileCartQuantity(item),
        0
    );

    if (cartTotal) cartTotal.textContent = `₱${total.toFixed(2)}`;

    if (cartCheckout) {
        cartCheckout.disabled = selectedItems.length === 0 || total <= 0;
    }

    if (cartDeleteSelected) {
        cartDeleteSelected.disabled = selectedItems.length === 0;
    }

    updateProfileSelectAll();
}

function renderProfileCart() {
    if (!cartBody || !cartTotal || !cartCheckout) return;

    const items = getProfileCart();

    const currentIds = new Set(
        items.map((item, index) => getProfileCartItemId(item, index))
    );

    profileCartSelected = new Set(
        [...profileCartSelected].filter(id => currentIds.has(id))
    );

    if (cartEdit) {
        cartEdit.disabled = items.length === 0;
        cartEdit.style.opacity = items.length === 0 ? '.5' : '1';
        cartEdit.textContent = profileCartEditMode ? 'Done' : 'Edit';
    }

    cartDrawer?.classList.toggle('edit-mode', profileCartEditMode);

    if (items.length === 0) {
        profileCartEditMode = false;
        profileCartSelected.clear();
        cartDrawer?.classList.remove('edit-mode');

        if (cartEdit) cartEdit.textContent = 'Edit';

        cartBody.innerHTML = `
            <div class="drawer-empty">
                <h3>Your cart is empty</h3>
                <p>Add some products to see them here.</p>
            </div>
        `;

        cartTotal.textContent = '₱0.00';
        cartCheckout.disabled = true;

        if (cartSelectAll) {
            cartSelectAll.checked = false;
            cartSelectAll.indeterminate = false;
        }

        if (cartDeleteSelected) cartDeleteSelected.disabled = true;

        updateProfileCartBadge();
        return;
    }

    cartBody.innerHTML = items.map((item, index) => {
        const id = getProfileCartItemId(item, index);
        const name = String(item.name || item.product_name || item.productName || 'Product');
        const price = getProfileCartPrice(item);
        const quantity = getProfileCartQuantity(item);
        const image = item.image || item.image_url || item.product_image || item.imageUrl || '';
        const checked = profileCartSelected.has(id);

        return `
            <div class="drawer-cart-item">
                <input
                    type="checkbox"
                    class="drawer-item-checkbox"
                    data-id="${escapeHTML(id)}"
                    aria-label="Select ${escapeHTML(name)}"
                    ${checked ? 'checked' : ''}>

                <img
                    src="${escapeHTML(image || 'images/placeholder.png')}"
                    alt="${escapeHTML(name)}"
                    onerror="this.onerror=null;this.style.visibility='hidden';">

                <div class="drawer-item-info">
                    <div class="drawer-item-name">${escapeHTML(name)}</div>
                    <div class="drawer-item-price">₱${price.toFixed(2)}</div>
                </div>

                <div class="drawer-item-actions">
                    <div class="drawer-item-qty-control">
                        <button
                            type="button"
                            class="qty-btn"
                            data-cart-action="decrease"
                            data-cart-index="${index}"
                            aria-label="Decrease quantity">−</button>

                        <span class="qty-val">${quantity}</span>

                        <button
                            type="button"
                            class="qty-btn"
                            data-cart-action="increase"
                            data-cart-index="${index}"
                            aria-label="Increase quantity">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateProfileSelectedTotal();
    updateProfileCartBadge();
}

function saveProfileCart(items) {
    const userId = localStorage.getItem('loggedInUserId');
    const cartKey = userId ? `furryCornerCart:${userId}` : 'cart';

    localStorage.setItem(cartKey, JSON.stringify(items));
    renderProfileCart();
}
/* Open and close */

cartToggle?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    openProfileCart();
});

document.getElementById('profileCartClose')
    ?.addEventListener('click', closeProfileCart);

cartOverlay?.addEventListener('click', closeProfileCart);

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeProfileCart();
});

/* Select all */

cartSelectAll?.addEventListener('change', () => {
    const items = getProfileCart();

    if (cartSelectAll.checked) {
        items.forEach((item, index) => {
            profileCartSelected.add(getProfileCartItemId(item, index));
        });
    } else {
        profileCartSelected.clear();
    }

    renderProfileCart();
});

/* Individual selection */

cartBody?.addEventListener('change', event => {
    const checkbox = event.target.closest('.drawer-item-checkbox');
    if (!checkbox) return;

    const id = String(checkbox.dataset.id);

    if (checkbox.checked) {
        profileCartSelected.add(id);
    } else {
        profileCartSelected.delete(id);
    }

    updateProfileSelectedTotal();
});

/* Quantity buttons */

cartBody?.addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const index = Number(button.dataset.cartIndex);
    const action = button.dataset.cartAction;
    const items = getProfileCart();

    if (!Number.isInteger(index) || !items[index]) return;

    if (action === 'increase') {
        items[index].quantity = Number(items[index].quantity || 1) + 1;
    } else if (action === 'decrease') {
        items[index].quantity = Number(items[index].quantity || 1) - 1;

        if (items[index].quantity <= 0) {
            profileCartSelected.delete(getProfileCartItemId(items[index], index));
            items.splice(index, 1);
        }
    } else {
        return;
    }

    saveProfileCart(items);
});

/* Delete selected */

cartDeleteSelected?.addEventListener('click', () => {
    if (profileCartSelected.size === 0) return;

    if (!confirm('Are you sure you want to delete the selected items?')) return;

    const items = getProfileCart();

    const remainingItems = items.filter(
        (item, index) => !profileCartSelected.has(getProfileCartItemId(item, index))
    );

    const userId = localStorage.getItem('loggedInUserId');
const cartKey = userId ? `furryCornerCart:${userId}` : 'cart';
localStorage.setItem(cartKey, JSON.stringify(remainingItems));
    profileCartSelected.clear();

    if (remainingItems.length === 0) profileCartEditMode = false;

    renderProfileCart();
});

/* Checkout selected items only */

cartCheckout?.addEventListener('click', () => {
    const items = getProfileCart();

    const selectedItems = items.filter(
        (item, index) => profileCartSelected.has(getProfileCartItemId(item, index))
    );

    if (selectedItems.length === 0) return;

    const total = selectedItems.reduce(
        (sum, item) => sum + getProfileCartPrice(item) * getProfileCartQuantity(item),
        0
    );

    if (total <= 0) {
        alert('The selected cart total is invalid. Please check your product prices.');
        return;
    }

    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    location.assign('checkout.html');
});

/* Refresh badge/cart when another tab updates storage */

window.addEventListener('storage', () => {
    updateProfileCartBadge();
    renderProfileCart();
});

updateProfileCartBadge();
renderProfileCart();

/* =====================================================
   SAVE CART
===================================================== */

function saveProfileCart(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    renderProfileCart();
}

/* =====================================================
   CART BUTTON AND CLOSE HANDLERS
===================================================== */

cartToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openProfileCart();
});

document.getElementById('profileCartClose')
    ?.addEventListener('click', closeProfileCart);

cartOverlay?.addEventListener('click', closeProfileCart);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProfileCart();
    }
});

/* =====================================================
   EDIT MODE
===================================================== */

cartEdit?.addEventListener('click', () => {
    const items = getProfileCart();

    if (items.length === 0) return;

    profileCartEditMode = !profileCartEditMode;

    if (profileCartEditMode) {
        cartDrawer?.classList.add('edit-mode');
        cartEdit.textContent = 'Done';
    } else {
        cartDrawer?.classList.remove('edit-mode');
        cartEdit.textContent = 'Edit';
        profileCartSelected.clear();

        if (cartSelectAll) {
            cartSelectAll.checked = false;
            cartSelectAll.indeterminate = false;
        }
    }

    renderProfileCart();
});

/* =====================================================
   SELECT ALL
===================================================== */

cartSelectAll?.addEventListener('change', () => {
    const items = getProfileCart();

    if (cartSelectAll.checked) {
        items.forEach((item, index) => {
            profileCartSelected.add(getProfileCartItemId(item, index));
        });
    } else {
        profileCartSelected.clear();
    }

    renderProfileCart();
});

/* =====================================================
   INDIVIDUAL ITEM CHECKBOXES
===================================================== */

cartBody?.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.drawer-item-checkbox');
    if (!checkbox) return;

    const id = String(checkbox.dataset.id);

    if (checkbox.checked) {
        profileCartSelected.add(id);
    } else {
        profileCartSelected.delete(id);
    }

    updateProfileSelectedTotal();
});

/* =====================================================
   QUANTITY BUTTONS
===================================================== */

cartBody?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const index = Number(button.dataset.cartIndex);
    const action = button.dataset.cartAction;
    const items = getProfileCart();

    if (!Number.isInteger(index) || !items[index]) return;

    if (action === 'increase') {
        items[index].quantity = Number(items[index].quantity || 1) + 1;
    } else if (action === 'decrease') {
        items[index].quantity = Number(items[index].quantity || 1) - 1;

        if (items[index].quantity <= 0) {
            profileCartSelected.delete(getProfileCartItemId(items[index], index));
            items.splice(index, 1);
        }
    } else {
        return;
    }

    saveProfileCart(items);
});

/* =====================================================
   DELETE SELECTED
===================================================== */

cartDeleteSelected?.addEventListener('click', () => {
    if (profileCartSelected.size === 0) return;

    const confirmed = confirm(
        'Are you sure you want to delete the selected items?'
    );

    if (!confirmed) return;

    const items = getProfileCart();

    const remainingItems = items.filter((item, index) =>
        !profileCartSelected.has(getProfileCartItemId(item, index))
    );

    localStorage.setItem('cart', JSON.stringify(remainingItems));
    profileCartSelected.clear();

    if (remainingItems.length === 0) {
        profileCartEditMode = false;
        cartDrawer?.classList.remove('edit-mode');

        if (cartEdit) {
            cartEdit.textContent = 'Edit';
        }
    }

    renderProfileCart();
});

/* =====================================================
   CHECKOUT — SELECTED ITEMS ONLY
===================================================== */

cartCheckout?.addEventListener('click', () => {
    const items = getProfileCart();

    const selectedItems = items.filter((item, index) =>
        profileCartSelected.has(getProfileCartItemId(item, index))
    );

    if (selectedItems.length === 0) return;

    const total = selectedItems.reduce(
        (sum, item) => sum + getProfileCartPrice(item) * getProfileCartQuantity(item),
        0
    );

    if (total <= 0) {
        alert('The selected cart total is invalid. Please check your product prices.');
        return;
    }

    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    location.assign('checkout.html');
});

/* =====================================================
   STORAGE UPDATES
===================================================== */

window.addEventListener('storage', () => {
    updateProfileCartBadge();
    renderProfileCart();
});

updateProfileCartBadge();

  }
}