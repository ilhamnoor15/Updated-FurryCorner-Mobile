// Page markup + CSS carried over unchanged from signin.html.
// Migrate this to a real Angular template (.html) / .scss one page at a time.
export const TITLE = `Log In - FurryCorner PH`;
export const BODY_CLASS = ``;

export const HTML = `<div class="page">

    <header class="topbar">
        <a class="brand" href="index.html">FurryCorner PH</a>
        <a class="back" href="profile.html">Profile</a>
    </header>

    <main class="panel">

        <h1>Welcome back</h1>

        <p class="intro">
            Sign in to continue to FurryCorner
        </p>

        <!-- Email Login -->
        <form id="loginForm">

            <div class="field">
                <label for="email">
                    Email address
                </label>

                <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autocomplete="email"
                    required
                >
            </div>

            <div class="field">
                <label for="password">
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    autocomplete="current-password"
                    required
                >
            </div>

            <button
                class="button"
                type="submit"
            >
                Continue with Email
            </button>

            <p
                class="error"
                id="error"
                hidden
            ></p>

        </form>

        <p class="signup">
            Don't have an account?
            <a
                id="signupLink"
                href="signup.html"
            >
                Sign up
            </a>
        </p>

        <p class="guest-link">
            <a href="index.html">Continue as guest</a>
        </p>

    </main>
</div>`;

export const CSS = `
:root{
    --blue:#7BB8F0;
    --blue-dark:#5CA3E8;
    --cream-light:#FDEEDA;
    --ink:#1F2430;
    --white:#fff;
    --border:#e5e7eb;
    --error:#c9554d;
}

*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

body{
    font-family:'Nunito',sans-serif;
    color:var(--ink);
    background:var(--cream-light);
    line-height:1.5;
    min-height:100vh;
}

h1{
    font:800 31px 'Baloo 2',cursive;
}

a{
    text-decoration:none;
    color:inherit;
}

/* =========================
   MAIN PAGE
========================= */

.page{
    min-height:100vh;
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    gap:14px;
    padding:24px 16px;

    background:#FDEEDA;
}

/* =========================
   TOP BAR
========================= */

.topbar{
    display:none;
}

.brand{
    font:800 25px 'Baloo 2',cursive;
    color:var(--blue-dark);
}

.back,
.link{
    color:var(--blue-dark);
    font-weight:800;
}

/* =========================
   LOGIN PANEL
========================= */

.panel{
    width:100%;
    max-width:520px;
    background:var(--white);
    border-radius:22px;
    padding:30px 42px;
    box-shadow:0 5px 18px #1f243012;
    text-align:center;
}

/* =========================
   LOGO
========================= */

.panel::before{
    content:"";
    display:block;
    width:140px;
    height:140px;
    margin:0 auto 8px;
    background:url("images/logo.png") center/contain no-repeat;
}

/* =========================
   INTRO
========================= */

.intro{
    margin:4px 0 20px;
    color:#7c8490;
    font-size:14px;
}

/* =========================
   FORM
========================= */

.field{
    margin-top:17px;
    text-align:left;
}

.field label{
    display:block;
    margin-bottom:8px;

    color:#8792a5;

    font-size:13px;
    font-weight:800;

    text-transform:uppercase;
    letter-spacing:.3px;
}

.field input{
    width:100%;
    height:61px;

    border:1.5px solid var(--border);
    border-radius:12px;

    padding:0 20px;

    outline:none;

    background:#fff;
    color:var(--ink);

    font:600 16px 'Nunito',sans-serif;

    transition:
        border-color .2s ease,
        box-shadow .2s ease;
}

.field input::placeholder{
    color:#a1a9b5;
}

.field input:focus{
    border-color:var(--blue);
    box-shadow:0 0 0 3px rgba(123,184,240,.16);
}

/* =========================
   LOGIN BUTTON
========================= */

.button{
    width:100%;
    height:63px;

    border:0;
    border-radius:12px;

    margin-top:22px;

    background:var(--blue);

    color:#fff;

    font:800 17px 'Nunito',sans-serif;

    cursor:pointer;

    transition:
        background .2s ease,
        transform .15s ease,
        box-shadow .2s ease;
}

.button:hover{
    background:var(--blue-dark);
    box-shadow:0 5px 12px rgba(92,163,232,.22);
}

.button:active{
    transform:scale(.99);
}

/* =========================
   ERROR
========================= */

.error{
    margin-top:14px;
    color:var(--error);
    font-weight:800;
    font-size:14px;
}

/* =========================
   SIGN UP
========================= */

.signup{
    margin-top:25px;
    text-align:center;
    font-size:15px;
    color:#7c8490;
}

.signup a{
    color:var(--blue-dark);
    font-weight:800;
}

.signup a:hover{
    text-decoration:underline;
}

.guest-link{
    margin-top:14px;
    text-align:center;
    font-size:14px;
    color:#7c8490;
}

.guest-link a{
    color:var(--blue-dark);
    font-weight:800;
}

/* =========================
   RESPONSIVE
========================= */

@media(max-width:600px){

    .page{
        padding:20px 12px;
    }

    .panel{
        max-width:520px;
        padding:25px 24px;
        border-radius:20px;
    }

    .panel::before{
        width:120px;
        height:120px;
        margin-bottom:5px;
    }

    h1{
        font-size:29px;
    }

    .google-button{
        height:58px;
        font-size:16px;
    }

    .field input{
        height:58px;
    }

    .button{
        height:59px;
    }
}

@media(max-width:380px){

    .panel{
        padding:22px 18px;
    }

    .panel::before{
        width:105px;
        height:105px;
    }

    h1{
        font-size:27px;
    }

    .intro{
        font-size:13px;
    }

    .google-button{
        font-size:15px;
        gap:12px;
    }
}
`;
