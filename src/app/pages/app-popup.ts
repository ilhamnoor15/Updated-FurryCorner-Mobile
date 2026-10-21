// Shared themed popup for FurryCorner PH.
// Replaces the browser's native alert() with a popup that matches the app theme
// (same look as the "Added to Cart" popup and the checkout success modal).
//
// Usage:
//   import { installAppAlert, showAppAlert } from './app-popup';
//   installAppAlert();                       // once, at app start -> every alert('...') is themed
//   showAppAlert('Saved!', { type: 'success' });   // or call it directly

export type PopupType = 'success' | 'error' | 'info';

export interface PopupOptions {
    title?: string;
    type?: PopupType;
    buttonText?: string;
}

const STYLE_ID = 'fc-popup-style';

const POPUP_CSS = `
.fc-popup-backdrop{
    position:fixed;
    inset:0;
    z-index:10000;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(31,36,48,.45);
    backdrop-filter:blur(2px);
    opacity:0;
    visibility:hidden;
    transition:opacity .25s ease, visibility .25s ease;
}
.fc-popup-backdrop.show{
    opacity:1;
    visibility:visible;
}
.fc-popup{
    width:360px;
    max-width:100%;
    padding:26px 22px 20px;
    border-radius:18px;
    border:2px solid #5CA3E8;
    background:#fff;
    box-shadow:0 18px 45px rgba(31,36,48,.18);
    text-align:center;
    transform:scale(.85);
    transition:transform .25s ease;
}
.fc-popup-backdrop.show .fc-popup{
    transform:scale(1);
}
.fc-popup.error{ border-color:#e0685f; }
.fc-popup-icon{
    width:58px;
    height:58px;
    margin:0 auto 12px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#5CA3E8;
    color:#fff;
}
.fc-popup.error .fc-popup-icon{ background:#e0685f; }
.fc-popup-icon svg{
    width:28px;
    height:28px;
}
.fc-popup-title{
    margin:0 0 6px;
    font-family:'Baloo 2',cursive;
    font-size:26px;
    line-height:1.1;
    color:#1F2430;
}
.fc-popup-message{
    margin:0 0 18px;
    font-family:'Nunito',sans-serif;
    font-size:14px;
    font-weight:700;
    line-height:1.5;
    color:#586273;
    white-space:pre-line;
    overflow-wrap:anywhere;
}
.fc-popup-btn{
    width:100%;
    height:46px;
    border:0;
    border-radius:10px;
    background:#5CA3E8;
    color:#fff;
    font-family:'Nunito',sans-serif;
    font-size:15px;
    font-weight:800;
    cursor:pointer;
    transition:background .2s ease, transform .15s ease;
}
.fc-popup-btn:hover{ background:#4b95dc; }
.fc-popup-btn:active{ transform:scale(.98); }
.fc-popup.error .fc-popup-btn{ background:#e0685f; }
.fc-popup.error .fc-popup-btn:hover{ background:#c9554d; }
.fc-popup-btn:focus-visible{
    outline:3px solid rgba(123,184,240,.45);
    outline-offset:2px;
}
`;

const ICONS: Record<PopupType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="6" x2="12" y2="13"></line><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="11" x2="12" y2="18"></line><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>'
};

const TITLES: Record<PopupType, string> = {
    success: 'Success!',
    error: 'Oops!',
    info: 'Heads up'
};

// Native alert() has no "type", so guess one from the wording.
function guessType(message: string): PopupType {
    if (/error|invalid|fail|incorrect|wrong|required|unable|cannot|can't|couldn't|not found|already|denied|mismatch/i.test(message)) {
        return 'error';
    }
    if (/success|added|saved|updated|created|welcome|thank|placed|booked|deleted|removed/i.test(message)) {
        return 'success';
    }
    return 'info';
}

function ensureStyle(): void {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = POPUP_CSS;
    document.head.appendChild(style);
}

let queue: Promise<void> = Promise.resolve();

export function showAppAlert(message: string, options: PopupOptions = {}): Promise<void> {
    // Show popups one at a time, in order.
    queue = queue.then(() => new Promise<void>(resolve => {
        ensureStyle();

        const type = options.type ?? guessType(message);

        const backdrop = document.createElement('div');
        backdrop.className = 'fc-popup-backdrop';

        const box = document.createElement('div');
        box.className = 'fc-popup ' + type;
        box.setAttribute('role', 'alertdialog');
        box.setAttribute('aria-modal', 'true');

        const icon = document.createElement('div');
        icon.className = 'fc-popup-icon';
        icon.innerHTML = ICONS[type];

        const title = document.createElement('h3');
        title.className = 'fc-popup-title';
        title.textContent = options.title ?? TITLES[type];

        const text = document.createElement('p');
        text.className = 'fc-popup-message';
        text.textContent = message;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fc-popup-btn';
        button.textContent = options.buttonText ?? 'OK';

        box.append(icon, title, text, button);
        backdrop.appendChild(box);
        document.body.appendChild(backdrop);

        const close = () => {
            document.removeEventListener('keydown', onKey);
            backdrop.classList.remove('show');
            setTimeout(() => { backdrop.remove(); resolve(); }, 250);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                close();
            }
        };

        button.addEventListener('click', close);
        backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
        document.addEventListener('keydown', onKey);

        requestAnimationFrame(() => {
            backdrop.classList.add('show');
            button.focus();
        });
    }));
    return queue;
}

// Call once at app start. Every plain alert('...') in the app becomes the themed popup.
// Note: the themed popup does not pause the code that called alert() the way the native one does.
export function installAppAlert(): void {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.__fcAlertInstalled) return;
    w.__fcAlertInstalled = true;
    w.alert = (message?: unknown) => { void showAppAlert(String(message ?? '')); };
}