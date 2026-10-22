// @ts-nocheck  (legacy script below is plain JavaScript carried over from checkout.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './checkout.markup';
import { supabase } from '../../../services/supabase.service';
import { API_BASE } from '../../config';

@Component({
  selector: 'app-checkout',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class CheckoutPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of checkout.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {

/* =====================================================
   REQUIRE LOGIN
===================================================== */

const loggedUser =
    JSON.parse(
        localStorage.getItem('loggedInUser') || 'null'
    );

const userId =
    localStorage.getItem('loggedInUserId') ||
    loggedUser?.user_id ||
    loggedUser?.id;


if(!userId){
    location.replace('signin.html?return=checkout.html');

}

/* =====================================================
   BACK BUTTON
===================================================== */

const backButton =
    document.getElementById('backButton');

backButton.addEventListener('click', () => {

    if(window.history.length > 1){

        window.history.back();

    }else{

        location.href =
            'index.html';

    }

});


/* =====================================================
   PAYMENT OPTIONS
===================================================== */

const paymentOptions =
    document.querySelectorAll(
        '.payment-option'
    );


const paymentDetails = {

    cod:null,

    gcash:null,

    card:
        document.getElementById(
            'cardDetails'
        ),

    saved:
        document.getElementById(
            'savedPaymentDetails'
        )

};

const savedAddressGroup = document.getElementById('savedAddressGroup');
const savedAddressSelect = document.getElementById('savedAddressSelect');
const savedPaymentOption = document.getElementById('savedPaymentOption');
const savedPaymentSelect = document.getElementById('savedPaymentSelect');
const savedPaymentSummary = document.getElementById('savedPaymentSummary');
let savedCheckoutAddresses = [];
let savedPaymentMethods = [];



paymentOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        // Ignore clicks on a hidden payment option.
        if (option.hidden || option.closest('[hidden]')) {
            event.preventDefault();
            return;
        }

        const radio = option.querySelector('input[type="radio"]');

        if (!radio || radio.disabled) return;

        // Explicitly select this payment method.
        radio.checked = true;

        // Update the selected option's appearance.
        paymentOptions.forEach(opt => {
            opt.classList.remove('active');
        });
        option.classList.add('active');

        // Hide all payment details.
        Object.values(paymentDetails).forEach(detail => {
            if (detail) detail.classList.remove('active');
        });

        // Show details for the selected payment method.
        const paymentType = radio.value;
        const details = paymentDetails[paymentType];

        if (details) {
            details.classList.add('active');
        }

        console.log(
            '[Checkout Debug] Payment option clicked:',
            radio.value
        );
    });
});



function applySavedAddress(address){
    document.getElementById('firstName').value = address.first_name || '';
    document.getElementById('lastName').value = address.last_name || '';
    document.getElementById('address').value = address.address_line || '';
    document.getElementById('city').value = address.city || '';
    document.getElementById('province').value = address.province || '';
    document.getElementById('postalCode').value = address.postal_code || '';
    document.getElementById('phone').value = address.phone || '';
}

async function loadSavedCheckoutDetails() {
    try {
        if (!userId) {
            throw new Error('Please sign in to continue checkout.');
        }

        // Load this user's saved addresses.
        const { data: addresses, error: addressError } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (addressError) throw addressError;

        savedCheckoutAddresses = (addresses || []).map(address => {
            const nameParts = (address.recipient_name || '').trim().split(/\s+/);
            return {
                ...address,
                address_id: address.id,
                address_label: address.label || 'My address',
                first_name: nameParts.shift() || '',
                last_name: nameParts.join(' ')
            };
        });

        savedAddressSelect.replaceChildren();

        if (savedCheckoutAddresses.length) {
            savedCheckoutAddresses.forEach(address => {
                const option = document.createElement('option');
                option.value = String(address.address_id);
                option.textContent =
                    `${address.address_label} - ${address.address_line}, ${address.city || ''}`;
                savedAddressSelect.append(option);
            });

            savedAddressGroup.hidden = false;

            const defaultAddress =
                savedCheckoutAddresses.find(address => address.is_default) ||
                savedCheckoutAddresses[0];

            savedAddressSelect.value = String(defaultAddress.address_id);
            applySavedAddress(defaultAddress);
        }

        // Load this user's saved payment methods.
        const { data: methods, error: methodsError } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (methodsError) throw methodsError;

        savedPaymentMethods = (methods || []).map(method => ({
            ...method,
            payment_method_id: method.id,
            method_type: method.card_brand ? 'card' : 'bank',
            method_label: method.card_brand
                ? method.card_brand
                : (method.provider || 'Payment method')
        }));

        savedPaymentSelect.replaceChildren();

        if (savedPaymentMethods.length) {
            savedPaymentMethods.forEach(method => {
                const option = document.createElement('option');
                option.value = String(method.payment_method_id);

                const type = method.method_type === 'card' ? 'Card' : 'Bank account';
                option.textContent =
                    `${method.method_label} - ${type} ending in ${method.last_four || '****'}`;

                savedPaymentSelect.append(option);
            });

            savedPaymentOption.hidden = false;

            const defaultMethod =
                savedPaymentMethods.find(method => method.is_default) ||
                savedPaymentMethods[0];

            savedPaymentSelect.value = String(defaultMethod.payment_method_id);
            savedPaymentSummary.textContent =
                `Selected: ${defaultMethod.method_label} ending in ${defaultMethod.last_four || '****'}`;
        } else {
            savedPaymentOption.hidden = true;
        }
    } catch (error) {
        console.error('Unable to load saved checkout details:', error);
    }
}


savedAddressSelect.addEventListener('change', () => {
    const selectedAddress = savedCheckoutAddresses.find(
        address => String(address.address_id) === savedAddressSelect.value
    );
    if(selectedAddress) applySavedAddress(selectedAddress);
});


savedPaymentSelect.addEventListener('change', () => {
    const selectedMethod = savedPaymentMethods.find(
        method => String(method.payment_method_id) === savedPaymentSelect.value
    );
    if(selectedMethod){
        savedPaymentSummary.textContent = `Selected: ${selectedMethod.method_label} ending in ${selectedMethod.last_four}`;
    }
});


/* =====================================================
   GET CART TOTAL — LOAD REAL PRODUCT PRICES
===================================================== */

const orderTotal = document.getElementById('orderTotal');

function getItemPrice(item) {
    const price = Number(
        item.price ??
        item.product_price ??
        item.unit_price ??
        item.selling_price ??
        item.productPrice ??
        item.amount ??
        0
    );

    return Number.isFinite(price) && price > 0 ? price : 0;
}

function getItemQuantity(item) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function getCheckoutItems() {
    try {
        const parsed = JSON.parse(
            localStorage.getItem('checkoutItems') || '[]'
        );

        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }

        // Recover checkout items from the signed-in user's cart.
        const currentUser = JSON.parse(
            localStorage.getItem('loggedInUser') || 'null'
        );

        const currentUserId =
            localStorage.getItem('loggedInUserId') ||
            currentUser?.user_id ||
            currentUser?.id;

        const cartKey = currentUserId
            ? `furryCornerCart:${currentUserId}`
            : 'cart';

        const cart = JSON.parse(
            localStorage.getItem(cartKey) || '[]'
        );

        if (!Array.isArray(cart) || cart.length === 0) {
            return [];
        }

        localStorage.setItem(
            'checkoutItems',
            JSON.stringify(cart)
        );

        return cart;
    } catch (error) {
        console.error('[Checkout] Cannot read cart items:', error);
        return [];
    }
}

async function refreshCheckoutItemsWithPrices() {
    const items = getCheckoutItems();

    if (items.length === 0) {
        if (orderTotal) orderTotal.textContent = '₱0.00';
        console.warn('[Checkout] checkoutItems is empty.');
        return [];
    }

    // Keep existing prices when they are already available.
    const needsPrice = items.some(item => getItemPrice(item) <= 0);

    if (needsPrice) {
        try {
            const response = await fetch(
                `${API_BASE}/getProducts.php`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Products API returned HTTP ${response.status}`);
            }

            const result = await response.json();

            // Support common API response formats.
            const products = Array.isArray(result)
                ? result
                : Array.isArray(result.products)
                    ? result.products
                    : Array.isArray(result.data)
                        ? result.data
                        : [];

            console.log('[Checkout Debug] API success:', result.success);
console.log('[Checkout Debug] First API product:', products[0]);
console.log('[Checkout Debug] First checkout item:', items[0]);

            const productMap = new Map();

            products.forEach(product => {
                const id = String(
                    product.product_id ??
                    product.id ??
                    product.productId ??
                    ''
                );

                const price = Number(
                    product.price ??
                    product.product_price ??
                    product.unit_price ??
                    product.selling_price ??
                    product.productPrice ??
                    product.amount ??
                    0
                );

                if (id && Number.isFinite(price) && price > 0) {
                    productMap.set(id, { ...product, resolvedPrice: price });
                }
            });

            items.forEach(item => {
                if (getItemPrice(item) > 0) return;

                const id = String(
                    item.product_id ??
                    item.productId ??
                    item.id ??
                    ''
                );

                const product = productMap.get(id);

                if (product) {
                    item.price = product.resolvedPrice;
                    item.product_name =
                        item.product_name ||
                        item.name ||
                        product.product_name ||
                        product.name ||
                        'Product';
                }
            });

            // Save the resolved prices so order placement uses the same values.
            localStorage.setItem('checkoutItems', JSON.stringify(items));
        } catch (error) {
            console.error('[Checkout] Could not refresh product prices:', error);
        }
    }

    const total = items.reduce((sum, item) => {
        return sum + getItemPrice(item) * getItemQuantity(item);
    }, 0);

    if (orderTotal) {
        orderTotal.textContent = '₱' + total.toFixed(2);
    }

    console.log('[Checkout] Items with prices:', items);
    console.log('[Checkout] Calculated total:', total);

    return items;
}

async function updateOrderTotal() {
    const items = await refreshCheckoutItemsWithPrices();

    const total = items.reduce((sum, item) => {
        return sum + getItemPrice(item) * getItemQuantity(item);
    }, 0);

    if (orderTotal) {
        orderTotal.textContent = '₱' + total.toFixed(2);
    }
}



/* =====================================================
   SUCCESS MODAL
===================================================== */

const successModalBackdrop =
    document.getElementById(
        'successModalBackdrop'
    );


const continueShoppingBtn =
    document.getElementById(
        'continueShoppingBtn'
    );


const viewOrderBtn =
    document.getElementById(
        'viewOrderBtn'
    );


function openSuccessModal(){

    successModalBackdrop.classList.add(
        'open'
    );

}


function closeSuccessModal(){

    successModalBackdrop.classList.remove(
        'open'
    );

}



continueShoppingBtn.addEventListener('click', () => {
    closeSuccessModal();
    location.href = 'index.html';
});



/* =====================================================
   VIEW ORDER
===================================================== */

viewOrderBtn.addEventListener(
    'click',
    () => {

        const lastOrderId =
            localStorage.getItem('lastOrderId');

        if (!lastOrderId) {
            alert('Order information could not be found.');
            return;
        }

        location.href =
            'order-confirmation.html';
    }
);

/* =====================================================
   PLACE ORDER BUTTON
===================================================== */

const checkoutBtn =
    document.getElementById(
        'checkoutBtn'
    );


checkoutBtn.addEventListener(

    'click',

    async () => {

        /* =================================================
           GET CUSTOMER INFORMATION
        ================================================= */

        const firstName =
            document
                .getElementById('firstName')
                .value
                .trim();


        const lastName =
            document
                .getElementById('lastName')
                .value
                .trim();


        const address =
            document
                .getElementById('address')
                .value
                .trim();


        const city =
            document
                .getElementById('city')
                .value
                .trim();


        const province =
            document
                .getElementById('province')
                .value
                .trim();


        const postalCode =
            document
                .getElementById('postalCode')
                .value
                .trim();


        const phone =
            document
                .getElementById('phone')
                .value
                .trim();


        /* =================================================
           VALIDATE
        ================================================= */

        if (
            !firstName ||
            !lastName ||
            !address ||
            !city ||
            !province ||
            !postalCode ||
            !phone
        ) {

            alert(
                'Please fill in all required fields.'
            );

            return;

        }


        /* =================================================
           PAYMENT
        ================================================= */

        const selectedPayment =
            document.querySelector(
                'input[name="payment"]:checked'
            );
        
            console.log('[Checkout Debug] Selected payment:', selectedPayment?.value);


        const selectedPaymentValue =
            selectedPayment
                ? selectedPayment.value
                : 'cod';

        const savedPaymentMethodId = selectedPaymentValue === 'saved'
            ? Number(savedPaymentSelect.value)
            : 0;

        if(selectedPaymentValue === 'saved' && !savedPaymentMethodId){
            alert('Choose a saved payment method or select another payment option.');
            return;
        }

        const paymentMethod = selectedPaymentValue === 'saved'
            ? 'saved'
            : selectedPaymentValue;


        /* =================================================
           GET CHECKOUT ITEMS
        ================================================= */

        const items = await refreshCheckoutItemsWithPrices();

if (!items.length) {
    alert('Your cart is empty.');
    return;
}


        if (
            !items ||
            items.length === 0
        ) {

            alert(
                'Your cart is empty.'
            );

            return;

        }


        /* =================================================
           CALCULATE SUBTOTAL
        ================================================= */

        
const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * getItemQuantity(item);
}, 0);

if (subtotal <= 0) {
    alert('Your cart total is invalid. Please return to your cart and try again.');
    return;
}



        /* =================================================
           SHIPPING
        ================================================= */

        /*
           Change this if your website
           uses a different shipping fee.
        */

        const shippingFee = 50;


        const totalAmount =
            subtotal +
            shippingFee;


        /* =================================================
           DISABLE BUTTON
        ================================================= */

        checkoutBtn.disabled =
            true;

        checkoutBtn.textContent =
            'Placing Order...';


        try {

        /* =================================================
        SEND ORDER TO DATABASE
        ================================================= */
const { data: { session }, error: sessionError } =
    await supabase.auth.getSession();

if (sessionError) {
    throw sessionError;
}

if (!session) {
    throw new Error(
        'Your sign-in session has expired. Please sign in again.'
    );
}

const authenticatedUserId = session.user.id;

console.log('Checkout auth session exists:', !!session);
console.log('Checkout auth user ID:', session?.user?.id);
console.log('Checkout local user ID:', userId);
console.log('Session error:', sessionError);
        const orderData = {
            user_id: authenticatedUserId,
            payment_method: paymentMethod,
            subtotal: subtotal,
            shipping_fee: shippingFee,
            total: totalAmount,
            address_id: savedCheckoutAddresses.some(
                address => String(address.address_id) === savedAddressSelect.value
            ) ? Number(savedAddressSelect.value) : null,
            notes: `Delivery to ${firstName} ${lastName}, ${address}, ${city}, ${province}, ${postalCode}. Phone: ${phone}. Saved payment method ID: ${savedPaymentMethodId || 'None'}.`
        };



        console.log(
            "SENDING ORDER DATA:",
            orderData
        );


// Create the order in Supabase.
const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select('id, order_number')
    .single();

if (orderError) throw orderError;

// Save the real Supabase order ID.
localStorage.setItem('lastOrderId', String(createdOrder.id));

// Save order items.

const orderItems = items.map(item => {
    const price = getItemPrice(item);
    const quantity = getItemQuantity(item);

    return {
        order_id: createdOrder.id,
        product_id: item.product_id ?? item.id ?? null,
        product_name: item.name || item.product_name || 'Product',
        unit_price: price,
        quantity: quantity,
        line_total: price * quantity
    };
});


const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

if (itemsError) {
    console.error('Order was created, but saving order items failed:', itemsError);
    throw new Error('Your order was created, but its items could not be saved. Please contact support before placing another order.');
}


try {
    const { data: { user: authUser } } =
        await supabase.auth.getUser();
console.log(
    'SIGNED-IN USER ID:',
    authUser?.id
);

console.log(
    'SIGNED-IN EMAIL:',
    authUser?.email
);

console.log(
    'EMAILJS RECIPIENT:',
    authUser?.email
);
    if (authUser?.email) {
        const emailItems = items.map(item =>
            `${item.name || item.product_name || 'Product'} x ${Number(item.quantity || 0)} — ₱${(Number(item.price) * Number(item.quantity || 0)).toFixed(2)}`
        ).join('\n');

        const emailResponse = await fetch(
            'https://api.emailjs.com/api/v1.0/email/send',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    service_id: 'service_ai9gzjz',
                    template_id: 'template_c2zl8s2',
                    user_id: '7UAkyBiNuMO3Hhj37',
                    template_params: {
                        email: authUser.email,
                        to_name: `${firstName} ${lastName}`,
                        status_message: 'We have received your order and are processing it.',
                        order_id: createdOrder.order_number || createdOrder.id,
                        order_status: 'Pending',
                        payment_method: paymentMethod,
                        total_amount: Number(totalAmount).toFixed(2),
                        items_list: emailItems
                    }
                })
            }
        );

        if (!emailResponse.ok) {
            console.error(
                'Order confirmation email could not be sent:',
                await emailResponse.text()
            );
        } else {
            console.log('Order confirmation email sent.');
        }
    }
} catch (emailError) {
    // Email failure must not prevent the order from continuing.
    console.error('Order confirmation email error:', emailError);
}


if (
    paymentMethod === 'gcash' ||
    paymentMethod === 'card' ||
    paymentMethod === 'saved'
) {
    
const { data: { user: authUser }, error: authError } =
    await supabase.auth.getUser();

if (authError || !authUser?.email) {
    throw new Error(
        'Unable to find your account email. Please sign in again.'
    );
}

const response = await fetch(
    `${API_BASE}/create-checkout.php`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: createdOrder.id,
            user_id: userId,
            payment_method: paymentMethod,
            customer_email: authUser.email,
            customer_name: `${firstName} ${lastName}`,
            customer_phone: phone
        })
    }
);


    const result = await response.json();

    if (!response.ok || !result.success || !result.checkout_url) {
        throw new Error(
            result.error || 'Unable to start PayMongo checkout.'
        );
    }

    // Keep the cart until payment has been handled.
    window.location.href = result.checkout_url;
    return;
}


/* Remove only purchased items from the signed-in user's cart. */
function getPurchasedProductKey(item) {
    return String(
        item.product_id ??
        item.productId ??
        item.id ??
        ''
    );
}

function getCartStorageKey() {
    const currentUser = JSON.parse(
        localStorage.getItem('loggedInUser') || 'null'
    );

    const currentUserId =
        localStorage.getItem('loggedInUserId') ||
        currentUser?.user_id ||
        currentUser?.id;

    return currentUserId
        ? `furryCornerCart:${currentUserId}`
        : 'cart';
}

const purchasedKeys = new Set(
    items.map(getPurchasedProductKey)
);

const cartStorageKey = getCartStorageKey();

let currentCart = [];

try {
    const parsedCart = JSON.parse(
        localStorage.getItem(cartStorageKey) || '[]'
    );

    currentCart = Array.isArray(parsedCart) ? parsedCart : [];
} catch (error) {
    console.error('Unable to read cart for cleanup:', error);
}

const remainingCart = currentCart.filter(item =>
    !purchasedKeys.has(getPurchasedProductKey(item))
);

localStorage.setItem(
    cartStorageKey,
    JSON.stringify(remainingCart)
);

// Keep the guest cart clean too if it contains the same purchased items.
if (cartStorageKey !== 'cart') {
    try {
        const guestCart = JSON.parse(
            localStorage.getItem('cart') || '[]'
        );

        if (Array.isArray(guestCart)) {
            localStorage.setItem(
                'cart',
                JSON.stringify(
                    guestCart.filter(item =>
                        !purchasedKeys.has(getPurchasedProductKey(item))
                    )
                )
            );
        }
    } catch (error) {
        console.warn('Unable to update guest cart:', error);
    }
}

localStorage.removeItem('checkoutItems');

window.dispatchEvent(new Event('cartUpdated'));

openSuccessModal();

       
        } catch (error) {
            console.error('Order error:', error);

            alert(
                error?.message ||
                'Unable to place your order. Please try again.'
            );
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Place Order';
        }


        checkoutBtn.disabled =
            false;

        checkoutBtn.textContent =
            'Place Order';

    }

);


/* =====================================================
   INITIALIZE ORDER TOTAL
===================================================== */

updateOrderTotal();
loadSavedCheckoutDetails();


;


  }
}
