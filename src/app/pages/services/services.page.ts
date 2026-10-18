// @ts-nocheck  (legacy script below is plain JavaScript carried over from services.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './services.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-services',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class ServicesPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of services.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {


/* =====================================================
   NAVBAR SCROLL
===================================================== */

const navbar =
    document.getElementById('navbar');

window.addEventListener('scroll', () => {

    navbar.classList.toggle(
        'scrolled',
        window.scrollY > 10
    );

});

/* =====================================================
   SEARCH
===================================================== */

const searchInput =
    document.getElementById('searchInput');

let searchQuery = '';

searchInput.addEventListener('input', () => {

    searchQuery =
        searchInput.value.trim().toLowerCase();

    renderServiceGrids();

});

/* =====================================================
   CART
===================================================== */

function getCart(){

    return JSON.parse(
        localStorage.getItem('cart')
    ) || [];

}

/* =====================================================
   PESO FORMAT
===================================================== */

function peso(number){

    return '₱' +
        Number(number).toLocaleString(
            'en-PH',
            {
                minimumFractionDigits:2
            }
        );

}

/* =====================================================
   CART DRAWER
===================================================== */

const cartDrawer =
    document.getElementById('cartDrawer');

const cartOverlay =
    document.getElementById('cartOverlay');

const cartClose =
    document.getElementById('cartClose');

const cartDrawerBody =
    document.getElementById('cartDrawerBody');

const drawerTotal =
    document.getElementById('drawerTotal');

function openCartDrawer(){

    renderCartDrawer();

    cartDrawer.classList.add('open');

    cartOverlay.classList.add('open');

}

function closeCartDrawer(){

    cartDrawer.classList.remove('open');

    cartOverlay.classList.remove('open');

}

cartClose.addEventListener(
    'click',
    closeCartDrawer
);

cartOverlay.addEventListener(
    'click',
    closeCartDrawer
);

/* =====================================================
   RENDER CART
===================================================== */

function renderCartDrawer(){

    const cart = getCart();

    if(cart.length === 0){

        cartDrawerBody.innerHTML = `

            <div class="drawer-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products to your cart to see them here.
                </p>

            </div>

        `;

        drawerTotal.textContent =
            '₱0.00';

        return;

    }

    let total = 0;

    cartDrawerBody.innerHTML =
        cart.map(item => {

            total +=
                Number(item.price) *
                Number(item.quantity);

            return `

                <div class="drawer-cart-item">

                    
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

                        <div class="drawer-item-quantity">
                            Quantity: ${item.quantity}
                        </div>

                    </div>

                </div>

            `;

        }).join('');

    drawerTotal.textContent =
        peso(total);

}

/* =====================================================
   SERVICES DATA FROM DATABASE
===================================================== */

let services = [];


/* =====================================================
   LOAD SERVICES
===================================================== */

async function loadServices() {
    const container = document.getElementById('serviceGridContainer');

    function showError(message) {
        if (!container) return;

        container.innerHTML = `
            <div class="services-error">
                <p>Unable to load services.</p>
                <small>${message}</small>
                <button type="button" class="retry-button" id="retryServices">
                    Try again
                </button>
            </div>
        `;

        document.getElementById('retryServices')?.addEventListener('click', () => {
            container.innerHTML = `
                <div class="services-error">
                    <p>Loading services...</p>
                </div>
            `;
            loadServices();
        });
    }

    try {
        const { data, error } = await supabase
            .from('services')
            .select(`
                id,
                name,
                description,
                category,
                price,
                price_label,
                duration_minutes,
                duration_label,
                image_url
            `)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        console.log('Services from Supabase:', data);

        services = (data || []).map(service => ({
            id: String(service.id),
            name: service.name,
            category: service.category || 'Other',
            description: service.description || '',
            price: service.price_label || peso(service.price),
            duration: service.duration_label ||
                (service.duration_minutes != null
                    ? `${service.duration_minutes} min`
                    : 'Varies'),
            image: service.image_url || 'images/service-placeholder.jpg'
        }));

        renderServiceGrids();

    } catch (error) {
        console.error('Service loading error:', error);
        showError(error?.message || 'Please check your Supabase connection and services table.');
    }
}

const CATEGORIES = [
    'All',
    'Grooming',
    'Care',
    'Boarding'
];

const serviceGridContainer =
    document.getElementById(
        'serviceGridContainer'
    );

const tabBar =
    document.getElementById('tabBar');

let activeCategory = 'All';

/* =====================================================
   RENDER SERVICES
===================================================== */

function renderServiceGrids(){

    serviceGridContainer.innerHTML =

        CATEGORIES.map(category => {

            const items =
                services.filter(service => {

                    const matchesCategory =
                        category === 'All' ||
                        service.category === category;

                    const matchesSearch =
                        service.name
                            .toLowerCase()
                            .includes(searchQuery);

                    return (
                        matchesCategory &&
                        matchesSearch
                    );

                });

            return `

                <div
                    class="services-grid ${
                        category === activeCategory
                            ? ''
                            : 'hidden'
                    }"
                    data-category-grid="${category}"
                >

                    ${
                        items.length
                        ?

                        items.map(service => `

                            <article class="service-card">

                                <div class="service-image">

                                    <img
                                        src="${service.image}"
                                        alt="${service.name}"
                                    >

                                </div>

                                <div class="service-body">

                                    <div class="service-info">

                                        <div class="service-name">
                                            ${service.name}
                                        </div>

                                        <div class="service-meta">

                                            <span>
                                                Duration: ${service.duration}
                                            </span>

                                            <span>
                                                ${service.price}
                                            </span>

                                        </div>

                                    </div>

                                    <button
                                        class="book-btn"
                                        data-auth-required
                                        data-auth-return="services.html"
                                        data-service-id="${service.id}"
                                    >
                                        Book Now
                                    </button>

                                </div>

                            </article>

                        `).join('')

                        :

                        `

                        <p
                            style="
                                grid-column:1/-1;
                                text-align:center;
                                font-weight:bold;
                                padding:30px;
                            "
                        >
                            No services found.
                        </p>

                        `

                    }

                </div>

            `;

        }).join('');

}

loadServices();

/* =====================================================
   CATEGORY FILTER
===================================================== */

tabBar.addEventListener(
    'click',
    event => {

        const btn =
            event.target.closest('.tab-btn');

        if(!btn) return;

        document
            .querySelectorAll('.tab-btn')
            .forEach(button => {

                button.classList.remove(
                    'active'
                );

            });

        btn.classList.add('active');

        activeCategory =
            btn.dataset.category;

        renderServiceGrids();

    }
);

/* =====================================================
   BOOKING MODAL
===================================================== */

const bookingBackdrop =
    document.getElementById(
        'bookingBackdrop'
    );

const bookingModal =
    document.getElementById(
        'bookingModal'
    );

let selectedTime = '';

function todayISO(){

    const d = new Date();

    return d
        .toISOString()
        .split('T')[0];

}

function renderBookingForm(service){

    selectedTime = '';
    let savedAddresses = [];
    let selectedAddress = null;

    bookingModal.innerHTML = `

        <div class="booking-header">

            <div class="booking-service-info">

                <div class="booking-service-thumb">

                    <img
                        src="${service.image}"
                        alt="${service.name}"
                    >

                </div>

                <div>

                    <div class="booking-service-name">
                        ${service.name}
                    </div>

                    <div class="booking-service-price">
                        ${service.price}
                    </div>

                </div>

            </div>

            <button
                class="booking-close"
                id="bookingCloseBtn"
                aria-label="Close"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >

                    <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                    />

                    <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                    />

                </svg>

            </button>

        </div>

        <label class="booking-label">
            Pet name
        </label>

        <input
            class="booking-field"
            type="text"
            id="petNameField"
            placeholder="e.g. Bella"
        >

        <label class="booking-label">
            Choose a date
        </label>

        <input
            class="booking-field"
            type="date"
            id="bookingDateField"
            min="${todayISO()}"
        >

        <label class="booking-label">
            Choose a time
        </label>

        <div
            class="time-slots"
            id="timeSlots"
        >

            <button
                class="time-slot"
                data-time="9:00 AM"
                type="button"
            >
                9:00 AM
            </button>

            <button
                class="time-slot"
                data-time="11:00 AM"
                type="button"
            >
                11:00 AM
            </button>

            <button
                class="time-slot"
                data-time="1:00 PM"
                type="button"
            >
                1:00 PM
            </button>

            <button
                class="time-slot"
                data-time="3:00 PM"
                type="button"
            >
                3:00 PM
            </button>

            <button
                class="time-slot"
                data-time="5:00 PM"
                type="button"
            >
                5:00 PM
            </button>

            <button
                class="time-slot"
                data-time="7:00 PM"
                type="button"
            >
                7:00 PM
            </button>

        </div>

        <label class="booking-label" for="bookingAddressSelect">
            Service location
        </label>

        <select class="booking-field" id="bookingAddressSelect" disabled>
            <option value="">Loading saved addresses...</option>
        </select>

        <div class="booking-address-detail" id="bookingAddressDetail" aria-live="polite">
            Choose the address where this service will take place.
        </div>

        <label class="booking-address-confirm">
            <input type="checkbox" id="confirmServiceAddress" disabled>
            <span>I confirm this is the current address for the service.</span>
        </label>

        <a class="booking-address-link" href="my-addresses.html">Manage saved addresses</a>

        <button
            class="booking-submit"
            id="confirmBookingBtn"
            type="button"
            disabled
        >
            Confirm Booking
        </button>

        <div class="booking-note-text">
            You'll receive a confirmation once your booking is reviewed.
        </div>

    `;

    const dateField =
        document.getElementById(
            'bookingDateField'
        );

    const petNameField =
        document.getElementById(
            'petNameField'
        );

    const confirmBtn =
        document.getElementById(
            'confirmBookingBtn'
        );

    const timeSlots =
        document.getElementById(
            'timeSlots'
        );

    const bookingAddressSelect = document.getElementById('bookingAddressSelect');
    const bookingAddressDetail = document.getElementById('bookingAddressDetail');
    const confirmServiceAddress = document.getElementById('confirmServiceAddress');

    function validate(){

        confirmBtn.disabled = !(
            petNameField.value.trim() &&
            dateField.value &&
            selectedTime &&
            selectedAddress &&
            confirmServiceAddress.checked
        );

    }

    petNameField.addEventListener(
        'input',
        validate
    );

    dateField.addEventListener(
        'change',
        validate
    );

    timeSlots.addEventListener(
        'click',
        event => {

            const slot =
                event.target.closest(
                    '.time-slot'
                );

            if(!slot) return;

            timeSlots
                .querySelectorAll('.time-slot')
                .forEach(button => {

                    button.classList.remove(
                        'active'
                    );

                });

            slot.classList.add('active');

            selectedTime =
                slot.dataset.time;

            validate();

        }
    );

    
bookingAddressSelect.addEventListener('change', () => {
    selectedAddress = savedAddresses.find(
        address => String(address.id) === bookingAddressSelect.value
    ) || null;

    confirmServiceAddress.checked = false;
    confirmServiceAddress.disabled = !selectedAddress;

    if (selectedAddress) {
        bookingAddressDetail.textContent = [
            selectedAddress.address_line,
            selectedAddress.barangay,
            selectedAddress.city,
            selectedAddress.province,
            selectedAddress.postal_code,
            selectedAddress.phone
        ].filter(Boolean).join(', ');
    } else {
        bookingAddressDetail.textContent =
            'Choose a saved service address.';
    }

    validate();
});

    confirmServiceAddress.addEventListener('change', validate);

async function loadBookingAddresses() {
    try {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            bookingAddressSelect.replaceChildren(
                new Option('Please sign in first', '')
            );
            bookingAddressSelect.disabled = true;
            confirmServiceAddress.disabled = true;

            bookingAddressDetail.textContent =
                'Sign in and save an address before requesting a service booking.';

            return;
        }

        const { data: addresses, error } = await supabase
            .from('user_addresses')
            .select(`
                id,
                label,
                recipient_name,
                phone,
                address_line,
                barangay,
                city,
                province,
                postal_code,
                is_default
            `)
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        savedAddresses = addresses || [];
        bookingAddressSelect.replaceChildren();

        if (savedAddresses.length === 0) {
            bookingAddressSelect.add(
                new Option('No saved addresses', '')
            );
            bookingAddressSelect.disabled = true;
            confirmServiceAddress.disabled = true;

            bookingAddressDetail.textContent =
                'Add an address before requesting a service booking.';

            validate();
            return;
        }

        savedAddresses.forEach(address => {
            const label = address.label || 'Saved address';
            const city = address.city || '';
            bookingAddressSelect.add(
                new Option(
                    `${label} · ${city}`,
                    String(address.id)
                )
            );
        });

        bookingAddressSelect.disabled = false;

        selectedAddress =
            savedAddresses.find(address => address.is_default) ||
            savedAddresses[0];

        bookingAddressSelect.value = String(selectedAddress.id);
        confirmServiceAddress.disabled = false;
        confirmServiceAddress.checked = false;

        function formatAddress(address) {
            return [
                address.address_line,
                address.barangay,
                address.city,
                address.province,
                address.postal_code
            ].filter(Boolean).join(', ');
        }

        bookingAddressDetail.textContent =
            `${formatAddress(selectedAddress)} · ${selectedAddress.phone || ''}`;

        validate();

    } catch (error) {
        console.error('Unable to load booking addresses:', error);

        bookingAddressSelect.replaceChildren(
            new Option('Address unavailable', '')
        );
        bookingAddressSelect.disabled = true;
        confirmServiceAddress.disabled = true;

        bookingAddressDetail.textContent =
            'Saved addresses could not be loaded. Please try again.';

        validate();
    }
}

    loadBookingAddresses();

    document
        .getElementById(
            'bookingCloseBtn'
        )
        .addEventListener(
            'click',
            closeBooking
        );
confirmBtn.addEventListener(
    'click',
    async () => {

        /* =========================================
           GET LOGGED-IN USER
        ========================================= */

        const loggedUser =
            JSON.parse(
                localStorage.getItem(
                    'loggedInUser'
                )
            );

        console.log(
            'Logged-in user for booking:',
            loggedUser
        );


        if(!loggedUser){
            window.FurryCornerAuth.promptForSignIn(location.href);
            return;

        }


        const userId =
            loggedUser.user_id ||
            loggedUser.id;

        if (!userId) {
            alert(
                'Unable to identify your logged-in account.'
            );
            return;
        }


        /* =========================================
           GET BOOKING INFORMATION
        ========================================= */

        const petName =
            petNameField.value.trim();

        const bookingDate =
            dateField.value;

        const bookingTime =
            selectedTime;


        /* =========================================
           CUSTOMER INFORMATION
        ========================================= */

        const customerName =
            (
                loggedUser.firstName ||
                ''
            ) +
            ' ' +
            (
                loggedUser.lastName ||
                ''
            );


        const customerContact =
            loggedUser.email ||
            '';


        /* =========================================
           BOOKING DATA
        ========================================= */
console.log('SELECTED BOOKING TIME:', bookingTime);
        const bookingData = {

            user_id:
                userId,

            service_id:
                Number(
                    service.id.replace(
                        /\D/g,
                        ''
                    )
                ),

            pet_name:
                petName,

            customer_name:
                customerName.trim(),

            customer_contact:
                customerContact,

            booking_date:
                bookingDate,

            booking_time: (() => {
  const match = bookingTime.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) {
    throw new Error('Invalid selected booking time: ' + bookingTime);
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'AM' && hours === 12) {
    hours = 0;
  } else if (period === 'PM' && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
})(),

            address_id: Number(selectedAddress.id)

        };


        console.log(
            'SENDING BOOKING DATA:',
            bookingData
        );


        /* =========================================
           DISABLE BUTTON
        ========================================= */

        confirmBtn.disabled =
            true;

        confirmBtn.textContent =
            'Booking...';


        try {

            /* =====================================
               SEND TO DATABASE
            ===================================== */

            const response =
                await fetch(
                    window.FURRY_API + '/createBooking.php',
                    {
                        method:'POST',

                        headers:{
                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                bookingData
                            )
                    }
                );


            const responseText =
                await response.text();


            console.log(
                'RAW BOOKING RESPONSE:',
                responseText
            );


            let data;

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch(error){

                console.error(
                    'Invalid server response:',
                    responseText
                );

                throw new Error(
                    'Invalid server response'
                );

            }


            console.log(
                'createBooking.php response:',
                data
            );


            /* =====================================
               SUCCESS
            ===================================== */

            if (data.success) {
                console.log(
                    'Booking created:',
                    data.booking?.id
                );

                renderConfirmation(
                    service,
                    petName,
                    bookingDate,
                    bookingTime,
                    selectedAddress
                );
            } else {
                alert(
                    data.error ||
                    data.message ||
                    'Unable to create booking.'
                );

                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm Booking';
            }

        }

        catch(error){

            console.error(
                'Booking error:',
                error
            );


            alert(
                'Unable to connect to the server. Please try again.'
            );


            confirmBtn.disabled =
                false;

            confirmBtn.textContent =
                'Confirm Booking';

        }

    }
);

}

function formatDate(iso){

    const d =
        new Date(
            iso + 'T00:00:00'
        );

    return d.toLocaleDateString(
        'en-PH',
        {
            weekday:'long',
            year:'numeric',
            month:'long',
            day:'numeric'
        }
    );

}

function renderConfirmation(
    service,
    petName,
    dateISO,
    time,
    address
){

    bookingModal.innerHTML = `

        <div class="booking-confirmed">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >

                <circle
                    cx="12"
                    cy="12"
                    r="10"
                />

                <polyline
                    points="8 12 11 15 16 9"
                />

            </svg>

            <h3>
                Booking Requested!
            </h3>

            <p>
                We've received your request for
                ${service.name}.
            </p>

            <div class="summary">

                <div>
                    <strong>Pet:</strong>
                    ${petName}
                </div>

                <div>
                    <strong>Service:</strong>
                    ${service.name}
                    (${service.price})
                </div>

                <div>
                    <strong>Date:</strong>
                    ${formatDate(dateISO)}
                </div>

                <div>
                    <strong>Time:</strong>
                    ${time}
                </div>

                <div>
                    <strong>Service address:</strong>
                    ${escapeBookingHtml(address.address_label)} - ${escapeBookingHtml(address.address_line)}, ${escapeBookingHtml(address.city)}, ${escapeBookingHtml(address.province)} ${escapeBookingHtml(address.postal_code)}
                </div>

            </div>

            <button
                class="booking-done-btn"
                id="bookingDoneBtn"
                type="button"
            >
                Done
            </button>

        </div>

    `;

    document
        .getElementById(
            'bookingDoneBtn'
        )
        .addEventListener(
            'click',
            closeBooking
        );

}

function escapeBookingHtml(value){
    return String(value).replace(/[&<>"']/g, character => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
    })[character]);
}

function getLoggedInUser(){

    const loggedInUser =
        localStorage.getItem('loggedInUser');

    if(loggedInUser){

        try{

            return JSON.parse(
                loggedInUser
            );

        }catch(error){

            console.error(
                'Invalid loggedInUser:',
                error
            );

        }

    }


    const furryCornerUser =
        localStorage.getItem('furryCornerUser');

    if(furryCornerUser){

        try{

            return JSON.parse(
                furryCornerUser
            );

        }catch(error){

            console.error(
                'Invalid furryCornerUser:',
                error
            );

        }

    }


    return null;

}


function isLoggedIn(){

    return !!getLoggedInUser();

}

function openBooking(serviceId){

    if(!isLoggedIn()){
        window.FurryCornerAuth.promptForSignIn(location.href);
        return;

    }

    const service =
        services.find(
            service =>
                service.id === serviceId
        );

    if(!service) return;

    renderBookingForm(service);

    bookingBackdrop.classList.add(
        'open'
    );

    document.body.style.overflow =
        'hidden';

}

function closeBooking(){

    bookingBackdrop.classList.remove(
        'open'
    );

    document.body.style.overflow =
        '';

}

/* =====================================================
   BOOK BUTTON CLICK
===================================================== */

serviceGridContainer.addEventListener(
    'click',
    event => {

        const btn =
            event.target.closest(
                '.book-btn'
            );

        if(!btn) return;

        const serviceId =
            btn.dataset.serviceId;

        openBooking(serviceId);

    }
);

/* =====================================================
   CLOSE BOOKING MODAL
===================================================== */

bookingBackdrop.addEventListener(
    'click',
    event => {

        if(
            event.target ===
            bookingBackdrop
        ){

            closeBooking();

        }

    }
);

/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    'keydown',
    event => {

        if(event.key !== 'Escape')
            return;

        closeCartDrawer();

        if(
            bookingBackdrop.classList.contains(
                'open'
            )
        ){

            closeBooking();

        }

    }
);

/* =====================================================
   INITIALIZE
===================================================== */

renderCartDrawer();


async function updateServiceNotificationBadge() {
    const badge = document.getElementById('bottomNotifBadge');

    if (!badge) return;

    try {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            badge.style.display = 'none';
            return;
        }

        const readKey = `furrycornerNotificationRead:${user.id}`;
        let readState = {};

        try {
            readState = JSON.parse(localStorage.getItem(readKey) || '{}');
        } catch {
            readState = {};
        }

        const [savedResult, ordersResult, bookingsResult] =
            await Promise.all([
                supabase
                    .from('notifications')
                    .select('id, is_read')
                    .eq('user_id', user.id),

                supabase
                    .from('orders')
                    .select('id')
                    .eq('user_id', user.id),

                supabase
                    .from('bookings')
                    .select('id')
                    .eq('user_id', user.id)
            ]);

        if (savedResult.error) throw savedResult.error;
        if (ordersResult.error) throw ordersResult.error;
        if (bookingsResult.error) throw bookingsResult.error;

        const unreadCount =
            (savedResult.data || []).filter(item => !item.is_read).length +
            (ordersResult.data || []).filter(
                order => readState[`order-${order.id}`] !== true
            ).length +
            (bookingsResult.data || []).filter(
                booking => readState[`booking-${booking.id}`] !== true
            ).length;

        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';

    } catch (error) {
        console.error('Service notification badge update failed:', error);
        badge.style.display = 'none';
    }
}


updateServiceNotificationBadge();


;




/* =====================================================
   TOP BAR CART BUTTON (shared top bar)
===================================================== */
function refreshNavCartBadge(){
    const badge = document.getElementById('cartBadge');
    if(!badge) return;
    let items = [];
    try { items = JSON.parse(localStorage.getItem('cart') || '[]'); } catch(e) { items = []; }
    const total = Array.isArray(items) ? items.reduce((t,i) => t + Number(i.quantity || 0), 0) : 0;
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}
refreshNavCartBadge();
window.addEventListener('storage', refreshNavCartBadge);

document.getElementById('cartToggle')?.addEventListener('click', openCartDrawer);

  }
}
