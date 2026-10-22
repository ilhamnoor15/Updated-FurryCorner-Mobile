export const TITLE = `AI Assistant - FurryCorner`;
export const BODY_CLASS = `page-ai-assistant`;

export const HTML = `
<div class="ai-screen">
  <header class="ai-header">
    <button class="ai-back" id="aiBack" type="button" aria-label="Back">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
    </button>
    <div class="ai-avatar" aria-hidden="true">🐾</div>
    <h1 class="ai-title">AI Assistant</h1>
  </header>

  <main class="ai-body" id="aiBody">
    <div class="ai-card" id="aiGreeting">
      <p class="ai-hi" id="aiHi">Hi there,</p>
      <p class="ai-ask">Could you tell us what you need help with today?</p>

      <div class="ai-suggestions" id="aiSuggestions">
        <button type="button" class="ai-suggestion">What pet products do you sell?</button>
        <button type="button" class="ai-suggestion">What pet care services are available?</button>
        <button type="button" class="ai-suggestion">How do I book a service?</button>
        <button type="button" class="ai-suggestion">How do I track my order?</button>
      </div>
    </div>

    <div class="ai-msgs" id="aiMsgs"></div>
  </main>

  <form class="ai-form" id="aiForm" autocomplete="off">
    <div class="ai-input-row">
      <input id="aiInput" class="ai-input" type="text" maxlength="500"
             placeholder="You may type your concern here.">
      <button id="aiSend" class="ai-send" type="submit" aria-label="Send" disabled>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 21 3l-7.5 18-2.5-7.5L3 11.5z"/></svg>
      </button>
    </div>
    <p class="ai-note">AI generated. Answers may not always be accurate.</p>
  </form>
</div>
`;

export const CSS = `
:root {
  --blue: #7BB8F0;
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
}

.ai-screen {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--cream-light);
  max-width: 760px;
  margin: 0 auto;
}

/* ---------- Header ---------- */
.ai-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.ai-back {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--blue-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ai-back:hover { background: var(--cream-light); }
.ai-back svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ai-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.ai-title {
  margin: 0;
  font: 800 22px 'Baloo 2', cursive;
  color: var(--ink);
}

/* ---------- Body ---------- */
.ai-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px 16px;
  box-shadow: 0 4px 12px #1f24300a;
}

.ai-hi {
  margin: 0 0 4px;
  font: 800 22px 'Baloo 2', cursive;
  color: var(--blue-dark);
}

.ai-ask {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: #586273;
}

.ai-suggestions { display: grid; gap: 10px; }

.ai-suggestion {
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  font: 700 14px 'Nunito', sans-serif;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.ai-suggestion:hover,
.ai-suggestion:active {
  border-color: var(--blue-dark);
  background: #f4f9ff;
}

/* ---------- Messages ---------- */
.ai-msgs { display: flex; flex-direction: column; gap: 10px; }

.ai-msg {
  max-width: 85%;
  padding: 11px 14px;
  border-radius: 17px;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.ai-msg.bot {
  align-self: flex-start;
  background: #fff;
  border: 1px solid var(--border);
  border-bottom-left-radius: 5px;
}
.ai-msg.me {
  align-self: flex-end;
  background: var(--blue-dark);
  color: #fff;
  border-bottom-right-radius: 5px;
}
.ai-msg.err {
  background: #fdeaea;
  border-color: #f2c8c3;
  color: #a1261b;
}

/* ---------- Input ---------- */
.ai-form {
  flex-shrink: 0;
  padding: 10px 12px calc(8px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid var(--border);
}

.ai-input-row { display: flex; align-items: center; gap: 10px; }

.ai-input {
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0 18px;
  border: 1px solid #d6dae0;
  border-radius: 24px;
  background: #fff;
  color: var(--ink);
  font: 500 16px 'Nunito', sans-serif; /* 16px stops iOS zoom on focus */
  outline: none;
}
.ai-input:focus {
  border-color: var(--blue-dark);
  box-shadow: 0 0 0 3px rgba(92, 163, 232, .15);
}

.ai-send {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: var(--blue-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity .15s;
}
.ai-send svg {
  width: 22px;
  height: 22px;
  fill: #fff;
}
.ai-send:disabled { opacity: .4; cursor: not-allowed; }

.ai-note {
  margin: 6px 0 0;
  text-align: center;
  font-size: 12px;
  color: #a0a6b0;
}
`;