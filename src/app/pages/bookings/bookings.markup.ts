
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
  <section class="page-intro">
    <h1>My Bookings</h1>
    <p>View your booked pet care services and their status.</p>
  </section>

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

.back-link:hover {
    background: var(--cream-light);
}

.page-title{
    font:800 22px 'Baloo 2',cursive;
    color:var(--blue-dark);
    text-align:left;
}
.content {
  width: min(100% - 32px, 760px);
  margin: 24px auto 40px;
}

.page-intro { margin-bottom: 20px; }
.page-intro h1 { margin: 0 0 4px; font-size: 30px; }
.page-intro p { margin: 0; color: var(--muted); }

.message {
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  color: var(--muted);
  overflow-wrap: anywhere;
}

.booking-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px #1f24300a;
}

.booking-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.booking-card h2 {
  margin: 0;
  font-size: 20px;
}

.booking-number {
  color: var(--muted);
  font-size: 12px;
}

.booking-status {
  display: inline-block;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
  background: #eaf4fd;
  color: #245784;
  text-transform: capitalize;
}

.booking-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-label {
  display: block;
  color: var(--muted);
  font-size: 12px;
}

.detail-value {
  display: block;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.booking-price {
  color: var(--blue-dark);
  font-weight: 800;
  font-size: 18px;
}

.booking-notes {
  border-top: 1px solid var(--border);
  margin-top: 14px;
  padding-top: 12px;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .booking-card { padding: 14px; }
  .booking-details { grid-template-columns: 1fr; }
  .booking-top { flex-direction: column; }
}
`;
