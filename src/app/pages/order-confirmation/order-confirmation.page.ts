// @ts-nocheck  (legacy script below is plain JavaScript carried over from order-confirmation.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './order-confirmation.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class OrderConfirmationPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of order-confirmation.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =====================================================
   FORMAT PESO
===================================================== */

function peso(number){

    return '₱' +
        Number(number || 0)
            .toLocaleString(
                'en-PH',
                {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                }
            );

}


/* =====================================================
   GET LAST ORDER ID + LOGGED-IN USER
===================================================== */

const urlParams = new URLSearchParams(window.location.search);

const orderId =
    urlParams.get('order_id') ||
    localStorage.getItem('lastOrderId');

const loggedInUser =
    JSON.parse(
        localStorage.getItem(
            'loggedInUser'
        ) || 'null'
    );


const userId =
    loggedInUser
        ? Number(loggedInUser.user_id || loggedInUser.id || 0)
        : 0;


console.log("Last Order ID:", orderId);
console.log("Logged In User:", loggedInUser);
console.log("User ID:", userId);


/* =====================================================
   ROOT
===================================================== */

const root =
    document.getElementById(
        'confirmationRoot'
    );


/* =====================================================
   LOAD ORDER
===================================================== */

async function loadOrder() {
    if (!orderId) {
        showEmptyOrder('No order ID was found.');
        return;
    }

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            showEmptyOrder('Please sign in again to view this order.');
            return;
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                user_id,
                status,
                payment_method,
                subtotal,
                shipping_fee,
                total,
                address_id,
                order_items (
                    id,
                    product_id,
                    product_name,
                    quantity,
                    unit_price,
                    line_total
                )
            `)
            .eq('user_id', user.id)
            .or(`id.eq.${orderId},order_number.eq.${orderId}`)
            .maybeSingle();

        if (orderError) throw orderError;

        if (!order) {
            showEmptyOrder('Order not found or you do not have access to it.');
            return;
        }

        let address = null;

        if (order.address_id) {
            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('id', order.address_id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            address = data;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        
const orderItems = order.order_items || [];

const productIds = [
    ...new Set(
        orderItems
            .map(item => item.product_id)
            .filter(id => id !== null && id !== undefined)
    )
];

let productImages = {};

if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, image_url')
        .in('id', productIds);

    if (productsError) {
        console.error('Could not load product images:', productsError);
    } else {
        productImages = Object.fromEntries(
            (products || []).map(product => [
                String(product.id),
                product.image_url || ''
            ])
        );
    }
}


        renderOrder({
            order_id: order.order_number || order.id,
            status: order.status,
            first_name: profile?.full_name || user.user_metadata?.['full_name'] || 'friend',
            phone: address?.phone || '',
            address: address?.address_line || '',
            city: address?.city || '',
            province: address?.province || '',
            postal_code: address?.postal_code || '',
            payment_method: order.payment_method,
            subtotal: order.subtotal,
            shipping_fee: order.shipping_fee,
            total_amount: order.total,
            
            items: orderItems.map(item => ({
                ...item,
                image_url: productImages[String(item.product_id)] || '',
                item_total: item.line_total
            }))

        });
    } catch (error) {
        console.error('Order loading error:', error);
        showEmptyOrder(error?.message || 'Unable to load order.');
    }
}


/* =====================================================
   EMPTY ORDER
===================================================== */

function showEmptyOrder(message){

    root.innerHTML = `

        <div class="confirmation-empty">

            <h2>
                No recent order found
            </h2>

            <p>
                ${
                    message ||
                    "We couldn't find your recent order."
                }
            </p>

            <a
                href="index.html"
                class="shop-btn"
            >
                Continue Shopping
            </a>

        </div>

    `;

}


/* =====================================================
   RENDER ORDER
===================================================== */

function renderOrder(order) {
    const items = order.items || [];

    const itemCount = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    const addressLine = [
        order.address,
        order.city,
        order.province,
        order.postal_code,
        'Philippines'
    ].filter(Boolean).join(', ');

    const itemsHtml = items.map(item => `
        <div class="confirmation-item">
            
            <img
                src="${item.image_url || 'images/placeholder.png'}"
                alt="${item.product_name}"
                onerror="this.onerror=null; this.src='images/placeholder.png';"
            >

            <div class="confirmation-item-info">
                <div class="confirmation-item-name">
                    ${item.product_name}
                </div>
                <div class="confirmation-item-quantity">
                    Quantity: ${item.quantity}
                </div>
            </div>
            <div class="confirmation-item-price">
                ${peso(item.item_total)}
            </div>
        </div>
    `).join('');

    root.innerHTML = `
        <div class="confirmation-header">
            <h2>Order Details</h2>
            <div class="confirmation-check-row">
                <div class="check-icon">✓</div>
                Order status: ${order.status || 'Pending'}
            </div>
        </div>

        <div class="confirm-box">
            <p class="confirm-order-id">Order #${order.order_id}</p>
        </div>

        <div class="confirm-box">
            <h3>Customer Information</h3>
            <h4>Contact</h4>
            <p>${order.phone || '-'}</p>
            <h4>Shipping Address</h4>
            <p>${addressLine || '-'}</p>
            <h4>Shipping Method</h4>
            <p>Standard Delivery</p>
        </div>

        <div class="confirm-box">
            <h3>Payment Method</h3>
            <p>${formatPayment(order.payment_method)}</p>
        </div>

        <div class="confirm-box confirmation-summary-box">
            <h3>Order Summary (${itemCount} item${itemCount === 1 ? '' : 's'})</h3>
            <div>${itemsHtml}</div>
            <div class="confirmation-totals">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${peso(order.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${peso(order.shipping_fee)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${peso(order.total_amount)}</span>
                </div>
            </div>
        </div>

        <a href="/purchase-status" class="shop-btn">
            Back to My Orders
        </a>
    `;
}


/* =====================================================
   PAYMENT DISPLAY
===================================================== */

function formatPayment(payment){

    if(!payment){

        return '-';

    }


    const value =
        payment.toLowerCase();


    if(value === 'cod'){

        return 'Cash on Delivery';

    }


    if(value === 'gcash'){

        return 'GCash';

    }


    if(value === 'card'){

        return 'Credit / Debit Card';

    }


    return payment;

}


/* =====================================================
   START
===================================================== */

loadOrder();


;



/* inline onclick="loadOrder()" (Try again) needs a global function */
try { window.loadOrder = loadOrder; } catch (e) {}

  }
}
