// Shared markup + style for the burger-menu pages (same look as About FurryCorner).
const header = (title: string) => `
<header class="page-header">
  <div class="header-inner">
    <button class="back-link" id="menuBack" type="button" aria-label="Back">
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
    <h1 class="page-title">${title}</h1>
  </div>
</header>`;

const band = (eyebrow: string, title: string, sub: string) => `
<section class="intro-band">
  <div class="intro-inner">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p>${sub}</p>
  </div>
</section>`;

const footer = `<footer>FurryCorner PH</footer>`;

/* ---------------- About Us (Company History) ---------------- */
export const aboutUsPage = {
  title: 'About Us - FurryCorner PH',
  html: `${header('About Us')}
${band('Our story', 'About FurryCorner', 'Pet essentials and care services, together in one platform.')}
<main class="content">
  <section class="section">
    <div class="section-heading"><h2>Company History</h2></div>
    <div class="history-layout">
      <p class="history-year">2026</p>
      <div class="history-copy">
        <p>FurryCorner was founded in 2026 by IT students and pet owners frustrated with buying pet products, booking grooming, and arranging boarding across disconnected stores and platforms.</p>
        <p>It brings online cat and dog product retail together with grooming, daily care, and boarding in one platform.</p>
      </div>
    </div>
  </section>
</main>
${footer}`
};

/* ---------------- About our Products ---------------- */
export const productsPage = {
  title: 'Our Products - FurryCorner PH',
  html: `${header('Our Products')}
${band('What we offer', 'About our Products', 'Everything your cat or dog needs, in one place.')}
<main class="content">
  <section class="section">
    <div class="section-heading"><h2>Products &amp; Services</h2></div>
    <div class="info-grid">
      <article class="info-card">
        <h3>Cat &amp; Dog Products</h3>
        <p>Browse and buy pet essentials for cats and dogs online, with delivery straight to your door.</p>
      </article>
      <article class="info-card">
        <h3>Grooming</h3>
        <p>Book grooming appointments for your pet and track the booking status in the app.</p>
      </article>
      <article class="info-card">
        <h3>Daily Care</h3>
        <p>Arrange everyday pet care services without going through a separate platform.</p>
      </article>
      <article class="info-card">
        <h3>Boarding</h3>
        <p>Reserve a boarding stay for your pet when you're away.</p>
      </article>
    </div>
    <div class="cta-row">
      <a class="submit-button" href="index.html">Shop products</a>
      <a class="submit-button alt" href="services.html">See services</a>
    </div>
  </section>
</main>
${footer}`
};

/* ---------------- About the App ---------------- */
export const appPage = {
  title: 'About the App - FurryCorner PH',
  html: `${header('About the App')}
${band('The app', 'About the App', 'Everyday pet shopping and care, made simple.')}
<main class="content">
  <section class="section">
    <div class="section-heading"><h2>What you can do</h2></div>
    <div class="app-layout">
      <p class="app-copy">FurryCorner brings everyday pet shopping and care tasks together, from choosing products to arranging services.</p>
      <ul class="feature-list">
        <li><span class="feature-mark" aria-hidden="true">+</span><span>Browse and buy pet products</span></li>
        <li><span class="feature-mark" aria-hidden="true">+</span><span>Book pet care services</span></li>
        <li><span class="feature-mark" aria-hidden="true">+</span><span>Order and delivery tracking</span></li>
        <li><span class="feature-mark" aria-hidden="true">+</span><span>Notifications</span></li>
        <li><span class="feature-mark" aria-hidden="true">+</span><span>Secure payments</span></li>
      </ul>
    </div>
  </section>
</main>
${footer}`
};

/* ---------------- Developers ---------------- */

const DEVELOPERS = [
  {
    name: 'Jocielle F. Buenavista',
    role: 'Project Leader & UI/UX Designer',
    photo: 'images/developer2.jpg'
  },
  {
    name: 'Jhamylle Rhon A. Oira',
    role: 'API Integration & Security Developer',
    photo: 'images/developer1.jpg'
  },
  {
    name: 'Ilham N. Noor',
    role: 'Backend & API Integration Developer',
    photo: 'images/developer3.jpg'
  },
  {
    name: 'Gilbert Meco Mari R. Torrevillas',
    role: 'UI/UX & Front-End Developer',
    photo: 'images/developer4.jpg'
  }
];



export const developersPage = {
  title: 'Developers - FurryCorner PH',
  html: `${header('Developers')}
${band('The team', 'Meet Our Developers', 'The people behind the design and development of FurryCorner Mobile.')}
<main class="content">
  <section class="section">
    <div class="developer-grid">
      ${DEVELOPERS.map(d => `
      <article class="developer-card">
        <img class="developer-photo" src="${d.photo}" alt="Photo of ${d.name}">
        <div class="developer-info">
          <h3>${d.name}</h3>
          <p class="developer-role">${d.role}</p>
        </div>
      </article>`).join('')}
    </div>
  </section>
</main>
${footer}`
};


/* ---------------- Contact Us ---------------- */
export const contactPage = {
  title: 'Contact Us - FurryCorner PH',
  html: `${header('Contact Us')}
${band('Get in touch', 'Contact Us', "Questions about an order or a booking? We'd love to hear from you.")}
<main class="content">
  <section class="section">
    <div class="contact-layout">
      <div class="contact-details">
        <div class="contact-item"><h3>Email</h3><p>furrycorner@gmail.com</p></div>
        <div class="contact-item"><h3>Phone</h3><p>09661657441</p></div>
      </div>
      <form class="contact-form" id="contactForm">
        <div class="form-field"><label for="contactName">Name</label><input id="contactName" name="name" autocomplete="name" required></div>
        <div class="form-field"><label for="contactEmail">Email</label><input id="contactEmail" name="email" type="email" autocomplete="email" required></div>
        <div class="form-field"><label for="contactMessage">Message</label><textarea id="contactMessage" name="message" required></textarea></div>
        <button class="submit-button" type="submit">Send message</button>
        <p class="form-status" id="formStatus" role="status" hidden></p>
      </form>
    </div>
  </section>
</main>
${footer}`
};


export function wireBack(location: any): void {
  document.getElementById('menuBack')?.addEventListener('click', () => {
    const token = localStorage.getItem('furryCornerAuthToken');
    const userId = localStorage.getItem('loggedInUserId');
    const savedUser = localStorage.getItem('loggedInUser');

    let user = null;

    try {
      user = JSON.parse(savedUser || 'null');
    } catch {
      user = null;
    }

    const isAuthenticated = Boolean(token && userId && user);

    // Guests should return to Home, not be redirected to Sign In.
    if (!isAuthenticated) {
      location.assign('index.html');
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      location.assign('index.html');
    }
  });
}


/* ---------------- Shared CSS ---------------- */
export const MENU_CSS = `
:root{
  --blue:#7BB8F0; --blue-dark:#5CA3E8; --cream:#FCE3C0; --cream-light:#FDEEDA;
  --ink:#1F2430; --white:#fff; --muted:#7c8490; --border:#e2e6ec;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;color:var(--ink);background:var(--cream-light);line-height:1.55}
a{color:inherit;text-decoration:none}
button,input,textarea{font:inherit}
h1,h2,h3{font-family:'Baloo 2',cursive}

.back-link{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex-shrink:0;min-height:40px;padding:0 8px;border-radius:10px;color:var(--blue-dark);font-size:14px;font-weight:800;white-space:nowrap}
.back-link span:first-child{font-size:24px;line-height:1}
.back-link:hover{background:var(--cream-light)}
.page-title{font:800 22px 'Baloo 2',cursive;color:var(--blue-dark);text-align:left}

.intro-band{background:var(--blue);padding:44px 16px 48px}
.intro-inner{width:min(100%,1080px);margin:auto}
.eyebrow{color:#245784;font-size:12px;font-weight:800;text-transform:uppercase}
.intro-band h1{font-size:42px;line-height:1.1;margin:8px 0 12px}
.intro-band p{max-width:650px;color:#26394b;font-size:17px}

.content{width:min(100% - 32px,960px);margin:auto}
.section{padding:42px 0;border-bottom:1px solid #e4d8c7}
.section-heading{display:flex;align-items:baseline;gap:12px;margin-bottom:18px}
.section h2{font-size:28px;line-height:1.2}

.history-layout{display:grid;grid-template-columns:150px 1fr;gap:30px;align-items:start}
.history-year{font:800 42px 'Baloo 2',cursive;color:var(--blue-dark);line-height:1}
.history-copy{max-width:690px;display:grid;gap:12px;color:#515866}

.info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.info-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:0 3px 10px rgba(31,36,48,.06)}
.info-card h3{font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;margin-bottom:4px}
.info-card p{font-size:14px;color:#515866}
.cta-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}

.developer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.developer-card {
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(31,36,48,.06);
}

.developer-photo {
  display: block;
  width: 100%;
  height: 240px;
  object-fit: contain;
  object-position: center;
  background: #fce3c0;
}

.developer-info {
  min-width: 0;
  flex: 1;
  padding: 16px;
  text-align: center;
}

.developer-info h3 {
  font-family: 'Nunito', sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: center;
}

.developer-role {
  margin-top: 4px;
  color: var(--blue-dark);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.5;
  text-align: center;
}

.tasks-heading {
  margin-top: 16px;
  margin-bottom: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 800;
}

.app-layout,.contact-layout{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:36px;align-items:start}
.app-copy{max-width:360px;color:#515866}
.feature-list{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 18px}
.feature-list li{display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:700}
.feature-mark{flex:0 0 20px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--blue);color:#173c5e;font-size:12px;line-height:1}

.contact-details{display:grid;gap:17px;align-content:start}
.contact-item h3{font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase}
.contact-item p{font-size:15px;font-weight:700;overflow-wrap:anywhere}
.contact-form{display:grid;gap:13px}
.form-field{display:grid;gap:5px}
.form-field label{font-size:13px;font-weight:800}
.form-field input,.form-field textarea{width:100%;border:1px solid #d9dee5;border-radius:7px;background:var(--white);padding:11px 12px;color:var(--ink)}
.form-field input:focus,.form-field textarea:focus{outline:2px solid #b6d8f5;border-color:var(--blue-dark)}
.form-field textarea{min-height:112px;resize:vertical}
.submit-button{display:inline-block;justify-self:start;border:0;border-radius:7px;background:var(--blue-dark);color:var(--white);font-weight:800;padding:11px 18px;cursor:pointer}
.submit-button:hover{background:#438fd7}
.submit-button.alt{background:var(--cream);color:var(--ink)}
.submit-button.alt:hover{background:#f7d6a8}
.form-status{color:#7c522d;font-size:13px;font-weight:700}

button.back-link{border:0;background:transparent;cursor:pointer;font-family:inherit}

footer{padding:22px 16px 30px;text-align:center;color:var(--muted);font-size:13px}

@media(max-width:760px){
  .developer-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .developer-photo{height:125px}
  .app-layout,.contact-layout{grid-template-columns:1fr;gap:20px}
  .app-copy{max-width:620px}
}
@media(max-width:520px){
  .intro-band{padding:34px 16px 38px}
  .intro-band h1{font-size:34px}
  .intro-band p{font-size:15px}
  .section{padding:32px 0}
  .section h2{font-size:25px}
  .history-layout{grid-template-columns:1fr;gap:12px}
  .history-year{font-size:34px}
  .info-grid,.feature-list{grid-template-columns:1fr}
  .developer-grid{gap:10px}
  .developer-photo{height:110px}
  .developer-info{padding:9px}
  .developer-info h3{font-size:12px}
  .developer-info p{font-size:11px}
}
`;