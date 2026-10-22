// @ts-nocheck  (legacy script below is plain JavaScript carried over from purchase-status.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './purchase-status.markup';
import { supabase } from '../../../services/supabase.service';
import { notifyOrderCancelled } from '../../legacy/notify';

@Component({
  selector: 'app-purchase-status',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class PurchaseStatusPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of purchase-status.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =====================================================
   GET CURRENT STATUS
===================================================== */

const urlParams =
    new URLSearchParams(
        location.search
    );


let currentStatus =
    urlParams.get("status") || "history";


/* =====================================================
   LOGGED-IN USER
===================================================== */

let loggedUser = null;


try{

    loggedUser =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );

}catch(error){

    loggedUser = null;

}


/*
 * If there is no logged-in user,
 * return to signin.
 */

if(
    !loggedUser ||
    !loggedUser.id
){

    location.href =
        "signin.html?return=checkout";

}


/* =====================================================
   PAGE TITLES
===================================================== */

const statusTitles = {

    pay:{

        title:"To Pay",

        subtitle:
            "Orders waiting for payment."

    },


    ship:{

        title:"To Ship",

        subtitle:
            "Orders being prepared for shipment."

    },


    receive:{

        title:"To Receive",

        subtitle:
            "Orders that have been shipped."

    },


    rate:{

        title:"To Rate",

        subtitle:
            "Orders that have been delivered."

    },


    history:{

        title:"Purchase History",

        subtitle:
            "View all of your previous orders."

    }

};


const selectedTitle =
    statusTitles[currentStatus]
        || statusTitles.history;


document.getElementById(
    "pageTitle"
).textContent =
    selectedTitle.title;


document.getElementById(
    "pageSubtitle"
).textContent =
    selectedTitle.subtitle;


/* =====================================================
   ACTIVE TAB
===================================================== */

document
    .querySelectorAll(".status-tab")
    .forEach(tab => {

        if(
            tab.dataset.status ===
            currentStatus
        ){

            tab.classList.add(
                "active"
            );

        }

    });


/* =====================================================
   BACK BUTTON
===================================================== */

function goBack() {
    location.href = "profile.html";
}

/* =====================================================
   LOAD ORDERS
===================================================== */


async function loadOrders() {
    if (!loggedUser || !loggedUser.id) {
        return;
    }

    try {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user || user.id !== loggedUser.id) {
            showError('Please sign in again to view your orders.');
            return;
        }

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                status,
                payment_status,
                total,
                created_at,
                order_items (
                    id,
                    product_name,
                    quantity,
                    unit_price,
                    line_total
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        
const mappedOrders = (orders || []).map(order => ({
    ...order,
    order_id: order.order_number || order.id,
    order_date: order.created_at,
    total_amount: order.total,
    items: order.order_items || []
}));

updateTabCounts(mappedOrders);
renderOrders(filterOrders(mappedOrders));

    } catch (error) {
        console.error('Purchase status error:', error);
        showError(error?.message || 'Unable to load your orders.');
    }
}



function updateTabCounts(orders) {
    const counts = {
        pay: 0,
        ship: 0,
        receive: 0,
        rate: 0,
        history: orders.length
    };

    orders.forEach(order => {
        const status = String(order.status || "").toLowerCase().trim();
        const paymentStatus = String(order.payment_status || "").toLowerCase().trim();

        if (status === "pending" && paymentStatus !== "paid") {
            counts.pay++;
        }

        if (
            (status === "pending" || status === "processing") &&
            paymentStatus === "paid"
        ) {
            counts.ship++;
        }

        if (status === "shipped") {
            counts.receive++;
        }

        if (status === "delivered") {
            counts.rate++;
        }
    });

    Object.entries(counts).forEach(([key, count]) => {
        const badge = document.getElementById(`count-${key}`);

        if (badge) {
            badge.textContent = count > 99 ? "99+" : String(count);
            badge.classList.toggle("has-count", count > 0);
        }
    });
}

/* =====================================================
   FILTER ORDERS
===================================================== */

function filterOrders(orders) {
    return orders.filter(order => {
        const status = String(order.status || "").toLowerCase().trim();
        const paymentStatus = String(order.payment_status || "").toLowerCase().trim();

        // PURCHASE HISTORY: Completed or cancelled orders only.
        if (currentStatus === "history") {
            return true;
        }

        // TO PAY: Pending orders that have not been paid.
        if (currentStatus === "pay") {
            return status === "pending" && paymentStatus !== "paid";
        }

        // TO SHIP: Paid orders still being processed.
        if (currentStatus === "ship") {
            return (status === "pending" || status === "processing")
                && paymentStatus === "paid";
        }

        // TO RECEIVE: Orders that have shipped.
        if (currentStatus === "receive") {
            return status === "shipped";
        }

        // TO RATE: Delivered orders.
        if (currentStatus === "rate") {
            return status === "delivered";
        }

        return false;
    });
}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(
    orders
){

    const container =
        document.getElementById(
            "ordersContainer"
        );


    if(
        !orders ||
        orders.length === 0
    ){

        renderEmptyState();

        return;

    }


    container.innerHTML =
        orders
            .map(
                order =>
                    createOrderCard(
                        order
                    )
            )
            .join("");

    container.querySelectorAll('.cancel-button').forEach(button => {
    button.addEventListener('click', () => {
        const orderId = button.getAttribute('data-order-id');

        if (orderId) {
            cancelOrder(orderId);
        }
    });
});

}


/* =====================================================
   CREATE ORDER CARD
===================================================== */

function createOrderCard(
    order
){

    const status = String(order.status || "Pending");

const paymentStatus = String(
    order.payment_status || "pending"
).toLowerCase();

const paymentStatusLabel =
    paymentStatus === "paid"
        ? "Paid"
        : paymentStatus === "pending"
            ? "Pending"
            : paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

const paymentStatusClass =
    paymentStatus.replace(/\s+/g, "-");


    const statusClass =
        status
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    const itemCount =
        Array.isArray(order.items)
            ? order.items.reduce(
                (total, item) =>
                    total +
                    (Number(item.quantity) || 0),
                0
            )
            : 0;


    return `

        <article
            class="order-card">


            <div
                class="order-top">


                <div>

                    <div
                        class="order-number">

                        Order #${escapeHTML(
                            order.order_id
                        )}

                    </div>


                    <div
                        class="order-date">

                        ${formatDate(
                            order.order_date
                        )}

                    </div>

                </div>


                <div class="order-status-group">
    <span class="status ${statusClass}">
        ${escapeHTML(status)}
    </span>

    <span class="payment-status ${paymentStatusClass}">
        Payment: ${escapeHTML(paymentStatusLabel)}
    </span>
</div>


            </div>


            <div
                class="order-body">


                <div
                    class="order-info-row">

                    <span
                        class="order-info-label">

                        Items

                    </span>


                    <span
                        class="order-info-value">

                        ${itemCount}
                        ${
                            itemCount === 1
                                ? "item"
                                : "items"
                        }

                    </span>

                </div>


                <div
                    class="order-info-row">

                    <span
                        class="order-info-label">

                        Total

                    </span>


                    <span
                        class="order-total">

                        ₱${formatPrice(
                            order.total_amount
                        )}

                    </span>

                </div>

            </div>


            <div
                class="order-bottom">


                <span
                    class="item-count">

                    Order #${escapeHTML(
                        order.order_id
                    )}

                </span>


                <div class="order-actions">
    <button
        type="button"
        class="view-button"
        onclick="viewOrder(
            ${Number(order.order_id)}
        )">
        View Order
    </button>

    ${
        String(order.status || '').toLowerCase() === 'pending'
        && String(order.payment_status || '').toLowerCase() === 'pending'
        ? `
            <button
                type="button"
                class="cancel-button"
                data-order-id="${escapeHTML(order.id)}">
                Cancel Order
            </button>
        `
        : ''
    }
</div>

            </div>


        </article>

    `;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function renderEmptyState(){

    const messages = {

        pay:{
            title:"No orders to pay",
            message:
                "You don't have any pending orders."
        },


        ship:{
            title:"No orders to ship",
            message:
                "You don't have any orders being prepared."
        },


        receive:{
            title:"No orders to receive",
            message:
                "You don't have any shipped orders."
        },


        rate:{
            title:"No orders to rate",
            message:
                "You don't have any delivered orders waiting for a rating."
        },


        history:{
            title:"No orders yet",
            message:
                "You haven't placed any orders yet."
        }

    };


    const message =
        messages[currentStatus]
        || messages.history;


    document.getElementById(
        "ordersContainer"
    ).innerHTML = `

        <div
            class="empty-orders">


            <div
                class="empty-icon">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path
                        d="M3 6h18v14H3z">
                    </path>

                    <path
                        d="M7 6V4h10v2">
                    </path>

                    <path
                        d="M8 10h8">
                    </path>

                    <path
                        d="M8 14h5">
                    </path>

                </svg>

            </div>


            <h3>

                ${message.title}

            </h3>


            <p>

                ${message.message}

            </p>


            <a
                href="AllProducts.php"
                class="shop-button">

                Start Shopping

            </a>


        </div>

    `;

}


/* =====================================================
   ERROR
===================================================== */

function showError(
    message
){

    document.getElementById(
        "ordersContainer"
    ).innerHTML = `

        <div
            class="error-box">


            <h3>

                Unable to load orders

            </h3>


            <p>

                ${escapeHTML(
                    message
                )}

            </p>


        </div>

    `;

}


/* =====================================================
   VIEW ORDER
===================================================== */

function viewOrder(orderId: string | number) {
    window.location.href =
        `/order-confirmation?order_id=${encodeURIComponent(String(orderId))}`;
}

async function cancelOrder(orderId: string) {
    if (!loggedUser?.id || !orderId) {
        return;
    }

    const confirmed = window.confirm(
        'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
        return;
    }

    try {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user || user.id !== loggedUser.id) {
            throw new Error('Please sign in again.');
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .eq('payment_status', 'pending')
            .select('id, order_number')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            throw new Error(
                'This order can no longer be cancelled. Please refresh your orders.'
            );
        }

        // Add an "Order cancelled" entry to the Notifications page.
        await notifyOrderCancelled(data.id, data.order_number);

        await loadOrders();
    } catch (error: any) {
        console.error('Cancel order error:', error);
        window.alert(
            error?.message || 'Unable to cancel this order.'
        );
    }
}
/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(
    value
){

    return Number(
        value || 0
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    date
){

    if(!date){

        return "";

    }


    const parsedDate =
        new Date(date);


    if(
        Number.isNaN(
            parsedDate.getTime()
        )
    ){

        return "";

    }


    return parsedDate.toLocaleDateString(
        "en-PH",
        {
            month:"long",
            day:"numeric",
            year:"numeric"
        }
    );

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
   CART BADGE
===================================================== */

function updateCartBadge(){

    /*
     * Cart is intentionally still
     * stored in localStorage,
     * based on your existing setup.
     */

    let cart = [];


    try{

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    }
    catch(error){

        cart = [];

    }


    const totalItems =
        cart.reduce(
            (
                total,
                item
            ) => {

                return total +
                    (
                        Number(
                            item.quantity
                        ) || 0
                    );

            },
            0
        );


    const badge =
        document.getElementById(
            "bottomNotifBadge"
        );


    /*
     * No cart badge is displayed
     * in this page's bottom nav.
     *
     * Keep this function here so
     * the cart remains compatible
     * with the rest of the website.
     */

}


/* =====================================================
   START
===================================================== */

updateCartBadge();

loadOrders();


;
try { window.goBack = goBack; } catch (e) {}


/* inline onclick="viewOrder(...)" needs a global function */
try { window.viewOrder = viewOrder; } catch (e) {}

try { window.cancelOrder = cancelOrder; } catch (e) {}

  }
}