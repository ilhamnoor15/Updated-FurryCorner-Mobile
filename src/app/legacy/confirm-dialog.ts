const STYLE_ID = 'fcConfirmStyle';

const CSS = `
.fc-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(31, 36, 48, .45);
  animation: fcFade .15s ease;
}
.fc-confirm-box {
  width: min(100%, 360px);
  padding: 24px 20px 20px;
  border-radius: 20px;
  background: #fff;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  box-shadow: 0 16px 40px rgba(31, 36, 48, .25);
  animation: fcPop .18s ease;
}
.fc-confirm-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #FDEEDA;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fc-confirm-icon svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: #d64545;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.fc-confirm-box h3 {
  margin: 0 0 6px;
  font: 800 22px 'Baloo 2', cursive;
  color: #1F2430;
}
.fc-confirm-box p {
  margin: 0 0 20px;
  font-size: 14px;
  color: #7c8490;
}
.fc-confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.fc-confirm-actions button {
  padding: 12px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  font: 800 15px 'Nunito', sans-serif;
  cursor: pointer;
  transition: filter .15s;
}
.fc-confirm-actions button:hover { filter: brightness(.93); }
.fc-confirm-actions button:focus-visible { outline: 2px solid #5CA3E8; outline-offset: 2px; }
.fc-confirm-keep { background: #fff; border-color: #5CA3E8 !important; color: #5CA3E8; }
.fc-confirm-yes { background: #d64545; color: #fff; }
@keyframes fcFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes fcPop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
`;

const PAW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5 2.5-5 4.5 0 1.7 1.5 2.5 3 2.2 1-.2 1.4-.4 2-.4s1 .2 2 .4c1.5.3 3-.5 3-2.2 0-2-2-4.5-5-4.5z"/></svg>';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function confirmDialog(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    // The legacy page loader removes <head> additions when you leave a page,
    // so re-add the style whenever it's missing.
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.className = 'fc-confirm-overlay';
    overlay.innerHTML = `
      <div class="fc-confirm-box" role="alertdialog" aria-modal="true">
        <div class="fc-confirm-icon">${PAW}</div>
        <h3></h3>
        <p></p>
        <div class="fc-confirm-actions">
          <button type="button" class="fc-confirm-keep"></button>
          <button type="button" class="fc-confirm-yes"></button>
        </div>
      </div>
    `;

    overlay.querySelector('h3')!.textContent = options.title || 'Cancel this booking?';
    overlay.querySelector('p')!.textContent =
      options.message || 'This action cannot be undone.';
    const keepBtn = overlay.querySelector('.fc-confirm-keep') as HTMLButtonElement;
    const yesBtn = overlay.querySelector('.fc-confirm-yes') as HTMLButtonElement;
    keepBtn.textContent = options.cancelText || 'Keep Booking';
    yesBtn.textContent = options.confirmText || 'Yes, Cancel';

    const close = (result: boolean) => {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve(result);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };

    keepBtn.addEventListener('click', () => close(false));
    yesBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    keepBtn.focus();
  });
}