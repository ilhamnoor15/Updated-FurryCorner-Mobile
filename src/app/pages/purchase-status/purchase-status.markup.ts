import { appBottomNav } from '../../legacy/app-shell';
// Page markup + CSS carried over unchanged from purchase-status.html.
// Migrate this to a real Angular template (.html) / .scss one page at a time.
export const TITLE = `My Purchases - FurryCorner`;
export const BODY_CLASS = ``;

export const HTML = `<!-- =====================================================
     MOBILE HEADER
===================================================== -->

<header class="mobile-header">

    <button
        type="button"
        class="back-button"
        onclick="goBack()"
        aria-label="Go back">

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M19 12H5"></path>

            <path d="M12 19l-7-7 7-7"></path>

        </svg>

    </button>


    <div class="mobile-header-title">

        My Purchases

    </div>


    <div class="header-spacer"></div>

</header>


<!-- =====================================================
     STATUS NAVIGATION
===================================================== -->


<nav class="status-navigation">

    <a href="purchase-status.html?status=pay"
       class="status-tab" data-status="pay">
        <span class="tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="15" rx="2"/>
                <path d="M3 9h18"/>
                <circle cx="16" cy="14" r="1"/>
            </svg>
            <span class="tab-count" id="count-pay">0</span>
        </span>
        <span class="tab-label">To Pay</span>
    </a>

    <a href="purchase-status.html?status=ship"
       class="status-tab" data-status="ship">
        <span class="tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7h18v13H3z"/>
                <path d="M3 7l4-4h10l4 4"/>
                <path d="M7 3l3 4 4-4"/>
                <path d="M7 12h5M7 15h3"/>
            </svg>
            <span class="tab-count" id="count-ship">0</span>
        </span>
        <span class="tab-label">To Ship</span>
    </a>

    <a href="purchase-status.html?status=receive"
       class="status-tab" data-status="receive">
        <span class="tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 7h12v11H2z"/>
                <path d="M14 11h4l4 4v3h-8z"/>
                <circle cx="6" cy="19" r="2"/>
                <circle cx="18" cy="19" r="2"/>
                <path d="M5 4h6M3 2h6"/>
            </svg>
            <span class="tab-count" id="count-receive">0</span>
        </span>
        <span class="tab-label">To Receive</span>
    </a>

    <a href="purchase-status.html?status=rate"
       class="status-tab" data-status="rate">
        <span class="tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>
            </svg>
            <span class="tab-count" id="count-rate">0</span>
        </span>
        <span class="tab-label">To Rate</span>
    </a>

    <a href="purchase-status.html?status=history"
       class="status-tab" data-status="history">
        <span class="tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7h16v14H4z"/>
                <path d="M8 7V4h8v3"/>
                <path d="m10 12-3 3 3 3"/>
                <path d="M7 15h8a3 3 0 0 0 0-6h-2"/>
            </svg>
            <span class="tab-count" id="count-history">0</span>
        </span>
        <span class="tab-label">History</span>
    </a>

</nav>


<!-- =====================================================
     PAGE
===================================================== -->

<main class="page">


    <div class="page-heading">

        <h1 id="pageTitle">

            My Purchases

        </h1>


        <p id="pageSubtitle">

            View your orders and their current status.

        </p>

    </div>


    <div
        class="orders-container"
        id="ordersContainer">

        <div class="loading">

            Loading your orders...

        </div>

    </div>

</main>


<!-- =====================================================
     MOBILE BOTTOM NAVIGATION
===================================================== -->

${appBottomNav('me')}`;

export const CSS = `

/* =====================================================
   VARIABLES
===================================================== */

:root{

    --blue:#7BB8F0;
    --blue-dark:#5CA3E8;

    --cream:#FCE3C0;
    --cream-light:#FDEEDA;

    --ink:#1F2430;

    --white:#ffffff;

    --gray:#777;

    --border:#e5e5e5;

}


/* =====================================================
   RESET
===================================================== */

*{

    box-sizing:border-box;

    margin:0;

    padding:0;

}


body{

    font-family:'Nunito',sans-serif;

    color:var(--ink);

    background:var(--cream);

    min-height:100vh;

    padding-bottom:80px;

}


a{

    text-decoration:none;

    color:inherit;

}


/* =====================================================
   MOBILE HEADER
===================================================== */

.mobile-header{

    position:sticky;

    top:0;

    z-index:1000;

    height:60px;

    background:white;

    display:flex;

    align-items:center;

    padding:0 18px;

    box-shadow:
        0 2px 8px rgba(0,0,0,.06);

}


.back-button{

    width:40px;

    height:40px;

    border:none;

    background:none;

    display:flex;

    align-items:center;

    justify-content:center;

    cursor:pointer;

}


.back-button svg{

    width:23px;

    height:23px;

}


.mobile-header-title{

    flex:1;

    text-align:center;

    font-family:'Baloo 2',cursive;

    font-size:22px;

    font-weight:800;

}


.header-spacer{

    width:40px;

}


.status-navigation {
    background: white;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
    overflow-x: auto;
    scrollbar-width: none;
}

.status-navigation::-webkit-scrollbar {
    display: none;
}

.status-tab {
    position: relative;
    flex: 1 0 68px;
    min-width: 68px;
    padding: 12px 4px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: #777;
}

.tab-icon-wrap {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tab-icon-wrap svg {
    width: 30px;
    height: 30px;
}

.tab-label {
    white-space: nowrap;
}

.tab-count {
    position: absolute;
    top: -7px;
    right: -13px;
    min-width: 19px;
    height: 19px;
    padding: 0 5px;
    border-radius: 12px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 800;
    line-height: 19px;
    text-align: center;
    display: none;
}

.tab-count.has-count {
    display: block;
}

.status-tab.active {
    color: var(--blue-dark);
}

.status-tab.active::after {
    content: "";
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 0;
    height: 3px;
    background: var(--blue-dark);
    border-radius: 5px 5px 0 0;
}


/* =====================================================
   PAGE
===================================================== */

.page{

    max-width:700px;

    margin:auto;

    padding:18px 14px 30px;

}


.page-heading{

    margin-bottom:15px;

}


.page-heading h1{

    font-family:'Baloo 2',cursive;

    font-size:26px;

    font-weight:800;

}


.page-heading p{

    font-size:13px;

    color:#777;

    margin-top:2px;

}


/* =====================================================
   ORDERS
===================================================== */

.orders-container{

    display:flex;

    flex-direction:column;

    gap:12px;

}


/* =====================================================
   ORDER CARD
===================================================== */

.order-card{

    background:white;

    border-radius:14px;

    padding:17px;

    box-shadow:
        0 3px 12px rgba(0,0,0,.05);

}


.order-top{

    display:flex;

    align-items:flex-start;

    justify-content:space-between;

    gap:10px;

    padding-bottom:13px;

    border-bottom:1px solid var(--border);

}


.order-number{

    font-size:14px;

    font-weight:800;

}


.order-date{

    font-size:11px;

    color:#888;

    margin-top:3px;

}


/* =====================================================
   STATUS
===================================================== */

.status{

    padding:6px 10px;

    border-radius:20px;

    font-size:10px;

    font-weight:800;

    white-space:nowrap;

}


.status.pending{

    background:#fff3cd;

    color:#9a7200;

}


.status.processing{

    background:#e4f2ff;

    color:#3279b9;

}


.status.shipped{

    background:#e9e2ff;

    color:#6743a5;

}


.status.delivered{

    background:#e2f7ed;

    color:#27845a;

}


.status.cancelled{

    background:#ffe5e5;

    color:#c23b3b;

}


/* =====================================================
   ORDER BODY
===================================================== */

.order-body{

    padding:14px 0;

}


.order-info-row{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:7px;

}


.order-info-label{

    font-size:12px;

    color:#777;

}


.order-info-value{

    font-size:13px;

    font-weight:700;

}


.order-total{

    font-size:18px;

    font-weight:800;

}


/* =====================================================
   ORDER BOTTOM
===================================================== */

.order-bottom{

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:10px;

    padding-top:13px;

    border-top:1px solid var(--border);

}


.item-count{

    font-size:12px;

    color:#777;

}


.view-button{

    border:none;

    background:var(--blue);

    color:white;

    padding:9px 14px;

    border-radius:8px;

    font-family:'Nunito',sans-serif;

    font-size:12px;

    font-weight:800;

    cursor:pointer;

}


.view-button:active{

    transform:scale(.97);

}


.view-button:hover{

    background:var(--blue-dark);

}


/* =====================================================
   EMPTY STATE
===================================================== */

.empty-orders{

    background:white;

    border-radius:14px;

    padding:55px 20px;

    text-align:center;

    box-shadow:
        0 3px 12px rgba(0,0,0,.05);

}


.empty-icon{

    width:60px;

    height:60px;

    margin:0 auto 15px;

    border-radius:50%;

    background:var(--cream-light);

    display:flex;

    align-items:center;

    justify-content:center;

}


.empty-icon svg{

    width:30px;

    height:30px;

}


.empty-orders h3{

    font-family:'Baloo 2',cursive;

    font-size:22px;

    margin-bottom:5px;

}


.empty-orders p{

    color:#888;

    font-size:13px;

    line-height:1.5;

    margin-bottom:18px;

}


.shop-button{

    display:inline-block;

    background:var(--blue);

    color:white;

    padding:10px 18px;

    border-radius:8px;

    font-size:13px;

    font-weight:800;

}


.shop-button:hover{

    background:var(--blue-dark);

}


/* =====================================================
   LOADING
===================================================== */

.loading{

    background:white;

    border-radius:14px;

    padding:45px 20px;

    text-align:center;

    color:#888;

    font-size:13px;

}


/* =====================================================
   ERROR
===================================================== */

.error-box{

    background:white;

    border-radius:14px;

    padding:40px 20px;

    text-align:center;

}


.error-box h3{

    font-family:'Baloo 2',cursive;

    font-size:21px;

    margin-bottom:5px;

}


.error-box p{

    color:#888;

    font-size:13px;

}


/* =====================================================
   MOBILE BOTTOM NAV
===================================================== */

.mobile-bottom-nav{

    position:fixed;

    left:0;

    right:0;

    bottom:0;

    height:68px;

    background:white;

    border-top:1px solid var(--border);

    display:flex;

    align-items:center;

    justify-content:space-around;

    z-index:2000;

}


.bottom-nav-item{

    position:relative;

    flex:1;

    height:100%;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    gap:3px;

    color:#777;

    font-size:10px;

    font-weight:700;

}


.bottom-nav-item svg{

    width:21px;

    height:21px;

}


.bottom-nav-item.active{

    color:var(--blue-dark);

}


.bottom-notif-badge{

    position:absolute;

    top:9px;

    margin-left:20px;

    min-width:15px;

    height:15px;

    padding:0 4px;

    border-radius:20px;

    background:#ef5b6b;

    color:white;

    display:flex;

    align-items:center;

    justify-content:center;

    font-size:9px;

    font-weight:800;

}


.order-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.cancel-button {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.cancel-button:hover {
    background: #ffe4e6;
    border-color: #fda4af;
}

.cancel-button:active {
    transform: scale(0.97);
}

.cancel-button:focus-visible {
    outline: 2px solid #e11d48;
    outline-offset: 3px;
}

.cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.order-status-group {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
}

.payment-status {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    background: #f3f4f6;
    color: #4b5563;
}

.payment-status.paid {
    background: #dcfce7;
    color: #166534;
}

.payment-status.pending {
    background: #fef3c7;
    color: #92400e;
}

/* =====================================================
   DESKTOP
===================================================== */

@media(min-width:751px){

    body{

        padding-bottom:0;

    }


    .mobile-header{

        display:none;

    }


    .status-navigation{

        display:none;

    }


    .page{

        padding-top:45px;

    }


    .mobile-bottom-nav{

        display:none;

    }


    .page-heading h1{

        font-size:34px;

    }

}


`;
