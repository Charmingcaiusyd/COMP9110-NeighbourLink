$root = Split-Path -Parent $PSScriptRoot

function Get-Nav([string]$role, [string]$active) {
  if ($role -eq 'public') {
    return @"
<nav class="nav-links">
  <a class="nav-link $(if ($active -eq 'login') {'is-active'})" href="./index.html">Log In</a>
  <a class="nav-link $(if ($active -eq 'register') {'is-active'})" href="./register.html">Register</a>
</nav>
"@
  }
  if ($role -eq 'rider') {
    return @"
<nav class="nav-links">
  <a class="nav-link $(if ($active -eq 'find') {'is-active'})" href="./find-a-ride.html">Find a Ride</a>
  <a class="nav-link $(if ($active -eq 'my-trips') {'is-active'})" href="./my-trips.html">My Trips</a>
  <a class="nav-link $(if ($active -eq 'settings') {'is-active'})" href="./rider-settings.html">Settings</a>
  <a class="nav-link" href="./index.html">Log Out</a>
</nav>
"@
  }
  return @"
<nav class="nav-links">
  <a class="nav-link $(if ($active -eq 'driver-hub') {'is-active'})" href="./driver-hub.html">Driver Review</a>
  <a class="nav-link $(if ($active -eq 'driver-workflow') {'is-active'})" href="./driver-trip-workflow.html">Trip Workflow</a>
  <a class="nav-link $(if ($active -eq 'settings') {'is-active'})" href="./driver-settings.html">Settings</a>
  <a class="nav-link" href="./index.html">Log Out</a>
</nav>
"@
}

function New-Page([string]$name, [string]$title, [string]$role, [string]$active, [string]$subtitle, [string]$body, [string]$extraScripts = '') {
  $nav = Get-Nav $role $active
  $roleLabel = switch ($role) {
    'rider' { 'Rider Prototype Surface' }
    'driver' { 'Driver Prototype Surface' }
    default { 'Public Prototype Surface' }
  }
  $homeHref = if ($role -eq 'driver') { './driver-hub.html' } elseif ($role -eq 'rider') { './find-a-ride.html' } else { './index.html' }
  $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - NeighbourLink Static Prototype</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="site-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="$homeHref">
          <span class="brand-mark">NL</span>
          <span>
            <strong>NeighbourLink</strong>
            <span class="brand-subtitle">Reduced-Budget Stage 2 Prototype</span>
          </span>
        </a>
        $nav
      </div>
    </header>
    <main class="page-wrap">
      <section class="hero-card">
        <span class="eyebrow">$roleLabel</span>
        <h1>$title</h1>
        <p>$subtitle</p>
      </section>
      $body
    </main>
  </div>
  $extraScripts
</body>
</html>
"@
  Set-Content -Path (Join-Path $root $name) -Value $html -Encoding UTF8
}

$styles = @'
:root {
  --bg: #f4efe7;
  --panel: #fffdf9;
  --ink: #1f2a2a;
  --muted: #5c6a6a;
  --line: #d8d0c4;
  --brand: #0f766e;
  --brand-deep: #0b4f4a;
  --success: #2f855a;
  --warn: #b45309;
  --danger: #b91c1c;
  --shadow: 0 18px 45px rgba(31, 42, 42, 0.08);
  --radius-lg: 24px;
  --radius-md: 18px;
  --radius-sm: 12px;
  --content: 1120px;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(217, 119, 6, 0.12), transparent 30%),
    var(--bg);
  line-height: 1.55;
}

a { color: inherit; text-decoration: none; }
p, h1, h2, h3 { margin: 0; }
code {
  padding: 0.12rem 0.42rem;
  border-radius: 999px;
  background: #f1ede6;
  font-size: 0.93rem;
}

.site-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(244, 239, 231, 0.9);
  border-bottom: 1px solid rgba(216, 208, 196, 0.8);
}

.topbar-inner,
.page-wrap,
.page-footer {
  width: min(calc(100% - 2rem), var(--content));
  margin: 0 auto;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  font-size: 1rem;
}

.brand-mark {
  width: 2.8rem;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  color: white;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-subtitle {
  display: block;
  color: var(--muted);
  font-size: 0.82rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link,
.btn,
.chip-link,
.step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.42rem 0.78rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 600;
}

.nav-link,
.step {
  background: rgba(255, 255, 255, 0.66);
  border-color: rgba(216, 208, 196, 0.85);
}

.nav-link.is-active,
.chip-link.is-active,
.step.is-active {
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  color: white;
  border-color: transparent;
}

.btn {
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  color: white;
  box-shadow: 0 12px 25px rgba(15, 118, 110, 0.18);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

.btn-secondary,
.chip-link {
  background: rgba(255, 255, 255, 0.78);
  color: var(--ink);
  border: 1px solid rgba(216, 208, 196, 0.95);
  box-shadow: none;
}

.page-wrap {
  display: grid;
  gap: 1.25rem;
  padding: 1.4rem 0 3rem;
}

.hero-card,
.panel,
.card,
.notice,
.summary-box,
.route-card,
.table-card {
  background: var(--panel);
  border: 1px solid rgba(216, 208, 196, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.hero-card,
.panel,
.summary-box,
.route-card,
.table-card,
.notice,
.card {
  padding: 1.3rem;
  display: grid;
  gap: 0.8rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.09);
  color: var(--brand-deep);
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.panel-grid,
.results-grid,
.story-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.request-summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.two-column {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.15fr 0.85fr;
}

.card-meta,
.muted,
.field-hint,
.page-footer {
  color: var(--muted);
}

.is-hidden {
  display: none !important;
}

.card-actions,
.form-actions,
.demo-actions,
.chip-row,
.step-actions,
.stepper,
.helper-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.helper-links {
  margin-top: 0.2rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.auth-grid {
  display: grid;
  gap: 1rem;
}

.form-grid label {
  display: grid;
  gap: 0.4rem;
  font-weight: 600;
}

.field-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.demo-account-list {
  display: grid;
  gap: 0.75rem;
}

.demo-account-item {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(216, 208, 196, 0.95);
  background: rgba(255, 255, 255, 0.78);
}

.demo-account-item strong {
  display: block;
  margin-bottom: 0.2rem;
}

.search-assist {
  display: grid;
  gap: 0.55rem;
  margin-top: -0.2rem;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid rgba(216, 208, 196, 0.98);
  border-radius: var(--radius-sm);
  padding: 0.85rem 0.95rem;
  font: inherit;
  color: var(--ink);
  background: #fcfaf6;
}

textarea {
  min-height: 7rem;
  resize: vertical;
}

.step {
  gap: 0.42rem;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.88rem;
}

.step strong { color: inherit; }

.step-index {
  width: 1.35rem;
  height: 1.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(216, 208, 196, 0.96);
  color: var(--brand-deep);
}

.step.is-active .step-index {
  color: var(--brand-deep);
}

.notice-success { border-color: rgba(47, 133, 90, 0.32); background: #f4fbf7; }
.notice-warning { border-color: rgba(180, 83, 9, 0.3); background: #fff8ef; }
.notice-danger { border-color: rgba(185, 28, 28, 0.26); background: #fff5f5; }

.card.is-emphasis,
.section-highlight {
  border-color: rgba(15, 118, 110, 0.65);
  box-shadow: 0 18px 45px rgba(15, 118, 110, 0.14);
}

.context-line {
  color: var(--muted);
  font-size: 0.94rem;
}

.pill {
  display: inline-flex;
  width: fit-content;
  padding: 0.32rem 0.72rem;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.pill.pending { background: #fff4de; color: var(--warn); }
.pill.confirmed { background: #edf9f1; color: var(--success); }
.pill.rejected { background: #fff0f0; color: var(--danger); }

.route-card {
  background:
    linear-gradient(160deg, rgba(15, 118, 110, 0.08), rgba(255, 255, 255, 0.92)),
    repeating-linear-gradient(
      45deg,
      rgba(15, 118, 110, 0.07),
      rgba(15, 118, 110, 0.07) 10px,
      rgba(255, 255, 255, 0.85) 10px,
      rgba(255, 255, 255, 0.85) 20px
    );
}

.mini-map {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(216, 208, 196, 0.95);
  background: #f8f5ef;
}

.map-frame {
  width: 100%;
  min-height: 270px;
  border: 1px solid rgba(216, 208, 196, 0.95);
  border-radius: 20px;
  background: #f8f5ef;
}

.request-map-wrap {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.25rem;
}

.request-map-frame {
  min-height: 170px;
  height: 170px;
  border-radius: 14px;
}


.mini-map svg {
  display: block;
  width: 100%;
  height: auto;
}

.mini-map img {
  display: block;
  width: 100%;
  height: auto;
}

.map-caption {
  font-size: 0.92rem;
  color: var(--muted);
}

.suggestion-list {
  display: grid;
  gap: 0.55rem;
}

.suggestion-item {
  display: grid;
  gap: 0.18rem;
  width: 100%;
  text-align: left;
  padding: 0.58rem 0.72rem;
  border-radius: 16px;
  border: 1px solid rgba(216, 208, 196, 0.95);
  background: rgba(255, 255, 255, 0.88);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

.suggestion-item strong {
  font-size: 0.95rem;
}

.suggestion-item span {
  color: var(--muted);
  font-size: 0.88rem;
}

.route-points {
  display: grid;
  gap: 0.9rem;
}

.route-stop {
  display: grid;
  gap: 0.25rem;
  padding-left: 1.2rem;
  position: relative;
}

.route-stop::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.48rem;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: var(--brand);
  box-shadow: 0 0 0 5px rgba(15, 118, 110, 0.12);
}

.route-stop + .route-stop::after {
  content: "";
  position: absolute;
  left: 0.28rem;
  top: -1.05rem;
  width: 2px;
  height: 1.1rem;
  background: rgba(15, 118, 110, 0.35);
}

.journey-strip {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.journey-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(216, 208, 196, 0.95);
  font-weight: 700;
}

.journey-line {
  flex: 1 1 80px;
  min-width: 80px;
  height: 3px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    90deg,
    rgba(15, 118, 110, 0.85),
    rgba(15, 118, 110, 0.85) 10px,
    rgba(15, 118, 110, 0.16) 10px,
    rgba(15, 118, 110, 0.16) 18px
  );
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.96rem;
}

.table th,
.table td {
  text-align: left;
  padding: 0.85rem 0.7rem;
  border-bottom: 1px solid rgba(216, 208, 196, 0.74);
}

.table th {
  color: var(--muted);
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.anchor-section {
  scroll-margin-top: 6rem;
}

.js-enabled .flow-panel {
  display: none;
}

.js-enabled .flow-panel.is-visible {
  display: grid;
}

.page-footer {
  padding: 0 0 2.2rem;
  font-size: 0.93rem;
}

@media (max-width: 900px) {
  .two-column { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .topbar-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .nav-links {
    width: 100%;
    justify-content: flex-start;
  }

  .page-wrap,
  .page-footer,
  .topbar-inner {
    width: min(calc(100% - 1rem), var(--content));
  }
}
'@
Set-Content -Path (Join-Path $root 'styles.css') -Value $styles -Encoding UTF8

New-Page 'index.html' 'Log In' 'public' 'login' 'Use a simple sign-in form to enter the Rider or Driver walkthrough without adding backend complexity to the static prototype.' @'
<section class="panel">
  <h2>Demo Sign In</h2>
  <p class="muted">Enter a demo Rider or Driver account. Lightweight client-side logic sends the sign-in to the matching static walkthrough.</p>
  <form class="auth-grid" id="login-form" action="./find-a-ride.html" method="get">
    <div class="field-row">
      <label>Email<input id="login-email" name="email" type="email" value="daniel.rider@example.com" required></label>
      <label>Password<input id="login-password" name="password" type="password" value="123456" required></label>
    </div>
    <div class="form-actions">
      <button class="btn" id="login-submit" type="submit">Log In</button>
      <a class="btn btn-secondary" href="./register.html">Need an account? Register</a>
    </div>
  </form>
  <div class="demo-account-list" aria-label="Demo accounts">
    <article class="demo-account-item">
      <strong>Rider demo</strong>
      <span><code>daniel.rider@example.com</code> / <code>123456</code></span>
    </article>
    <article class="demo-account-item">
      <strong>Driver demo</strong>
      <span><code>emma.driver@example.com</code> / <code>demo1234</code></span>
    </article>
  </div>
</section>
'@ '<script src="./auth-flow.js"></script>'

New-Page 'register.html' 'Register' 'public' 'register' 'Create a Rider or Driver demo account and let the selected role route the prototype to the correct static surface.' @'
<section class="panel">
  <h2>Create Demo Account</h2>
  <p class="muted">Registration stays lightweight, but still demonstrates how role selection changes the next screen in the walkthrough.</p>
  <form class="auth-grid" id="register-form" action="./find-a-ride.html" method="get">
    <div class="field-row">
      <label>Role
        <select id="register-role" name="role">
          <option value="rider" selected>Rider</option>
          <option value="driver">Driver</option>
        </select>
      </label>
      <label>Full name<input id="register-name" name="name" type="text" value="Olivia Chen" required></label>
    </div>
    <div class="field-row">
      <label>Email<input id="register-email" name="email" type="email" value="olivia.rider@example.com" required></label>
      <label>Phone<input id="register-phone" name="phone" type="text" value="0412 555 901"></label>
    </div>
    <div class="field-row">
      <label>Suburb<input id="register-suburb" name="suburb" type="text" value="Clayton"></label>
      <label>Password<input id="register-password" name="password" type="password" value="demo1234" required></label>
    </div>
    <div class="form-actions">
      <button class="btn" id="register-submit" type="submit">Create Account</button>
      <a class="btn btn-secondary" href="./index.html">Back to Log In</a>
    </div>
  </form>
</section>
'@ '<script src="./auth-flow.js"></script>'

New-Page 'find-a-ride.html' 'Find a Ride' 'rider' 'find' 'Use the step controls to move between Origin, Destination, and Trip Date while previewing searchable OpenStreetMap context for the trip.' @'
<section class="panel">
  <div class="stepper" aria-label="Find a Ride steps">
    <a class="step is-active" data-step="origin" href="./find-a-ride.html#origin"><strong>Origin</strong></a>
    <a class="step" data-step="destination" href="./find-a-ride.html#destination"><strong>Destination</strong></a>
    <a class="step" data-step="trip-date" href="./find-a-ride.html#trip-date"><strong>Trip Date</strong></a>
  </div>
</section>
<section class="two-column anchor-section flow-panel is-visible" id="origin">
  <section class="panel">
    <h2>Origin (pickup)</h2>
    <div class="form-grid">
      <label>Suburb or landmark<input id="origin-search" type="text" value="Clayton Station Gate 2"></label>
      <div class="search-assist">
        <p class="field-hint">Search a real place or choose a suggested pickup point.</p>
        <div class="suggestion-list" id="origin-suggestions" aria-live="polite"></div>
      </div>
      <label>Nearby meeting hint<textarea>Monash bus interchange, pickup lane beside the station entrance.</textarea></label>
      <div class="step-actions">
        <a class="btn" href="./find-a-ride.html#destination">Continue to Destination</a>
      </div>
    </div>
  </section>
  <aside class="route-card">
    <h2>Route context</h2>
    <iframe id="origin-map" class="map-frame" title="Origin OpenStreetMap preview" loading="lazy"></iframe>
    <p class="map-caption" id="origin-map-caption">OpenStreetMap preview for the selected pickup area.</p>
    <div class="route-points">
      <div class="route-stop">
        <strong>Pickup zone</strong>
        <span id="origin-label">Clayton Station Gate 2</span>
      </div>
      <div class="route-stop">
        <strong>Rider note</strong>
        <span>Short walk from the bus interchange and station entrance.</span>
      </div>
    </div>
  </aside>
</section>
<section class="two-column anchor-section flow-panel" id="destination">
  <section class="panel">
    <h2>Destination</h2>
    <div class="summary-box">
      <p><strong>Origin:</strong> <span id="destination-origin-summary">Clayton Station Gate 2</span></p>
    </div>
    <div class="form-grid">
      <label>Destination suburb<input id="destination-search" type="text" value="Southern Cross Station"></label>
      <div class="search-assist">
        <p class="field-hint">Search a real destination or select a matching city stop.</p>
        <div class="suggestion-list" id="destination-suggestions" aria-live="polite"></div>
      </div>
      <label>Optional destination note<textarea>Southern Cross precinct, walking distance to the office tower.</textarea></label>
      <div class="step-actions">
        <a class="btn btn-secondary" href="./find-a-ride.html#origin">Back</a>
        <a class="btn" href="./find-a-ride.html#trip-date">Continue to Trip Date</a>
      </div>
    </div>
  </section>
  <aside class="route-card">
    <h2>Destination context</h2>
    <iframe id="destination-map" class="map-frame" title="Destination OpenStreetMap preview" loading="lazy"></iframe>
    <p class="map-caption" id="destination-map-caption">OpenStreetMap preview for the selected destination area.</p>
    <div class="route-points">
      <div class="route-stop">
        <strong>Destination area</strong>
        <span id="destination-label">Southern Cross Station</span>
      </div>
      <div class="route-stop">
        <strong>Arrival note</strong>
        <span>Walking distance to the office tower and train interchange.</span>
      </div>
    </div>
  </aside>
</section>
<section class="two-column anchor-section flow-panel" id="trip-date">
  <section class="panel">
    <h2>Trip date and rider details</h2>
    <div class="summary-box">
      <p><strong>Origin:</strong> <span id="trip-origin-summary">Clayton Station Gate 2</span></p>
      <p><strong>Destination:</strong> <span id="trip-destination-summary">Southern Cross Station</span></p>
    </div>
    <div class="form-grid">
      <label>Trip date<input id="trip-date-input" type="date" value="2026-04-09"></label>
      <label>Preferred departure time<input id="trip-time-input" type="time" value="07:30"></label>
      <label>Passengers
        <select id="trip-passengers-input">
          <option value="1" selected>1</option>
          <option value="2">2</option>
        </select>
      </label>
      <label>Notes to driver<textarea id="trip-notes-input">Commuting to the city and can meet at the Clayton station pickup area.</textarea></label>
      <div class="step-actions">
        <a class="btn btn-secondary" href="./find-a-ride.html#destination">Back</a>
        <a class="btn" id="search-results-link" href="./search-results.html">Search Ride Offers</a>
      </div>
    </div>
  </section>
  <aside class="route-card">
    <h2>Trip planning summary</h2>
    <iframe id="summary-map" class="map-frame" title="Trip summary OpenStreetMap preview" loading="lazy"></iframe>
    <p class="map-caption" id="summary-map-caption">OpenStreetMap route context for the selected rider trip.</p>
    <div class="route-points">
      <div class="route-stop">
        <strong>Departure window</strong>
        <span>Weekday commute around 7:30 AM</span>
      </div>
      <div class="route-stop">
        <strong>Primary goal</strong>
        <span>Join an existing offer when a suitable match is available.</span>
      </div>
    </div>
  </aside>
</section>
'@ '<script src="./find-a-ride-flow.js"></script>'

New-Page 'search-results.html' 'Search Results' 'rider' 'find' 'Two existing ride offers are shown so the rider can compare timing and seats before opening the selected offer details.' @'
<section class="summary-box">
  <h2>Search Summary</h2>
  <p><strong>From:</strong> <span id="results-from">Clayton</span></p>
  <p><strong>To:</strong> <span id="results-to">Melbourne</span></p>
  <p><strong>Date:</strong> <span id="results-date">2026-04-09</span></p>
  <p><strong>Time:</strong> <span id="results-time">07:30</span></p>
  <p><strong>Passengers:</strong> <span id="results-passengers">1</span></p>
  <div class="helper-links">
    <a class="chip-link" id="edit-trip-link" href="./find-a-ride.html#trip-date">Edit trip details</a>
    <a class="chip-link" id="edit-destination-link" href="./find-a-ride.html#destination">Change destination</a>
  </div>
</section>
<section class="notice notice-danger is-hidden" id="matching-failed">
  <h2>Rider Matching Failed</h2>
  <p id="matching-failed-message">No suitable existing ride offer was found for the selected trip details.</p>
  <div class="card-actions">
    <a class="btn btn-secondary" id="failed-edit-trip-link" href="./find-a-ride.html#trip-date">Edit trip details</a>
    <a class="btn" id="failed-start-search-link" href="./find-a-ride.html">Start a New Search</a>
  </div>
</section>
<section class="panel">
  <h2>Matching Ride Offers</h2>
  <div class="results-grid">
    <article class="card" data-offer-card="emma">
      <span class="pill confirmed">2 seats left</span>
      <h3>Emma Driver</h3>
      <p><strong>Route:</strong> Clayton to Melbourne CBD</p>
      <p><strong>Departure:</strong> 2026-04-09 at 07:30</p>
      <p><strong>Meeting point:</strong> Clayton Station Gate 2</p>
      <p class="context-line" data-offer-context="emma">Good fit for CBD-bound weekday commuters.</p>
      <div class="card-actions">
        <a class="btn offer-details-link" data-offer="emma" href="./ride-offer-details.html">View Details</a>
      </div>
    </article>
    <article class="card" data-offer-card="liam">
      <span class="pill pending">1 seat left</span>
      <h3>Liam Driver</h3>
      <p><strong>Route:</strong> Clayton to Docklands</p>
      <p><strong>Departure:</strong> 2026-04-09 at 08:05</p>
      <p><strong>Meeting point:</strong> Monash northern pickup zone</p>
      <p class="context-line" data-offer-context="liam">Better fit for Docklands or harbour-side destinations.</p>
      <div class="card-actions">
        <a class="btn btn-secondary offer-details-link" data-offer="liam" href="./ride-offer-details.html">View Details</a>
      </div>
    </article>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'ride-offer-details.html' 'Ride Offer Details' 'rider' 'find' 'The rider reviews route fit, available seats, and meeting details before submitting a join request.' @'
<section class="two-column">
  <section class="panel">
    <h2>Selected offer</h2>
    <div class="summary-box">
      <p><strong>Driver:</strong> <span id="offer-driver">Emma Driver</span></p>
      <p><strong>Route:</strong> <span id="offer-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Departure:</strong> <span id="offer-departure">2026-04-09 at 07:30</span></p>
      <p><strong>Available seats:</strong> <span id="offer-seats">2</span></p>
      <p><strong>Vehicle:</strong> <span id="offer-vehicle">Silver Toyota Corolla</span></p>
      <p><strong>Pickup point:</strong> <span id="offer-pickup">Clayton Station Gate 2</span></p>
    </div>
    <div class="form-grid">
      <label>Seats requested
        <select id="details-passengers">
          <option value="1" selected>1</option>
          <option value="2">2</option>
        </select>
      </label>
      <label>Message to driver<textarea id="details-message">Heading into the CBD for work and happy to meet at Gate 2 by 7:20 AM.</textarea></label>
      <div class="form-actions">
        <a class="btn" id="submit-join-request-link" href="./my-trips.html#join-request-submitted">Submit Join Request</a>
        <a class="btn btn-secondary" id="back-to-results-link" href="./search-results.html">Back to Results</a>
      </div>
    </div>
  </section>
  <aside class="panel">
    <div class="card">
      <p><strong>Your search context</strong></p>
      <p class="muted"><span id="details-search-route">Clayton to Melbourne</span> on <span id="details-search-date">2026-04-09</span> for <span id="details-search-passengers">1</span> passenger.</p>
    </div>
    <h2>Decision support shown to rider</h2>
    <div class="card">
      <p><strong>Seat availability is visible</strong></p>
      <p class="muted">The rider can see whether enough seats remain before making the request.</p>
    </div>
    <div class="card">
      <p><strong>Pickup context is visible</strong></p>
      <p class="muted">The rider can judge whether the meeting arrangement fits the trip without opening extra flows.</p>
    </div>
  </aside>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'my-trips.html' 'My Trips' 'rider' 'my-trips' 'Notifications and trip records stay separate so rider updates remain easy to follow.' @'
<section class="panel">
  <h2>Notifications</h2>
  <section class="notice notice-success anchor-section" id="join-request-submitted">
    <span class="pill pending" id="notification-pill">Pending</span>
    <h3 id="notification-title">Join Request Submitted</h3>
    <p id="join-request-message">Your join request for Emma Driver&apos;s Clayton to Melbourne ride is now pending driver review.</p>
    <div class="card-actions">
      <a class="btn" id="notification-primary-link" href="./my-trips.html#trip-records">Open Trip Records</a>
    </div>
  </section>
</section>
<section class="panel anchor-section" id="trip-records">
  <h2>Trip Records</h2>
  <div class="chip-row">
    <a class="chip-link trip-filter-link is-active" data-filter="all" href="./my-trips.html#all">All</a>
    <a class="chip-link trip-filter-link" data-filter="in-progress" href="./my-trips.html#in-progress">In Progress</a>
    <a class="chip-link trip-filter-link" data-filter="completed" href="./my-trips.html#completed">Completed</a>
  </div>
  <div class="results-grid" id="orders-grid">
    <article class="card" id="primary-order-card" data-order-type="in-progress">
      <span class="pill pending" id="primary-order-pill">In Progress</span>
      <h3>Record #501</h3>
      <p><strong>Route:</strong> <span id="primary-order-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Status:</strong> <span id="primary-order-status">Pending driver decision</span></p>
      <div class="card-actions">
        <a class="btn btn-secondary" id="record-501-link" href="./rider-record-501-details.html">View Details</a>
      </div>
    </article>
    <article class="card" id="secondary-order-card" data-order-type="completed">
      <span class="pill confirmed">Completed</span>
      <h3>Record #601</h3>
      <p><strong>Driver:</strong> Emma Driver</p>
      <p><strong>Status:</strong> Confirmed trip outcome</p>
      <div class="card-actions">
        <a class="btn btn-secondary" id="record-601-link" href="./rider-record-601-details.html">View Details</a>
      </div>
    </article>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'rider-record-501-details.html' 'Record #501 Details' 'rider' 'my-trips' 'This page shows the full rider-visible details for record #501, including an OpenStreetMap preview of the trip context.' @'
<section class="panel anchor-section" id="record-501-details">
  <span class="pill pending" id="rider-record-501-pill">In Progress</span>
  <h2 id="rider-record-501-title">Record #501</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Record ID:</strong> <span id="rider-record-501-id">#501</span></p>
      <p><strong>Record Type:</strong> <span id="rider-record-501-type">Join Request</span></p>
      <p><strong>Current Status:</strong> <span id="rider-record-501-status">Pending driver decision</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Driver:</strong> <span id="rider-record-501-driver">Emma Driver</span></p>
      <p><strong>Route:</strong> <span id="rider-record-501-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Requested Seats:</strong> <span id="rider-record-501-seats">1</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Timeline:</strong> Submitted and waiting for driver review.</p>
      <p><strong>Outcome hint:</strong> You will see accepted or rejected status in My Trips notifications.</p>
      <p><strong>Navigation:</strong> Return to My Trips after review.</p>
    </div>
  </div>
  <div class="request-map-wrap">
    <p class="map-caption">OpenStreetMap trip preview (Origin to Destination)</p>
    <iframe class="map-frame request-map-frame" id="rider-record-501-map" title="Record 501 trip preview map" loading="lazy"></iframe>
  </div>
  <div class="card-actions">
    <a class="btn" id="rider-record-501-back-link" href="./my-trips.html#trip-records">Back to Trip Records</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'rider-record-601-details.html' 'Record #601 Details' 'rider' 'my-trips' 'This page shows the full rider-visible details for confirmed record #601, including an OpenStreetMap preview of the trip context.' @'
<section class="panel anchor-section" id="record-601-details">
  <span class="pill confirmed" id="rider-record-601-pill">Completed</span>
  <h2 id="rider-record-601-title">Record #601</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Record ID:</strong> <span id="rider-record-601-id">#601</span></p>
      <p><strong>Record Type:</strong> <span id="rider-record-601-type">Ride Match</span></p>
      <p><strong>Current Status:</strong> <span id="rider-record-601-status">Confirmed</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Driver:</strong> <span id="rider-record-601-driver">Emma Driver</span></p>
      <p><strong>Route:</strong> <span id="rider-record-601-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Meeting point:</strong> <span id="rider-record-601-meeting">Southern Cross Coach Bay</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Timeline:</strong> Accepted and confirmed in matching flow.</p>
      <p><strong>Outcome:</strong> Ride agreement recorded for rider and driver.</p>
      <p><strong>Navigation:</strong> Return to My Trips to review other records.</p>
    </div>
  </div>
  <div class="request-map-wrap">
    <p class="map-caption">OpenStreetMap trip preview (Origin to Destination)</p>
    <iframe class="map-frame request-map-frame" id="rider-record-601-map" title="Record 601 trip preview map" loading="lazy"></iframe>
  </div>
  <div class="card-actions">
    <a class="btn" id="rider-record-601-back-link" href="./my-trips.html#trip-records">Back to Trip Records</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'rider-settings.html' 'Settings' 'rider' 'settings' 'Manage simple account preferences for your rider demo account, including password reset and payment preference.' @'
<section class="panel">
  <h2>Account Overview</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Role:</strong> <span id="settings-role-label">Rider</span></p>
      <p><strong>Name:</strong> <span id="settings-user-name">Daniel Rider</span></p>
      <p><strong>Email:</strong> <span id="settings-user-email">daniel.rider@example.com</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Password status:</strong> <span id="settings-password-summary">Default demo password in use</span></p>
      <p><strong>Payment preference:</strong> <span id="settings-payment-summary">Visa ending 4242</span></p>
      <p><strong>Scope:</strong> Presentation-only preference settings (no live payment transaction).</p>
    </div>
  </div>
</section>
<section class="panel">
  <h2>Reset Password</h2>
  <form id="settings-password-form" class="form-grid">
    <div class="field-row">
      <label>Current password<input id="settings-current-password" type="password" required></label>
      <label>New password<input id="settings-new-password" type="password" minlength="6" required></label>
    </div>
    <label>Confirm new password<input id="settings-confirm-password" type="password" minlength="6" required></label>
    <div class="card-actions">
      <button class="btn" id="settings-password-submit" type="submit">Save New Password</button>
    </div>
  </form>
  <section class="notice notice-warning is-hidden" id="settings-password-status"></section>
</section>
<section class="panel">
  <h2>Payment Preference</h2>
  <form id="settings-payment-form" class="form-grid">
    <div class="field-row">
      <label>Method
        <select id="settings-payment-method" required>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </label>
      <label>Account holder<input id="settings-payment-holder" type="text" required></label>
    </div>
    <div class="field-row">
      <label>Reference (last 4 / email)<input id="settings-payment-reference" type="text" required></label>
      <label>Expiry month<input id="settings-payment-expiry" type="month" required></label>
    </div>
    <label><input id="settings-payment-default" type="checkbox" checked> Set as default payment preference</label>
    <div class="card-actions">
      <button class="btn" id="settings-payment-submit" type="submit">Save Payment Preference</button>
    </div>
  </form>
  <section class="notice notice-warning is-hidden" id="settings-payment-status"></section>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-settings.html' 'Settings' 'driver' 'settings' 'Manage simple account preferences for your driver demo account, including password reset and payment preference.' @'
<section class="panel">
  <h2>Account Overview</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Role:</strong> <span id="settings-role-label">Driver</span></p>
      <p><strong>Name:</strong> <span id="settings-user-name">Emma Driver</span></p>
      <p><strong>Email:</strong> <span id="settings-user-email">emma.driver@example.com</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Password status:</strong> <span id="settings-password-summary">Default demo password in use</span></p>
      <p><strong>Payment preference:</strong> <span id="settings-payment-summary">Mastercard ending 7788</span></p>
      <p><strong>Scope:</strong> Presentation-only preference settings (no live payment transaction).</p>
    </div>
  </div>
</section>
<section class="panel">
  <h2>Reset Password</h2>
  <form id="settings-password-form" class="form-grid">
    <div class="field-row">
      <label>Current password<input id="settings-current-password" type="password" required></label>
      <label>New password<input id="settings-new-password" type="password" minlength="6" required></label>
    </div>
    <label>Confirm new password<input id="settings-confirm-password" type="password" minlength="6" required></label>
    <div class="card-actions">
      <button class="btn" id="settings-password-submit" type="submit">Save New Password</button>
    </div>
  </form>
  <section class="notice notice-warning is-hidden" id="settings-password-status"></section>
</section>
<section class="panel">
  <h2>Payment Preference</h2>
  <form id="settings-payment-form" class="form-grid">
    <div class="field-row">
      <label>Method
        <select id="settings-payment-method" required>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </label>
      <label>Account holder<input id="settings-payment-holder" type="text" required></label>
    </div>
    <div class="field-row">
      <label>Reference (last 4 / email)<input id="settings-payment-reference" type="text" required></label>
      <label>Expiry month<input id="settings-payment-expiry" type="month" required></label>
    </div>
    <label><input id="settings-payment-default" type="checkbox" checked> Set as default payment preference</label>
    <div class="card-actions">
      <button class="btn" id="settings-payment-submit" type="submit">Save Payment Preference</button>
    </div>
  </form>
  <section class="notice notice-warning is-hidden" id="settings-payment-status"></section>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-hub.html' 'Driver Review' 'driver' 'driver-hub' 'The driver prototype is now reduced to request review plus accepted and rejected history, without extra trip-management surfaces.' @'
<section class="panel anchor-section" id="join-request-review">
  <h2>Join Request Review</h2>
  <div class="results-grid">
    <article class="card" data-pending-request="501" data-rider="Daniel Rider" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-available="2">
      <span class="pill pending">Pending</span>
      <h3>Join Request #501</h3>
      <p><strong>Rider:</strong> Daniel Rider</p>
      <p><strong>Offer:</strong> Clayton to Melbourne CBD at 07:30</p>
      <p><strong>Requested seats:</strong> 1</p>
      <p><strong>Available seats:</strong> 2</p>
      <div class="request-map-wrap">
        <p class="map-caption">OpenStreetMap trip preview (Start to End)</p>
        <iframe class="map-frame request-map-frame" title="Join Request 501 trip preview map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=144.93%2C-37.94%2C145.14%2C-37.80&layer=mapnik&marker=-37.9263641%2C145.1230003"></iframe>
      </div>
      <div class="card-actions">
        <a class="btn driver-review-decision-link" data-request="501" data-rider="Daniel Rider" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-available="2" data-decision="accepted" href="./driver-decision-outcome.html">Accept Request</a>
        <a class="btn btn-secondary driver-review-decision-link" data-request="501" data-rider="Daniel Rider" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-available="2" data-decision="rejected" href="./driver-decision-outcome.html">Reject Request</a>
      </div>
    </article>
    <article class="card" data-pending-request="504" data-rider="Olivia Chen" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-available="1">
      <span class="pill pending">Pending</span>
      <h3>Join Request #504</h3>
      <p><strong>Rider:</strong> Olivia Chen</p>
      <p><strong>Offer:</strong> Clayton to Docklands at 08:05</p>
      <p><strong>Requested seats:</strong> 1</p>
      <p><strong>Available seats:</strong> 1</p>
      <div class="request-map-wrap">
        <p class="map-caption">OpenStreetMap trip preview (Start to End)</p>
        <iframe class="map-frame request-map-frame" title="Join Request 504 trip preview map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=144.93%2C-37.94%2C145.14%2C-37.80&layer=mapnik&marker=-37.9263641%2C145.1230003"></iframe>
      </div>
      <div class="card-actions">
        <a class="btn driver-review-decision-link" data-request="504" data-rider="Olivia Chen" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-available="1" data-decision="accepted" href="./driver-decision-outcome.html">Accept Request</a>
        <a class="btn btn-secondary driver-review-decision-link" data-request="504" data-rider="Olivia Chen" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-available="1" data-decision="rejected" href="./driver-decision-outcome.html">Reject Request</a>
      </div>
    </article>
  </div>
</section>
<section class="panel anchor-section" id="accepted-records">
  <h2>Accepted</h2>
  <div class="results-grid">
    <article class="card">
      <span class="pill confirmed">Accepted</span>
      <h3>Join Request #501</h3>
      <p><strong>Rider:</strong> Daniel Rider</p>
      <p><strong>Route:</strong> Clayton to Melbourne CBD</p>
      <p><strong>Status:</strong> Accepted and matched</p>
      <div class="card-actions">
        <a class="btn driver-workflow-link" data-request="501" data-rider="Daniel Rider" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-meeting="Clayton Station Gate 2" href="./driver-trip-workflow.html">Start Trip Workflow</a>
        <a class="btn btn-secondary driver-accepted-details-link" data-request="501" data-rider="Daniel Rider" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-meeting="Clayton Station Gate 2" href="./driver-accepted-details.html">View Details</a>
      </div>
    </article>
    <article class="card">
      <span class="pill confirmed">Accepted</span>
      <h3>Join Request #504</h3>
      <p><strong>Rider:</strong> Olivia Chen</p>
      <p><strong>Route:</strong> Clayton to Docklands</p>
      <p><strong>Status:</strong> Accepted and matched</p>
      <div class="card-actions">
        <a class="btn driver-workflow-link" data-request="504" data-rider="Olivia Chen" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-meeting="Monash northern pickup zone" href="./driver-trip-workflow.html">Start Trip Workflow</a>
        <a class="btn btn-secondary driver-accepted-details-link" data-request="504" data-rider="Olivia Chen" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-meeting="Monash northern pickup zone" href="./driver-accepted-details.html">View Details</a>
      </div>
    </article>
  </div>
</section>
<section class="panel anchor-section" id="rejected-records">
  <h2>Rejected</h2>
  <div class="results-grid">
    <article class="card">
      <span class="pill rejected">Rejected</span>
      <h3>Join Request #498</h3>
      <p><strong>Rider:</strong> Mia Santos</p>
      <p><strong>Route:</strong> Clayton to Docklands</p>
      <p><strong>Status:</strong> Rejected because the car was full</p>
      <div class="card-actions">
        <a class="btn btn-secondary driver-rejected-details-link" data-request="498" data-rider="Mia Santos" data-driver="Liam Driver" data-route="Clayton to Docklands" data-seats="1" data-reason="Vehicle already full at decision time" href="./driver-rejected-details.html">View Details</a>
      </div>
    </article>
    <article class="card">
      <span class="pill rejected">Rejected</span>
      <h3>Join Request #499</h3>
      <p><strong>Rider:</strong> Zoe Patel</p>
      <p><strong>Route:</strong> Clayton to Melbourne CBD</p>
      <p><strong>Status:</strong> Rejected because timing no longer matched</p>
      <div class="card-actions">
        <a class="btn btn-secondary driver-rejected-details-link" data-request="499" data-rider="Zoe Patel" data-driver="Emma Driver" data-route="Clayton to Melbourne CBD" data-seats="1" data-reason="Departure timing changed before confirmation" href="./driver-rejected-details.html">View Details</a>
      </div>
    </article>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-accepted-details.html' 'Accepted Details' 'driver' 'driver-hub' 'Accepted records now open into a dedicated detail page so the driver can inspect the full accepted outcome and then return.' @'
<section class="panel">
  <span class="pill confirmed" id="accepted-detail-pill">Accepted</span>
  <h2 id="accepted-detail-title">Accepted Join Request</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Join Request:</strong> <span id="accepted-detail-request">#501</span></p>
      <p><strong>Rider:</strong> <span id="accepted-detail-rider">Daniel Rider</span></p>
      <p><strong>Driver:</strong> <span id="accepted-detail-driver">Emma Driver</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Route:</strong> <span id="accepted-detail-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Seats approved:</strong> <span id="accepted-detail-seats">1</span></p>
      <p><strong>Meeting point:</strong> <span id="accepted-detail-meeting">Clayton Station Gate 2</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Status:</strong> Accepted and matched</p>
      <p><strong>Decision note:</strong> Seat count was available and the driver confirmed the ride.</p>
      <p><strong>Visible result:</strong> This accepted request appears in the driver record and the rider outcome record.</p>
    </div>
  </div>
  <div class="card-actions">
    <a class="btn" id="accepted-detail-workflow-link" href="./driver-trip-workflow.html">Start Trip Workflow</a>
    <a class="btn" id="accepted-detail-back-link" href="./driver-hub.html#accepted-records">Back to Driver Review</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-trip-workflow.html' 'Driver Trip Workflow' 'driver' 'driver-workflow' 'After accepting a join request, drivers can follow one guided workflow step at a time, with each action refreshing into the next state.' @'
<section class="panel">
  <span class="pill pending" id="workflow-status-pill">Ready</span>
  <h2 id="workflow-title">Trip Execution for Accepted Request</h2>
  <p id="workflow-status-text">Ready to begin segment 1: depart to the pickup point.</p>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Join Request:</strong> <span id="workflow-request-id">#501</span></p>
      <p><strong>Rider:</strong> <span id="workflow-rider">Daniel Rider</span></p>
      <p><strong>Driver:</strong> <span id="workflow-driver">Emma Driver</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Route:</strong> <span id="workflow-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Pickup point:</strong> <span id="workflow-pickup">Clayton Station Gate 2</span></p>
      <p><strong>Destination:</strong> <span id="workflow-destination">Melbourne CBD drop-off zone</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Step status:</strong> <span id="workflow-step-status">Waiting to depart</span></p>
      <p><strong>Current segment:</strong> <span id="workflow-segment-label">Segment 1: Driver to Pickup</span></p>
      <p><strong>Use:</strong> Click the single action button to refresh to the next stage.</p>
    </div>
  </div>
</section>
<section class="panel" id="workflow-route-panel">
  <h2 id="workflow-map-title">Segment 1: Driver to Pickup</h2>
  <p class="muted" id="workflow-map-subtitle">OpenStreetMap preview updates after each action.</p>
  <div class="request-map-wrap">
    <p class="map-caption" id="workflow-map-caption">OpenStreetMap preview for the current segment</p>
    <iframe class="map-frame request-map-frame" id="workflow-map-main" title="Trip workflow map preview" loading="lazy"></iframe>
  </div>
  <div class="card-actions">
    <a class="btn" id="workflow-next-stage-link" href="./driver-trip-workflow.html">Depart to Pickup</a>
  </div>
</section>
<section class="panel notice notice-success is-hidden" id="workflow-complete-panel">
  <span class="pill confirmed">Completed</span>
  <h2>Trip Completed</h2>
  <p>The driver has arrived at the destination and the accepted trip workflow is complete.</p>
  <div class="card-actions">
    <a class="btn" id="workflow-complete-back-link" href="./driver-hub.html#accepted-records">Back</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-rejected-details.html' 'Rejected Details' 'driver' 'driver-hub' 'Rejected records now open into a dedicated detail page so the driver can inspect the full rejected outcome and then return.' @'
<section class="panel">
  <span class="pill rejected" id="rejected-detail-pill">Rejected</span>
  <h2 id="rejected-detail-title">Rejected Join Request</h2>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Join Request:</strong> <span id="rejected-detail-request">#498</span></p>
      <p><strong>Rider:</strong> <span id="rejected-detail-rider">Mia Santos</span></p>
      <p><strong>Driver:</strong> <span id="rejected-detail-driver">Liam Driver</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Route:</strong> <span id="rejected-detail-route">Clayton to Docklands</span></p>
      <p><strong>Seats requested:</strong> <span id="rejected-detail-seats">1</span></p>
      <p><strong>Rejection reason:</strong> <span id="rejected-detail-reason">Vehicle already full at decision time</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Status:</strong> Rejected</p>
      <p><strong>Decision note:</strong> No ride match was created for this request.</p>
      <p><strong>Visible result:</strong> The rejected request remains visible to the rider as a failed coordination outcome.</p>
    </div>
  </div>
  <div class="card-actions">
    <a class="btn" id="rejected-detail-back-link" href="./driver-hub.html#rejected-records">Back to Driver Review</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

New-Page 'driver-decision-outcome.html' 'Driver Decision Outcome' 'driver' 'driver-hub' 'Accepting or rejecting a pending join request now opens a dedicated result page, shows the full details, and returns to Driver Review after 5 seconds.' @'
<section class="panel">
  <span class="pill pending" id="decision-outcome-pill">Pending</span>
  <h2 id="decision-outcome-title">Driver Decision</h2>
  <p id="decision-outcome-message">The selected join request has been processed.</p>
  <div class="request-summary-grid">
    <div class="summary-box">
      <p><strong>Join Request:</strong> <span id="decision-request-id">#501</span></p>
      <p><strong>Rider:</strong> <span id="decision-rider">Daniel Rider</span></p>
      <p><strong>Driver:</strong> <span id="decision-driver">Emma Driver</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Route:</strong> <span id="decision-route">Clayton to Melbourne CBD</span></p>
      <p><strong>Seats:</strong> <span id="decision-seats">1</span></p>
      <p><strong>Available seats before decision:</strong> <span id="decision-available">2</span></p>
    </div>
    <div class="summary-box">
      <p><strong>Next visible state:</strong> <span id="decision-next-state">Driver Review updates this request history after the decision.</span></p>
      <p class="muted" id="decision-return-note">Returning to Driver Review in 5 seconds...</p>
      <p><strong>Countdown:</strong> <span id="decision-countdown">5</span>s</p>
    </div>
  </div>
  <div class="card-actions">
    <a class="btn" id="decision-back-link" href="./driver-hub.html">Back to Driver Review</a>
  </div>
</section>
'@ '<script src="./prototype-context.js"></script>'

$appJs = Join-Path $root 'app.js'
if (Test-Path $appJs) {
  Remove-Item $appJs -Force
}

$obsoletePages = @(
  'find-a-ride-origin.html',
  'find-a-ride-destination.html',
  'find-a-ride-date.html',
  'join-request-submitted.html',
  'driver-decision.html',
  'driver-my-trips.html',
  'fallback-request-recorded.html',
  'my-trips-join-requests.html',
  'my-trips-fallback.html',
  'my-trips-confirmed.html',
  'driver-decision-accepted.html',
  'driver-decision-rejected.html'
)

foreach ($obsoletePage in $obsoletePages) {
  $obsoletePath = Join-Path $root $obsoletePage
  if (Test-Path $obsoletePath) {
    Remove-Item $obsoletePath -Force
  }
}
