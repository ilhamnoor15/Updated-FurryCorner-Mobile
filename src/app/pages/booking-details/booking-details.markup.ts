export const TITLE = `Booking Details - FurryCorner`;
export const BODY_CLASS = `page-booking-details`;

export const HTML = `
<header class="page-header">
  <div class="header-inner">
    <a class="back-link" href="bookings.html" aria-label="Back to My Bookings">
      <span aria-hidden="true">←</span>
    </a>
    <div class="header-text">
      <h1 class="page-title">Booking Details</h1>
      <span class="header-sub" id="detailsBookingNumber"></span>
    </div>
    <span class="booking-status" id="detailsStatus" hidden></span>
  </div>
</header>

<main class="content">
  <div id="detailsMessage" class="message" role="status">Loading booking...</div>

  <div id="detailsContent" hidden>
    <section class="panel">
      <h2 class="section-label">Service details</h2>
      <h3 class="service-name" id="detailsService"></h3>
      <ul class="detail-list">
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
          <span id="detailsDate"></span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span id="detailsTime"></span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5 2.5-5 4.5 0 1.7 1.5 2.5 3 2.2 1-.2 1.4-.4 2-.4s1 .2 2 .4c1.5.3 3-.5 3-2.2 0-2-2-4.5-5-4.5z"/></svg>
          <span id="detailsPet"></span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>
          <span id="detailsPrice" class="price"></span>
        </li>
      </ul>
      <div class="notes" id="detailsNotesWrap" hidden>
        <span class="detail-label">Notes</span>
        <p id="detailsNotes"></p>
      </div>
    </section>

    <section class="panel">
      <h2 class="progress-title">Booking Progress</h2>
      <p class="progress-sub">Your appointment status and updates.</p>
      <ol class="timeline" id="detailsTimeline"></ol>
    </section>

    <section class="reminder" id="detailsReminder" hidden>
      <div class="reminder-title">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
        <strong>Appointment Reminder</strong>
      </div>
      <p id="detailsReminderText"></p>
    </section>

    <button class="btn btn-cancel" id="detailsCancel" type="button" hidden>Cancel Booking</button>
  </div>
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
  --grey-dot: #b8bec7;
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
h1, h2, h3 { font-family: 'Baloo 2', cursive; margin: 0; }

.page-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.header-inner {
  width: min(100% - 32px, 760px);
  margin: 0 auto;
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: var(--blue-dark);
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
}
.back-link:hover { background: var(--cream-light); }

.header-text { flex: 1; min-width: 0; }
.page-title { font: 800 20px 'Baloo 2', cursive; color: var(--ink); line-height: 1.2; }
.header-sub { display: block; font-size: 13px; font-weight: 700; color: var(--blue-dark); }

.booking-status {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 800;
  text-transform: capitalize;
  background: #eaf4fd;
  color: #245784;
}
.booking-status.status-in-progress { background: var(--amber-bg); color: var(--amber); }
.booking-status.status-confirmed { background: var(--green-bg); color: var(--green); }
.booking-status.status-pending { background: var(--amber-bg); color: var(--amber); }
.booking-status.status-completed { background: #eaf4fd; color: #245784; }
.booking-status.status-cancelled { background: var(--red-bg); color: var(--red); }

.content {
  width: min(100% - 32px, 760px);
  margin: 20px auto 40px;
  display: grid;
  gap: 14px;
}
#detailsContent { display: grid; gap: 14px; }
#detailsContent[hidden], [hidden] { display: none !important; }

.message {
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  color: var(--muted);
}

.panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 12px #1f24300a;
}

.section-label {
  font: 700 12px 'Nunito', sans-serif;
  color: var(--muted);
  margin-bottom: 6px;
}

.service-name { font-size: 22px; line-height: 1.2; margin-bottom: 12px; }

.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.detail-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.detail-list svg, .reminder-title svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke: var(--muted);
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.price { font-weight: 800; }

.notes { border-top: 1px solid var(--border); margin-top: 14px; padding-top: 12px; }
.detail-label { display: block; color: var(--muted); font-size: 12px; }
.notes p { margin: 2px 0 0; overflow-wrap: anywhere; }

.progress-title { font-size: 18px; }
.progress-sub { margin: 0 0 16px; color: var(--muted); font-size: 14px; }

/* ---------- Timeline ---------- */
.timeline { list-style: none; margin: 0; padding: 0; }

.timeline li {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 22px;
}
.timeline li:last-child { padding-bottom: 0; }

.timeline li::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 22px;
  bottom: 2px;
  width: 2px;
  background: var(--border);
}
.timeline li:last-child::before { display: none; }
.timeline li.done::before { background: var(--green); }

.dot {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--grey-dot);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  z-index: 1;
}
.done .dot { background: var(--green); }
.current .dot { background: var(--blue-dark); }
.cancelled-step .dot { background: var(--red); }

.step-title { font: 800 15px 'Nunito', sans-serif; }
.step-desc { margin: 0; font-size: 13px; color: var(--muted); }
.step-time { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
.todo .step-title { color: var(--muted); }

/* ---------- Reminder + button ---------- */
.reminder {
  background: #fff;
  border: 1px dashed var(--blue-dark);
  border-radius: 16px;
  padding: 16px 18px;
}
.reminder-title { display: flex; align-items: center; gap: 10px; }
.reminder p { margin: 4px 0 0; font-size: 14px; color: var(--muted); }

.btn {
  display: block;
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  font: 800 15px 'Nunito', sans-serif;
  text-align: center;
  cursor: pointer;
}
.btn.btn-cancel {
  border: 1px solid var(--red) !important;
  background: var(--red) !important;
  color: #fff !important;
}
.btn.btn-cancel:hover { filter: brightness(.92); }

.btn.btn-cancel:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

.btn[disabled] { opacity: .5; cursor: not-allowed; }
.btn:focus-visible, .back-link:focus-visible { outline: 2px solid var(--blue-dark); outline-offset: 2px; }
`;