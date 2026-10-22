export const TITLE = `My Bookings - FurryCorner`;
export const BODY_CLASS = `page-bookings`;

export const HTML = `
<header class="page-header">
  <div class="header-inner">
    <a class="back-link" href="profile.html" aria-label="Back to My Account">
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </a>
    <h1 class="page-title">My Bookings</h1>
  </div>
</header>

<main class="content">

  <div class="filter-chips" id="bookingFilters" role="tablist" aria-label="Filter bookings">
    <button class="chip active" type="button" role="tab" aria-selected="true" data-filter="all">All</button>
    <button class="chip" type="button" role="tab" aria-selected="false" data-filter="upcoming">Upcoming</button>
    <button class="chip" type="button" role="tab" aria-selected="false" data-filter="completed">Completed</button>
    <button class="chip" type="button" role="tab" aria-selected="false" data-filter="cancelled">Cancelled</button>
  </div>

  <div id="bookingsMessage" class="message" role="status">
    Loading your bookings...
  </div>

  <section id="bookingsList" aria-live="polite"></section>
</main>
`;

export const CSS = `
:root {
  --blue-dark: #5CA3E8;
  --cream-light: #FDEEDA;
  --ink: #1F2430;
  --muted: #7c8490;
  --border: #e5e7eb;
  --green: #1e8a4c;
  --green-bg: #e3f5ea;
  --amber: #a8620b;
  --amber-bg: #fdf0d8;
  --red: #d64545;
  --red-bg: #fdeaea;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Nunito', sans-serif;
  color: var(--ink);
  background: var(--cream-light);
  line-height: 1.5;
}

a { text-decoration: none; color: inherit; }

h1, h2, h3, .brand {
  font-family: 'Baloo 2', cursive;
}

.site-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--blue-dark);
  font-size: 22px;
  font-weight: 800;
}

.brand img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 8px;
  border-radius: 10px;
  color: var(--blue-dark);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.back-link span:first-child {
  font-size: 24px;
  line-height: 1;
}

.back-link:hover { background: var(--cream-light); }

.page-title {
  font: 800 22px 'Baloo 2', cursive;
  color: var(--blue-dark);
  text-align: left;
}

.content {
  width: min(100% - 32px, 760px);
  margin: 24px auto 40px;
}

/* ---------- Filter chips ---------- */
.filter-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }

.chip {
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--ink);
  font: 700 13px 'Nunito', sans-serif;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.chip:hover { border-color: var(--blue-dark); }
.chip.active {
  background: var(--blue-dark);
  border-color: var(--blue-dark);
  color: #fff;
}
.chip:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--blue-dark);
  outline-offset: 2px;
}

.message {
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  color: var(--muted);
  overflow-wrap: anywhere;
}

/* ---------- Booking card ---------- */
.booking-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px #1f24300a;
}

.booking-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.booking-card h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
}

.booking-number {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 12px;
}

.booking-status {
  flex-shrink: 0;
  display: inline-block;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 800;
  background: #eaf4fd;
  color: #245784;
  text-transform: capitalize;
}
.booking-status.status-confirmed { background: var(--green-bg); color: var(--green); }
.booking-status.status-pending,
.booking-status.status-in-progress { background: var(--amber-bg); color: var(--amber); }
.booking-status.status-completed { background: #eaf4fd; color: #245784; }
.booking-status.status-cancelled { background: var(--red-bg); color: var(--red); }

/* Date row + pet/price row */
.booking-meta {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
}

.meta-left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.meta-left svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke: var(--muted);
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.booking-price {
  color: var(--ink);
  font-weight: 800;
  font-size: 17px;
  white-space: nowrap;
}

/* Buttons */
.booking-actions {
  display: grid;
  gap: 10px;
}

.btn {
  display: block;
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  font: 800 15px 'Nunito', sans-serif;
  text-align: center;
  cursor: pointer;
  transition: filter .15s, background .15s;
}

.btn-track {
  border: 1px solid var(--blue-dark);
  background: var(--blue-dark);
  color: #fff;
}
.btn-track:hover { filter: brightness(.95); }

.btn.btn-cancel {
  border: 1px solid var(--red) !important;
  background: var(--red) !important;
  color: #fff !important;
}
.btn.btn-cancel:hover { filter: brightness(.92); }

.btn[disabled] { opacity: .5; cursor: not-allowed; }

/* Old layout classes kept so nothing else breaks */
.booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-label { display: block; color: var(--muted); font-size: 12px; }
.detail-value { display: block; font-weight: 700; overflow-wrap: anywhere; }
.booking-notes {
  border-top: 1px solid var(--border);
  margin-top: 14px;
  padding-top: 12px;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .booking-card { padding: 14px; }
  .booking-details { grid-template-columns: 1fr; }
}
`;