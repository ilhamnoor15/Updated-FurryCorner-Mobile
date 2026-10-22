import { appNavbar, appBottomNav } from '../../legacy/app-shell';
// Page markup + CSS carried over unchanged from profile.html.
// Migrate this to a real Angular template (.html) / .scss one page at a time.
export const TITLE = `Profile - FurryCorner`;
export const BODY_CLASS = `page-profile`;

export const HTML = `<!-- =====================================================
     MAIN PAGE
===================================================== -->

${appNavbar()}

<div class="page">

    <main class="panel">

        <!-- =================================================
             PROFILE HEADER
        ================================================= -->

        <div class="profile-head">

            
<div class="profile-avatar-wrap">
    <div class="avatar" id="profileAvatar" aria-label="Profile picture">
        FC
    </div>
</div>


            <div>

                <h1 id="profileName">
                    My Profile
                </h1>

                <p class="muted" id="profileSubtitle">
                    Keep your delivery details close.
                </p>

            </div>

            <div class="profile-actions" id="profileActions"></div>

        </div>


        <!-- =================================================
             ACCOUNT
        ================================================= -->

        <section class="section" id="accountSection" style="display:none">

            <h2>
                Welcome to FurryCorner
            </h2>

            <p class="muted">
                Create an account to save your details and track future orders.
            </p>

            <a class="button"
               id="signupLink"
               href="signup.html">

                Sign up

            </a>

            <a class="button secondary"
               href="checkout.html">

                View checkout

            </a>

        </section>


        <!-- =================================================
             MY ACCOUNT
        ================================================= -->

        <section class="menu-section">

            <h2>
                My Account
            </h2>

            <a class="menu-row"
                    href="account-security.html">

                Account &amp; Security

            </a>

            <a class="menu-row"
                    href="my-addresses.html">

                My Addresses

            </a>

            <a class="menu-row"
                    href="/bookings.html">

                My Bookings

            </a>

            <a class="menu-row"
                    href="payment-methods.html">

                Bank Accounts / Cards

            </a>

        </section>


        <!-- =================================================
             SETTINGS
        ================================================= -->

        <section class="menu-section">

            <h2>
                Settings
            </h2>

            <a class="menu-row"
               href="notification-settings.html">

                Notifications

            </a>

            <a class="menu-row"
               href="privacy-settings.html">

                Privacy Settings

            </a>

        </section>


        <!-- =================================================
             SUPPORT
        ================================================= -->

        <section class="menu-section">

            <h2>
                Support
            </h2>

            <a class="menu-row"
                    href="help-center.html">

                Help Center

            </a>

            <a class="menu-row"
                    href="ai-assistant.html">

                AI Assistant

            </a>

            <a class="menu-row"
                    href="community-rules.html">

                Community Rules

            </a>

            <a class="menu-row"
                    href="policies.html">

                FurryCorner Policies

            </a>

        </section>


        <!-- =================================================
             ABOUT
        ================================================= -->

        <section class="menu-section">

            <h2>
                About
            </h2>

            <a class="menu-row" href="rate-us.html">

    Happy with FurryCorner? Rate us!

</a>

            <a class="menu-row"
                    href="about.html#about-us">

                About FurryCorner

            </a>

        </section>


        <!-- =================================================
             QUICK LINKS
        ================================================= -->

        <section class="section">

            <h2>
                Quick links
            </h2>

            <div class="detail">

                <span>
                    Shopping cart
                </span>

                <a class="link"
                   href="index.html">

                    Browse products

                </a>

            </div>


            <div class="detail">

                <span>
                    Pet care services
                </span>

                <a class="link"
                   href="services.html">

                    See services

                </a>

            </div>

        </section>

    </main>

</div>

<!-- PROFILE CART ALERT -->
<div class="cart-alert" id="profileCartAlert" role="status" aria-live="polite">
    <div class="cart-alert-icon">✓</div>
    <h3 id="profileCartAlertTitle">Done!</h3>
    <p id="profileCartAlertText">Your changes have been saved.</p>
</div>

<!-- PROFILE CART DRAWER -->
<div class="cart-overlay" id="profileCartOverlay"></div>

<aside class="cart-drawer" id="profileCartDrawer">
    <div class="cart-drawer-header">
        <h2>Cart</h2>

        <div class="cart-header-actions">
            <button type="button" class="cart-edit" id="profileCartEdit">
                Edit
            </button>

            <button
                type="button"
                class="cart-close"
                id="profileCartClose"
                aria-label="Close cart">
                ×
            </button>
        </div>
    </div>

    <div class="cart-drawer-body" id="profileCartBody"></div>

    
<div class="cart-drawer-footer">
    <div class="normal-footer">
        <div class="cart-total-row">
            <div class="cart-total-info">
                <span>Total</span>
                <strong id="profileCartTotal">₱0.00</strong>
            </div>

            <button
                type="button"
                class="checkout-btn"
                id="profileCartCheckout"
                disabled>
                Checkout
            </button>
        </div>
    </div>

    <div class="edit-mode-footer">
        <div class="edit-total-row">
            <label class="select-all-label">
                <input type="checkbox" id="profileCartSelectAll">
                <span>Select All</span>
            </label>

            <button
                type="button"
                class="delete-btn"
                id="profileCartDeleteSelected"
                disabled>
                Delete Selected
            </button>
        </div>
    </div>
</div>

</aside>


${appBottomNav('me')}`;

export const CSS = `
:root{
    --blue:#7BB8F0;
    --blue-dark:#5CA3E8;
    --cream:#FCE3C0;
    --cream-light:#FDEEDA;
    --ink:#1F2430;
    --white:#fff;
    --border:#e5e7eb;
    --red:#e0685f;
}

*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

body{
    font-family:'Nunito',sans-serif;
    color:var(--ink);
    background:var(--cream-light);
    line-height:1.5;
}

h1,h2{
    font-family:'Baloo 2',cursive;
}

a{
    text-decoration:none;
    color:inherit;
}

/* ================================
   PAGE
================================ */

.page{
    max-width:680px;
    margin:auto;
    padding:18px 16px 40px;
}

/* ================================
   NAVBAR
================================ */

.topbar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:24px;
}

.navbar{
    position:sticky;
    top:0;
    z-index:1000;

    width:100%;

    background:var(--white);

    display:flex;
    align-items:center;
    justify-content:space-between;

    padding:12px 40px;

    box-shadow:0 2px 0 rgba(0,0,0,.04);
}

.navbar .back{
    display:none;
}

.navbar .brand{
    display:flex;
    align-items:center;
    gap:9px;

    font:800 25px 'Baloo 2',cursive;
    color:var(--blue-dark);
}

.navbar .brand img{
    width:38px;
    height:38px;
    object-fit:contain;
}

/* ================================
   CART BUTTON
================================ */

.navbar .cart-link{
    position:relative;

    width:44px;
    height:44px;

    display:flex;
    align-items:center;
    justify-content:center;

    border:0;
    border-radius:8px;

    background:transparent;
    color:var(--ink);

    cursor:pointer;
    padding:0;
}

.navbar .cart-link:hover{
    background:var(--cream-light);
}

.navbar .cart-link svg{
    width:24px;
    height:24px;
}

/* =====================================================
   NAVBAR CART BADGE — MATCH HOME
===================================================== */

.cart-badge{
    position:absolute;
    top:2px;
    right:0;

    min-width:18px;
    height:18px;
    padding:0 4px;

    display:none;
    align-items:center;
    justify-content:center;

    border-radius:50%;
    background:var(--blue-dark, #5CA3E8);
    color:white;

    font-family:'Nunito',sans-serif;
    font-size:10px;
    font-weight:800;
    line-height:1;

    border:2px solid white;
}

/* ================================
   BRAND
================================ */

.brand{
    font:800 25px 'Baloo 2',cursive;
    color:var(--blue-dark);
}

.back,
.link{
    color:var(--blue-dark);
    font-weight:800;
}

/* ================================
   MAIN PANEL
================================ */

.panel{
    background:#fff;
    border-radius:16px;
    padding:24px;
    box-shadow:0 5px 18px #1f243012;
}

/* ================================
   PROFILE HEADER
================================ */

.profile-head{
    display:flex;
    align-items:center;
    gap:16px;

    padding-bottom:22px;

    border-bottom:1px solid var(--border);
}

.avatar{
    width:68px;
    height:68px;

    border-radius:50%;

    background:var(--blue);

    display:grid;
    place-items:center;

    font:800 28px 'Baloo 2',cursive;

    color:#fff;

    flex-shrink:0;
}
    
.profile-avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.profile-avatar-wrap .avatar {
    overflow: hidden;
}

.profile-avatar-wrap .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.change-photo-button {
    border: none;
    background: transparent;
    color: var(--blue-dark);
    font: 800 11px 'Nunito', sans-serif;
    cursor: pointer;
    padding: 4px;
}

.change-photo-button:disabled {
    opacity: 0.6;
    cursor: wait;
}


.avatar svg{
    width:34px;
    height:34px;
}

.profile-head h1{
    font-size:24px;
    line-height:1.1;
    white-space:nowrap;
}

.profile-head p.muted{
    font-size:11px;
    line-height:1.2;
}

.muted{
    color:#7c8490;
    font-size:14px;
}

/* ================================
   PROFILE ACTIONS
================================ */

.profile-actions{
    display:flex;
    flex-direction:column;
    align-items:stretch;

    gap:4px;

    margin-left:auto;

    width:86px;
}

.profile-head .profile-actions .button{
    margin-top:1px;

    padding:6px 8px;

    font-size:12px;

    text-align:center;
}

.profile-head .profile-actions .secondary{
    margin-left:0;
}

.profile-head .profile-actions .logout{
    padding:6px 4px;
    font-size:12px;
}

/* Show the full name and email instead of cutting them off */
.profile-head > div:nth-child(2) {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}

.profile-head h1,
.profile-head #profileName {
  display: block !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  -webkit-line-clamp: unset !important;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.15 !important;
}

.profile-head p.muted,
.profile-head #profileSubtitle {
  display: block !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  -webkit-line-clamp: unset !important;
  overflow-wrap: anywhere;
  word-break: break-all;
}

/* Keep the Sign out button from shrinking */
.profile-head .profile-actions {
  flex-shrink: 0 !important;
}

/* ================================
   SECTIONS
================================ */

.section{
    padding:20px 0;
    border-bottom:1px solid var(--border);
}

.section:last-child{
    border-bottom:0;
    padding-bottom:0;
}

.section h2{
    font-size:21px;
    margin-bottom:10px;
}

/* ================================
   DETAILS
================================ */

.detail{
    display:flex;
    justify-content:space-between;

    gap:16px;

    padding:9px 0;

    font-size:14px;
}

.detail span:first-child{
    color:#7c8490;
}

/* ================================
   MENU
================================ */

.menu-section{
    padding:18px 0;
    border-bottom:1px solid var(--border);
}

.menu-section h2{
    font-size:14px;

    color:#7c8490;

    font-family:'Nunito',sans-serif;

    font-weight:800;

    margin-bottom:4px;
}

.menu-row{
    display:flex;
    align-items:center;
    justify-content:space-between;

    gap:16px;

    padding:13px 0;

    border-top:1px solid #f0f1f2;

    font-weight:700;
}

.menu-row:first-of-type{
    border-top:0;
}

.menu-row::after{
    content:'›';

    color:#7c8490;

    font-size:24px;

    font-weight:400;

    line-height:1;
}

/* ================================
   BUTTONS
================================ */

.button{
    display:inline-block;

    margin-top:18px;

    background:var(--blue-dark);

    color:#fff;

    border-radius:9px;

    padding:12px 18px;

    font-weight:800;

    border:0;

    cursor:pointer;
}

.secondary{
    background:var(--cream);
    color:var(--ink);
    margin-left:8px;
}

.logout{
    font:800 14px 'Nunito',sans-serif;
}

/* ================================
   PURCHASE SECTION
================================ */

.purchase-section{
    padding:22px 0;

    border-bottom:1px solid var(--border);
}

.purchase-header{
    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:12px;

    margin-bottom:18px;
}

.purchase-header h2{
    font-size:21px;
    margin:0;
}

.history-link{
    color:var(--blue-dark);

    font-size:14px;

    font-weight:800;

    white-space:nowrap;
}

.purchase-statuses{
    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:10px;
}

.purchase-status{
    display:flex;

    flex-direction:column;

    align-items:center;

    gap:7px;

    text-align:center;

    font-size:13px;

    font-weight:700;
}

.purchase-status svg{
    width:34px;
    height:34px;

    color:var(--ink);
}

.purchase-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.purchase-count-badge {
    position: absolute;
    top: -5px;
    right: -10px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 999px;
    background: #e53935;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    line-height: 17px;
    text-align: center;
    box-sizing: border-box;
    z-index: 2;
}
/* ================================
   MOBILE BOTTOM NAVIGATION
================================ */

.mobile-bottom-nav{
    display:none;
}

/* =====================================================
   MOBILE
===================================================== */

@media(max-width:700px){

    body{
        padding-bottom:68px;
    }

    .page{
        padding:14px 12px;
    }

    .panel{
        padding:18px;
    }

    /* NAVBAR */

    .navbar{
        padding:10px 12px;
        gap:8px;
    }

    .navbar .brand{
        font-size:21px;
    }

    .navbar .brand img{
        width:34px;
        height:34px;
    }

    /* BOTTOM NAV */

    .mobile-bottom-nav{
        position:fixed;

        left:0;
        right:0;
        bottom:0;

        width:100%;
        height:68px;

        background:var(--white);

        border-top:1px solid #e5e5e5;

        box-shadow:
            0 -4px 15px
            rgba(0,0,0,.08);

        z-index:4000;

        display:grid;

        grid-template-columns:repeat(4,1fr);

        align-items:stretch;

        padding:0;
        margin:0;
    }

    .mobile-bottom-nav .bottom-nav-item{
        width:100%;
        min-width:0;
        height:68px;

        display:flex;

        flex-direction:column;

        align-items:center;
        justify-content:center;

        gap:3px;

        color:#7d8490;

        font-family:'Nunito',sans-serif;

        font-size:10.5px;

        font-weight:700;

        line-height:1;

        text-decoration:none;

        border:none;

        background:transparent;

        cursor:pointer;

        position:relative;

        padding:8px 2px;

        margin:0;
    }

    .mobile-bottom-nav .bottom-nav-item svg{
        width:22px;
        height:22px;

        display:block;

        flex-shrink:0;

        margin:0;
    }

    .mobile-bottom-nav
    .bottom-nav-item
    span:not(.bottom-notif-badge){

        display:block;

        width:100%;

        text-align:center;

        line-height:1;

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;
    }

    .mobile-bottom-nav
    .bottom-nav-item.active{
        color:var(--blue-dark);
    }

    .mobile-bottom-nav
    .bottom-nav-item:hover{
        color:#7d8490;
    }

    .mobile-bottom-nav
    .bottom-nav-item.active:hover{
        color:var(--blue-dark);
    }

    /* =================================================
       NOTIFICATION BADGE
       SAME POSITION AS NOTIF.HTML
    ================================================= */

    .mobile-bottom-nav .bottom-notif-badge{
        position:absolute;

        top:6px;

        right:50%;

        transform:translateX(12px);

        min-width:16px;
        height:16px;

        padding:0 4px;

        display:none;

        align-items:center;
        justify-content:center;

        border-radius:50%;

        background:var(--red);

        color:white;

        font-size:9px;

        font-weight:800;

        line-height:1;

        z-index:2;
    }

    /* PROFILE HEADER */

    .profile-head{
        align-items:flex-start;

        flex-wrap:nowrap;
    }

    .profile-head>div:nth-child(2){
        flex:1;
        min-width:0;
    }

    .profile-actions{
        width:86px;
        flex-shrink:0;
    }

    .profile-head h1{
        font-size:20px;
    }

    .profile-head .profile-actions .button{
        padding:6px 5px;
        font-size:11px;
    }

    /* DETAILS */

    .detail{
        display:block;
    }

    .detail span{
        display:block;
    }

    .secondary{
        margin-left:0;
        margin-top:8px;
    }

    /* PURCHASE */

    .purchase-statuses{
        gap:4px;
    }

    .purchase-status{
        font-size:11px;
    }

    .purchase-status svg{
        width:29px;
        height:29px;
    }

    .history-link{
        font-size:12px;
    }
}


/* =====================================================
   POPUP ALERT — MATCH HOME / SERVICES / CHECKOUT
===================================================== */

.cart-alert{
    position:fixed;
    left:50%;
    top:50%;
    transform:translate(-50%,-50%) scale(.85);
    background:#fff;
    width:360px;
    max-width:90vw;
    padding:26px 22px 20px;
    border-radius:18px;
    border:2px solid #5CA3E8;
    box-shadow:0 18px 45px rgba(31,36,48,.18);
    z-index:5002;
    opacity:0;
    visibility:hidden;
    transition:.25s ease;
    text-align:center;
}

.cart-alert.show{
    opacity:1;
    visibility:visible;
    transform:translate(-50%,-50%) scale(1);
}

.cart-alert.error{
    border-color:#e0685f;
}

.cart-alert-icon{
    width:58px;
    height:58px;
    margin:0 auto 12px;
    border-radius:50%;
    background:#5CA3E8;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    font-weight:800;
}

.cart-alert.error .cart-alert-icon{
    background:#e0685f;
}

.cart-alert h3{
    margin-bottom:6px;
    font-family:'Baloo 2',cursive;
    font-size:26px;
    line-height:1.1;
    color:var(--ink);
}

.cart-alert p{
    font-size:14px;
    font-weight:700;
    color:#586273;
}

/* =====================================================
   PROFILE CART DRAWER — MATCH HOME CART
===================================================== */

#profileCartOverlay {
    position: fixed;
    inset: 0;
    background: rgba(31, 36, 48, 0.35);
    z-index: 5000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

#profileCartOverlay.is-open {
    opacity: 1;
    visibility: visible;
}

#profileCartDrawer,
#profileCartDrawer * {
    box-sizing: border-box;
}

#profileCartDrawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;

    width: 390px;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;

    background: var(--cream-light);
    z-index: 5001;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    transform: translateX(100%);
    transition: transform 0.3s ease;

    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}

#profileCartDrawer.is-open {
    transform: translateX(0);
}

#profileCartDrawer .cart-drawer-header {
    background: #5CA3E8;
    color: white;
    padding: calc(18px + env(safe-area-inset-top, 0px)) 20px 18px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    

    flex-shrink: 0;
}

#profileCartDrawer .cart-drawer-header h2 {
    font-size: 22px;
    margin: 0;
}

#profileCartDrawer .cart-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

#profileCartDrawer .cart-edit {
    height: 32px;
    padding: 0 10px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
}

#profileCartDrawer .cart-close {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    background: transparent;
    color: white;
    font-size: 23px;
    line-height: 1;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
}

#profileCartDrawer .cart-drawer-body {
    flex: 1;
    min-height: 0;
    min-width: 0;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 15px;
    background: #ffffff;
}

#profileCartDrawer .drawer-cart-item {
    width: 100%;
    min-width: 0;

    background: white;
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 10px;

    display: flex;
    align-items: center;
    gap: 8px;

    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

#profileCartDrawer .drawer-cart-item img {
    width: 62px;
    height: 62px;
    flex-shrink: 0;

    border-radius: 9px;
    background: #7BB8F0;
    object-fit: contain;
}

#profileCartDrawer .drawer-item-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

#profileCartDrawer .drawer-item-name {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 4px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#profileCartDrawer .drawer-item-price {
    color: #5CA3E8;
    font-size: 13px;
    font-weight: 800;
    overflow-wrap: anywhere;
}

#profileCartDrawer .drawer-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
}

#profileCartDrawer .drawer-item-qty-control {
    display: flex;
    align-items: center;

    border: 1.5px solid #7BB8F0;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}

#profileCartDrawer .qty-btn {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    padding: 0;

    border: none;
    background: transparent;
    color: #5CA3E8;

    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
}

#profileCartDrawer .qty-val {
    width: 28px;
    height: 28px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-left: 1.5px solid #7BB8F0;
    border-right: 1.5px solid #7BB8F0;

    font-size: 13px;
    font-weight: 800;
}

#profileCartDrawer .cart-drawer-footer {
    background:white;

    padding:16px 20px calc(16px + env(safe-area-inset-bottom, 0px));

    border-top:1px solid #eee;

    flex-shrink:0;
}


#profileCartDrawer .cart-total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;
    gap: 10px;

    font-size: 15px;
    font-weight: 800;
}

#profileCartDrawer .cart-total-info {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

#profileCartDrawer .cart-total-row strong {
    color: #5CA3E8;
    white-space: nowrap;
    font-size: 16px;
}

#profileCartDrawer .checkout-btn {
    height: 40px;
    width: 110px;
    max-width: 100%;
    flex-shrink: 0;
    padding: 0;

    border: none;
    border-radius: 9px;

    background: #5CA3E8;
    color: white;

    font-family: 'Nunito', sans-serif;
    font-size: 11.5px;
    font-weight: 800;
    cursor: pointer;
}

#profileCartDrawer .checkout-btn:disabled {
    background: #c8cdd3;
    color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.8;
}

/* Prevent background scrolling while cart is open */
body.profile-cart-open {
    overflow: hidden;
}

/* Cart edit mode */
#profileCartDrawer .normal-footer {
    display: block;
}

#profileCartDrawer .edit-mode-footer {
    display: none;
}

#profileCartDrawer.edit-mode .normal-footer {
    display: none;
}

#profileCartDrawer.edit-mode .edit-mode-footer {
    display: block;
}

#profileCartDrawer .edit-total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;
    gap: 10px;
}

#profileCartDrawer .select-all-label {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    color: #333333;
    cursor: pointer;
}

#profileCartDrawer .drawer-item-checkbox {
    display: block;
    width: 19px;
    height: 19px;
    flex-shrink: 0;

    accent-color: #5CA3E8;
    cursor: pointer;
}

#profileCartDrawer .delete-btn {
    border: none;
    border-radius: 8px;
    padding: 10px 14px;

    background: #e0685f;
    color: #ffffff;

    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;

    transition: background 0.2s ease, opacity 0.2s ease;
}

#profileCartDrawer .delete-btn:hover:not(:disabled) {
    background: #c9554d;
}

#profileCartDrawer .delete-btn:disabled {
    background: #d5dce4;
    color: #ffffff;
    opacity: 0.7;
    cursor: not-allowed;
}

/* Mobile: use the full phone width like Home */
@media (max-width: 700px) {
    #profileCartDrawer {
        top: 0;
        right: 0;
        bottom: 0;

        width: 100%;
        max-width: 100%;
        height: 100dvh;
    }

    #profileCartDrawer .cart-drawer-header {
        padding: calc(16px + env(safe-area-inset-top, 0px)) 15px 16px;
    }

    #profileCartDrawer .cart-drawer-body {
        padding: 15px;
    }

    #profileCartDrawer .cart-drawer-footer {
        padding: 14px 15px calc(14px + env(safe-area-inset-bottom, 0px));
    }

    #profileCartDrawer .checkout-btn {
        width: 110px;
        height: 40px;
        font-size: 11.5px;
    }
}

/* Very narrow phones */
@media (max-width: 360px) {
    #profileCartDrawer .drawer-cart-item {
        gap: 6px;
        padding: 8px;
    }

    #profileCartDrawer .drawer-cart-item img {
        width: 52px;
        height: 52px;
    }

    #profileCartDrawer .qty-btn {
        width: 24px;
        height: 26px;
    }

    #profileCartDrawer .qty-val {
        width: 24px;
        height: 26px;
    }

    #profileCartDrawer .cart-total-row {
        font-size: 14px;
    }
}

.drawer-empty{
    min-height:300px;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    text-align:center;

    padding:30px;
}

.drawer-empty h3{
    font-size:22px;

    margin-bottom:8px;
}

.drawer-empty p{
    font-size:14px;

    opacity:.7;
}



/* =====================================================
   SMALL MOBILE
===================================================== */

@media(max-width:380px){

    body{
        padding-bottom:64px;
    }

    .mobile-bottom-nav{
        height:64px;
    }

    .mobile-bottom-nav .bottom-nav-item{
        height:64px;

        font-size:9.5px;

        gap:3px;

        padding:6px 2px;
    }

    .mobile-bottom-nav .bottom-nav-item svg{
        width:20px;
        height:20px;
    }
}
`;