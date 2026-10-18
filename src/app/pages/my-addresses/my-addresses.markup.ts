// Page markup + CSS carried over unchanged from my-addresses.html.
// Migrate this to a real Angular template (.html) / .scss one page at a time.
export const TITLE = `My Addresses - FurryCorner PH`;
export const BODY_CLASS = ``;

export const HTML = `<header class="page-header"><div class="header-inner"><h1 class="page-title">My Addresses</h1><a class="back-link" href="profile.html">Back to profile</a></div></header>
<main>
    <section aria-labelledby="address-form-title">
        <h2 class="section-title" id="address-form-title">Add an address</h2>
        <form class="address-form" id="addressForm">
            <input type="hidden" id="addressId">

            <div class="map-picker" id="mapPicker">
                <label for="mapSearch">Find your location on the map (optional)</label>
                <div class="map-search-wrap">
                    <input id="mapSearch" type="search" autocomplete="off" maxlength="200" placeholder="Search a place or address" disabled>
                    <div class="map-suggestions" id="mapSuggestions" role="listbox" hidden></div>
                </div>
                <div class="map-canvas" id="mapCanvas" aria-label="Map for choosing your address"></div>
                <div class="map-actions"><button class="button secondary" id="useMyLocation" type="button" disabled>Use my current location</button></div>
                <p class="map-coords" id="mapCoords">No map location selected.</p>
                <p class="status" id="mapStatus" role="status" aria-live="polite">Loading map...</p>
            </div>
            <div class="field"><label for="addressLabel">Address name</label><input id="addressLabel" maxlength="50" placeholder="Home, Work, or another name" required></div>
            <div class="field-grid">
                <div class="field"><label for="firstName">First name</label><input id="firstName" maxlength="50" required></div>
                <div class="field"><label for="lastName">Last name</label><input id="lastName" maxlength="50" required></div>
            </div>
                        
            <div class="field">
                <label for="addressLine">House number, street, building</label>
                <input id="addressLine" maxlength="255" required>
            </div>

            <div class="field">
                <label for="region">Region</label>
                <select id="region" required>
                    <option value="NCR" selected>National Capital Region (NCR)</option>
                </select>
            </div>

            <div class="field">
                <label for="province">Province</label>
                <select id="province" required disabled>
                    <option value="">Select province</option>
                </select>
            </div>

            <div class="field-grid">
                <div class="field">
                    <label for="city">City / Municipality</label>
                    <select id="city" required disabled>
                        <option value="">Select city / municipality</option>
                    </select>
                </div>
                <div class="field">
                    <label for="barangay">Barangay</label>
                    <select id="barangay" required disabled>
                        <option value="">Select barangay</option>
                    </select>
                </div>
            </div>
            <p class="psgc-note">Address list source: Philippine Statistics Authority (PSA), Philippine Standard Geographic Code (PSGC), as of 30 September 2026.</p>

            <div class="field-grid">
                <div class="field"><label for="postalCode">Postal code</label><input id="postalCode" maxlength="20" required></div>
                <div class="field"><label for="phone">Phone number</label><input id="phone" type="tel" maxlength="20" required></div>
            </div>
            <label class="default-control"><input id="isDefault" type="checkbox"> Set as my default address</label>
            <div class="form-actions"><button class="button" id="saveAddress" type="submit">Save address</button><button class="button secondary" id="cancelEdit" type="button" hidden>Cancel</button></div>
            <p class="status" id="addressStatus" role="status" aria-live="polite"></p>
        </form>
    </section>
    <section aria-labelledby="saved-address-title">
        <h2 class="section-title" id="saved-address-title">Saved addresses</h2>
        <div class="address-list" id="addressList" aria-live="polite"></div>
    </section>
</main>`;

export const CSS = `
:root{--blue:#7BB8F0;--blue-dark:#5CA3E8;--cream:#FCE3C0;--cream-light:#FDEEDA;--ink:#1F2430;--muted:#8b929e;--border:#e2e6ec;--white:#fff;--danger:#c9554d}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;background:var(--cream);color:var(--ink);font:600 15px 'Nunito',sans-serif;line-height:1.5;padding-bottom:36px}
a{color:inherit;text-decoration:none}
.page-header{background:var(--white);border-bottom:1px solid var(--border)}
.header-inner{max-width:900px;min-height:64px;margin:auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.back-link{color:var(--blue-dark);font-weight:800}
.page-title{font:800 22px 'Baloo 2',cursive;color:var(--blue-dark)}
main{max-width:900px;margin:28px auto;padding:0 20px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.9fr);gap:24px;align-items:start}
.section-title{font:800 21px 'Baloo 2',cursive;margin-bottom:14px}
.address-form,.address-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:20px}
.address-form{display:grid;gap:13px}
.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:grid;gap:5px}
.field label{font-size:12px;font-weight:800;color:#626b79}
.field input{width:100%;height:42px;padding:0 11px;border:1px solid var(--border);border-radius:8px;background:#fff;font:600 14px 'Nunito',sans-serif;color:var(--ink)}
.field input:focus{outline:2px solid rgba(92,163,232,.25);border-color:var(--blue-dark)}
.field select{
    width:100%;
    min-height:42px;
    padding:0 11px;
    border:1px solid var(--border);
    border-radius:8px;
    background:#fff;
    font:600 14px 'Nunito',sans-serif;
    color:var(--ink);
}

.field select:focus{
    outline:2px solid rgba(92,163,232,.25);
    border-color:var(--blue-dark);
}

.field select:disabled{
    background:#f3f4f6;
    color:#8b929e;
}
.default-control{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700}
.default-control input{width:18px;height:18px;accent-color:var(--blue-dark)}
.form-actions{display:flex;gap:9px}
.button{min-height:42px;padding:0 16px;border:0;border-radius:8px;background:var(--blue-dark);color:#fff;font:800 14px 'Nunito',sans-serif;cursor:pointer}
.button.secondary{border:1px solid var(--border);background:var(--cream-light);color:var(--ink)}
.button:disabled{opacity:.6;cursor:wait}
.status{min-height:22px;color:#39784c;font-size:13px;font-weight:800}
.status.error{color:var(--danger)}
.address-list{display:grid;gap:10px}
.address-card{padding:15px 16px}
.address-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:7px}
.address-card h3{font:800 17px 'Baloo 2',cursive}
.default-badge{padding:3px 8px;border-radius:20px;background:var(--cream-light);color:var(--blue-dark);font-size:11px;font-weight:800;white-space:nowrap}
.address-card p{font-size:13px;color:#596170;line-height:1.55;overflow-wrap:anywhere}
.address-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.address-actions button{border:0;background:none;padding:2px 0;color:var(--blue-dark);font:800 13px 'Nunito',sans-serif;cursor:pointer}
.address-actions button.delete{color:var(--danger)}
.map-picker{display:grid;gap:8px}
.map-picker>label{font-size:12px;font-weight:800;color:#626b79}
.map-search-wrap{position:relative}
.map-search-wrap input{width:100%;height:42px;padding:0 11px;border:1px solid var(--border);border-radius:8px;background:#fff;font:600 14px 'Nunito',sans-serif;color:var(--ink)}
.map-search-wrap input:focus{outline:2px solid rgba(92,163,232,.25);border-color:var(--blue-dark)}
.map-search-wrap input:disabled{background:#f3f4f6}
.map-suggestions{position:absolute;z-index:20;left:0;right:0;top:46px;background:#fff;border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,.12);max-height:240px;overflow:auto}
.map-suggestions[hidden]{display:none}
.map-suggestions button{display:block;width:100%;min-height:42px;padding:9px 12px;border:0;border-bottom:1px solid var(--border);background:#fff;text-align:left;font:600 13px 'Nunito',sans-serif;color:var(--ink);cursor:pointer}
.map-suggestions button:last-child{border-bottom:0}
.map-suggestions button:hover,.map-suggestions button:focus{background:var(--cream-light)}
.map-suggestions .map-suggestions-empty{padding:10px 12px;font-size:13px;color:#687180}
.map-canvas{width:100%;height:280px;border:1px solid var(--border);border-radius:10px;background:#e9edf3}
.map-canvas[hidden]{display:none}
.map-coords{font-size:12px;color:#596170}
.psgc-note{font-size:11px;font-weight:600;color:#8b929e;line-height:1.4}
.empty-state{padding:16px;background:rgba(255,255,255,.65);border-radius:10px;color:#687180;font-size:14px}
@media(max-width:700px){main{grid-template-columns:1fr;margin-top:18px;padding:0 14px;gap:22px}.header-inner{padding:9px 14px}.address-form{padding:16px}.map-canvas{height:240px}}
@media(max-width:380px){.field-grid{grid-template-columns:1fr}.page-title{font-size:19px}.form-actions{flex-wrap:wrap}}
`;