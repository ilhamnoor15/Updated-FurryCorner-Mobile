// Page markup + CSS carried over from privacy-settings.html, restyled so Language, Notifications, Privacy Settings,
// Help Centre, Community Rules and FurryCorner Policies all share the same header and intro band.
export const TITLE = `Privacy Settings - FurryCorner`;
export const BODY_CLASS = ``;

export const HTML = `<header class="page-header">
                        <div class="header-inner">
                            <a class="back-link" href="profile.html" aria-label="Back to My Account">
                                <span aria-hidden="true">←</span>
                                <span>Back</span>
                            </a>
                            <h1 class="page-title">Privacy Settings</h1>
                        </div>
                    </header>
<section class="intro-band"><div class="intro-inner"><p class="eyebrow">Settings</p><h1>Privacy Settings</h1><p>Control how your account information is shared.</p></div></section>
<main class="content settings-content">
  <div class="panel settings-panel">
    <div class="option">
      <div class="option-text">
        <strong>Profile visibility</strong>
        <span>Allow others to see your public profile</span>
      </div>
      <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
    </div>

    <div class="option">
      <div class="option-text">
        <strong>Activity insights</strong>
        <span>Share usage insights with the app</span>
      </div>
      <label class="switch"><input type="checkbox"><span class="slider"></span></label>
    </div>

    <div class="option">
      <div class="option-text">
        <strong>Saved data sync</strong>
        <span>Sync your preferences across devices</span>
      </div>
      <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
    </div>
  </div>
</main>`;

export const CSS = `
:root{--blue:#7BB8F0;--blue-dark:#5CA3E8;--cream-light:#FDEEDA;--ink:#1F2430;--white:#fff;--muted:#7c8490;--border:#e2e6ec}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Nunito',sans-serif;color:var(--ink);background:var(--cream-light);line-height:1.55}
a{color:inherit;text-decoration:none}
h1,h2,h3,.brand{font-family:'Baloo 2',cursive}
.site-header{background:var(--white);border-bottom:1px solid var(--border)}
.brand{display:flex;align-items:center;gap:10px;color:var(--blue-dark);font-size:23px;font-weight:800}
.brand img{width:40px;height:40px;object-fit:contain}
.intro-band{background:var(--blue);padding:42px 16px}
.intro-inner{width:min(100%,960px);margin:auto}
.eyebrow{color:#245784;font-size:12px;font-weight:800;text-transform:uppercase}
.intro-band h1{font-size:40px;line-height:1.12;margin:7px 0}
.intro-band p{max-width:640px;color:#26394b}
.content{width:min(100% - 32px,880px);margin:auto}
.back-link:focus-visible{outline:3px solid #245784;outline-offset:3px}

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
@media(max-width:560px){.header-inner{min-height:60px}.brand{font-size:20px}.brand img{width:34px;height:34px}.intro-band{padding:34px 16px}.intro-band h1{font-size:34px}}

.option{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border-top:1px solid rgba(31,42,68,.08)}
.option:first-child{border-top:0}
.option-text strong{display:block;font-size:15px;margin-bottom:3px}
.option-text span{font-size:12.5px;color:var(--muted)}
.switch{position:relative;flex:0 0 48px;width:48px;height:28px;background:#dfe5ec;border-radius:999px;display:inline-block;cursor:pointer}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;inset:0;border-radius:999px;transition:.2s ease}
.slider:before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s ease;box-shadow:0 3px 8px rgba(31,36,48,.16)}
.switch input:checked + .slider{background:var(--blue-dark)}
.switch input:checked + .slider:before{transform:translateX(20px)}
.switch input:focus-visible + .slider{outline:3px solid #245784;outline-offset:2px}
`;
