// contactForm.ts
// Handles the Contact Us form: sends the message via Web3Forms and shows a pop-up modal.
//
// SETUP (one time, free, no template needed):
//  1. Go to https://web3forms.com and enter furrycorner@gmail.com
//  2. Open the email they send you and copy the Access Key
//  3. Paste it below (replace the whole string, no "YOUR_" left).
//  Messages will arrive in that inbox, with the sender's email as Reply-To.

import { notifyContactSent } from './notify';

const WEB3FORMS_ACCESS_KEY = 'ad40e2fd-4916-43c5-a10d-fe22b552e9aa';

const isConfigured = () =>
  !!WEB3FORMS_ACCESS_KEY && !WEB3FORMS_ACCESS_KEY.startsWith('YOUR_');

/* ---------- Modal ---------- */
function showModal(type: 'success' | 'error', title: string, text: string): void {
  document.getElementById('fcModal')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'fcModal';
  overlay.className = 'fc-modal-overlay';
  overlay.innerHTML = `
    <div class="fc-modal ${type}" role="dialog" aria-modal="true" aria-labelledby="fcModalTitle">
      <div class="fc-modal-icon" aria-hidden="true">${type === 'success' ? '✓' : '!'}</div>
      <h3 id="fcModalTitle">${title}</h3>
      <p>${text}</p>
      <button type="button" class="submit-button" id="fcModalClose">OK</button>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#fcModalClose')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  (overlay.querySelector('#fcModalClose') as HTMLButtonElement)?.focus();
}

/* ---------- Form wiring: call this after contactPage.html is rendered ---------- */
export function wireContactForm(): void {
  const form = document.getElementById('contactForm') as HTMLFormElement | null;
  if (!form) return;

  const status = document.getElementById('formStatus');
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (status) status.hidden = true;

    if (!isConfigured()) {
      console.error('Contact form: set WEB3FORMS_ACCESS_KEY in contactForm.ts');
      showModal('error', 'Message not sent', 'The contact form is not set up yet. Please email us directly at furrycorner@gmail.com.');
      return;
    }

    const data = new FormData(form);
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'FurryCorner PH - new contact message',
          from_name: data.get('name'),
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message')
        })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) {
        throw new Error(result.message || `HTTP ${res.status}`);
      }

      form.reset();
      notifyContactSent(); // adds a "message sent" notification if the user is signed in
      showModal('success', 'Message sent!', 'Thanks for reaching out. We\'ll get back to you soon.');
    } catch (err) {
      console.error('Contact form send failed:', err);
      showModal('error', 'Message not sent', 'Something went wrong. Please try again in a moment.');
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}

/* ---------- Modal CSS: appended to MENU_CSS in contact.page.ts ---------- */
export const MODAL_CSS = `
.fc-modal-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(31,36,48,.45)}
.fc-modal{width:min(100%,340px);background:#fff;border-radius:18px;padding:26px 22px 22px;text-align:center;box-shadow:0 12px 32px rgba(31,36,48,.25);animation:fcPop .18s ease-out}
.fc-modal-icon{width:54px;height:54px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;font:800 28px 'Baloo 2',cursive;color:#fff}
.fc-modal.success .fc-modal-icon{background:#4caf7d}
.fc-modal.error .fc-modal-icon{background:#e5775a}
.fc-modal h3{font-size:22px;margin-bottom:6px}
.fc-modal p{font-size:14px;color:#515866;margin-bottom:18px}
.fc-modal .submit-button{justify-self:center;min-width:110px}
@keyframes fcPop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
`;