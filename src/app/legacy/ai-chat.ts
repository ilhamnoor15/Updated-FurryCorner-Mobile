const AI_API_URL =
  'https://furrycorner.online/FurryCorner_ESB/api/esb/gateway.php?service=ai&action=chat';

/**
 * Floating AI chat bubble (bottom-right) for the mobile app.
 * Talks ONLY to your own backend (aiChat.php). The Gemini key never lives in the app.
 * Everything it adds to <body> is removed automatically when you leave the page (see LegacyPage.ngOnDestroy).
 */
export function initAiChat(): void {
  if (document.getElementById('fcAiRoot')) return;

  const root = document.createElement('div');
  root.id = 'fcAiRoot';
  root.innerHTML = `
<style>

#fcAiRoot {
  font-family: 'Nunito', Arial, sans-serif;
  --fc-cream: #fff7ee;
  --fc-text: #3b2a1a;
  --fc-border: #f0dcc4;
      --blue:#7BB8F0;
    --blue-dark:#5CA3E8;
}

#fcAiBtn {
  position: fixed;
  right: 18px;
  bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 0;
  background: var(--blue);
  color: #fff;
  font-size: 25px;
  box-shadow: 0 5px 16px rgba(80, 45, 18, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9990;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

#fcAiBtn:active {
  transform: scale(0.94);
  background: var(--blue-dark);
}

#fcAiPanel {
  position: fixed;
  right: 12px;
  left: 12px;
  bottom: calc(156px + env(safe-area-inset-bottom, 0px));
  width: auto;
  max-width: 390px;
  height: min(500px, calc(100dvh - 230px));
  margin-left: auto;
  background: #fff;
  border: 1px solid var(--fc-border);
  border-radius: 22px;
  box-shadow: 0 12px 36px rgba(62, 39, 20, 0.2);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 9991;
}

#fcAiPanel.open {
  display: flex;
  animation: fcAiAppear 0.2s ease-out;
}

@keyframes fcAiAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#fcAiHead {
  background: var(--blue-dark);
  color: #fff;
  padding: 15px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(80, 45, 18, 0.08);
}

#fcAiHead span {
  display: flex;
  align-items: center;
  gap: 8px;
}

#fcAiClose {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.18);
  border: 0;
  border-radius: 50%;
  color: #fff;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
}

#fcAiMsgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 12px;
  background: var(--fc-cream);
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.fcAiM {
  max-width: 84%;
  padding: 11px 14px;
  border-radius: 17px;
  font-size: 13.5px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  box-shadow: 0 1px 3px rgba(62, 39, 20, 0.04);
}

.fcAiM.bot {
  align-self: flex-start;
  background: #fff;
  color: var(--fc-text);
  border: 1px solid var(--fc-border);
  border-bottom-left-radius: 5px;
}

.fcAiM.me {
  align-self: flex-end;
  background: var(--blue);
  color: #fff;
  border: 1px solid var(--blue);
  border-bottom-right-radius: 5px;
}

.fcAiM.err {
  background: #fff0ee;
  color: #a1261b;
  border: 1px solid #f2c8c3;
}

#fcAiForm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--fc-border);
  background: #fff;
}

#fcAiInput {
  flex: 1;
  min-width: 0;
  height: 42px;
  box-sizing: border-box;
  border: 1px solid #e8d8c7;
  border-radius: 22px;
  padding: 0 15px;
  background: #fffaf5;
  color: var(--fc-text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

#fcAiInput::placeholder {
  color: #a89887;
}

#fcAiInput:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(232, 131, 58, 0.12);
}

#fcAiSend {
  height: 42px;
  flex-shrink: 0;
  border: 0;
  border-radius: 22px;
  padding: 0 17px;
  background: var(--blue);
  color: #060606;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
}

#fcAiSend:hover:not(:disabled) {
  background: var(--blue-dark);
}

#fcAiSend:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 420px) {
  #fcAiPanel {
    right: 10px;
    left: 10px;
    max-width: none;
    height: min(480px, calc(100dvh - 220px));
    border-radius: 20px;
  }

  #fcAiMsgs {
    padding: 13px 10px;
  }

  .fcAiM {
    max-width: 88%;
  }

  #fcAiForm {
    gap: 7px;
    padding: 10px;
  }

  #fcAiSend {
    padding: 0 14px;
  }
}

</style>
<button id="fcAiBtn" type="button" aria-label="Open AI assistant">💬</button>
<div id="fcAiPanel" role="dialog" aria-label="FurryCorner assistant">
  <div id="fcAiHead"><span>🐾 Furry Assistant</span><button id="fcAiClose" type="button" aria-label="Close">×</button></div>
  <div id="fcAiMsgs"></div>
  <form id="fcAiForm" autocomplete="off">
    <input id="fcAiInput" type="text" maxlength="500" placeholder="Ask about products, services…">
    <button id="fcAiSend" type="submit">Send</button>
  </form>
</div>`;
  document.body.appendChild(root);

  const $ = (id: string) => root.querySelector('#' + id) as HTMLElement;
  const btn = $('fcAiBtn'), panel = $('fcAiPanel'), msgs = $('fcAiMsgs');
  const form = $('fcAiForm') as HTMLFormElement;
  const input = $('fcAiInput') as HTMLInputElement;
  const send = $('fcAiSend') as HTMLButtonElement;

  const history: { role: 'user' | 'model'; text: string }[] = [];
  let busy = false;

  const add = (text: string, cls: string) => {
    const d = document.createElement('div');
    d.className = 'fcAiM ' + cls;
    d.textContent = text;           // textContent: model output can never inject HTML
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  };

  add('Hi! 🐶🐱 I\'m the FurryCorner assistant. Ask me about our products, services, or pet care.', 'bot');

  const toggle = (open?: boolean) => {
    panel.classList.toggle('open', open);
    if (panel.classList.contains('open')) setTimeout(() => input.focus(), 50);
  };
  btn.addEventListener('click', () => toggle());
  $('fcAiClose').addEventListener('click', () => toggle(false));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    if (text.length > 500) { add('Please keep your message under 500 characters.', 'bot err'); return; }

    busy = true; send.disabled = true; input.value = '';
    add(text, 'me');
    const typing = add('Typing…', 'bot');

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-10) }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      let data: any = null;
      try { data = JSON.parse(await res.text()); } catch { /* not JSON */ }

      if (data && data.success && typeof data.reply === 'string') {
        typing.textContent = data.reply;
        history.push({ role: 'user', text }, { role: 'model', text: data.reply });
      } else {
        typing.textContent = (data && data.message) || 'Sorry, something went wrong. Please try again.';
        typing.classList.add('err');
      }
    } catch (err) {
      typing.textContent = 'Can\'t reach the assistant. Check your internet connection and try again.';
      typing.classList.add('err');
    } finally {
      busy = false; send.disabled = false;
      msgs.scrollTop = msgs.scrollHeight;
    }
  });
}