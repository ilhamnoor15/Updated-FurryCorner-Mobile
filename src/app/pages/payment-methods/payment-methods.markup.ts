
export const TITLE = `Bank Accounts / Cards - FurryCorner PH`;
export const BODY_CLASS = ``;

export const HTML = `
<header class="page-header">
    <div class="header-inner">
        <a class="back-link" href="profile.html" aria-label="Back to My Account">
            <span aria-hidden="true">←</span>
            <span>Back</span>
        </a>
        <h1 class="page-title">Bank Accounts / Cards</h1>
    </div>
</header>

<main>
    <section aria-labelledby="method-form-title">
        <h2 class="section-title" id="method-form-title">Add a payment method</h2>

        <form class="method-form" id="methodForm">
            <div class="field">
                <label for="methodType">Account type</label>
                <select id="methodType">
                    <option value="card">Credit or debit card</option>
                    <option value="bank">Bank account</option>
                </select>
            </div>

            <div class="field">
                <label for="methodLabel">Name this method</label>
                <input id="methodLabel" maxlength="50" placeholder="Personal card, Payroll, or another name" required>
            </div>

            <div class="field">
                <label for="provider" id="providerLabel">Card brand</label>
                <input id="provider" maxlength="50" placeholder="Visa, Mastercard, etc." required>
            </div>

            <div class="field">
                <label for="accountHolder">Name on account</label>
                <input id="accountHolder" maxlength="100" autocomplete="name" required>
            </div>

            <div class="field">
                <label for="accountNumber" id="numberLabel">Card number</label>
                <input id="accountNumber" type="text" inputmode="numeric" autocomplete="off" maxlength="23" pattern="[0-9 ]{8,27}" required aria-describedby="securityNote">
            </div>

            <div class="field-grid" id="expiryFields">
                <div class="field">
                    <label for="expiry">Expiration</label>
                    <input id="expiry" type="month" autocomplete="cc-exp" required>
                </div>
            </div>

            <label class="default-control">
                <input id="isDefault" type="checkbox">
                <span>Set as my default payment method</span>
            </label>

            <p class="security-note" id="securityNote">
                Only the account type, name, provider, and last four digits are saved.
                The full number and CVV are not stored. Saved methods are displayed at
                checkout; payment processing is not enabled.
            </p>

            <div class="form-actions">
                <button class="button" id="saveMethod" type="submit">Save payment method</button>
            </div>

            <p class="status" id="methodStatus" role="status" aria-live="polite"></p>
        </form>
    </section>

    <section aria-labelledby="saved-methods-title">
        <h2 class="section-title" id="saved-methods-title">Saved methods</h2>
        <div class="method-list" id="methodList" aria-live="polite"></div>
    </section>
</main>`;

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
    --danger: #c9554d;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html,
body {
    width: 100%;
    min-height: 100%;
    max-width: 100%;
    overflow-x: clip;
}

body {
    min-height: 100vh;
    background: var(--cream);
    color: var(--ink);
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    padding-bottom: 36px;
}

a {
    color: inherit;
    text-decoration: none;
}

/* FULL-WIDTH NAVBAR — MATCHES MY ADDRESSES */
.page-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: block;
    width: 100%;
    max-width: none;
    box-sizing: border-box;
    margin: 0;
    background: var(--white);
    border: 0;
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
}

.back-link span:first-child {
    font-size: 24px;
    line-height: 1;
}

.back-link:hover {
    background: var(--cream-light);
}

.back-link:focus-visible {
    outline: 2px solid var(--blue-dark);
    outline-offset: 2px;
}

.page-title {
    min-width: 0;
    margin: 0;
    font-family: 'Baloo 2', cursive;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--blue-dark);
    text-align: left;
    overflow-wrap: anywhere;
}

/* PAGE CONTENT */
main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
    align-items: start;
    gap: 24px;
    width: 100%;
    max-width: 900px;
    min-width: 0;
    margin: 28px auto;
    padding: 0 20px;
}

main section {
    min-width: 0;
}

.section-title {
    margin-bottom: 14px;
    font-family: 'Baloo 2', cursive;
    font-size: 21px;
    font-weight: 800;
    line-height: 1.3;
}

.method-form,
.method-card {
    min-width: 0;
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
}

.method-form {
    display: grid;
    gap: 13px;
}

.field {
    display: grid;
    min-width: 0;
    gap: 5px;
}

.field label {
    color: #626b79;
    font-size: 12px;
    font-weight: 800;
}

.field input,
.field select {
    display: block;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 42px;
    padding: 0 11px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    color: var(--ink);
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 600;
}

.field input:focus,
.field select:focus {
    outline: 2px solid rgba(92, 163, 232, .25);
    border-color: var(--blue-dark);
}

.field-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
}

.default-control {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
    font-weight: 700;
}

.default-control input {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    accent-color: var(--blue-dark);
}

.security-note {
    padding: 11px 12px;
    border-left: 3px solid var(--blue-dark);
    background: var(--cream-light);
    color: #5b6472;
    font-size: 12px;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
}

.button {
    min-height: 42px;
    padding: 0 16px;
    border: 0;
    border-radius: 8px;
    background: var(--blue-dark);
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
}

.button:disabled {
    opacity: .6;
    cursor: wait;
}

.status {
    min-height: 22px;
    color: #39784c;
    font-size: 13px;
    font-weight: 800;
    overflow-wrap: anywhere;
}

.status.error {
    color: var(--danger);
}

.method-list {
    display: grid;
    min-width: 0;
    gap: 10px;
}

.method-card {
    padding: 15px 16px;
}

.method-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 7px;
}

.method-card h3 {
    font-family: 'Baloo 2', cursive;
    font-size: 17px;
    font-weight: 800;
    overflow-wrap: anywhere;
}

.default-badge {
    padding: 3px 8px;
    border-radius: 20px;
    background: var(--cream-light);
    color: var(--blue-dark);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
}

.method-card p {
    color: #596170;
    font-size: 13px;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.method-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.method-actions button {
    padding: 2px 0;
    border: 0;
    background: none;
    color: var(--blue-dark);
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
}

.method-actions button.delete {
    color: var(--danger);
}

.empty-state {
    padding: 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, .65);
    color: #687180;
    font-size: 14px;
    overflow-wrap: anywhere;
}

/* RESPONSIVE LAYOUT */
@media (max-width: 700px) {
    .header-inner {
        padding: 9px 14px;
        gap: 12px;
    }

    .page-title {
        font-size: 19px;
    }

    main {
        grid-template-columns: minmax(0, 1fr);
        gap: 22px;
        margin: 18px auto 0;
        padding: 0 14px;
    }

    .method-form {
        padding: 16px;
    }
}

@media (min-width: 480px) and (max-width: 700px) {
    .field-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}

@media (max-width: 380px) {
    .header-inner {
        gap: 8px;
    }

    .back-link {
        gap: 4px;
        padding: 0 5px;
        font-size: 13px;
    }

    .page-title {
        font-size: 18px;
    }

    .section-title {
        font-size: 19px;
    }
}
`;
