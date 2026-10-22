// @ts-nocheck  (legacy script below is plain JavaScript carried over from notif.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './notif.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-notif',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class NotifPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of notif.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =====================================================
   NAVBAR SCROLL SHADOW
===================================================== */

const navbar =
    document.getElementById(
        'navbar'
    );

window.addEventListener('scroll', () => {

    if(window.scrollY > 4){

        navbar.classList.add('scrolled');

    }else{

        navbar.classList.remove('scrolled');

    }

});


/* =====================================================
   CART STORAGE
===================================================== */

/* =====================================================
   CART STORAGE — GUEST OR SIGNED-IN USER
===================================================== */

function getCart() {
    const userId = localStorage.getItem('loggedInUserId');
    const cartKey = userId ? `furryCornerCart:${userId}` : 'cart';

    try {
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error('Cart data could not be loaded:', error);
        return [];
    }
}

function saveCart(cart) {
    const userId = localStorage.getItem('loggedInUserId');
    const cartKey = userId ? `furryCornerCart:${userId}` : 'cart';

    localStorage.setItem(cartKey, JSON.stringify(cart));
}

function getCartItemId(item) {
    return String(
        item.id ??
        item.product_id ??
        item.productId ??
        item.service_id ??
        item.serviceId ??
        ''
    );
}

/* =====================================================
   PESO FORMAT
===================================================== */

function peso(number){

    return '₱' +
        Number(number).toLocaleString(
            'en-PH',
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        );

}


/* =====================================================
   CART BADGE
===================================================== */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    const cart = getCart();
    const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    badge.textContent = String(totalItems);
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

/* =====================================================
   CART DRAWER
===================================================== */

const cartDrawer =
    document.getElementById(
        'cartDrawer'
    );


const cartOverlay =
    document.getElementById(
        'cartOverlay'
    );


const cartClose =
    document.getElementById(
        'cartClose'
    );


const cartEdit =
    document.getElementById(
        'cartEdit'
    );


const cartDrawerBody =
    document.getElementById(
        'cartDrawerBody'
    );


const drawerTotal =
    document.getElementById(
        'drawerTotal'
    );


const checkoutBtn =
    document.getElementById(
        'checkoutBtn'
    );


const selectAllCheckbox =
    document.getElementById(
        'selectAllCheckbox'
    );


const deleteSelectedBtn =
    document.getElementById(
        'deleteSelectedBtn'
    );


const cartToggle =
    document.getElementById(
        'cartToggle'
    );


let cartEditMode = false;

let selectedCartItems =
    new Set();


/* =====================================================
   OPEN CART
===================================================== */

function openCartDrawer(){

    renderCartDrawer();

    cartDrawer.classList.add(
        'open'
    );

    cartOverlay.classList.add(
        'open'
    );

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCartDrawer(){

    cartDrawer.classList.remove(
        'open'
    );

    cartOverlay.classList.remove(
        'open'
    );


    cartEditMode = false;

    selectedCartItems.clear();


    cartDrawer.classList.remove(
        'edit-mode'
    );


    cartEdit.textContent =
        'Edit';


    selectAllCheckbox.checked =
        false;


    selectAllCheckbox.indeterminate =
        false;


    deleteSelectedBtn.disabled =
        true;

}


/* =====================================================
   CART TOGGLE
===================================================== */

cartToggle.addEventListener(
    'click',
    openCartDrawer
);


cartClose.addEventListener(
    'click',
    closeCartDrawer
);


cartOverlay.addEventListener(
    'click',
    closeCartDrawer
);


/* =====================================================
   EDIT MODE
===================================================== */

cartEdit.addEventListener(
    'click',
    () => {

        const cart =
            getCart();


        if(cart.length === 0){

            return;

        }


        cartEditMode =
            !cartEditMode;


        if(cartEditMode){

            cartDrawer.classList.add(
                'edit-mode'
            );


            cartEdit.textContent =
                'Done';

        }else{

            cartDrawer.classList.remove(
                'edit-mode'
            );


            cartEdit.textContent =
                'Edit';


            selectedCartItems.clear();


            selectAllCheckbox.checked =
                false;


            selectAllCheckbox.indeterminate =
                false;


            deleteSelectedBtn.disabled =
                true;

        }


        renderCartDrawer();

    }
);


/* =====================================================
   SELECT ALL
===================================================== */

selectAllCheckbox.addEventListener(
    'change',
    () => {

        const cart =
            getCart();


        if(
            cart.length === 0
        ){

            return;

        }


        if(
            selectAllCheckbox.checked
        ){

            cart.forEach(item => {

                selectedCartItems.add(getCartItemId(item));

            });

        }else{

            selectedCartItems.clear();

        }


        renderCartDrawer();

    }
);


/* =====================================================
   UPDATE SELECT ALL
===================================================== */

function updateSelectAllCheckbox(){

    const cart =
        getCart();


    if(cart.length === 0){

        selectAllCheckbox.checked =
            false;

        selectAllCheckbox.indeterminate =
            false;

        return;

    }


    const allSelected =
        cart.every(
            item =>
                selectedCartItems.has(
                    getCartItemId(item)
                )
        );


    const someSelected =
        cart.some(
            item =>
                selectedCartItems.has(
                    getCartItemId(item)
                )
        );


    selectAllCheckbox.checked =
        allSelected;


    selectAllCheckbox.indeterminate =
        someSelected &&
        !allSelected;

}


/* =====================================================
   UPDATE DELETE BUTTON & TOTAL DISPLAY
===================================================== */

function updateSelectedCartTotal() {
    const cart = getCart();

    const selectedItems = cart.filter(item =>
        selectedCartItems.has(getCartItemId(item))
    );

    deleteSelectedBtn.disabled = selectedItems.length === 0;

    let total = 0;

    selectedItems.forEach(item => {
        total += Number(item.price || 0) *
                 Number(item.quantity || 1);
    });

    drawerTotal.textContent = peso(total);

    updateSelectAllCheckbox();
}

/* =====================================================
   ITEM CHECKBOX
===================================================== */

cartDrawerBody.addEventListener(
    'change',
    event => {

        if(
            !event.target.classList.contains(
                'drawer-item-checkbox'
            )
        ){

            return;

        }


        const id =
            String(
                event.target.dataset.id
            );


        if(
            event.target.checked
        ){

            selectedCartItems.add(id);

        }else{

            selectedCartItems.delete(id);

        }


        updateSelectedCartTotal();

    }
);


/* =====================================================
   QUANTITY BUTTONS
===================================================== */

cartDrawerBody.addEventListener(
    'click',
    event => {

        const minusBtn =
            event.target.closest(
                '.qty-btn.minus'
            );


        const plusBtn =
            event.target.closest(
                '.qty-btn.plus'
            );


        if(
            !minusBtn &&
            !plusBtn
        ){

            return;

        }


        const id =
            Number(
                minusBtn
                    ? minusBtn.dataset.id
                    : plusBtn.dataset.id
            );


        let cart =
            getCart();


        const itemIndex =
            cart.findIndex(
                item =>
                    Number(item.id) === id
            );


        if(itemIndex === -1){

            return;

        }


        /* DECREASE */
        if(minusBtn){
            const currentQuantity = Number(cart[itemIndex].quantity || 1);

            if(currentQuantity > 1){
                cart[itemIndex].quantity = currentQuantity - 1;
            } else {
                // Quantity reached 0, delete the item entirely
                cart.splice(itemIndex, 1);
                
                // Also remove from selected items if it was checked
                selectedCartItems.delete(String(id));
            }
        }


        /* INCREASE */
        if(plusBtn){
            cart[itemIndex].quantity = Number(cart[itemIndex].quantity || 0) + 1;
        }


        saveCart(cart);
        updateCartBadge();
        renderCartDrawer();

    }
);

/* =====================================================
   DELETE SELECTED
===================================================== */

deleteSelectedBtn.addEventListener('click', () => {
    const selectedIds = new Set(
        [...selectedCartItems].map(String)
    );

    if (selectedIds.size === 0) {
        console.log('No cart items selected.');
        return;
    }

    if (!window.confirm(
        'Are you sure you want to delete the selected items?'
    )) {
        return;
    }

    const cart = getCart();

    const updatedCart = cart.filter(item =>
        !selectedIds.has(getCartItemId(item))
    );

    console.log('Cart before deletion:', cart);
    console.log('Selected IDs:', [...selectedIds]);
    console.log('Cart after deletion:', updatedCart);

    saveCart(updatedCart);
    selectedCartItems.clear();

    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;

    updateCartBadge();
    renderCartDrawer();
});

/* =====================================================
   CHECKOUT
===================================================== */

function goToCheckout(items){

    if(
        !items ||
        items.length === 0
    ){

        return;

    }


    localStorage.setItem(
        'checkoutItems',
        JSON.stringify(items)
    );


    location.href =
        'checkout.html';

}


checkoutBtn.addEventListener(
    'click',
    () => {
        const cart = getCart();

        // Filter to only selected items if any are explicitly selected
        const selectedItems = cart.filter(item => 
            selectedCartItems.has(String(item.id))
        );

        // If user selected specific items, checkout those. Otherwise, checkout the whole cart.
        const itemsToCheckout = selectedItems.length > 0 ? selectedItems : cart;

        goToCheckout(itemsToCheckout);
    }
);


/* =====================================================
   RENDER CART
===================================================== */

function renderCartDrawer(){

    const cart =
        getCart();


    /*
     * Remove selections for products
     * that no longer exist.
     */

    const cartIds =
        new Set(
            cart.map(
                item =>
                    getCartItemId(item)
            )
        );


    selectedCartItems =
        new Set(
            [...selectedCartItems]
                .filter(
                    id =>
                        cartIds.has(id)
                )
        );


    /* EMPTY CART */

    if(cart.length === 0){

        cartEditMode = false;


        cartDrawer.classList.remove(
            'edit-mode'
        );


        cartEdit.textContent =
            'Edit';


        cartDrawerBody.innerHTML = `

            <div class="drawer-empty">

                <h3>
                    Your cart is empty
                </h3>


                <p>
                    Add some products to your
                    cart to see them here.
                </p>

            </div>

        `;


        drawerTotal.textContent =
            '₱0.00';


        checkoutBtn.disabled =
            true;


        cartEdit.disabled =
            true;


        cartEdit.style.opacity =
            '.5';


        selectAllCheckbox.checked =
            false;


        selectAllCheckbox.indeterminate =
            false;


        deleteSelectedBtn.disabled =
            true;


        return;

    }


    /* CART HAS ITEMS */

    cartEdit.disabled =
        false;


    cartEdit.style.opacity =
        '1';


    cartDrawerBody.innerHTML =

        cart.map(item => {

            const isChecked =
                selectedCartItems.has(
                    getCartItemId(item)
                );


            return `

                <div
                    class="drawer-cart-item"
                    data-id="${item.id}">


                    <input
                        type="checkbox"
                        class="drawer-item-checkbox"
                        data-id="${item.id}"
                        ${isChecked ? 'checked' : ''}>


                    
<img
    src="${item.image_url || item.image || item.imageUrl || item.product_image || `images/product-${item.id}.png`}"
    alt="${item.name}"
    onerror="this.onerror=null; this.src='images/product-${item.id}.png';">



                    <div class="drawer-item-info">

                        <div class="drawer-item-name">

                            ${item.name}

                        </div>


                        <div class="drawer-item-price">

                            ${peso(item.price)}

                        </div>

                    </div>


                    <div class="drawer-item-actions">

                        <div
                            class="drawer-item-qty-control">


                            <button
                                type="button"
                                class="qty-btn minus"
                                data-id="${item.id}"
                                aria-label="Decrease quantity">

                                −

                            </button>


                            <span class="qty-val">

                                ${Number(item.quantity || 1)}

                            </span>


                            <button
                                type="button"
                                class="qty-btn plus"
                                data-id="${item.id}"
                                aria-label="Increase quantity">

                                +

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join('');


    /* TOTAL - BASED ON SELECTED ITEMS */
const selectedItems = cart.filter(item =>
    selectedCartItems.has(getCartItemId(item))
);

const total = selectedItems.reduce(
    (sum, item) =>
        sum + Number(item.price || 0) *
              Number(item.quantity || 1),
    0
);

drawerTotal.textContent = peso(total);


    checkoutBtn.disabled =
        cart.length === 0;


    /* EDIT MODE */

    if(cartEditMode){

        cartDrawer.classList.add(
            'edit-mode'
        );


        cartEdit.textContent =
            'Done';


        updateSelectedCartTotal();

    }else{

        cartDrawer.classList.remove(
            'edit-mode'
        );


        cartEdit.textContent =
            'Edit';


        deleteSelectedBtn.disabled =
            true;

    }

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

/* =====================================================
   NOTIFICATIONS — LOCAL ONLY
===================================================== */

const notificationUserId =
    window.FurryCornerAuth?.userId ?? null;

const notificationStorageKey = notificationUserId
    ? `furrycornerNotificationRead:${notificationUserId}`
    : 'furrycornerNotificationRead:guest';

let notifications = [];

function persistNotificationReadState() {
    try {
        const readState = Object.fromEntries(
            notifications.map(item => [item.id, item.read])
        );

        localStorage.setItem(
            notificationStorageKey,
            JSON.stringify(readState)
        );
    } catch (error) {
        console.error('Could not save notification read state:', error);
    }
}



async function loadNotifications() {
    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            notifications = [];
            renderNotifications();
            return;
        }

        const storageKey =
            `furrycornerNotificationRead:${user.id}`;

        let savedReadState = {};

        try {
            savedReadState = JSON.parse(
                localStorage.getItem(storageKey) || '{}'
            );
        } catch {
            savedReadState = {};
        }

        // Fetch saved notifications, orders, and bookings together.
        const [
            notificationResult,
            orderResult,
            bookingResult
        ] = await Promise.all([
            supabase
                .from('notifications')
                .select(`
                    id,
                    title,
                    message,
                    notification_type,
                    is_read,
                    related_order_id,
                    created_at
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),

            supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    status,
                    payment_status,
                    payment_method,
                    created_at
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),

            supabase
                .from('bookings')
                .select(`
                    id,
                    pet_name,
                    booking_date,
                    booking_time,
                    status,
                    price,
                    created_at
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
        ]);

        if (notificationResult.error) {
            throw notificationResult.error;
        }

        if (orderResult.error) {
            throw orderResult.error;
        }

        if (bookingResult.error) {
            throw bookingResult.error;
        }

        const savedNotifications =
    (notificationResult.data || []).map(item => {
        const raw = String(item.notification_type || '').toLowerCase();

        let iconType = 'booking';
        let category = 'Notification';

        if (raw.includes('order'))        { iconType = 'payment'; category = 'Order'; }
        else if (raw.includes('payment')) { iconType = 'payment'; category = 'Payment'; }
        else if (raw.includes('booking')) { iconType = 'booking'; category = 'Booking'; }
        else if (raw.includes('contact')) { iconType = 'message'; category = 'Message'; }

        return {
            id: `db-${item.id}`,
            title: item.title,
            message: item.message || '',
            type: iconType,
            category,
            time: new Date(item.created_at).toLocaleString('en-PH', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }),
            createdAt: item.created_at,
            read: item.is_read,
            source: 'database',
            dbId: item.id,
            relatedOrderId: item.related_order_id
        };
    });
        const orderNotifications =
            (orderResult.data || []).map(order => {
                const id = `order-${order.id}`;
                const orderLabel =
                    order.order_number || order.id;

                return {
                    id,
                    title: `Order #${orderLabel}`,
                    message:
                        `Order status: ${order.status}. ` +
                        `Payment status: ${order.payment_status}.`,
                    type: 'payment',
                    category: 'Order',
                    time: new Date(order.created_at).toLocaleString(
                        'en-PH',
                        {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        }
                    ),
                    createdAt: order.created_at,
                    read: Boolean(savedReadState[id]),
                    source: 'order',
                    dbId: null,
                    relatedOrderId: order.id
                };
            });

        const bookingNotifications =
            (bookingResult.data || []).map(booking => {
                const id = `booking-${booking.id}`;

                const date = booking.booking_date
                    ? new Date(
                        `${booking.booking_date}T00:00:00`
                    ).toLocaleDateString('en-PH', {
                        dateStyle: 'medium'
                    })
                    : 'Date not available';

                const time = booking.booking_time
                    ? String(booking.booking_time).slice(0, 5)
                    : '';

                return {
                    id,
                    title: `Service Booking #${booking.id}`,
                    message:
                        `${booking.pet_name || 'Your pet'} — ` +
                        `${booking.status}. Appointment: ${date}` +
                        (time ? ` at ${time}.` : '.'),
                    type: 'booking',
                    category: 'Booking',
                    time: new Date(booking.created_at).toLocaleString(
                        'en-PH',
                        {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        }
                    ),
                    createdAt: booking.created_at,
                    read: Boolean(savedReadState[id]),
                    source: 'booking',
                    dbId: null,
                    relatedOrderId: null
                };
            });

        // Show all three sources, newest first.
        notifications = [
            ...savedNotifications,
            ...orderNotifications,
            ...bookingNotifications
        ].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

        renderNotifications();

        console.log('Notifications loaded:', {
            saved: savedNotifications.length,
            orders: orderNotifications.length,
            bookings: bookingNotifications.length
        });

    } catch (error) {
        console.error('Notification loading error:', error);
        notifications = [];
        renderNotifications();
    }
}




let activeFilter = 'all';


const notifList =
    document.getElementById(
        'notifList'
    );


const notifBadge =
    document.getElementById(
        'bottomNotifBadge'
    );


const notifIcons = {

    payment:`

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2">
            </rect>


            <line
                x1="2"
                y1="10"
                x2="22"
                y2="10">
            </line>

        </svg>

    `,


    booking:`

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2">
            </rect>


            <line
                x1="16"
                y1="2"
                x2="16"
                y2="6">
            </line>


            <line
                x1="8"
                y1="2"
                x2="8"
                y2="6">
            </line>


            <line
                x1="3"
                y1="10"
                x2="21"
                y2="10">
            </line>

        </svg>

    `,

        message: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
        </svg>
    `

};


function renderNotifications(){

    const unread =
        notifications.filter(
            item =>
                !item.read
        ).length;
    
        console.log('Unread count:', unread, notifications);

    if(unread > 0){

        notifBadge.textContent =
            unread;


        notifBadge.style.display =
            'flex';

    }else{

        notifBadge.style.display =
            'none';

    }
    console.log(
    'Badge element:',
    notifBadge,
    'Display:',
    notifBadge.style.display,
    'Text:',
    notifBadge.textContent
);


    
document.getElementById('tabCountAll').textContent =
    notifications.length;

document.getElementById('tabCountUnread').textContent =
    notifications.filter(item => !item.read).length;

document.getElementById('tabCountRead').textContent =
    notifications.filter(item => item.read).length;



    const visible =
        notifications.filter(item => {

            if(activeFilter === 'unread')
                return !item.read;

            if(activeFilter === 'read')
                return item.read;

            return true;

        });


    notifList.innerHTML =

        visible.length

            ?

        visible.map(item => `

            <div
                class="notif-item ${item.read ? '' : 'unread'}"
                data-id="${item.id}">


                <div class="notif-icon ${item.type === 'message' ? 'booking' : item.type}">

                    ${notifIcons[item.type]}

                </div>


                <div class="notif-body">

                    <div class="notif-title">

                        ${item.title}

                    </div>


                    <div class="notif-meta">

                        <span>${item.time}</span>

                        <span class="dot-sep"></span>

                        <span>${item.category}</span>

                    </div>

                </div>


                ${
                    item.read
                        ? ''
                        : '<div class="notif-unread-dot"></div>'
                }

            </div>

        `).join('')

            :

        `

            <div class="notif-empty">

                ${
                    activeFilter === 'unread'
                        ? "You're all caught up"
                        : activeFilter === 'read'
                            ? 'No read notifications yet'
                            : 'No notifications yet'
                }

            </div>

        `;

}


/* =====================================================
   FILTER TABS
===================================================== */

document
    .getElementById(
        'notifTabs'
    )
    .addEventListener(
        'click',
        event => {

            const tab =
                event.target.closest(
                    '.notif-tab'
                );


            if(!tab)
                return;


            document
                .querySelectorAll(
                    '.notif-tab'
                )
                .forEach(
                    el =>
                        el.classList.remove('active')
                );


            tab.classList.add('active');


            activeFilter =
                tab.dataset.filter;


            renderNotifications();

        }
    );



/* MARK ALL READ */

document
    .getElementById('notifMarkAllRead')
    .addEventListener('click', async () => {
        try {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError) throw authError;
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            notifications.forEach(item => {
                item.read = true;
            });

            const storageKey =
                `furrycornerNotificationRead:${user.id}`;

            const readState = {};

            notifications
                .filter(item =>
                    item.source === 'order' ||
                    item.source === 'booking'
                )
                .forEach(item => {
                    readState[item.id] = true;
                });

            localStorage.setItem(
                storageKey,
                JSON.stringify(readState)
            );

            renderNotifications();

        } catch (error) {
            console.error(
                'Mark all notifications as read failed:',
                error
            );
        }
    });


/* INDIVIDUAL NOTIFICATION */

notifList.addEventListener('click', async event => {
    const element = event.target.closest('.notif-item');

    if (!element) return;

    const notification = notifications.find(
        item => item.id === element.dataset.id
    );

    if (!notification || notification.read) return;

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        if (notification.source === 'database') {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.dbId)
                .eq('user_id', user.id);

            if (error) throw error;
        } else {
            const storageKey =
                `furrycornerNotificationRead:${user.id}`;

            let readState = {};

            try {
                readState = JSON.parse(
                    localStorage.getItem(storageKey) || '{}'
                );
            } catch {
                readState = {};
            }

            readState[notification.id] = true;

            localStorage.setItem(
                storageKey,
                JSON.stringify(readState)
            );
        }

        notification.read = true;
        renderNotifications();

    } catch (error) {
        console.error(
            'Mark notification as read failed:',
            error
        );
    }
});


/* =====================================================
   INITIALIZE
===================================================== */

loadNotifications();

updateCartBadge();


;


  }
}