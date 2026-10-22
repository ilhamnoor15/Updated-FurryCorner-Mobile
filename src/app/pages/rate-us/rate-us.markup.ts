
export const TITLE = `Rate Us - FurryCorner PH`;
export const BODY_CLASS = ``;

const STAR_PATH =
  'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z';

const stars = [1, 2, 3, 4, 5]
  .map(
    n => `<button type="button" class="rate-star" data-value="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>
    </button>`
  )
  .join('');

const reasons = [
  'Good product quality',
  'Easy service booking',
  'Friendly staff',
  'Package arrived in good condition',
  'Authentic products',
  'Fast delivery',
  'Accurate product information',
  'Convenient refunds and returns',
  'Affordable pricing',
]
  .map(
    r => `<button type="button" class="rate-chip" aria-pressed="false">${r}</button>`
  )
  .join('\n');

export const HTML = `
<header class="page-header">
    <div class="header-inner">
        <a class="back-link" href="profile.html" aria-label="Back to My Account">
            <span aria-hidden="true">←</span>
            <span>Back</span>
        </a>
        <h1 class="page-title">Rate Us</h1>
    </div>
</header>

<main class="rate-container">
    <h1 class="rate-question">
        Based on this experience, how likely are you to use FurryCorner again?
    </h1>

    <div class="rate-stars" id="rateStars" role="radiogroup" aria-label="Rating">
        ${stars}
    </div>

    <div class="rate-scale">
        <span>Extremely unlikely</span>
        <span>Extremely likely</span>
    </div>

    <h2 class="rate-sub">
        What do you enjoy about FurryCorner? Select all that apply.
    </h2>

    <div class="rate-chips" id="rateChips">
        ${reasons}
    </div>

    <div class="rate-textarea-wrap">
        <textarea id="rateFeedback" maxlength="300" placeholder="Any suggestions/feedback for FurryCorner?"></textarea>
        <div class="rate-counter"><span id="rateCount">0</span>/300</div>
    </div>

    <button type="button" class="rate-submit" id="rateSubmit" disabled>Submit</button>
</main>

<div class="rate-backdrop" id="rateBackdrop">
    <div class="rate-modal" role="dialog" aria-modal="true" aria-labelledby="rateThanksTitle">
        <div class="rate-modal-icon">✓</div>
        <h3 id="rateThanksTitle">Thank you for your feedback!</h3>
        <p>Your feedback helps us make FurryCorner better for you and your furry friends.</p>
        <button type="button" class="rate-done" id="rateDone">Done</button>
    </div>
</div>`;

export const CSS = `
:root {
    --blue: #7BB8F0;
    --blue-dark: #5CA3E8;
    --cream: #FCE3C0;
    --cream-light: #FDEEDA;
    --ink: #1F2430;
    --muted: #8b929e;
    --border: #e2e6ec;
    --white: #fff;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    min-height: 100vh;
    background: var(--cream);
    color: var(--ink);
    font: 600 15px 'Nunito', sans-serif;
    line-height: 1.5;
    padding-bottom: 36px;
}

a {
    color: inherit;
    text-decoration: none;
}

/* NAVBAR — MATCHES MY ADDRESSES */
.page-header {
    width: 100%;
    background: var(--white);
    border-bottom: 1px solid var(--border);
}

.header-inner {
    width: 100%;
    max-width: 900px;
    min-height: 64px;
    margin: 0 auto;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
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
    text-decoration: none;
}

.back-link span:first-child {
    font-size: 24px;
    line-height: 1;
}

.back-link:hover {
    background: var(--cream-light);
}

.page-title {
    margin: 0;
    font: 800 22px 'Baloo 2', cursive;
    color: var(--blue-dark);
    text-align: left;
}

/* RATE CONTENT */
.rate-container {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 20px 60px;
}

.rate-question {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--ink);
    margin-bottom: 22px;
}

.rate-stars {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 12px;
}

.rate-star {
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.rate-star svg {
    width: 100%;
    height: 100%;
    fill: #d9dce1;
    transition: fill .15s ease, transform .15s ease;
}

.rate-star.active svg {
    fill: #f5c518;
}

.rate-star:active svg {
    transform: scale(.9);
}

.rate-scale {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 30px;
}

.rate-sub {
    font-family: 'Nunito', sans-serif;
    font-size: 19px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--ink);
    margin-bottom: 16px;
}

.rate-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 28px;
}

.rate-chip {
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
}

.rate-chip.selected {
    background: var(--blue);
    border-color: var(--blue);
    color: #fff;
}

.rate-textarea-wrap textarea {
    display: block;
    width: 100%;
    height: 150px;
    resize: none;
    padding: 16px;
    border: 1.5px solid transparent;
    border-radius: 14px;
    background: #f3f3f3;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    outline: none;
}

.rate-textarea-wrap textarea:focus {
    border-color: var(--blue);
    background: #fff;
}

.rate-counter {
    text-align: right;
    margin-top: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
}

.rate-submit {
    width: 100%;
    height: 52px;
    margin-top: 22px;
    border: 0;
    border-radius: 999px;
    background: var(--blue-dark);
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: background .2s ease;
}

.rate-submit:hover {
    background: #4b95dc;
}

.rate-submit:disabled {
    background: #cbd2db;
    cursor: not-allowed;
}

/* THANK-YOU MODAL */
.rate-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(31, 36, 48, .5);
    z-index: 6000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.rate-backdrop.open {
    display: flex;
}

.rate-modal {
    width: 100%;
    max-width: 340px;
    background: #fff;
    border-radius: 18px;
    padding: 28px 24px 22px;
    text-align: center;
    box-shadow: 0 24px 60px rgba(0, 0, 0, .25);
    animation: ratePop .22s ease;
}

@keyframes ratePop {
    from { opacity: 0; transform: scale(.9); }
    to { opacity: 1; transform: scale(1); }
}

.rate-modal-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: var(--blue-dark);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 800;
}

.rate-modal h3 {
    font-family: 'Baloo 2', cursive;
    font-size: 22px;
    margin-bottom: 8px;
    color: var(--ink);
}

.rate-modal p {
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 20px;
}

.rate-done {
    width: 100%;
    height: 46px;
    border: 0;
    border-radius: 10px;
    background: var(--blue-dark);
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
}

.rate-done:hover {
    background: #4b95dc;
}

@media (max-width: 700px) {
    .header-inner {
        padding: 9px 14px;
    }

    .rate-container {
        margin-top: 0;
        padding: 20px 14px 48px;
    }

    .rate-question {
        font-size: 21px;
    }

    .rate-stars {
        gap: 12px;
    }

    .rate-star {
        width: 40px;
        height: 40px;
    }
}

@media (max-width: 380px) {
    .page-title {
        font-size: 19px;
    }

    .rate-scale {
        font-size: 11px;
    }
}
`;
