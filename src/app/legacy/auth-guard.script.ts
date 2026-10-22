// @ts-nocheck  (auth-guard.js carried over; runs once per page, same as the old <script src="auth-guard.js">)
import { supabase } from '../../services/supabase.service';
export function runAuthGuard(location: any, __onReady: any): void {
(function () {
    'use strict';

    const protectedPages = new Set([
        'checkout.html',
        'order-confirmation.html',
        'purchase-status.html',
        'profile.html',
        'notif.html',
        'notification-settings.html',
        'privacy-settings.html',
        'my-addresses.html',
        'payment-methods.html',
        'account-security.html'
    ]);

    const authPages = new Set(['signin.html', 'signup.html']);
    const skipAuthSplashKey = 'furrycornerSkipAuthSplash';
    const token = localStorage.getItem('furryCornerAuthToken') || '';
    const userId = localStorage.getItem('loggedInUserId') || '';
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    } catch (error) {
        user = null;
    }

    const isAuthenticated = Boolean(token && userId && user);

    function readAuth() {
    const t = localStorage.getItem('furryCornerAuthToken') || '';
    const id = localStorage.getItem('loggedInUserId') || '';

    let u = null;

    try {
        u = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    } catch (error) {
        u = null;
    }

    return {
        token: t,
        userId: id,
        user: u,
        isAuthenticated: Boolean(t && id && u)
    };
}
    const pageName = location.pathname.split('/').pop() || 'index.html';

    function getSafeReturnTarget(value) {
        if (value === 'checkout') {
            return 'checkout.html';
        }

        try {
            const target = new URL(value || location.href, location.href);
            if (target.origin !== location.origin) {
                return 'index.html';
            }

            const targetPage = target.pathname.split('/').pop() || 'index.html';
            if (authPages.has(targetPage)) {
                return 'index.html';
            }

            return `${targetPage}${target.search}${target.hash}`;
        } catch (error) {
            return 'index.html';
        }
    }

    function signInUrl(returnTarget) {
        return `signin.html?return=${encodeURIComponent(getSafeReturnTarget(returnTarget))}`;
    }

    function clearLocalSession() {
        [
            'furryCornerAuthToken',
            'loggedInUserId',
            'loggedInUser',
            'loggedInName',
            'loggedInEmail',
            'furryCornerUser',
            'profileName',
            'furryCornerAccount'
        ].forEach(key => localStorage.removeItem(key));
    }

    // Plain-language reason shown on screen when the API cannot be reached.
    window.furryApiError = function (error) {
        const msg = String((error && error.message) || error || '');
        if (/failed to fetch|networkerror|load failed|network request|timeout|timed out|unable to resolve|connect/i.test(msg)) {
            return 'Cannot reach the FurryCorner server (' + window.FURRY_API + '). Make sure Apache/XAMPP is running and this phone is on the same Wi-Fi as your PC.';
        }
        return msg || 'Something went wrong.';
    };

    window.FurryCornerAuth = {
        isAuthenticated,
        user,
        userId,
        token,
        getSafeReturnTarget,
        signInUrl,
        promptForSignIn(returnTarget) {
            sessionStorage.setItem(skipAuthSplashKey, 'true');
            location.assign(signInUrl(returnTarget));
        },
        
        
async logout() {
    // Preserve the current account's cart under its own user ID.
    const currentUserId = localStorage.getItem('loggedInUserId');

    if (currentUserId) {
        const accountCartKey = `furryCornerCart:${currentUserId}`;

        // Keep the account cart saved, but don't expose it to guests.
        if (localStorage.getItem(accountCartKey) === null) {
            const currentCart = localStorage.getItem('cart');

            if (currentCart !== null) {
                localStorage.setItem(accountCartKey, currentCart);
            }
        }
    }

    clearLocalSession();

    // Start with an empty guest cart after logout.
    localStorage.setItem('cart', '[]');
    localStorage.removeItem('furryCornerGuestCart');

    location.assign('signin.html');
},

        clearLocalSession
    };

    const nativeFetch = window.__nativeFetch || (window.__nativeFetch = window.fetch.bind(window));
    window.fetch = function (resource, options) {
        const requestUrl = typeof resource === 'string' ? resource : resource.url;
        let isApiRequest = false;

        try {
            isApiRequest = new URL(requestUrl, location.href).pathname.includes('/furrycorner_api/');
        } catch (error) {
            isApiRequest = false;
        }

        if (!isApiRequest) {
            return nativeFetch(resource, options);
        }

        const requestOptions = options || {};
        const headers = new Headers(
            requestOptions.headers || (resource instanceof Request ? resource.headers : undefined)
        );
        const endpoint = new URL(requestUrl, location.href).pathname.split('/').pop();

        if (token && !['login.php', 'register.php'].includes(endpoint)) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return nativeFetch(resource, {...requestOptions, headers}).then(response => {
            const protectedEndpoint = new Set([
                'getProfile.php',
                'getOrder.php',
                'getOrderConfirmation.php',
                'getNotifications.php',
                'createOrder.php',
                'createBooking.php'
            ]).has(endpoint);

            if (response.status === 401 && protectedEndpoint && isAuthenticated) {
                clearLocalSession();
                location.replace(signInUrl(location.href));
            }

            return response;
        });
    };


    // Old PHP session-check API removed.
    // Keep the existing local authentication state for now.

    if (protectedPages.has(pageName) && !isAuthenticated) {
        sessionStorage.setItem(skipAuthSplashKey, 'true');
        location.replace(signInUrl(location.href));
        return;
    }

    if (authPages.has(pageName) && isAuthenticated) {
        location.replace('index.html');
        return;
    }

    function initialsFor(name) {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) {
            return 'FC';
        }

        return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
    }

    function updateAccountLinks() {
        if (authPages.has(pageName)) {
            return;
        }

        const accountName = isAuthenticated
            ? (user.firstName || user.first_name || '') + ' ' + (user.lastName || user.last_name || '')
            : '';
        const displayName = accountName.trim() || localStorage.getItem('loggedInName') || 'Account';

        document.querySelectorAll('header a[href="profile.html"], nav a[href="profile.html"]').forEach(link => {
            if (link.closest('.menu-section')) {
                return;
            }


            link.setAttribute('aria-label', isAuthenticated ? `Profile: ${displayName}` : 'Sign in to continue');

            // Bottom tab bar: keep the tab's own icon + label. Signed out -> person icon with "Sign in".
            // Signed in -> initials circle with the first name.
            if (link.classList.contains('bottom-nav-item')) {
                const tabLabel = link.querySelector('span:not(.bottom-notif-badge):not(.auth-account-avatar)');
                if (isAuthenticated) {
                    let avatar = link.querySelector('.auth-account-avatar');
                    if (!avatar) {
                        avatar = document.createElement('span');
                        avatar.className = 'auth-account-avatar';
                        const icon = link.querySelector('svg');
                        if (icon) { icon.replaceWith(avatar); } else { link.prepend(avatar); }
                    }
                    avatar.textContent = initialsFor(displayName);
                    if (tabLabel) {
                        tabLabel.textContent = (user.firstName || user.first_name || '').trim() || 'Me';
                    }
                } else if (tabLabel) {
                    tabLabel.textContent = 'Sign in';
                }
                return;
            }

            // Back links (e.g. on About) stay as Back. Signed out, they go Home instead of asking to sign in.
            if (link.classList.contains('back-link')) {
                link.setAttribute('aria-label', 'Back');
                if (!isAuthenticated) {
                    link.setAttribute('href', 'index.html');
                }
                return;
            }

            // Top bars never show the signed-in user's name or avatar: signed in keeps the link as written
            // in the page ("Profile", "Back", ...); signed out turns it into "Sign in".
            if (!isAuthenticated) {
                link.textContent = 'Sign in';
            }
        });
    }

    /*
     * One shared notification badge for the bottom tabs on every page: just a number (99+ at most),
     * hidden when there is nothing unread. Read-state is the same localStorage record the Notifications page writes.
     */

async function refreshNotifBadge() {
    const badge = document.getElementById('bottomNotifBadge');
    if (!badge) {
        return;
    }

    // Old PHP notification API removed.
    // Hide the badge until a working notification source is connected.
    badge.textContent = '';
    badge.style.display = 'none';
}


    
function guardActions() {
    document.addEventListener('click', event => {
        const target = event.target;
        if (!target || typeof target.closest !== 'function') {
            return;
        }

        const control = target.closest('a[href], [data-auth-required]');
        if (!control) {
            return;
        }

        const href = control.getAttribute('href');
        let targetUrl = null;
        let targetPage = '';

        if (href) {
            try {
                targetUrl = new URL(href, location.href);
                targetPage = targetUrl.pathname.split('/').pop() || '';
            } catch (error) {
                targetUrl = null;
            }
        }

        if (authPages.has(targetPage)) {
            sessionStorage.setItem(skipAuthSplashKey, 'true');
        }

        const protectedLink = protectedPages.has(targetPage);

        // Keep the sign-in requirement for protected pages and protected buttons.
        if (
            !readAuth().isAuthenticated &&
            (control.hasAttribute('data-auth-required') || protectedLink)
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();

            const returnTarget = control.dataset.authReturn
                || (protectedLink && targetUrl
                    ? targetUrl.href
                    : location.href);

            window.FurryCornerAuth.promptForSignIn(returnTarget);
            return;
        }

        // Convert same-origin legacy .html links into Angular routes.
        if (
            href &&
            targetUrl &&
            targetUrl.origin === location.origin &&
            /\.html$/i.test(targetUrl.pathname)
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            location.assign(targetUrl.href);
        }
    }, true);
}


    function installAccountStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-account-link{display:inline-flex;align-items:center;gap:7px}
            .auth-account-avatar{width:28px;height:28px;flex:0 0 28px;display:inline-grid;place-items:center;border-radius:50%;background:#7BB8F0;color:#1F2430;font-size:11px;font-weight:800}
            .auth-account-name{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            .furry-menu-button{position:fixed;left:12px;top:calc(var(--sat,0px) + 10px);z-index:1500;width:40px;height:40px;border:1px solid rgba(31,42,68,.10);border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;box-shadow:0 2px 8px rgba(31,42,68,.08);cursor:pointer;padding:0}
            body:has(.cart-drawer.open) .furry-menu-button{display:none}
            .furry-menu-button span{display:block;width:18px;height:2px;background:#5CA3E8;border-radius:999px}
            .furry-menu-panel{position:fixed;left:0;top:0;bottom:0;width:290px;max-width:80vw;z-index:1501;background:#fff;transform:translateX(-105%);transition:transform .25s ease;box-shadow:12px 0 28px rgba(31,36,48,.12);padding:calc(22px + var(--sat,0px)) 16px calc(18px + var(--sab,0px));overflow-y:auto}
            .furry-menu-panel.open{transform:translateX(0)}
            body.menu-open::before{content:"";position:fixed;inset:0;background:rgba(31,36,48,.2);z-index:1480}
            .furry-menu-brand{display:flex;align-items:center;justify-content:center;margin:4px 8px 16px;padding:6px 0 0;border-bottom:0;text-decoration:none;box-shadow:none}
            .furry-menu-brand img{display:block;width:60px;height:60px;object-fit:contain}
            .furry-menu-section{margin-top:12px;padding-top:12px;border-top:1px solid #e2e6ec}
            .furry-menu-title{margin:0 0 8px 8px;color:#6a7280;font-size:12px;font-weight:800;letter-spacing:0;text-transform:uppercase}
            .furry-menu-list{display:flex;flex-direction:column;gap:0}
            .furry-menu-item{display:flex;align-items:center;justify-content:space-between;padding:11px 10px;border-bottom:1px solid #e2e6ec;border-radius:8px;color:#1F2430;text-decoration:none;font-weight:800;box-shadow:none}
            .furry-menu-item:last-child{border-bottom:0}
            .furry-menu-item:hover,.furry-menu-item:active{background:#EAF4FD}
            .furry-menu-item:focus-visible{outline:2px solid #5CA3E8;outline-offset:2px}
            .furry-menu-item .arrow{color:#5CA3E8;font-size:20px;line-height:1}      
            .furry-menu-user{display:flex;align-items:center;gap:12px;margin:4px 4px 6px;padding:10px;border-radius:12px;background:#EAF4FD;text-decoration:none;color:#1F2430}
            .furry-menu-avatar-wrap{position:relative;width:44px;height:44px;flex:0 0 44px}
            .furry-menu-avatar-image{display:block;width:44px;height:44px;object-fit:cover;border-radius:50%}
            .furry-menu-avatar-image[hidden],.furry-menu-avatar[hidden]{display:none}
            .furry-menu-avatar{width:44px;height:44px;flex:0 0 44px;font-size:16px}
            .furry-menu-user-details{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}
            .furry-menu-username{font-weight:800;font-size:15px;line-height:1.2;overflow-wrap:anywhere}
            .furry-menu-phone{font-size:12px;font-weight:600;color:#6a7280;line-height:1.3;overflow-wrap:anywhere}
            .furry-menu-back{display:flex;align-items:center;gap:6px;margin:4px 4px 6px;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:#5CA3E8;font:800 14px 'Nunito',sans-serif;cursor:pointer}
            .furry-menu-back span{font-size:22px;line-height:1}
            .furry-menu-guest {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin: 4px 4px 12px;
    padding: 14px 10px;
    border-radius: 12px;
    background: #EAF4FD;
}

.furry-menu-guest-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
}

.furry-menu-signin {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    background: #5CA3E8;
    color: #fff;
    text-align: center;
    font-weight: 800;
    text-decoration: none;
}

.furry-menu-signin:hover {
    background: #438fd7;
}

.furry-menu-user {
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.furry-menu-user-details {
    align-items: center;
}

.furry-menu-username {
    overflow-wrap: anywhere;
}
            .furry-menu-user {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 8px 4px 12px;
    padding: 16px 10px;
    border-radius: 12px;
    background: #EAF4FD;
    color: #1F2430;
    text-align: center;
}

.furry-menu-avatar {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #7BB8F0;
    color: #1F2430;
    font-size: 18px;
    font-weight: 800;
}

.furry-menu-username {
    font-size: 15px;
    font-weight: 800;
    overflow-wrap: anywhere;
}

.furry-menu-guest {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin: 8px 4px 12px;
    padding: 16px 10px;
}

.furry-menu-guest-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
}

.furry-menu-signin {
    display: block;
    width: 100%;
    padding: 11px 16px;
    border-radius: 8px;
    background: #5CA3E8;
    color: #fff;
    font-weight: 800;
    text-align: center;
}

/* Square profile / guest card, content centered */
.furry-menu-user,
.furry-menu-guest {
    box-sizing: border-box;
    width: min(100%, 200px);
    aspect-ratio: 1 / 1;
    margin: 8px auto 12px;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    background: #EAF4FD;
    border-radius: 16px;
}

/* Fix: remove the stretching that pushed name/avatar to the top */
.furry-menu-user-details {
    flex: 0 0 auto;
    align-items: center;
}

/* Slim Sign in button */
.furry-menu-guest .furry-menu-signin {
    display: inline-block;
    width: auto;
    min-width: 0;
    padding: 6px 22px;
    font-size: 14px;
    line-height: 1.3;
    border-radius: 999px;
}
            
        `;

        document.head.append(style);
    }

    function installHamburgerMenu() {
        const currentPage = location.pathname.split('/').pop().toLowerCase();
        // The hamburger menu lives on the four main tabs (same top bar on each).
        if (!['index.html', 'services.html', 'notif.html', 'profile.html'].includes(currentPage)) {
            return;
        }

        if (document.getElementById('furry-menu-button')) {
            return;
        }

        const menuButton = document.createElement('button');
        menuButton.type = 'button';
        menuButton.id = 'furry-menu-button';
        menuButton.className = 'furry-menu-button';
        menuButton.setAttribute('aria-label', 'Open menu');
        menuButton.innerHTML = '<span></span><span></span><span></span>';

                const menuPanel = document.createElement('aside');
        menuPanel.id = 'furry-menu-panel';
        menuPanel.className = 'furry-menu-panel';

        
        function escapeMenuText(value) {
            return String(value || '').replace(/[&<>"']/g, c => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[c]));
        }

        
async function getMenuAvatarUrl(profileUser) {
    const avatarPath = String(
        profileUser?.avatar_url || profileUser?.avatarUrl || ''
    ).trim();

    if (!avatarPath) return '';

    // Already a full URL? Use it as-is.
    if (/^https?:\/\//i.test(avatarPath)) {
        return avatarPath;
    }

    try {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(avatarPath, 3600);

        if (error) throw error;

        return data?.signedUrl || '';
    } catch (error) {
        console.error('Unable to load sidebar profile photo:', error);
        return '';
    }
}



function buildMenuProfile(profileUser, signedAvatarUrl = '') {
    const fullName = String(
        profileUser?.full_name ||
        profileUser?.fullName ||
        (
            (profileUser?.firstName || profileUser?.first_name || '') +
            ' ' +
            (profileUser?.lastName || profileUser?.last_name || '')
        )
    ).trim();

    const displayName =
        fullName || localStorage.getItem('loggedInName') || 'Account';

    return `
        <a href="profile.html"
           class="furry-menu-user"
           aria-label="Profile: ${escapeMenuText(displayName)}">
            <span class="auth-account-avatar furry-menu-avatar">
                ${initialsFor(displayName)}
            </span>
            <span class="furry-menu-user-details">
                <span class="furry-menu-username">${escapeMenuText(displayName)}</span>
            </span>
        </a>
    `;
}



        function setupMenuAvatarFallback() {
            const avatarImage = menuPanel.querySelector('.furry-menu-avatar-image');
            const initials = menuPanel.querySelector('.furry-menu-avatar');

            if (!avatarImage || !initials) return;

            const showInitials = () => {
                avatarImage.hidden = true;
                initials.hidden = false;
            };

            avatarImage.addEventListener('error', showInitials);

            if (!avatarImage.getAttribute('src')) {
                showInitials();
            }
        }

        

const topBlock = isAuthenticated
    ? '<div id="furry-menu-profile-loading"></div>'
    : `
        <div class="furry-menu-guest">
            <img src="images/logo.png" alt="FurryCorner PH" class="furry-menu-guest-logo">
            <a href="signin.html" class="furry-menu-signin">Sign in</a>
        </div>
    `;



menuPanel.innerHTML = `

    ${topBlock}

    <div class="furry-menu-section">
        <div class="furry-menu-list">
            <a class="furry-menu-item" href="about-app.html">
                About App <span class="arrow">›</span>
            </a>
            <a class="furry-menu-item" href="about-products.html">
                About Products <span class="arrow">›</span>
            </a>
            <a class="furry-menu-item" href="about-us.html">
                About Us <span class="arrow">›</span>
            </a>
            <a class="furry-menu-item" href="developers.html">
                Developers <span class="arrow">›</span>
            </a>
            <a class="furry-menu-item" href="contact.html">
                Contact Us <span class="arrow">›</span>
            </a>
        </div>
    </div>
`;

document.body.prepend(menuButton, menuPanel);

// Load the signed-in user's profile and private avatar.
if (isAuthenticated) {
    const profileContainer = menuPanel.querySelector(
        '#furry-menu-profile-loading'
    );

    if (profileContainer) {
        getMenuAvatarUrl(user || {}).then(signedUrl => {
            profileContainer.outerHTML = buildMenuProfile(
                user || {},
                signedUrl
            );
            setupMenuAvatarFallback();
        });
    }
} else {
    setupMenuAvatarFallback();
}

        document.body.prepend(menuButton, menuPanel);

                setupMenuAvatarFallback();

        
window.addEventListener('furrycorner:profile-updated', async event => {
    const freshUser = event.detail || {};

    const mergedUser = {
        ...(user || {}),
        ...freshUser
    };

    const signedUrl = await getMenuAvatarUrl(mergedUser);

    const existingProfile = menuPanel.querySelector('.furry-menu-user');

    if (existingProfile) {
        existingProfile.outerHTML = buildMenuProfile(
            mergedUser,
            signedUrl
        );
    } else if (isAuthenticated) {
        const loadingContainer = menuPanel.querySelector(
            '#furry-menu-profile-loading'
        );

        if (loadingContainer) {
            loadingContainer.outerHTML = buildMenuProfile(
                mergedUser,
                signedUrl
            );
        }
    }

    setupMenuAvatarFallback();
});


        const closeMenu = () => {
            menuPanel.classList.remove('open');
            document.body.classList.remove('menu-open');
        };

        menuPanel.querySelector('#furryMenuBack')?.addEventListener('click', closeMenu);

        menuButton.addEventListener('click', () => {
            const isOpen = menuPanel.classList.toggle('open');
            document.body.classList.toggle('menu-open', isOpen);
        });

        menuPanel.addEventListener('click', event => {
            if (event.target.closest('a')) {
                closeMenu();
            }
        });

        document.addEventListener('click', event => {
            if (!menuPanel.contains(event.target) && !menuButton.contains(event.target)) {
                closeMenu();
            }
        });
    }

    // Page changes are instant: no fade/slide animation between pages.
    function installPageTransitions() {
        document.body.classList.remove('furry-page-entering', 'furry-page-leaving');
    }

    function showLaunchSplash() {
        if (!authPages.has(pageName)) {
            return;
        }

        if (sessionStorage.getItem(skipAuthSplashKey) === 'true') {
            sessionStorage.removeItem(skipAuthSplashKey);
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .splash-screen{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;background:#FDEEDA;opacity:1;visibility:visible;transition:opacity .25s ease,visibility .25s ease}
            .splash-screen.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
            .splash-content{display:grid;justify-items:center;gap:10px}
            .splash-logo{width:132px;height:132px;object-fit:contain;animation:splash-reveal .75s cubic-bezier(.2,.8,.2,1) both}
            .splash-title{color:#1F2430;font:800 27px 'Baloo 2',cursive;opacity:0;animation:splash-title-in .4s ease .2s forwards}
            .splash-dots{display:flex;gap:6px;margin-top:2px}
            .splash-dots span{width:7px;height:7px;border-radius:50%;background:#5CA3E8;animation:splash-dot .6s ease-in-out infinite alternate}
            .splash-dots span:nth-child(2){animation-delay:.15s}
            .splash-dots span:nth-child(3){animation-delay:.3s}
            @keyframes splash-reveal{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes splash-title-in{to{opacity:1;transform:translateY(0)}}
            @keyframes splash-dot{to{opacity:.35;transform:translateY(-4px)}}
            @media(prefers-reduced-motion:reduce){.splash-logo,.splash-title,.splash-dots span{animation:none;opacity:1}.splash-screen{transition-duration:.01ms}}
        `;
        document.head.append(style);

        const splash = document.createElement('div');
        splash.className = 'splash-screen';
        splash.setAttribute('role', 'status');
        splash.setAttribute('aria-label', 'Loading FurryCorner');
        splash.innerHTML = '<div class="splash-content"><img class="splash-logo" src="images/logo.png" alt=""><p class="splash-title">FurryCorner PH</p><div class="splash-dots" aria-hidden="true"><span></span><span></span><span></span></div></div>';
        document.body.prepend(splash);
        window.setTimeout(() => splash.classList.add('is-hidden'), 1750);
    }

    if (document.readyState === 'loading') {
        __onReady( () => {
            installAccountStyles();
            installHamburgerMenu();
            showLaunchSplash();
            updateAccountLinks();
            refreshNotifBadge();
            guardActions();
            installPageTransitions();
        }, {once: true});
    } else {
        installAccountStyles();
        installHamburgerMenu();
        showLaunchSplash();
        updateAccountLinks();
        refreshNotifBadge();
        window.setInterval(refreshNotifBadge, 45000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshNotifBadge(); });
        guardActions();
        installPageTransitions();
    }
})();
}
