import './index.css';
import './App.css';
import * as api from './api/rideOffersApi.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const APP_ROOT = document.getElementById('app');
const SESSION_KEY = 'neighbourlink.session';
const FIXED_ADMIN_EMAIL = 'admin@neighbourlink.local';
const FIXED_ADMIN_PASSWORD = 'admin12345';

const PAGE_SIZE = 3;
const ADMIN_PAGE_SIZE_OPTIONS = [5, 8, 12, 20];
const ADMIN_DEFAULT_PAGE_SIZE = 8;
const DEFAULT_MAP_CENTER = { latitude: -33.8688, longitude: 151.2093 };
const mapInstances = new Map();

const synonymMap = {
  melbourne: ['Melbourne', 'City Centre', 'CBD'],
  'city centre': ['City Centre', 'Melbourne', 'CBD'],
  cbd: ['CBD', 'Melbourne', 'City Centre'],
  docklands: ['Docklands'],
  clayton: ['Clayton'],
  'box hill': ['Box Hill'],
  richmond: ['Richmond'],
  southbank: ['Southbank'],
};

const state = {
  session: readSession(),
  menuOpen: false,
  rideConfirmed: null,
  introFaqIndex: 0,
  tutorial: {
    track: 'RIDER',
    mode: 'GUIDED',
    checklistByTrack: {},
    troubleIndex: 0,
    quizAnswers: {},
    quizSubmitted: false,
    copyFeedback: '',
  },
  findFlow: createDefaultFindFlow(),
  postFlow: createDefaultPostFlow(),
  profile: createDefaultProfileState(),
  myTrips: createDefaultMyTrips(),
  driverHub: createDefaultDriverHub(),
  admin: createDefaultAdmin(),
  flash: {},
};

let renderToken = 0;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createLocationState(seed) {
  const baseName = normalizeText(seed?.name || seed?.suburb || seed?.address || '');
  const baseAddress = normalizeText(seed?.address || seed?.displayName || baseName);
  return {
    name: baseName,
    address: baseAddress,
    suburb: normalizeText(seed?.suburb || baseName),
    state: normalizeText(seed?.state || ''),
    postcode: normalizeText(seed?.postcode || ''),
    latitude: seed?.latitude ?? null,
    longitude: seed?.longitude ?? null,
    searchQuery: normalizeText(seed?.displayName || baseAddress || baseName),
    searchResults: [],
    searchLoading: false,
    searchError: '',
    mapResolving: false,
    searchTicket: 0,
    mapTicket: 0,
  };
}

function createDefaultFindFlow() {
  return {
    step: 'ORIGIN',
    error: '',
    origin: createLocationState({
      name: 'Clayton',
      address: 'Clayton Railway Station',
      suburb: 'Clayton',
      state: 'VIC',
      postcode: '3168',
      latitude: -37.9241,
      longitude: 145.1207,
    }),
    destination: createLocationState({
      name: 'Melbourne',
      address: 'Melbourne CBD',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      latitude: -37.8136,
      longitude: 144.9631,
    }),
    form: {
      departureDate: todayPlus(1),
      departureTime: '',
      timeFlexHours: '0',
      passengerCount: '1',
    },
  };
}

function createDefaultPostFlow() {
  return {
    step: 'ORIGIN',
    error: '',
    success: '',
    submitting: false,
    redirectTimer: null,
    origin: createLocationState({
      name: 'Box Hill',
      address: 'Box Hill Library',
      suburb: 'Box Hill',
      state: 'VIC',
      postcode: '3128',
      latitude: -37.8183,
      longitude: 145.1256,
    }),
    destination: createLocationState({
      name: 'Docklands',
      address: 'Docklands Community Hub',
      suburb: 'Docklands',
      state: 'VIC',
      postcode: '3008',
      latitude: -37.8139,
      longitude: 144.946,
    }),
    form: {
      tripDate: todayPlus(1),
      tripTime: '10:00',
      passengerCount: '2',
      notes: 'Weekend event travel',
    },
  };
}

function createDefaultProfileState() {
  return {
    loaded: false,
    loading: false,
    saving: false,
    error: '',
    message: '',
    data: null,
    form: {
      fullName: '',
      phone: '',
      suburb: '',
      bio: '',
      travelPreferences: '',
      trustNotes: '',
    },
  };
}

function createDefaultMyTrips() {
  return {
    loaded: false,
    loading: false,
    error: '',
    trips: [],
    joinHistory: [],
    requestHistory: [],
    driverOfferHistory: [],
    notifications: [],
    notificationTab: 'UNREAD',
    notificationPage: 1,
    notificationError: '',
    notificationMessage: '',
    tripFilter: 'UPCOMING',
    tripTypeFilter: 'ALL',
    tripPage: 1,
    noTripTab: 'GUIDE',
    joinTab: 'PENDING',
    joinPage: 1,
    requestTab: 'ALL',
    requestPage: 1,
    driverOfferTab: 'ALL',
    driverOfferPage: 1,
    requestActionError: '',
    requestActionMessage: '',
    ratingForms: {},
    focusHandled: false,
  };
}

function createDefaultDriverHub() {
  return {
    loaded: false,
    loading: false,
    error: '',
    pendingJoinRequests: [],
    openRideRequests: [],
    driverOfferHistory: [],
    driverRideOffers: [],
    rideOfferForm: {
      origin: 'Clayton',
      originAddress: 'Clayton Railway Station',
      originSuburb: 'Clayton',
      destination: 'Melbourne',
      destinationAddress: 'Melbourne CBD',
      destinationSuburb: 'Melbourne',
      departureDate: todayPlus(1),
      departureTime: '08:30',
      availableSeats: '2',
    },
    rideOfferSubmitting: false,
    rideOfferError: '',
    rideOfferMessage: '',
    joinForms: {},
    oneOffOfferForms: {},
  };
}

function createDefaultAdminSection() {
  return {
    search: '',
    page: 1,
    pageSize: ADMIN_DEFAULT_PAGE_SIZE,
    selected: {},
    bulkValue: '',
  };
}

function createDefaultAdmin() {
  return {
    loaded: false,
    loading: false,
    error: '',
    message: '',
    tab: 'users',
    data: {
      overview: null,
      users: [],
      offers: [],
      requests: [],
      requestOffers: [],
      joins: [],
      matches: [],
      ratings: [],
    },
    sections: {
      users: createDefaultAdminSection(),
      offers: createDefaultAdminSection(),
      requests: createDefaultAdminSection(),
      requestOffers: createDefaultAdminSection(),
      joins: createDefaultAdminSection(),
      matches: createDefaultAdminSection(),
      ratings: createDefaultAdminSection(),
    },
  };
}

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ? parsed : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
    state.profile = createDefaultProfileState();
    state.myTrips = createDefaultMyTrips();
    state.driverHub = createDefaultDriverHub();
    state.admin = createDefaultAdmin();
  }
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeLocationText(location) {
  return normalizeText(location?.name || location?.suburb || location?.address || '');
}

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toNullableCoordinate(value) {
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function teardownMaps() {
  mapInstances.forEach((map) => {
    try {
      map.off();
      map.remove();
    } catch {
      // ignore detached map cleanup errors
    }
  });
  mapInstances.clear();
}

function resolveLocationDisplayName(payload) {
  return normalizeText(payload?.displayName || payload?.address || payload?.suburb || payload?.name || '');
}

function applyLocationSelection(location, payload, fallback = {}) {
  const displayName = resolveLocationDisplayName(payload);
  const suburb = normalizeText(payload?.suburb || location?.suburb || '');
  const address = normalizeText(payload?.address || payload?.displayName || location?.address || displayName);
  const stateText = normalizeText(payload?.state || location?.state || '');
  const postcode = normalizeText(payload?.postcode || location?.postcode || '');
  const latitude = toNullableCoordinate(payload?.latitude ?? fallback.latitude ?? location?.latitude);
  const longitude = toNullableCoordinate(payload?.longitude ?? fallback.longitude ?? location?.longitude);

  location.name = suburb || displayName || address;
  location.address = address || displayName;
  location.suburb = suburb || location.name;
  location.state = stateText;
  location.postcode = postcode;
  location.latitude = latitude;
  location.longitude = longitude;
  location.searchQuery = displayName || address || suburb || location.name;
  location.searchResults = [];
  location.searchError = '';
}

async function searchLocationSuggestions(location, forceQuery = '') {
  const query = normalizeText(forceQuery || location.searchQuery || location.name || location.address);
  if (!query) {
    location.searchResults = [];
    location.searchError = 'Enter suburb, postcode, or address first.';
    renderApp();
    return;
  }

  location.searchTicket += 1;
  const ticket = location.searchTicket;
  location.searchLoading = true;
  location.searchError = '';
  renderApp();

  try {
    const payload = await api.searchAustralianLocations(query, 8);
    if (ticket !== location.searchTicket) return;
    location.searchResults = Array.isArray(payload) ? payload : [];
    location.searchError = location.searchResults.length === 0
      ? 'No matching locations found. Try suburb, postcode, or a fuller address.'
      : '';
  } catch (error) {
    if (ticket !== location.searchTicket) return;
    location.searchResults = [];
    location.searchError = error.message || 'Unable to search locations right now.';
  } finally {
    if (ticket === location.searchTicket) {
      location.searchLoading = false;
      renderApp();
    }
  }
}

function setupLocationMap(mapContainerId, location, { disabled = false } = {}) {
  const container = document.getElementById(mapContainerId);
  if (!container) return;

  const selectedLat = toNullableCoordinate(location.latitude);
  const selectedLng = toNullableCoordinate(location.longitude);
  const centerLat = selectedLat ?? DEFAULT_MAP_CENTER.latitude;
  const centerLng = selectedLng ?? DEFAULT_MAP_CENTER.longitude;

  const map = L.map(mapContainerId, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([centerLat, centerLng], selectedLat != null && selectedLng != null ? 15 : 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  if (selectedLat != null && selectedLng != null) {
    L.marker([selectedLat, selectedLng]).addTo(map);
  }

  if (!disabled) {
    map.on('click', async (event) => {
      const latitude = Number(event.latlng.lat.toFixed(6));
      const longitude = Number(event.latlng.lng.toFixed(6));
      location.mapTicket += 1;
      const ticket = location.mapTicket;
      location.mapResolving = true;
      location.searchError = '';
      renderApp();
      try {
        const payload = await api.reverseLookupAustralia(latitude, longitude);
        if (ticket !== location.mapTicket) return;
        applyLocationSelection(location, payload, { latitude, longitude });
      } catch (error) {
        if (ticket !== location.mapTicket) return;
        applyLocationSelection(location, location, { latitude, longitude });
        location.searchError = error.message || 'Unable to resolve selected map point.';
      } finally {
        if (ticket === location.mapTicket) {
          location.mapResolving = false;
          renderApp();
        }
      }
    });
  }

  mapInstances.set(mapContainerId, map);
  window.setTimeout(() => {
    try {
      map.invalidateSize();
    } catch {
      // no-op
    }
  }, 0);
}

function formatDateTime(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString();
}

function withLoadingButton(button, text) {
  if (!button) return () => {};
  const oldDisabled = button.disabled;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = text;
  return () => {
    button.disabled = oldDisabled;
    button.textContent = oldText;
  };
}

function navigate(path, replace = false) {
  if (replace) window.history.replaceState({}, '', path);
  else window.history.pushState({}, '', path);
  renderApp();
}

function match(pathname, pattern) {
  const p1 = pathname.split('/').filter(Boolean);
  const p2 = pattern.split('/').filter(Boolean);
  if (p1.length !== p2.length) return null;
  const params = {};
  for (let i = 0; i < p2.length; i += 1) {
    if (p2[i].startsWith(':')) params[p2[i].slice(1)] = decodeURIComponent(p1[i]);
    else if (p2[i] !== p1[i]) return null;
  }
  return params;
}

function requireUser() {
  if (!state.session?.userId || state.session.role === 'ADMIN') {
    navigate('/login', true);
    return null;
  }
  return state.session;
}

function requireRole(role) {
  const session = requireUser();
  if (!session) return null;
  if (session.role !== role) {
    renderUser('Role Restricted', `<section class="section-card"><p class="status-error">This page is for ${esc(role)} only.</p></section>`);
    return null;
  }
  return session;
}

function requireAdmin() {
  if (!state.session?.userId || state.session.role !== 'ADMIN') {
    navigate('/admin/login', true);
    return null;
  }
  return state.session;
}

function wireCommon() {
  APP_ROOT.querySelectorAll('[data-action="toggle-menu"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.menuOpen = !state.menuOpen;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveSession(null);
      state.menuOpen = false;
      navigate('/login', true);
    });
  });
}

function publicLayout(title, subtitle, html) {
  const home = state.session?.role === 'ADMIN' ? '/admin' : '/';
  teardownMaps();
  APP_ROOT.innerHTML = `
    <div class="intro-shell intro-shell-rich">
      <header class="intro-nav">
        <div class="intro-nav-inner">
          <a class="brand" href="${home}" data-nav="1">
            <span class="brand-mark">NL</span>
            <span class="brand-text"><strong>NeighbourLink</strong><span class="brand-subtitle">Native Frontend</span></span>
          </a>
          <div class="intro-nav-actions">
            <button class="intro-nav-toggle" data-action="toggle-menu" type="button">${state.menuOpen ? 'Close Menu' : 'Menu'}</button>
            <nav class="intro-nav-links ${state.menuOpen ? 'is-open' : ''}">
              <a class="intro-link" href="/intro" data-nav="1">Intro</a>
              <a class="intro-link" href="/tutorial" data-nav="1">Tutorial</a>
              ${state.session ? `<a class="btn" href="${home}" data-nav="1">Open App</a>` : '<a class="btn" href="/login" data-nav="1">Log In</a>'}
            </nav>
          </div>
        </div>
      </header>
      <main class="intro-main intro-main-rich">
        <section class="intro-section">
          <h2 class="intro-section-title">${esc(title)}</h2>
          ${subtitle ? `<p class="intro-section-subtitle">${esc(subtitle)}</p>` : ''}
          ${html}
        </section>
      </main>
    </div>
  `;
  wireCommon();
}

function userLayout(title, html) {
  const session = state.session;
  teardownMaps();
  APP_ROOT.innerHTML = `
    <div class="app-shell">
      <header class="top-nav">
        <div class="nav-row">
          <a class="brand" href="/" data-nav="1">
            <span class="brand-mark">NL</span>
            <span class="brand-text"><strong>NeighbourLink</strong><span class="brand-subtitle">Community Rides</span></span>
          </a>
          <div class="nav-actions">
            <button class="nav-toggle" data-action="toggle-menu" type="button">${state.menuOpen ? 'Close Menu' : 'Menu'}</button>
            <nav class="app-nav ${state.menuOpen ? 'is-open' : ''}">
              <a class="nav-link" href="/intro" data-nav="1">Intro</a>
              <a class="nav-link" href="/tutorial" data-nav="1">Tutorial</a>
              <a class="nav-link" href="/" data-nav="1">Find a Ride</a>
              <a class="nav-link" href="/post-ride-request" data-nav="1">Post a Request</a>
              <a class="nav-link" href="/my-trips" data-nav="1">My Trips</a>
              <a class="nav-link" href="/profile" data-nav="1">Profile</a>
              ${session?.role === 'DRIVER' ? '<a class="nav-link" href="/driver-hub" data-nav="1">Driver Hub</a>' : ''}
              <button class="btn btn-secondary nav-btn" data-action="logout" type="button">Log Out</button>
            </nav>
          </div>
        </div>
        <p class="nav-user">Signed in as <strong>${esc(session?.fullName || '')}</strong> (${esc(session?.role || '')})</p>
      </header>
      <main class="page-content"><div class="page-stack"><header><h2>${esc(title)}</h2></header>${html}</div></main>
    </div>
  `;
  wireCommon();
}

function adminLayout(html) {
  teardownMaps();
  APP_ROOT.innerHTML = `
    <div class="admin-shell">
      <header class="admin-topbar">
        <div>
          <h1>Admin Control Panel</h1>
          <p class="admin-subtitle">Fixed-account governance dashboard</p>
        </div>
        <div class="form-actions admin-top-actions">
          <a class="btn btn-secondary" href="/intro" data-nav="1">Intro</a>
          <a class="btn btn-secondary" href="/tutorial" data-nav="1">Tutorial</a>
          <button class="btn" data-action="logout" type="button">Log Out</button>
        </div>
      </header>
      <main class="admin-content">${html}</main>
    </div>
  `;
  wireCommon();
}

function renderUser(title, html) {
  userLayout(title, html);
}

function paginateItems(items, page, pageSize = PAGE_SIZE) {
  const list = Array.isArray(items) ? items : [];
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.max(1, Math.min(page || 1, totalPages));
  const start = (safePage - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: list.length,
  };
}

function renderPager(key, page, totalPages, totalItems) {
  if (totalItems <= PAGE_SIZE) return '';
  return `
    <div class="mini-pager" data-pager="${esc(key)}">
      <span>Showing page ${page} of ${totalPages} (${totalItems} items)</span>
      <div class="mini-pager-actions">
        <button class="btn btn-secondary" type="button" data-page-action="prev" ${page <= 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn btn-secondary" type="button" data-page-action="next" ${page >= totalPages ? 'disabled' : ''}>Next</button>
      </div>
    </div>
  `;
}

function isUpcomingTrip(trip, now = new Date()) {
  if (!trip || trip.tripStatus !== 'CONFIRMED' || !trip.tripDate) return false;
  const day = String(trip.tripDate).slice(0, 10);
  const time = /^\d{2}:\d{2}$/.test(trip.tripTime || '') ? trip.tripTime : '00:00';
  const dt = new Date(`${day}T${time}:00`);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() >= now.getTime();
}

function resolveTripTypeLabel(type) {
  if (type === 'JOIN_REQUEST') return 'Join Request Match';
  if (type === 'ONE_OFF_REQUEST') return 'One-Off Request Match';
  return type || 'Unknown';
}

function resolveTripKey(trip) {
  if (trip?.rideMatchId != null) return String(trip.rideMatchId);
  return `${trip?.driverId || 'driver'}-${trip?.riderId || 'rider'}-${trip?.tripDate || 'date'}-${trip?.tripTime || 'time'}`;
}

function resolveRatingTarget(trip, role) {
  if (!trip) return { targetUserId: null, targetName: 'User' };
  if (role === 'RIDER') {
    const driverId = Number(trip.driverId);
    return {
      targetUserId: Number.isInteger(driverId) && driverId > 0 ? driverId : null,
      targetName: trip.driverName || 'Driver',
    };
  }
  const riderId = Number(trip.riderId);
  return {
    targetUserId: Number.isInteger(riderId) && riderId > 0 ? riderId : null,
    targetName: trip.riderName || 'Rider',
  };
}

function ensureRatingForm(tripKey) {
  if (!state.myTrips.ratingForms[tripKey]) {
    state.myTrips.ratingForms[tripKey] = {
      score: '5',
      comment: '',
      submitting: false,
      error: '',
      message: '',
      submitted: false,
    };
  }
  return state.myTrips.ratingForms[tripKey];
}

function mapOpenStreetMapUrl(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return '';
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
}

function normalizeSuburbCandidates(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return [];
  const candidates = synonymMap[normalized] || [value];
  const seen = new Set();
  const unique = [];
  candidates.forEach((item) => {
    const key = normalizeText(item).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });
  return unique;
}

async function searchRideOffersWithSynonyms(filters) {
  const origins = normalizeSuburbCandidates(filters.origin);
  const destinations = normalizeSuburbCandidates(filters.destination);
  if (origins.length === 0 || destinations.length === 0) {
    return api.searchRideOffers(filters);
  }

  const results = [];
  const seen = new Set();
  for (const origin of origins) {
    for (const destination of destinations) {
      // eslint-disable-next-line no-await-in-loop
      const list = await api.searchRideOffers({ ...filters, origin, destination });
      (Array.isArray(list) ? list : []).forEach((item) => {
        const key = String(item.offerId);
        if (!seen.has(key)) {
          seen.add(key);
          results.push(item);
        }
      });
    }
  }
  return results;
}

function summarizeStatusClass(status) {
  if (status === 'PENDING') return 'status-pending';
  if (status === 'ACCEPTED' || status === 'MATCHED' || status === 'CONFIRMED') return 'status-accepted';
  if (status === 'REJECTED' || status === 'CLOSED' || status === 'CANCELLED') return 'status-rejected';
  return 'status-open';
}

function clearPostRedirectTimer() {
  if (state.postFlow.redirectTimer) {
    window.clearTimeout(state.postFlow.redirectTimer);
    state.postFlow.redirectTimer = null;
  }
}

function renderIntro() {
  publicLayout(
    'NeighbourLink Product Introduction',
    'High-quality static showcase aligned with your real backend logic.',
    `
      <section class="intro-hero intro-hero-rich" id="overview">
        <div class="intro-hero-grid intro-hero-grid-rich">
          <div>
            <span class="intro-kicker">NeighbourLink Product Showcase</span>
            <h1 class="intro-title">Polished native frontend for Rider, Driver, and Admin workflows</h1>
            <p class="intro-lead">
              This page maps business context, approved use cases, trust logic, and architecture constraints for demonstration.
            </p>
            <div class="intro-hero-actions">
              ${state.session ? '<a class="btn" href="/" data-nav="1">Go to App</a>' : '<a class="btn" href="/login" data-nav="1">Sign In</a><a class="btn btn-secondary" href="/register" data-nav="1">Create Account</a>'}
            </div>
            <div class="intro-hero-points">
              <span>Three approved use cases implemented end-to-end.</span>
              <span>Trust-first acceptance logic enforced in UI and API.</span>
              <span>Admin governance features support review-ready demonstration.</span>
            </div>
          </div>
          <div class="intro-stats intro-stats-rich">
            <article class="stat-card"><strong>3</strong><span>Approved use cases</span></article>
            <article class="stat-card"><strong>9+</strong><span>Core domain entities</span></article>
            <article class="stat-card"><strong>1</strong><span>Fixed admin role</span></article>
            <article class="stat-card"><strong>Native</strong><span>HTML + CSS + JS</span></article>
          </div>
        </div>
      </section>

      <section class="intro-section">
        <h2 class="intro-section-title">Capability Matrix</h2>
        <div class="intro-capability-grid">
          <article class="intro-capability-card"><h3>Fast Rider Search</h3><p>Search available ride offers with route/date/seat filters.</p></article>
          <article class="intro-capability-card"><h3>Join Request Lifecycle</h3><p>Submit, validate, accept or reject with explicit status transitions.</p></article>
          <article class="intro-capability-card"><h3>One-Off Matching</h3><p>Post one-off request, receive offers, accept one final offer.</p></article>
          <article class="intro-capability-card"><h3>Trust Before Acceptance</h3><p>Driver profile + rating summary shown before rider confirmation.</p></article>
          <article class="intro-capability-card"><h3>Driver Verification Docs</h3><p>Licence / spare-seat proof / rego upload and admin review.</p></article>
          <article class="intro-capability-card"><h3>Admin Operations</h3><p>Pagination, search, row edit, and batch status updates.</p></article>
        </div>
      </section>

      <section class="intro-section">
        <h2 class="intro-section-title">Approved Use Cases</h2>
        <div class="intro-usecase-grid">
          <article class="intro-usecase-card">
            <p class="intro-usecase-id">UC1</p>
            <h3>Search Available Ride Offers</h3>
            <ul><li>Set Origin, Destination, and Trip Date</li><li>Review matching offers</li><li>Inspect trust details before request</li></ul>
          </article>
          <article class="intro-usecase-card">
            <p class="intro-usecase-id">UC2</p>
            <h3>Request to Join Ride Offer</h3>
            <ul><li>Submit join request with seat count</li><li>Driver decides with meeting point</li><li>Seat updates and match creation</li></ul>
          </article>
          <article class="intro-usecase-card">
            <p class="intro-usecase-id">UC3</p>
            <h3>Post One-Off Request + Accept Driver Offer</h3>
            <ul><li>Rider posts one-off request</li><li>Drivers submit responses</li><li>Rider accepts one and system records match</li></ul>
          </article>
        </div>
      </section>

      <section class="intro-section">
        <h2 class="intro-section-title">Architecture Snapshot</h2>
        <div class="intro-architecture-grid">
          <article class="intro-architecture-card"><h3>Backend</h3><ul><li>Java 17 + Spring Boot</li><li>REST + DTO boundary</li><li>SQLite + JPA</li></ul></article>
          <article class="intro-architecture-card"><h3>Frontend</h3><ul><li>Native HTML/CSS/JS on Vite</li><li>Route-driven SPA behavior</li><li>Mobile responsive layouts</li></ul></article>
          <article class="intro-architecture-card"><h3>Domain</h3><ul><li>User/Profile/Rating</li><li>RideOffer/JoinRequest/RideMatch</li><li>RideRequest/RideRequestOffer</li></ul></article>
          <article class="intro-architecture-card"><h3>Rules</h3><ul><li>No overbooking</li><li>Match only after acceptance</li><li>Trust visible before acceptance</li></ul></article>
        </div>
      </section>

      <section class="intro-section">
        <h2 class="intro-section-title">Project FAQ</h2>
        <div class="faq-list">
          ${[
            { q: 'Is this aligned to implemented behavior?', a: 'Yes. This page reflects current backend + frontend behavior.' },
            { q: 'Why is trust emphasized in flow?', a: 'Trust-before-acceptance is a core business requirement.' },
            { q: 'Can this be mapped to UML quickly?', a: 'Yes. UC1/UC2/UC3 and domain terms are shown explicitly.' },
          ].map((faq, idx) => `
            <article class="faq-item">
              <button class="faq-trigger" type="button" data-faq-index="${idx}">
                ${esc(faq.q)}
                <span>${state.introFaqIndex === idx ? '-' : '+'}</span>
              </button>
              ${state.introFaqIndex === idx ? `<div class="faq-body">${esc(faq.a)}</div>` : ''}
            </article>
          `).join('')}
        </div>
      </section>
    `,
  );

  APP_ROOT.querySelectorAll('[data-faq-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.faqIndex);
      state.introFaqIndex = state.introFaqIndex === idx ? -1 : idx;
      renderApp();
    });
  });
}

const tutorialTracks = {
  RIDER: {
    label: 'Rider Tutorial',
    objective: 'Find rides correctly, evaluate trust, submit requests, and track statuses in My Trips.',
    checklist: [
      'I can complete Find a Ride in 3 steps: Origin, Destination, Trip Date.',
      'I know Confirm is required before submit.',
      'I can review trust info before requesting.',
      'I can distinguish Join History and One-Off History.',
      'I can submit post-trip rating.',
    ],
    guided: [
      { title: 'Search flow setup', detail: 'Set Origin, Destination, and Trip Date. Confirm flow to submit.' },
      { title: 'Trust review before action', detail: 'Inspect profile/rating in Ride Offer Details before requesting.' },
      { title: 'Track lifecycle', detail: 'Use My Join Request History tabs and Trip Filter.' },
      { title: 'Fallback path', detail: 'If no results, switch to one-off request flow.' },
    ],
    tasks: ['Task A: Join existing offer', 'Task B: Post one-off fallback', 'Task C: Accept one driver offer', 'Task D: Submit rating'],
    demo: ['00:00 Show 3-step search', '01:30 Show trust review', '03:00 Show history tabs', '04:30 Submit one-off and redirect'],
    trouble: [
      { issue: 'No search results', cause: 'Suburb/date/time mismatch', fix: 'Verify suburb/date and increase time flexibility.' },
      { issue: 'Join request missing in My Trips', cause: 'Wrong tab/page', fix: 'Switch to All tab and check pagination.' },
      { issue: 'Rider not found error', cause: 'Session stale vs DB', fix: 'Log out and sign in again.' },
    ],
    quiz: [
      { id: 'r1', q: 'When does flow submit?', options: ['After Destination', 'Only after final Confirm'], answer: 1 },
      { id: 'r2', q: 'Where to track join outcomes?', options: ['My Join Request History', 'Profile'], answer: 0 },
    ],
  },
  DRIVER: {
    label: 'Driver Tutorial',
    objective: 'Process join requests and one-off responses with seat and verification constraints.',
    checklist: [
      'I can decide pending joins with meeting point on accept.',
      'I can respond to one-off requests without duplicate pending offers.',
      'I can post ride offers within spare seat capacity.',
      'I can track outcomes in My Trips.',
    ],
    guided: [
      { title: 'Process pending joins', detail: 'Review request and decide ACCEPTED/REJECTED with clear meeting point.' },
      { title: 'Respond to one-off requests', detail: 'Set proposed seats and meeting point; avoid duplicate pending offers.' },
      { title: 'Track accepted outcomes', detail: 'Check confirmed trip records and one-off offer history.' },
    ],
    tasks: ['Task A: Accept join request', 'Task B: Reject invalid request', 'Task C: Submit one-off response', 'Task D: Verify confirmed outcome'],
    demo: ['00:00 Open Driver Hub', '01:30 Accept with meeting point', '03:00 Reject one request', '04:30 Respond to one-off'],
    trouble: [
      { issue: 'Accept action fails', cause: 'Missing meeting point or ownership mismatch', fix: 'Provide meeting point and verify ownership.' },
      { issue: 'Cannot submit one-off response', cause: 'Inactive/unverified driver or seat limit', fix: 'Check account/verification and seat capacity.' },
    ],
    quiz: [
      { id: 'd1', q: 'What is required on ACCEPTED decision?', options: ['Meeting point', 'Nothing'], answer: 0 },
      { id: 'd2', q: 'Can one driver keep multiple pending offers for same request?', options: ['Yes', 'No'], answer: 1 },
    ],
  },
  ADMIN: {
    label: 'Admin Tutorial',
    objective: 'Use fixed admin account to govern users, rides, verification, and trust data.',
    checklist: [
      'I can sign in only via dedicated admin login URL.',
      'I can search, paginate, and batch-update statuses.',
      'I can review driver verification fields and docs.',
      'I can edit ride/request/match/rating records.',
    ],
    guided: [
      { title: 'Fixed credential entry', detail: 'Admin role cannot register; login only with fixed account.' },
      { title: 'Dataset operations', detail: 'Use tabs for users/offers/requests/joins/matches/ratings.' },
      { title: 'Batch governance', detail: 'Select rows and apply bulk status updates safely.' },
    ],
    tasks: ['Task A: Verify pending driver account', 'Task B: Bulk close old offers', 'Task C: Correct join status', 'Task D: Audit ratings'],
    demo: ['00:00 Login admin', '01:00 Edit user status', '02:30 Bulk update offers', '04:00 Edit match status'],
    trouble: [
      { issue: 'Admin table appears empty', cause: 'Search/page state', fix: 'Clear search and reset to page 1.' },
      { issue: 'Auth error on update', cause: 'Admin session expired', fix: 'Logout and login again via /admin/login.' },
    ],
    quiz: [
      { id: 'a1', q: 'Can admin be registered from register page?', options: ['No', 'Yes'], answer: 0 },
      { id: 'a2', q: 'Best way to update many rows?', options: ['Bulk status action', 'Only one-by-one'], answer: 0 },
    ],
  },
};

function buildCheatSheet(trackKey) {
  const track = tutorialTracks[trackKey] || tutorialTracks.RIDER;
  const lines = [];
  lines.push(`${track.label} Cheat Sheet`);
  lines.push('');
  lines.push(`Objective: ${track.objective}`);
  lines.push('');
  lines.push('Checklist:');
  track.checklist.forEach((item, i) => lines.push(`${i + 1}. ${item}`));
  lines.push('');
  lines.push('Guided Steps:');
  track.guided.forEach((step, i) => lines.push(`${i + 1}. ${step.title} - ${step.detail}`));
  lines.push('');
  lines.push('Tasks:');
  track.tasks.forEach((task, i) => lines.push(`${i + 1}. ${task}`));
  return lines.join('\n');
}

function renderTutorial() {
  const t = state.tutorial;
  const track = tutorialTracks[t.track] || tutorialTracks.RIDER;
  const checklistState = t.checklistByTrack[t.track] || {};
  const done = track.checklist.reduce((sum, _item, idx) => (checklistState[idx] ? sum + 1 : sum), 0);
  const progress = track.checklist.length ? Math.round((done / track.checklist.length) * 100) : 0;
  const quizScore = track.quiz.reduce((sum, item) => (Number(t.quizAnswers[item.id]) === item.answer ? sum + 1 : sum), 0);

  publicLayout(
    'Tutorial Training Center',
    'Practical onboarding with guided steps, tasks, demo script, troubleshooting, and quiz.',
    `
      <section class="tutorial-master tutorial-master-rich">
        <div class="tutorial-top-grid">
          <aside class="tutorial-sidebar tutorial-sidebar-rich">
            <p class="tutorial-label">Choose Track</p>
            <div class="tutorial-role-list">
              ${Object.keys(tutorialTracks).map((key) => `<button type="button" class="tutorial-role-btn ${t.track === key ? 'active' : ''}" data-track="${key}">${esc(tutorialTracks[key].label)}</button>`).join('')}
            </div>
            <div class="tutorial-progress-card ${progress >= 80 ? 'is-high' : progress >= 45 ? 'is-mid' : 'is-low'}">
              <div class="tutorial-progress-head"><strong>Progress</strong><span>${progress}%</span></div>
              <div class="tutorial-progress-bar"><span class="tutorial-progress-fill" style="width:${progress}%"></span></div>
              <p class="tutorial-progress-meta">${done}/${track.checklist.length} readiness items completed.</p>
              <ul class="tutorial-checklist">
                ${track.checklist.map((item, idx) => `
                  <li><label><input type="checkbox" data-check-index="${idx}" ${checklistState[idx] ? 'checked' : ''}><span>${esc(item)}</span></label></li>
                `).join('')}
              </ul>
            </div>
          </aside>

          <article class="tutorial-board tutorial-board-rich">
            <header class="tutorial-board-head">
              <p class="tutorial-pill">${esc(track.label)}</p>
              <h3>${esc(track.objective)}</h3>
            </header>

            <div class="tutorial-mode-tabs">
              <button type="button" class="tutorial-mode-btn ${t.mode === 'GUIDED' ? 'active' : ''}" data-mode="GUIDED"><span class="mode-title">Guided Path</span><span class="mode-desc">Scenario checkpoints</span></button>
              <button type="button" class="tutorial-mode-btn ${t.mode === 'TASKS' ? 'active' : ''}" data-mode="TASKS"><span class="mode-title">Task Playbooks</span><span class="mode-desc">Execution cards</span></button>
              <button type="button" class="tutorial-mode-btn ${t.mode === 'DEMO' ? 'active' : ''}" data-mode="DEMO"><span class="mode-title">Demo Script</span><span class="mode-desc">Timeline cues</span></button>
              <button type="button" class="tutorial-mode-btn ${t.mode === 'TROUBLE' ? 'active' : ''}" data-mode="TROUBLE"><span class="mode-title">Troubleshooting</span><span class="mode-desc">Issue-fix pairs</span></button>
              <button type="button" class="tutorial-mode-btn ${t.mode === 'QUIZ' ? 'active' : ''}" data-mode="QUIZ"><span class="mode-title">Knowledge Check</span><span class="mode-desc">Self validation</span></button>
            </div>

            ${t.mode === 'GUIDED' ? `
              <ol class="tutorial-step-list">
                ${track.guided.map((step, idx) => `
                  <li class="tutorial-step-card">
                    <span class="tutorial-step-index">Step ${idx + 1}</span>
                    <div class="tutorial-step-content"><h5>${esc(step.title)}</h5><p>${esc(step.detail)}</p></div>
                  </li>
                `).join('')}
              </ol>
            ` : ''}

            ${t.mode === 'TASKS' ? `<div class="tutorial-task-grid">${track.tasks.map((task) => `<article class="tutorial-card tutorial-task-card"><p>${esc(task)}</p></article>`).join('')}</div>` : ''}
            ${t.mode === 'DEMO' ? `<div class="tutorial-demo-list">${track.demo.map((line) => `<article class="tutorial-card tutorial-demo-item"><div class="tutorial-demo-content"><p>${esc(line)}</p></div></article>`).join('')}</div>` : ''}

            ${t.mode === 'TROUBLE' ? `
              <div class="tutorial-trouble-list">
                ${track.trouble.map((item, idx) => `
                  <article class="tutorial-card tutorial-trouble-item">
                    <button type="button" class="tutorial-trouble-toggle" data-trouble-index="${idx}">
                      <span>${esc(item.issue)}</span><span>${t.troubleIndex === idx ? '-' : '+'}</span>
                    </button>
                    ${t.troubleIndex === idx ? `<div class="tutorial-trouble-body"><p><strong>Likely cause:</strong> ${esc(item.cause)}</p><p><strong>How to fix:</strong> ${esc(item.fix)}</p></div>` : ''}
                  </article>
                `).join('')}
              </div>
            ` : ''}

            ${t.mode === 'QUIZ' ? `
              <form id="tutorial-quiz-form" class="tutorial-quiz-form">
                ${track.quiz.map((item, idx) => `
                  <article class="tutorial-card tutorial-question-card">
                    <p class="tutorial-card-title">Q${idx + 1}. ${esc(item.q)}</p>
                    <div class="tutorial-option-list">
                      ${item.options.map((option, optionIdx) => `
                        <label class="tutorial-option-item">
                          <input type="radio" name="quiz-${esc(item.id)}" data-quiz-id="${esc(item.id)}" value="${optionIdx}" ${Number(t.quizAnswers[item.id]) === optionIdx ? 'checked' : ''}>
                          <span>${esc(option)}</span>
                        </label>
                      `).join('')}
                    </div>
                    ${t.quizSubmitted ? `<p class="${Number(t.quizAnswers[item.id]) === item.answer ? 'status-success' : 'status-note'}">${Number(t.quizAnswers[item.id]) === item.answer ? 'Correct.' : 'Not correct yet.'}</p>` : ''}
                  </article>
                `).join('')}
                <div class="tutorial-cta">
                  <button class="btn" type="submit">Submit Answers</button>
                  <button class="btn btn-secondary" type="button" data-action="tutorial-reset-quiz">Reset Quiz</button>
                  ${t.quizSubmitted ? `<p class="tutorial-quiz-score">Score: ${quizScore}/${track.quiz.length}</p>` : ''}
                </div>
              </form>
            ` : ''}

            <div class="tutorial-cta">
              <button class="btn btn-secondary" type="button" data-action="tutorial-copy">Copy 1-Page Cheat Sheet</button>
              ${t.copyFeedback ? `<span class="tutorial-copy-feedback">${esc(t.copyFeedback)}</span>` : ''}
            </div>
            <div class="tutorial-cta">
              <a class="btn" href="/" data-nav="1">Open App</a>
              <a class="btn btn-secondary" href="/my-trips" data-nav="1">Open My Trips</a>
            </div>
          </article>
        </div>
      </section>
    `,
  );

  APP_ROOT.querySelectorAll('[data-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tutorial.track = btn.dataset.track;
      state.tutorial.mode = 'GUIDED';
      state.tutorial.troubleIndex = 0;
      state.tutorial.quizAnswers = {};
      state.tutorial.quizSubmitted = false;
      state.tutorial.copyFeedback = '';
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tutorial.mode = btn.dataset.mode;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-check-index]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const idx = Number(checkbox.dataset.checkIndex);
      const trackKey = state.tutorial.track;
      state.tutorial.checklistByTrack[trackKey] = {
        ...(state.tutorial.checklistByTrack[trackKey] || {}),
        [idx]: checkbox.checked,
      };
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-trouble-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.troubleIndex);
      state.tutorial.troubleIndex = state.tutorial.troubleIndex === idx ? -1 : idx;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-quiz-id]').forEach((input) => {
    input.addEventListener('change', () => {
      state.tutorial.quizAnswers[input.dataset.quizId] = Number(input.value);
    });
  });

  const quizForm = APP_ROOT.querySelector('#tutorial-quiz-form');
  if (quizForm) {
    quizForm.addEventListener('submit', (event) => {
      event.preventDefault();
      state.tutorial.quizSubmitted = true;
      renderApp();
    });
  }

  const resetQuizBtn = APP_ROOT.querySelector('[data-action="tutorial-reset-quiz"]');
  if (resetQuizBtn) {
    resetQuizBtn.addEventListener('click', () => {
      state.tutorial.quizAnswers = {};
      state.tutorial.quizSubmitted = false;
      renderApp();
    });
  }

  const copyBtn = APP_ROOT.querySelector('[data-action="tutorial-copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const text = buildCheatSheet(state.tutorial.track);
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const area = document.createElement('textarea');
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
        }
        state.tutorial.copyFeedback = 'Cheat sheet copied to clipboard.';
      } catch {
        state.tutorial.copyFeedback = 'Copy failed. Use this page directly.';
      }
      renderApp();
    });
  }
}

function renderLogin() {
  if (state.session?.userId) {
    navigate(state.session.role === 'ADMIN' ? '/admin' : '/', true);
    return;
  }

  publicLayout('User Login', 'Sign in with your NeighbourLink account.', `
    <section class="auth-shell"><div class="auth-card">
      <form class="form-grid" id="login-form">
        <label>Email<input type="email" name="email" value="daniel.rider@example.com" required></label>
        <label>Password<input type="password" name="password" value="demo1234" required></label>
        <p id="login-error" class="status-error" style="display:none;"></p>
        <div class="form-actions">
          <button class="btn" type="submit">Log In</button>
          <a class="btn btn-secondary" href="/register" data-nav="1">Register</a>
          <a class="btn btn-secondary" href="/admin/login" data-nav="1">Admin</a>
        </div>
      </form>
    </div></section>
  `);

  const form = APP_ROOT.querySelector('#login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorNode = APP_ROOT.querySelector('#login-error');
    errorNode.style.display = 'none';
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    const restore = withLoadingButton(button, 'Signing in...');
    try {
      const response = await api.login({
        email: normalizeText(data.get('email')),
        password: String(data.get('password') || ''),
      });
      saveSession(response);
      state.menuOpen = false;
      navigate(response.role === 'ADMIN' ? '/admin' : '/', true);
    } catch (error) {
      errorNode.textContent = error.message || 'Unable to sign in.';
      errorNode.style.display = 'block';
      restore();
    }
  });
}

function renderRegister() {
  if (state.session?.userId) {
    navigate(state.session.role === 'ADMIN' ? '/admin' : '/', true);
    return;
  }

  publicLayout('Register Account', 'Driver registration supports required document upload and admin verification.', `
    <section class="auth-shell"><div class="auth-card">
      <form class="form-grid" id="register-form" enctype="multipart/form-data">
        <label>Full name<input name="fullName" required></label>
        <label>Email<input type="email" name="email" required></label>
        <label>Password<input type="password" name="password" minlength="6" required></label>
        <label>Phone<input name="phone" required></label>
        <label>Suburb<input name="suburb" required></label>
        <label>Role<select name="role"><option value="RIDER">RIDER</option><option value="DRIVER">DRIVER</option></select></label>
        <div id="driver-fields" class="form-grid" style="display:none;">
          <label>Vehicle info<input name="driverVehicleInfo"></label>
          <label>Spare seat capacity<input type="number" min="1" name="driverSpareSeatCapacity" value="2"></label>
          <label>Driver licence file<input type="file" name="driverLicenceFile" accept="image/*,.pdf"></label>
          <label>Spare seat proof file<input type="file" name="spareSeatCapacityProofFile" accept="image/*,.pdf"></label>
          <label>Vehicle rego file<input type="file" name="vehicleRegoFile" accept="image/*,.pdf"></label>
        </div>
        <p id="register-error" class="status-error" style="display:none;"></p>
        <div class="form-actions">
          <button class="btn" type="submit">Create Account</button>
          <a class="btn btn-secondary" href="/login" data-nav="1">Back</a>
        </div>
      </form>
    </div></section>
  `);

  const form = APP_ROOT.querySelector('#register-form');
  const roleSelect = form.querySelector('select[name="role"]');
  const driverFields = APP_ROOT.querySelector('#driver-fields');
  const syncDriverFields = () => {
    driverFields.style.display = roleSelect.value === 'DRIVER' ? 'grid' : 'none';
  };
  syncDriverFields();
  roleSelect.addEventListener('change', syncDriverFields);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorNode = APP_ROOT.querySelector('#register-error');
    errorNode.style.display = 'none';
    const button = form.querySelector('button[type="submit"]');
    const restore = withLoadingButton(button, 'Creating...');
    const raw = new FormData(form);
    const role = String(raw.get('role') || 'RIDER');
    const payload = {
      fullName: normalizeText(raw.get('fullName')),
      email: normalizeText(raw.get('email')),
      password: String(raw.get('password') || ''),
      role,
      phone: normalizeText(raw.get('phone')),
      suburb: normalizeText(raw.get('suburb')),
      driverVehicleInfo: role === 'DRIVER' ? normalizeText(raw.get('driverVehicleInfo')) || null : null,
      driverSpareSeatCapacity: role === 'DRIVER' ? Number(raw.get('driverSpareSeatCapacity') || 0) || null : null,
    };
    try {
      let body = payload;
      if (role === 'DRIVER') {
        const multipart = new FormData();
        multipart.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        ['driverLicenceFile', 'spareSeatCapacityProofFile', 'vehicleRegoFile'].forEach((name) => {
          const file = raw.get(name);
          if (file instanceof File && file.size > 0) multipart.append(name, file);
        });
        body = multipart;
      }
      const response = await api.register(body);
      saveSession(response);
      navigate('/', true);
    } catch (error) {
      errorNode.textContent = error.message || 'Unable to register.';
      errorNode.style.display = 'block';
      restore();
    }
  });
}

function renderAdminLogin() {
  if (state.session?.role === 'ADMIN') {
    navigate('/admin', true);
    return;
  }

  publicLayout('Admin Login', 'Fixed admin account only. Admin cannot register.', `
    <section class="auth-shell"><div class="auth-card">
      <p class="auth-hint">Fixed credentials: ${esc(FIXED_ADMIN_EMAIL)} / ${esc(FIXED_ADMIN_PASSWORD)}</p>
      <form class="form-grid" id="admin-login-form">
        <label>Email<input type="email" name="email" value="${esc(FIXED_ADMIN_EMAIL)}" required></label>
        <label>Password<input type="password" name="password" value="${esc(FIXED_ADMIN_PASSWORD)}" required></label>
        <p id="admin-login-error" class="status-error" style="display:none;"></p>
        <div class="form-actions"><button class="btn" type="submit">Open Admin Dashboard</button></div>
      </form>
    </div></section>
  `);

  const form = APP_ROOT.querySelector('#admin-login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorNode = APP_ROOT.querySelector('#admin-login-error');
    errorNode.style.display = 'none';
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    const restore = withLoadingButton(button, 'Signing in...');
    try {
      const response = await api.login({
        email: normalizeText(data.get('email')),
        password: String(data.get('password') || ''),
      });
      if (response.role !== 'ADMIN') throw new Error('This portal only accepts admin credentials.');
      saveSession(response);
      state.admin = createDefaultAdmin();
      navigate('/admin', true);
    } catch (error) {
      errorNode.textContent = error.message || 'Unable to sign in.';
      errorNode.style.display = 'block';
      restore();
    }
  });
}

function renderLocationPanel(prefix, location, placeholder, scope, contextKey, disabled = false) {
  const mapId = `location-map-${contextKey}-${scope}`;
  const hasCoordinates = toNullableCoordinate(location.latitude) != null && toNullableCoordinate(location.longitude) != null;
  const coordLabel = hasCoordinates
    ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}`
    : 'Not selected';
  const osmLink = hasCoordinates ? mapOpenStreetMapUrl(location.latitude, location.longitude) : '';
  return `
    <div class="location-picker" data-location-picker="${esc(scope)}" data-context="${esc(contextKey)}">
      <p class="location-picker-title">${esc(prefix)}</p>
      <label>
        Search location
        <div class="location-search-row">
          <input
            type="text"
            data-loc-query="${esc(scope)}"
            data-context="${esc(contextKey)}"
            value="${esc(location.searchQuery || '')}"
            placeholder="${esc(placeholder)}"
            ${disabled ? 'disabled' : ''}
          >
          <button class="btn btn-secondary" type="button" data-action="loc-search" data-context="${esc(contextKey)}" data-scope="${esc(scope)}" ${disabled ? 'disabled' : ''}>
            ${location.searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </label>

      ${Array.isArray(location.searchResults) && location.searchResults.length > 0 ? `
        <div class="location-results">
          ${location.searchResults.map((item, index) => `
            <button
              class="location-result-item"
              type="button"
              data-action="loc-select"
              data-context="${esc(contextKey)}"
              data-scope="${esc(scope)}"
              data-index="${index}"
              ${disabled ? 'disabled' : ''}
            >
              <strong>${esc(resolveLocationDisplayName(item) || 'Unknown location')}</strong>
              <small>${esc(normalizeText(item?.suburb || '-'))} | ${esc(normalizeText(item?.state || '-'))} | ${esc(normalizeText(item?.postcode || '-'))}</small>
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div class="location-meta">
        <span><strong>Address:</strong> ${esc(location.address || '-')}</span>
        <span><strong>Suburb:</strong> ${esc(location.suburb || '-')}</span>
        <span><strong>State:</strong> ${esc(location.state || '-')}</span>
        <span><strong>Postcode:</strong> ${esc(location.postcode || '-')}</span>
        <span><strong>Coordinates:</strong> ${esc(coordLabel)}</span>
        ${osmLink ? `<span><a href="${esc(osmLink)}" target="_blank" rel="noreferrer">Open in OpenStreetMap</a></span>` : ''}
      </div>

      <p class="trip-map-note">Click a point on the map to auto-fill address and coordinates.</p>
      <div class="location-map-shell">
        <div id="${esc(mapId)}" class="location-map" data-location-map="1" data-context="${esc(contextKey)}" data-scope="${esc(scope)}"></div>
      </div>

      ${location.mapResolving ? '<p>Resolving selected map point...</p>' : ''}
      ${location.searchError ? `<p class="status-error">${esc(location.searchError)}</p>` : ''}

      <div class="flow-summary-grid">
        <label>Place name<input type="text" data-loc-field="${esc(scope)}.name" data-context="${esc(contextKey)}" value="${esc(location.name || '')}" ${disabled ? 'disabled' : ''}></label>
        <label>Address (optional)<input type="text" data-loc-field="${esc(scope)}.address" data-context="${esc(contextKey)}" value="${esc(location.address || '')}" ${disabled ? 'disabled' : ''}></label>
        <label>Suburb (optional)<input type="text" data-loc-field="${esc(scope)}.suburb" data-context="${esc(contextKey)}" value="${esc(location.suburb || '')}" ${disabled ? 'disabled' : ''}></label>
        <label>State (optional)<input type="text" data-loc-field="${esc(scope)}.state" data-context="${esc(contextKey)}" value="${esc(location.state || '')}" ${disabled ? 'disabled' : ''}></label>
        <label>Postcode (optional)<input type="text" data-loc-field="${esc(scope)}.postcode" data-context="${esc(contextKey)}" value="${esc(location.postcode || '')}" ${disabled ? 'disabled' : ''}></label>
        <label>Latitude (optional)<input type="number" step="any" data-loc-field="${esc(scope)}.latitude" data-context="${esc(contextKey)}" value="${location.latitude ?? ''}" ${disabled ? 'disabled' : ''}></label>
        <label>Longitude (optional)<input type="number" step="any" data-loc-field="${esc(scope)}.longitude" data-context="${esc(contextKey)}" value="${location.longitude ?? ''}" ${disabled ? 'disabled' : ''}></label>
      </div>
    </div>
  `;
}

function wireLocationPanelHandlers(flow, contextKey, options = {}) {
  const disabled = Boolean(options.disabled);

  APP_ROOT.querySelectorAll(`[data-loc-query][data-context="${contextKey}"]`).forEach((input) => {
    input.addEventListener('input', () => {
      const scope = input.dataset.locQuery;
      if (!flow[scope]) return;
      flow[scope].searchQuery = input.value;
    });
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (disabled) return;
      const scope = input.dataset.locQuery;
      if (!flow[scope]) return;
      searchLocationSuggestions(flow[scope]);
    });
  });

  APP_ROOT.querySelectorAll(`[data-action="loc-search"][data-context="${contextKey}"]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (disabled) return;
      const scope = button.dataset.scope;
      if (!flow[scope]) return;
      searchLocationSuggestions(flow[scope]);
    });
  });

  APP_ROOT.querySelectorAll(`[data-action="loc-select"][data-context="${contextKey}"]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (disabled) return;
      const scope = button.dataset.scope;
      const index = Number(button.dataset.index);
      const location = flow[scope];
      if (!location || !Number.isInteger(index) || !Array.isArray(location.searchResults)) return;
      const selected = location.searchResults[index];
      if (!selected) return;
      applyLocationSelection(location, selected);
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll(`[data-loc-field][data-context="${contextKey}"]`).forEach((input) => {
    input.addEventListener('input', () => {
      const [scope, field] = String(input.dataset.locField || '').split('.');
      if (!flow[scope]) return;
      flow[scope][field] = input.value;
      if (field === 'name') {
        flow[scope].suburb = input.value;
        flow[scope].searchQuery = input.value;
      }
      if (field === 'address' && !normalizeText(flow[scope].searchQuery)) {
        flow[scope].searchQuery = input.value;
      }
    });
  });

  APP_ROOT.querySelectorAll(`[data-location-map][data-context="${contextKey}"]`).forEach((node) => {
    const scope = node.dataset.scope;
    const location = flow[scope];
    if (!location) return;
    setupLocationMap(node.id, location, { disabled });
  });
}

function canAccessFindStep(step) {
  const flow = state.findFlow;
  const originReady = Boolean(normalizeLocationText(flow.origin));
  const destinationReady = Boolean(normalizeLocationText(flow.destination));
  if (step === 'ORIGIN') return true;
  if (step === 'DESTINATION') return originReady;
  if (step === 'TRIP') return originReady && destinationReady;
  return false;
}

function validateFindFlow() {
  const flow = state.findFlow;
  if (!normalizeLocationText(flow.origin)) return { step: 'ORIGIN', message: 'Origin is required before moving on.' };
  if (!normalizeLocationText(flow.destination)) return { step: 'DESTINATION', message: 'Destination is required before setting trip date.' };
  if (!normalizeText(flow.form.departureDate)) return { step: 'TRIP', message: 'Trip date is required.' };
  if (normalizeText(flow.form.departureTime)) {
    const flex = Number(flow.form.timeFlexHours);
    if (!Number.isInteger(flex) || flex < 0 || flex > 6) {
      return { step: 'TRIP', message: 'Time flexibility must be an integer from 0 to 6.' };
    }
  }
  const passengerCount = Number(flow.form.passengerCount);
  if (!Number.isInteger(passengerCount) || passengerCount < 1) {
    return { step: 'TRIP', message: 'Passengers must be at least 1.' };
  }
  return null;
}

function renderFindRide() {
  if (!requireUser()) return;
  const flow = state.findFlow;

  userLayout('Find a Ride', `
    <section class="section-card form-layout-card">
      <p>Step-by-step flow: Origin, Destination, Trip Date confirmation.</p>
      <div class="flow-step-tabs">
        <button type="button" class="flow-step-tab ${flow.step === 'ORIGIN' ? 'is-active' : ''}" data-find-step="ORIGIN">Origin</button>
        <button type="button" class="flow-step-tab ${flow.step === 'DESTINATION' ? 'is-active' : ''}" data-find-step="DESTINATION" ${canAccessFindStep('DESTINATION') ? '' : 'disabled'}>Destination</button>
        <button type="button" class="flow-step-tab ${flow.step === 'TRIP' ? 'is-active' : ''}" data-find-step="TRIP" ${canAccessFindStep('TRIP') ? '' : 'disabled'}>Trip Date</button>
      </div>

      ${flow.step === 'ORIGIN' ? `<div class="flow-step-panel">${renderLocationPanel('Origin', flow.origin, 'Search pickup suburb/address', 'origin', 'find')}</div>` : ''}
      ${flow.step === 'DESTINATION' ? `<div class="flow-step-panel"><p class="status-note"><strong>Current origin:</strong> ${esc(normalizeLocationText(flow.origin))}. You can return to edit.</p>${renderLocationPanel('Destination', flow.destination, 'Search destination suburb/address', 'destination', 'find')}</div>` : ''}
      ${flow.step === 'TRIP' ? `
        <div class="flow-step-panel">
          <p class="status-note"><strong>Origin:</strong> ${esc(normalizeLocationText(flow.origin))} | <strong>Destination:</strong> ${esc(normalizeLocationText(flow.destination))}</p>
          <div class="flow-summary-grid">
            <label>Trip date<input type="date" data-find-field="departureDate" value="${esc(flow.form.departureDate)}"></label>
            <label>Departure time (optional)<input type="time" data-find-field="departureTime" value="${esc(flow.form.departureTime)}"></label>
            <label>Time flexibility (0-6h)
              <select data-find-field="timeFlexHours">
                ${[0, 1, 2, 3, 4, 5, 6].map((h) => `<option value="${h}" ${String(h) === String(flow.form.timeFlexHours || '0') ? 'selected' : ''}>${h} hour${h === 1 ? '' : 's'}</option>`).join('')}
              </select>
            </label>
            <label>Passengers<input type="number" min="1" data-find-field="passengerCount" value="${esc(flow.form.passengerCount)}"></label>
          </div>
        </div>
      ` : ''}

      ${flow.error ? `<p class="status-error">${esc(flow.error)}</p>` : ''}
      <div class="form-actions">
        ${flow.step !== 'ORIGIN' ? '<button class="btn btn-secondary" type="button" data-action="find-back">Back</button>' : ''}
        ${flow.step !== 'TRIP' ? '<button class="btn" type="button" data-action="find-next">Continue</button>' : '<button class="btn" type="button" data-action="find-confirm">Confirm Flow</button>'}
      </div>
    </section>

    <section class="section-card">
      <h2>Notes</h2>
      <p>You can return to earlier steps and correct any field before confirmation.</p>
      <p>If no suitable offers are found, switch to one-off request flow.</p>
    </section>
  `);

  APP_ROOT.querySelectorAll('[data-find-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.findStep;
      if (canAccessFindStep(next)) {
        flow.step = next;
        flow.error = '';
        renderApp();
      }
    });
  });

  wireLocationPanelHandlers(flow, 'find');

  APP_ROOT.querySelectorAll('[data-find-field]').forEach((input) => {
    const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
      flow.form[input.dataset.findField] = String(input.value ?? '');
      if (input.dataset.findField === 'departureTime' && !normalizeText(input.value)) {
        flow.form.timeFlexHours = '0';
      }
    });
  });

  const backBtn = APP_ROOT.querySelector('[data-action="find-back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      flow.error = '';
      if (flow.step === 'TRIP') flow.step = 'DESTINATION';
      else if (flow.step === 'DESTINATION') flow.step = 'ORIGIN';
      renderApp();
    });
  }

  const nextBtn = APP_ROOT.querySelector('[data-action="find-next"]');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      flow.error = '';
      if (flow.step === 'ORIGIN') {
        if (!normalizeLocationText(flow.origin)) {
          flow.error = 'Origin is required before moving on.';
          renderApp();
          return;
        }
        flow.step = 'DESTINATION';
      } else if (flow.step === 'DESTINATION') {
        if (!normalizeLocationText(flow.destination)) {
          flow.error = 'Destination is required before moving on.';
          renderApp();
          return;
        }
        flow.step = 'TRIP';
      }
      renderApp();
    });
  }

  const confirmBtn = APP_ROOT.querySelector('[data-action="find-confirm"]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      flow.error = '';
      const validation = validateFindFlow();
      if (validation) {
        flow.step = validation.step;
        flow.error = validation.message;
        renderApp();
        return;
      }
      const params = new URLSearchParams();
      params.set('origin', normalizeLocationText(flow.origin));
      params.set('destination', normalizeLocationText(flow.destination));
      params.set('departureDate', normalizeText(flow.form.departureDate));
      if (normalizeText(flow.form.departureTime)) {
        params.set('departureTime', normalizeText(flow.form.departureTime));
        params.set('timeFlexHours', normalizeText(flow.form.timeFlexHours) || '0');
      }
      params.set('passengerCount', normalizeText(flow.form.passengerCount) || '1');
      navigate(`/search-results?${params.toString()}`);
    });
  }
}

async function renderSearchResults(token) {
  if (!requireUser()) return;
  const query = new URLSearchParams(window.location.search);
  const filters = {
    origin: query.get('origin') || '',
    destination: query.get('destination') || '',
    departureDate: query.get('departureDate') || '',
    departureTime: query.get('departureTime') || '',
    timeFlexHours: query.get('timeFlexHours') || '0',
    passengerCount: query.get('passengerCount') || '',
  };

  userLayout('Search Results', `
    <section class="section-card">
      <h2>Search Summary</h2>
      <p><strong>From:</strong> ${esc(filters.origin || 'Any')}</p>
      <p><strong>To:</strong> ${esc(filters.destination || 'Any')}</p>
      <p><strong>Date:</strong> ${esc(filters.departureDate || 'Any')}</p>
      <p><strong>Time:</strong> ${esc(filters.departureTime || 'Any')}</p>
      <p><strong>Time tolerance:</strong> ${filters.departureTime ? `+/- ${esc(filters.timeFlexHours || '0')}h` : 'Not applied'}</p>
      <p><strong>Passengers:</strong> ${esc(filters.passengerCount || 'Any')}</p>
    </section>
    <section class="section-card" id="results-box"><p>Loading matching ride offers...</p></section>
  `);

  try {
    const offers = await searchRideOffersWithSynonyms(filters);
    if (token !== renderToken) return;
    const list = Array.isArray(offers) ? offers : [];
    const box = APP_ROOT.querySelector('#results-box');
    if (list.length === 0) {
      box.innerHTML = `
        <h2>No Results</h2>
        <p>No suitable ride offers found.</p>
        <div class="form-actions">
          <a class="btn btn-secondary" href="/post-ride-request" data-nav="1">Post a One-Off Ride Request</a>
          <a class="btn" href="/" data-nav="1">Back to Find a Ride</a>
        </div>
      `;
      return;
    }
    box.innerHTML = `
      <h2>Matching Ride Offers</h2>
      <div class="results-grid">
        ${list.map((offer) => `
          <article class="result-card">
            <p><strong>Offer #${esc(offer.offerId)}</strong></p>
            <p><strong>Driver:</strong> ${esc(offer.driver?.driverName || '-')}</p>
            <p><strong>Route:</strong> ${esc(offer.origin)} to ${esc(offer.destination)}</p>
            <p><strong>Departure:</strong> ${esc(offer.departureDate)} ${esc(offer.departureTime || '')}</p>
            <p><strong>Available seats:</strong> ${esc(offer.availableSeats)}</p>
            <p><strong>Trust:</strong> ${offer.driver?.averageRating != null ? `${Number(offer.driver.averageRating).toFixed(1)} (${offer.driver?.ratingCount || 0})` : 'No ratings yet'}</p>
            <div class="form-actions">
              <a class="btn" href="/ride-offer-details/${esc(offer.offerId)}${window.location.search}" data-nav="1">View Details</a>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  } catch (error) {
    if (token !== renderToken) return;
    APP_ROOT.querySelector('#results-box').innerHTML = `<p class="status-error">${esc(error.message || 'Unable to load results.')}</p>`;
  }
}

async function renderRideOfferDetails(token, offerId) {
  const session = requireRole('RIDER');
  if (!session) return;

  userLayout('Ride Offer Details', '<section class="section-card" id="offer-box"><p>Loading details...</p></section>');
  try {
    const detail = await api.getRideOfferDetail(offerId);
    if (token !== renderToken) return;
    const maxSeats = detail?.availableSeats || 1;
    APP_ROOT.querySelector('#offer-box').innerHTML = `
      <div class="two-column">
        <section class="section-card">
          <h2>Driver Trust</h2>
          <p><strong>Name:</strong> ${esc(detail.driver?.driverName || '-')}</p>
          <p><strong>Rating:</strong> ${detail.driver?.averageRating != null ? `${Number(detail.driver.averageRating).toFixed(1)} (${detail.driver?.ratingCount || 0} ratings)` : 'No ratings yet'}</p>
          <p><strong>Preferences:</strong> ${esc(detail.driver?.travelPreferences || 'Not provided')}</p>
          <p><strong>Trust notes:</strong> ${esc(detail.driver?.trustNotes || 'Not provided')}</p>
          <p><strong>Bio:</strong> ${esc(detail.driver?.bio || 'Not provided')}</p>
        </section>
        <section class="section-card">
          <h2>Trip Information</h2>
          <p><strong>Origin:</strong> ${esc(detail.origin)}</p>
          <p><strong>Destination:</strong> ${esc(detail.destination)}</p>
          <p><strong>Date:</strong> ${esc(detail.departureDate)}</p>
          <p><strong>Time:</strong> ${esc(detail.departureTime || '')}</p>
          <p><strong>Available seats:</strong> ${esc(detail.availableSeats)}</p>
          <p><strong>Status:</strong> ${esc(detail.status || '')}</p>
        </section>
      </div>
      <section class="section-card">
        <h2>Request This Ride</h2>
        <form class="form-grid compact-form" id="join-form">
          <label>Requested seats<input type="number" min="1" max="${esc(maxSeats)}" name="requestedSeats" value="1"></label>
          <p id="join-error" class="status-error" style="display:none;"></p>
          <div class="form-actions">
            <button class="btn" type="submit" ${detail.availableSeats < 1 ? 'disabled' : ''}>${detail.availableSeats < 1 ? 'No Seats Left' : 'Request This Ride'}</button>
            <a class="btn btn-secondary" href="/search-results${window.location.search || ''}" data-nav="1">Back to Results</a>
          </div>
        </form>
      </section>
    `;

    const joinForm = APP_ROOT.querySelector('#join-form');
    joinForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorNode = APP_ROOT.querySelector('#join-error');
      errorNode.style.display = 'none';
      const button = joinForm.querySelector('button[type="submit"]');
      const restore = withLoadingButton(button, 'Submitting...');
      const seats = Number(new FormData(joinForm).get('requestedSeats') || 1);
      try {
        if (!Number.isInteger(seats) || seats < 1) throw new Error('Requested seats must be at least 1.');
        if (seats > detail.availableSeats) throw new Error(`Only ${detail.availableSeats} seat(s) available.`);
        const joinRequest = await api.submitJoinRequest({
          riderId: session.userId,
          rideOfferId: Number(detail.offerId),
          requestedSeats: seats,
        });
        state.rideConfirmed = {
          type: 'JOIN_REQUEST_SUBMITTED',
          joinRequest,
          offerDetail: detail,
          requestedSeats: seats,
        };
        navigate('/ride-confirmed');
      } catch (error) {
        errorNode.textContent = error.message || 'Unable to submit join request.';
        errorNode.style.display = 'block';
        restore();
      }
    });
  } catch (error) {
    if (token !== renderToken) return;
    APP_ROOT.querySelector('#offer-box').innerHTML = `<p class="status-error">${esc(error.message || 'Unable to load ride detail.')}</p>`;
  }
}

function canAccessPostStep(step) {
  const flow = state.postFlow;
  const originReady = Boolean(normalizeLocationText(flow.origin));
  const destinationReady = Boolean(normalizeLocationText(flow.destination));
  if (step === 'ORIGIN') return true;
  if (step === 'DESTINATION') return originReady;
  if (step === 'TRIP') return originReady && destinationReady;
  return false;
}

function validatePostFlow() {
  const flow = state.postFlow;
  if (!normalizeLocationText(flow.origin)) return { step: 'ORIGIN', message: 'Origin is required.' };
  if (!normalizeLocationText(flow.destination)) return { step: 'DESTINATION', message: 'Destination is required.' };
  if (!normalizeText(flow.form.tripDate)) return { step: 'TRIP', message: 'Trip date is required.' };
  if (!normalizeText(flow.form.tripTime)) return { step: 'TRIP', message: 'Preferred departure time is required.' };
  const passengerCount = Number(flow.form.passengerCount);
  if (!Number.isInteger(passengerCount) || passengerCount < 1) return { step: 'TRIP', message: 'Passengers must be at least 1.' };
  return null;
}

function renderPostRideRequest() {
  const session = requireRole('RIDER');
  if (!session) return;

  const flow = state.postFlow;

  userLayout('Post a Ride Request', `
    <section class="section-card form-layout-card">
      <p>Step-by-step flow: Origin, Destination, then Trip Date confirmation.</p>
      <div class="flow-step-tabs">
        <button type="button" class="flow-step-tab ${flow.step === 'ORIGIN' ? 'is-active' : ''}" data-post-step="ORIGIN">Origin</button>
        <button type="button" class="flow-step-tab ${flow.step === 'DESTINATION' ? 'is-active' : ''}" data-post-step="DESTINATION" ${canAccessPostStep('DESTINATION') ? '' : 'disabled'}>Destination</button>
        <button type="button" class="flow-step-tab ${flow.step === 'TRIP' ? 'is-active' : ''}" data-post-step="TRIP" ${canAccessPostStep('TRIP') ? '' : 'disabled'}>Trip Date</button>
      </div>

      ${flow.step === 'ORIGIN' ? `<div class="flow-step-panel">${renderLocationPanel('Origin', flow.origin, 'Search pickup suburb/address', 'origin', 'post', flow.submitting)}</div>` : ''}
      ${flow.step === 'DESTINATION' ? `<div class="flow-step-panel"><p class="status-note"><strong>Current origin:</strong> ${esc(normalizeLocationText(flow.origin))}. You can return to edit.</p>${renderLocationPanel('Destination', flow.destination, 'Search destination suburb/address', 'destination', 'post', flow.submitting)}</div>` : ''}
      ${flow.step === 'TRIP' ? `
        <div class="flow-step-panel">
          <p class="status-note"><strong>Origin:</strong> ${esc(normalizeLocationText(flow.origin))} | <strong>Destination:</strong> ${esc(normalizeLocationText(flow.destination))}</p>
          <div class="flow-summary-grid">
            <label>Trip date<input type="date" data-post-field="tripDate" value="${esc(flow.form.tripDate)}" ${flow.submitting ? 'disabled' : ''}></label>
            <label>Preferred departure time<input type="time" data-post-field="tripTime" value="${esc(flow.form.tripTime)}" ${flow.submitting ? 'disabled' : ''}></label>
            <label>Passengers<input type="number" min="1" data-post-field="passengerCount" value="${esc(flow.form.passengerCount)}" ${flow.submitting ? 'disabled' : ''}></label>
            <label>Notes to drivers<textarea rows="3" data-post-field="notes" ${flow.submitting ? 'disabled' : ''}>${esc(flow.form.notes)}</textarea></label>
          </div>
        </div>
      ` : ''}

      ${flow.error ? `<p class="status-error">${esc(flow.error)}</p>` : ''}
      ${flow.success ? `<p class="status-success">${esc(flow.success)}</p>` : ''}

      <div class="form-actions">
        ${flow.step !== 'ORIGIN' ? `<button class="btn btn-secondary" type="button" data-action="post-back" ${flow.submitting ? 'disabled' : ''}>Back</button>` : ''}
        ${flow.step !== 'TRIP'
          ? `<button class="btn" type="button" data-action="post-next" ${flow.submitting ? 'disabled' : ''}>Continue</button>`
          : `<button class="btn" type="button" data-action="post-confirm" ${flow.submitting ? 'disabled' : ''}>${flow.submitting ? 'Submitting...' : 'Confirm and Submit'}</button>`}
      </div>
    </section>

    <section class="section-card">
      <h2>How It Works</h2>
      <p>Step 1 sets origin, step 2 sets destination, step 3 confirms trip details.</p>
      <p>If any step is wrong, go back and fix before final confirmation.</p>
    </section>
  `);

  APP_ROOT.querySelectorAll('[data-post-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.postStep;
      if (!flow.submitting && canAccessPostStep(next)) {
        flow.step = next;
        flow.error = '';
        renderApp();
      }
    });
  });

  wireLocationPanelHandlers(flow, 'post', { disabled: flow.submitting });

  APP_ROOT.querySelectorAll('[data-post-field]').forEach((input) => {
    input.addEventListener('input', () => {
      flow.form[input.dataset.postField] = input.value;
    });
  });

  const backBtn = APP_ROOT.querySelector('[data-action="post-back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (flow.submitting) return;
      flow.error = '';
      if (flow.step === 'TRIP') flow.step = 'DESTINATION';
      else if (flow.step === 'DESTINATION') flow.step = 'ORIGIN';
      renderApp();
    });
  }

  const nextBtn = APP_ROOT.querySelector('[data-action="post-next"]');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (flow.submitting) return;
      flow.error = '';
      if (flow.step === 'ORIGIN') {
        if (!normalizeLocationText(flow.origin)) {
          flow.error = 'Origin is required before moving on.';
          renderApp();
          return;
        }
        flow.step = 'DESTINATION';
      } else if (flow.step === 'DESTINATION') {
        if (!normalizeLocationText(flow.destination)) {
          flow.error = 'Destination is required before moving on.';
          renderApp();
          return;
        }
        flow.step = 'TRIP';
      }
      renderApp();
    });
  }

  const confirmBtn = APP_ROOT.querySelector('[data-action="post-confirm"]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (flow.submitting) return;
      flow.error = '';
      flow.success = '';
      const validation = validatePostFlow();
      if (validation) {
        flow.step = validation.step;
        flow.error = validation.message;
        renderApp();
        return;
      }

      flow.submitting = true;
      renderApp();
      try {
        const created = await api.createOneOffRideRequest({
          riderId: session.userId,
          origin: normalizeLocationText(flow.origin),
          originAddress: normalizeText(flow.origin.address) || normalizeLocationText(flow.origin),
          originState: normalizeText(flow.origin.state) || null,
          originSuburb: normalizeText(flow.origin.suburb) || normalizeLocationText(flow.origin),
          originPostcode: normalizeText(flow.origin.postcode) || null,
          originLatitude: toNullableCoordinate(flow.origin.latitude),
          originLongitude: toNullableCoordinate(flow.origin.longitude),
          destination: normalizeLocationText(flow.destination),
          destinationAddress: normalizeText(flow.destination.address) || normalizeLocationText(flow.destination),
          destinationState: normalizeText(flow.destination.state) || null,
          destinationSuburb: normalizeText(flow.destination.suburb) || normalizeLocationText(flow.destination),
          destinationPostcode: normalizeText(flow.destination.postcode) || null,
          destinationLatitude: toNullableCoordinate(flow.destination.latitude),
          destinationLongitude: toNullableCoordinate(flow.destination.longitude),
          tripDate: normalizeText(flow.form.tripDate),
          tripTime: normalizeText(flow.form.tripTime),
          passengerCount: Number(flow.form.passengerCount),
          notes: normalizeText(flow.form.notes) || null,
        });
        const reqId = created.requestId || created.rideRequestId || null;
        flow.success = `Request #${reqId != null ? reqId : '-'} submitted successfully. Redirecting to My Trips in 3 seconds...`;
        state.flash.requestHistoryFocus = { focus: 'REQUEST_HISTORY', createdRequestId: reqId };
        clearPostRedirectTimer();
        flow.redirectTimer = window.setTimeout(() => {
          flow.redirectTimer = null;
          navigate('/my-trips');
        }, 3000);
      } catch (error) {
        const msg = String(error.message || 'Unable to submit request.');
        if (/rider not found|user not found/i.test(msg)) {
          saveSession(null);
          navigate('/login', true);
          return;
        }
        flow.error = msg;
      } finally {
        flow.submitting = false;
        renderApp();
      }
    });
  }
}

async function renderRideRequestOffers(token, rideRequestId) {
  const session = requireRole('RIDER');
  if (!session) return;

  userLayout('Ride Request Offers', '<section class="section-card" id="request-offer-box"><p>Loading offers...</p></section>');
  try {
    const offers = await api.getRideRequestOffersForRider(session.userId, Number(rideRequestId));
    if (token !== renderToken) return;
    const list = Array.isArray(offers) ? offers : [];
    const box = APP_ROOT.querySelector('#request-offer-box');
    if (list.length === 0) {
      box.innerHTML = '<h2>No Offers Yet</h2><p>No driver responses have arrived for this request.</p>';
      return;
    }
    box.innerHTML = `
      <h2>Available Driver Offers</h2>
      <div class="results-grid">
        ${list.map((offer) => `
          <article class="result-card">
            <p><strong>Offer #${esc(offer.offerId)}</strong></p>
            <p><strong>Driver:</strong> ${esc(offer.driverName || '-')}</p>
            <p><strong>Proposed seats:</strong> ${esc(offer.proposedSeats)}</p>
            <p><strong>Meeting point:</strong> ${esc(offer.meetingPoint || 'Not provided')}</p>
            <p><strong>Status:</strong> ${esc(offer.status)}</p>
            <p><strong>Submitted:</strong> ${esc(formatDateTime(offer.createdAt))}</p>
            <div class="trust-panel">
              <p><strong>Driver trust summary</strong></p>
              <p><strong>Rating:</strong> ${offer.driver?.averageRating != null ? `${Number(offer.driver.averageRating).toFixed(1)} (${offer.driver?.ratingCount || 0} ratings)` : 'No ratings yet'}</p>
              <p><strong>Travel preferences:</strong> ${esc(offer.driver?.travelPreferences || 'Not provided')}</p>
              <p><strong>Trust notes:</strong> ${esc(offer.driver?.trustNotes || 'Not provided')}</p>
              <p><strong>Bio:</strong> ${esc(offer.driver?.bio || 'Not provided')}</p>
            </div>
            <div class="form-actions">
              ${offer.status === 'PENDING'
                ? `<button class="btn" type="button" data-action="accept-offer" data-offer-id="${esc(offer.offerId)}">Accept This Offer</button>`
                : `<button class="btn btn-secondary" type="button" disabled>${offer.status === 'ACCEPTED' ? 'Already Accepted' : 'Not Acceptable'}</button>`}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="form-actions form-actions-top">
        <a class="btn btn-secondary" href="/post-ride-request" data-nav="1">Post Another Request</a>
        <a class="btn" href="/my-trips" data-nav="1">Back to My Trips</a>
      </div>
    `;

    APP_ROOT.querySelectorAll('[data-action="accept-offer"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const offerId = Number(button.dataset.offerId);
        const restore = withLoadingButton(button, 'Accepting...');
        try {
          const acceptedOneOff = await api.acceptRideRequestOffer(session.userId, Number(rideRequestId), offerId);
          const selected = list.find((item) => Number(item.offerId) === offerId) || null;
          state.rideConfirmed = {
            type: 'ONE_OFF_ACCEPTED',
            acceptedOneOff,
            selectedOneOffOffer: selected,
          };
          navigate('/ride-confirmed');
        } catch (error) {
          restore();
          window.alert(error.message || 'Unable to accept this offer.');
        }
      });
    });
  } catch (error) {
    if (token !== renderToken) return;
    APP_ROOT.querySelector('#request-offer-box').innerHTML = `<p class="status-error">${esc(error.message || 'Unable to load offers.')}</p>`;
  }
}

function renderRideConfirmed() {
  if (!requireUser()) return;
  const payload = state.rideConfirmed;
  let title = 'Ride Confirmed';
  let subtitle = 'Your ride arrangement has been processed.';
  let summary = '<p><strong>Status:</strong> Confirmation ready.</p><p>If page refreshed, transient confirmation context may be cleared.</p>';
  let next = '<p>Open My Trips to review latest records.</p>';

  if (payload?.type === 'JOIN_REQUEST_SUBMITTED') {
    title = 'Ride Request Submitted';
    subtitle = 'Your join request has been sent to the driver for review.';
    summary = `
      <p><strong>Request ID:</strong> ${esc(payload.joinRequest?.joinRequestId || '-')}</p>
      <p><strong>Route:</strong> ${esc(payload.offerDetail?.origin || '-')} to ${esc(payload.offerDetail?.destination || '-')}</p>
      <p><strong>Date and time:</strong> ${esc(payload.offerDetail?.departureDate || '-')} ${esc(payload.offerDetail?.departureTime || '-')}</p>
      <p><strong>Requested seats:</strong> ${esc(payload.requestedSeats || '-')}</p>
      <p><strong>Status:</strong> ${esc(payload.joinRequest?.status || 'PENDING')}</p>
    `;
    next = '<p>Driver will decide in Driver Hub. Track updates in My Trips.</p>';
  } else if (payload?.type === 'ONE_OFF_ACCEPTED') {
    title = 'One-Off Ride Matched';
    subtitle = 'You accepted a driver offer and the trip is now matched.';
    summary = `
      <p><strong>Ride request ID:</strong> ${esc(payload.acceptedOneOff?.rideRequestId || '-')}</p>
      <p><strong>Accepted offer ID:</strong> ${esc(payload.acceptedOneOff?.acceptedOfferId || '-')}</p>
      <p><strong>Ride match ID:</strong> ${esc(payload.acceptedOneOff?.rideMatchId || '-')}</p>
      <p><strong>Driver:</strong> ${esc(payload.selectedOneOffOffer?.driverName || '-')}</p>
      <p><strong>Meeting point:</strong> ${esc(payload.selectedOneOffOffer?.meetingPoint || 'Not provided')}</p>
      <p><strong>Request status:</strong> ${esc(payload.acceptedOneOff?.rideRequestStatus || '-')}</p>
    `;
    next = '<p>One-off request is now closed for further accepted offers. Check My Trips for details.</p>';
  }

  userLayout(title, `
    <p>${esc(subtitle)}</p>
    <section class="section-card"><h2>Trip Summary</h2>${summary}</section>
    <section class="section-card">
      <h2>Next Steps</h2>
      ${next}
      <div class="form-actions">
        <a class="btn" href="/my-trips" data-nav="1">Open My Trips</a>
        <a class="btn btn-secondary" href="/" data-nav="1">Return Home</a>
        <a class="btn btn-secondary" href="/post-ride-request" data-nav="1">Post Another Request</a>
      </div>
    </section>
  `);
}

async function ensureProfileLoaded(token, userId) {
  const profile = state.profile;
  if (profile.loading || profile.loaded) return;
  profile.loading = true;
  profile.error = '';
  try {
    const data = await api.getProfile(userId);
    if (token !== renderToken) return;
    profile.data = data;
    profile.form = {
      fullName: data.fullName || '',
      phone: data.phone || '',
      suburb: data.suburb || '',
      bio: data.bio || '',
      travelPreferences: data.travelPreferences || '',
      trustNotes: data.trustNotes || '',
    };
    profile.loaded = true;
  } catch (error) {
    if (token !== renderToken) return;
    profile.error = error.message || 'Unable to load profile.';
  } finally {
    if (token === renderToken) {
      profile.loading = false;
      renderApp();
    }
  }
}

async function renderProfile(token) {
  const session = requireUser();
  if (!session) return;
  ensureProfileLoaded(token, session.userId);
  const profile = state.profile;

  userLayout('Profile', `
    ${profile.loading ? '<p>Loading profile...</p>' : ''}
    ${profile.error ? `<p class="status-error">${esc(profile.error)}</p>` : ''}
    ${profile.data ? `
      <section class="section-card">
        <h2>Public Profile Summary</h2>
        <p><strong>Email:</strong> ${esc(profile.data.email || '-')}</p>
        <p><strong>Average rating:</strong> ${profile.data.averageRating != null ? Number(profile.data.averageRating).toFixed(1) : 'No ratings yet'}</p>
        <p><strong>Rating count:</strong> ${esc(profile.data.ratingCount || 0)}</p>
      </section>
      <section class="section-card">
        <h2>Edit Profile</h2>
        <form id="profile-form" class="form-grid">
          <label>Full name<input type="text" name="fullName" value="${esc(profile.form.fullName)}" ${profile.saving ? 'disabled' : ''}></label>
          <label>Phone<input type="text" name="phone" value="${esc(profile.form.phone)}" ${profile.saving ? 'disabled' : ''}></label>
          <label>Suburb<input type="text" name="suburb" value="${esc(profile.form.suburb)}" ${profile.saving ? 'disabled' : ''}></label>
          <label>Bio<textarea rows="3" name="bio" ${profile.saving ? 'disabled' : ''}>${esc(profile.form.bio)}</textarea></label>
          <label>Travel preferences<textarea rows="3" name="travelPreferences" ${profile.saving ? 'disabled' : ''}>${esc(profile.form.travelPreferences)}</textarea></label>
          <label>Trust notes<textarea rows="3" name="trustNotes" ${profile.saving ? 'disabled' : ''}>${esc(profile.form.trustNotes)}</textarea></label>
          ${profile.message ? `<p class="status-success">${esc(profile.message)}</p>` : ''}
          <div class="form-actions"><button class="btn" type="submit">${profile.saving ? 'Saving...' : 'Save Profile'}</button></div>
        </form>
      </section>
    ` : ''}
  `);

  const form = APP_ROOT.querySelector('#profile-form');
  if (!form) return;

  form.addEventListener('input', () => {
    const data = new FormData(form);
    profile.form = {
      fullName: String(data.get('fullName') || ''),
      phone: String(data.get('phone') || ''),
      suburb: String(data.get('suburb') || ''),
      bio: String(data.get('bio') || ''),
      travelPreferences: String(data.get('travelPreferences') || ''),
      trustNotes: String(data.get('trustNotes') || ''),
    };
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    profile.error = '';
    profile.message = '';
    profile.saving = true;
    renderApp();
    try {
      const updated = await api.updateProfile(session.userId, {
        fullName: profile.form.fullName,
        phone: profile.form.phone,
        suburb: profile.form.suburb,
        bio: profile.form.bio,
        travelPreferences: profile.form.travelPreferences,
        trustNotes: profile.form.trustNotes,
      });
      profile.data = updated;
      profile.form = {
        fullName: updated.fullName || '',
        phone: updated.phone || '',
        suburb: updated.suburb || '',
        bio: updated.bio || '',
        travelPreferences: updated.travelPreferences || '',
        trustNotes: updated.trustNotes || '',
      };
      profile.message = 'Profile updated successfully.';
    } catch (error) {
      profile.error = error.message || 'Unable to save profile.';
    } finally {
      profile.saving = false;
      renderApp();
    }
  });
}

function resolveRideRequestId(item) {
  const candidate = item?.rideRequestId ?? item?.requestId;
  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveRideRequestKey(item) {
  const id = resolveRideRequestId(item);
  if (id) return String(id);
  return `${item?.riderId || 'r'}-${item?.tripDate || 'date'}-${item?.tripTime || 'time'}-${item?.origin || 'origin'}`;
}

function ensureDriverJoinForm(joinId) {
  if (!state.driverHub.joinForms[joinId]) {
    state.driverHub.joinForms[joinId] = {
      decision: 'ACCEPTED',
      meetingPoint: '',
      submitting: false,
      error: '',
      message: '',
    };
  }
  return state.driverHub.joinForms[joinId];
}

function ensureDriverOneOffForm(requestKey, passengerCount) {
  if (!state.driverHub.oneOffOfferForms[requestKey]) {
    state.driverHub.oneOffOfferForms[requestKey] = {
      proposedSeats: String(passengerCount || 1),
      meetingPoint: '',
      submitting: false,
      error: '',
      message: '',
    };
  }
  return state.driverHub.oneOffOfferForms[requestKey];
}

async function ensureDriverHubLoaded(token, driverId) {
  const hub = state.driverHub;
  if (hub.loading || hub.loaded) return;
  hub.loading = true;
  hub.error = '';
  try {
    const [pending, openRequests, offerHistory, rideOffers] = await Promise.all([
      api.getPendingJoinRequests(driverId),
      api.listOpenRideRequests(),
      api.getDriverRideRequestOffers(driverId),
      api.getDriverRideOffers(driverId),
    ]);
    if (token !== renderToken) return;
    hub.pendingJoinRequests = Array.isArray(pending) ? pending : [];
    hub.openRideRequests = Array.isArray(openRequests) ? openRequests : [];
    hub.driverOfferHistory = Array.isArray(offerHistory) ? offerHistory : [];
    hub.driverRideOffers = Array.isArray(rideOffers) ? rideOffers : [];
    hub.loaded = true;
  } catch (error) {
    if (token !== renderToken) return;
    hub.error = error.message || 'Unable to load driver hub.';
  } finally {
    if (token === renderToken) {
      hub.loading = false;
      renderApp();
    }
  }
}

async function renderDriverHub(token) {
  const session = requireRole('DRIVER');
  if (!session) return;

  ensureDriverHubLoaded(token, session.userId);
  const hub = state.driverHub;

  userLayout('Driver Hub', `
    <p>Manage rider join requests, post ride offers, and respond to open one-off requests.</p>
    ${hub.loading ? '<p>Loading dashboard data...</p>' : ''}
    ${hub.error ? `<p class="status-error">${esc(hub.error)}</p>` : ''}

    ${!hub.error ? `
      <section class="section-card">
        <h2>Post Ride Offer (Self-Service)</h2>
        <form class="form-grid" id="driver-offer-form">
          <div class="flow-summary-grid">
            <label>Origin<input type="text" name="origin" value="${esc(hub.rideOfferForm.origin)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Origin address<input type="text" name="originAddress" value="${esc(hub.rideOfferForm.originAddress)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Origin suburb<input type="text" name="originSuburb" value="${esc(hub.rideOfferForm.originSuburb)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Destination<input type="text" name="destination" value="${esc(hub.rideOfferForm.destination)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Destination address<input type="text" name="destinationAddress" value="${esc(hub.rideOfferForm.destinationAddress)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Destination suburb<input type="text" name="destinationSuburb" value="${esc(hub.rideOfferForm.destinationSuburb)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Departure date<input type="date" name="departureDate" value="${esc(hub.rideOfferForm.departureDate)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Departure time<input type="time" name="departureTime" value="${esc(hub.rideOfferForm.departureTime)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
            <label>Available seats<input type="number" min="1" name="availableSeats" value="${esc(hub.rideOfferForm.availableSeats)}" ${hub.rideOfferSubmitting ? 'disabled' : ''}></label>
          </div>
          ${hub.rideOfferError ? `<p class="status-error">${esc(hub.rideOfferError)}</p>` : ''}
          ${hub.rideOfferMessage ? `<p class="status-success">${esc(hub.rideOfferMessage)}</p>` : ''}
          <div class="form-actions"><button class="btn" type="submit" ${hub.rideOfferSubmitting ? 'disabled' : ''}>${hub.rideOfferSubmitting ? 'Publishing...' : 'Publish Ride Offer'}</button></div>
        </form>
      </section>

      <section class="section-card">
        <h2>My Posted Ride Offers</h2>
        ${hub.driverRideOffers.length === 0 ? '<p>You have not posted ride offers yet.</p>' : `
          <div class="results-grid">
            ${hub.driverRideOffers.map((offer) => `
              <article class="result-card">
                <p><strong>Offer ID:</strong> ${esc(offer.offerId)}</p>
                <p><strong>Route:</strong> ${esc(offer.originAddress || offer.origin)} to ${esc(offer.destinationAddress || offer.destination)}</p>
                <p><strong>Departure:</strong> ${esc(offer.departureDate)} ${esc(offer.departureTime)}</p>
                <p><strong>Seats:</strong> ${esc(offer.availableSeats)}</p>
                <p><strong>Status:</strong> ${esc(offer.status)}</p>
              </article>
            `).join('')}
          </div>
        `}
      </section>

      <section class="section-card">
        <h2>Pending Join Requests</h2>
        ${hub.pendingJoinRequests.length === 0 ? '<p>No pending join requests.</p>' : `
          <div class="results-grid">
            ${hub.pendingJoinRequests.map((item) => {
              const form = ensureDriverJoinForm(item.joinRequestId);
              return `
                <article class="result-card">
                  <p><strong>Request ID:</strong> ${esc(item.joinRequestId)}</p>
                  <p><strong>Rider:</strong> ${esc(item.riderName)}</p>
                  <p><strong>Route:</strong> ${esc(item.origin)} to ${esc(item.destination)}</p>
                  <p><strong>Trip:</strong> ${esc(item.departureDate)} ${esc(item.departureTime)}</p>
                  <p><strong>Requested seats:</strong> ${esc(item.requestedSeats)}</p>
                  <p><strong>Current available seats:</strong> ${esc(item.availableSeats)}</p>
                  <div class="form-grid compact-form">
                    <label>Decision
                      <select data-join-field="${esc(item.joinRequestId)}.decision" ${form.submitting ? 'disabled' : ''}>
                        <option value="ACCEPTED" ${form.decision === 'ACCEPTED' ? 'selected' : ''}>Accept</option>
                        <option value="REJECTED" ${form.decision === 'REJECTED' ? 'selected' : ''}>Reject</option>
                      </select>
                    </label>
                    <label>Meeting point (for accept)
                      <input type="text" data-join-field="${esc(item.joinRequestId)}.meetingPoint" value="${esc(form.meetingPoint)}" ${form.submitting || form.decision === 'REJECTED' ? 'disabled' : ''}>
                    </label>
                    ${form.error ? `<p class="status-error">${esc(form.error)}</p>` : ''}
                    ${form.message ? `<p class="status-success">${esc(form.message)}</p>` : ''}
                    <div class="form-actions"><button class="btn" type="button" data-action="driver-join-submit" data-join-id="${esc(item.joinRequestId)}" ${form.submitting ? 'disabled' : ''}>${form.submitting ? 'Submitting...' : 'Submit Decision'}</button></div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        `}
      </section>

      <section class="section-card">
        <h2>Open One-Off Ride Requests</h2>
        <p class="status-note">Respond only when your account is active, verified, and seat capacity is sufficient.</p>
        ${hub.openRideRequests.length === 0 ? '<p>No open one-off requests right now.</p>' : `
          <div class="results-grid">
            ${hub.openRideRequests.map((req) => {
              const requestId = resolveRideRequestId(req);
              const requestKey = resolveRideRequestKey(req);
              const form = ensureDriverOneOffForm(requestKey, req.passengerCount);
              const existing = hub.driverOfferHistory.find((offer) => Number(offer.requestId) === Number(requestId) && offer.status === 'PENDING');
              const mapUrl = mapOpenStreetMapUrl(req.originLatitude, req.originLongitude);
              return `
                <article class="result-card">
                  <p><strong>Request ID:</strong> ${esc(requestId || 'Unavailable')}</p>
                  <p><strong>Rider:</strong> ${esc(req.riderName)}</p>
                  <p><strong>Route:</strong> ${esc(req.origin)} to ${esc(req.destination)}</p>
                  <p><strong>Trip:</strong> ${esc(req.tripDate)} ${esc(req.tripTime)}</p>
                  <p><strong>Passenger count:</strong> ${esc(req.passengerCount)}</p>
                  ${mapUrl ? `<p><a href="${esc(mapUrl)}" target="_blank" rel="noreferrer">Open pickup point on map</a></p>` : ''}
                  ${req.notes ? `<p><strong>Notes:</strong> ${esc(req.notes)}</p>` : ''}
                  ${existing ? `<p class="status-note"><strong>Existing response:</strong> Offer #${esc(existing.offerId)} is still ${esc(existing.status)}.</p>` : ''}
                  <div class="form-grid compact-form">
                    <label>Proposed seats
                      <input type="number" min="1" data-oneoff-field="${esc(requestKey)}.proposedSeats" value="${esc(form.proposedSeats)}" ${form.submitting || existing || !requestId ? 'disabled' : ''}>
                    </label>
                    <label>Meeting point
                      <input type="text" data-oneoff-field="${esc(requestKey)}.meetingPoint" value="${esc(form.meetingPoint)}" placeholder="e.g. Box Hill Library front gate" ${form.submitting || existing || !requestId ? 'disabled' : ''}>
                    </label>
                    ${form.error ? `<p class="status-error">${esc(form.error)}</p>` : ''}
                    ${form.message ? `<p class="status-success">${esc(form.message)}</p>` : ''}
                    <div class="form-actions">
                      <button class="btn" type="button" data-action="driver-oneoff-submit" data-request-key="${esc(requestKey)}" data-request-id="${esc(requestId || '')}" data-passenger-count="${esc(req.passengerCount || 1)}" ${form.submitting || existing || !requestId ? 'disabled' : ''}>${form.submitting ? 'Submitting...' : 'Respond to Request'}</button>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        `}
      </section>

      <section class="section-card">
        <h2>My One-Off Offer History</h2>
        ${hub.driverOfferHistory.length === 0 ? '<p>You have not submitted one-off offers yet.</p>' : `
          <div class="results-grid">
            ${hub.driverOfferHistory.map((offer) => `
              <article class="result-card">
                <p><strong>Offer ID:</strong> ${esc(offer.offerId)}</p>
                <p><strong>Request ID:</strong> ${esc(offer.requestId)}</p>
                <p><strong>Rider:</strong> ${esc(offer.riderName)}</p>
                <p><strong>Route:</strong> ${esc(offer.origin)} to ${esc(offer.destination)}</p>
                <p><strong>Trip:</strong> ${esc(offer.tripDate)} ${esc(offer.tripTime)}</p>
                <p><strong>Proposed seats:</strong> ${esc(offer.proposedSeats)}</p>
                <p><strong>Meeting point:</strong> ${esc(offer.meetingPoint || 'Not provided')}</p>
                <p><strong>Status:</strong> ${esc(offer.status)}</p>
              </article>
            `).join('')}
          </div>
        `}
      </section>
    ` : ''}
  `);

  const offerForm = APP_ROOT.querySelector('#driver-offer-form');
  if (offerForm) {
    offerForm.addEventListener('input', () => {
      const data = new FormData(offerForm);
      hub.rideOfferForm = {
        origin: String(data.get('origin') || ''),
        originAddress: String(data.get('originAddress') || ''),
        originSuburb: String(data.get('originSuburb') || ''),
        destination: String(data.get('destination') || ''),
        destinationAddress: String(data.get('destinationAddress') || ''),
        destinationSuburb: String(data.get('destinationSuburb') || ''),
        departureDate: String(data.get('departureDate') || ''),
        departureTime: String(data.get('departureTime') || ''),
        availableSeats: String(data.get('availableSeats') || ''),
      };
    });

    offerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      hub.rideOfferError = '';
      hub.rideOfferMessage = '';
      const seats = Number(hub.rideOfferForm.availableSeats);
      if (!normalizeText(hub.rideOfferForm.origin)) {
        hub.rideOfferError = 'Origin is required.';
        renderApp();
        return;
      }
      if (!normalizeText(hub.rideOfferForm.destination)) {
        hub.rideOfferError = 'Destination is required.';
        renderApp();
        return;
      }
      if (!normalizeText(hub.rideOfferForm.departureDate)) {
        hub.rideOfferError = 'Departure date is required.';
        renderApp();
        return;
      }
      if (!normalizeText(hub.rideOfferForm.departureTime)) {
        hub.rideOfferError = 'Departure time is required.';
        renderApp();
        return;
      }
      if (!Number.isInteger(seats) || seats < 1) {
        hub.rideOfferError = 'Available seats must be at least 1.';
        renderApp();
        return;
      }

      hub.rideOfferSubmitting = true;
      renderApp();
      try {
        const created = await api.createRideOffer({
          driverId: session.userId,
          origin: normalizeText(hub.rideOfferForm.origin),
          originAddress: normalizeText(hub.rideOfferForm.originAddress) || normalizeText(hub.rideOfferForm.origin),
          originState: 'VIC',
          originSuburb: normalizeText(hub.rideOfferForm.originSuburb) || normalizeText(hub.rideOfferForm.origin),
          originPostcode: null,
          originLatitude: null,
          originLongitude: null,
          destination: normalizeText(hub.rideOfferForm.destination),
          destinationAddress: normalizeText(hub.rideOfferForm.destinationAddress) || normalizeText(hub.rideOfferForm.destination),
          destinationState: 'VIC',
          destinationSuburb: normalizeText(hub.rideOfferForm.destinationSuburb) || normalizeText(hub.rideOfferForm.destination),
          destinationPostcode: null,
          destinationLatitude: null,
          destinationLongitude: null,
          departureDate: normalizeText(hub.rideOfferForm.departureDate),
          departureTime: normalizeText(hub.rideOfferForm.departureTime),
          availableSeats: seats,
        });
        hub.rideOfferMessage = `Ride offer #${created.offerId} posted successfully.`;
        hub.loaded = false;
      } catch (error) {
        hub.rideOfferError = error.message || 'Unable to publish ride offer.';
      } finally {
        hub.rideOfferSubmitting = false;
        renderApp();
      }
    });
  }

  APP_ROOT.querySelectorAll('[data-join-field]').forEach((input) => {
    input.addEventListener('input', () => {
      const [id, field] = String(input.dataset.joinField || '').split('.');
      const joinId = Number(id);
      const form = ensureDriverJoinForm(joinId);
      form[field] = input.value;
    });
  });

  APP_ROOT.querySelectorAll('[data-action="driver-join-submit"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const joinId = Number(button.dataset.joinId);
      const form = ensureDriverJoinForm(joinId);
      form.error = '';
      form.message = '';
      if (form.decision === 'ACCEPTED' && !normalizeText(form.meetingPoint)) {
        form.error = 'Meeting point is required when accepting.';
        renderApp();
        return;
      }
      form.submitting = true;
      renderApp();
      try {
        const response = await api.decideJoinRequest(session.userId, joinId, {
          decision: form.decision,
          meetingPoint: form.decision === 'ACCEPTED' ? normalizeText(form.meetingPoint) : null,
        });
        form.message = `Updated to ${response.status}.`;
        hub.loaded = false;
      } catch (error) {
        form.error = error.message || 'Unable to update request.';
      } finally {
        form.submitting = false;
        renderApp();
      }
    });
  });

  APP_ROOT.querySelectorAll('[data-oneoff-field]').forEach((input) => {
    input.addEventListener('input', () => {
      const [requestKey, field] = String(input.dataset.oneoffField || '').split('.');
      const form = ensureDriverOneOffForm(requestKey, 1);
      form[field] = input.value;
    });
  });

  APP_ROOT.querySelectorAll('[data-action="driver-oneoff-submit"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestKey = String(button.dataset.requestKey || '');
      const requestId = Number(button.dataset.requestId || 0);
      const passengerCount = Number(button.dataset.passengerCount || 1);
      const form = ensureDriverOneOffForm(requestKey, passengerCount);
      form.error = '';
      form.message = '';
      if (!requestId) {
        form.error = 'Ride request id is missing. Refresh page.';
        renderApp();
        return;
      }
      const seats = Number(form.proposedSeats);
      if (!Number.isInteger(seats) || seats < 1) {
        form.error = 'Proposed seats must be at least 1.';
        renderApp();
        return;
      }
      if (!normalizeText(form.meetingPoint)) {
        form.error = 'Meeting point is required.';
        renderApp();
        return;
      }
      form.submitting = true;
      renderApp();
      try {
        const response = await api.createRideRequestOffer(requestId, {
          driverId: session.userId,
          proposedSeats: seats,
          meetingPoint: normalizeText(form.meetingPoint),
        });
        form.message = `Offer #${response.offerId} submitted.`;
        hub.loaded = false;
      } catch (error) {
        form.error = error.message || 'Unable to submit offer.';
      } finally {
        form.submitting = false;
        renderApp();
      }
    });
  });
}

async function ensureMyTripsLoaded(token, session) {
  const trips = state.myTrips;
  if (trips.loading || trips.loaded) return;
  trips.loading = true;
  trips.error = '';
  try {
    const loaded = session.role === 'DRIVER'
      ? await Promise.all([
        api.getDriverTrips(session.userId),
        api.getDriverRideRequestOffers(session.userId),
        api.getUserNotifications(session.userId, false),
      ])
      : await Promise.all([
        api.getRiderTrips(session.userId),
        api.getRiderRideRequests(session.userId),
        api.getRiderJoinRequests(session.userId),
        api.getUserNotifications(session.userId, false),
      ]);

    if (token !== renderToken) return;
    if (session.role === 'DRIVER') {
      const [tripData, offerData, notificationData] = loaded;
      trips.trips = Array.isArray(tripData) ? tripData : [];
      trips.driverOfferHistory = Array.isArray(offerData) ? offerData : [];
      trips.joinHistory = [];
      trips.requestHistory = [];
      trips.notifications = Array.isArray(notificationData) ? notificationData : [];
    } else {
      const [tripData, requestData, joinData, notificationData] = loaded;
      trips.trips = Array.isArray(tripData) ? tripData : [];
      trips.requestHistory = Array.isArray(requestData) ? requestData : [];
      trips.joinHistory = Array.isArray(joinData) ? joinData : [];
      trips.driverOfferHistory = [];
      trips.notifications = Array.isArray(notificationData) ? notificationData : [];
    }
    trips.loaded = true;
  } catch (error) {
    if (token !== renderToken) return;
    trips.error = error.message || 'Unable to load trips right now.';
    trips.trips = [];
    trips.joinHistory = [];
    trips.requestHistory = [];
    trips.driverOfferHistory = [];
    trips.notifications = [];
  } finally {
    if (token === renderToken) {
      trips.loading = false;
      renderApp();
    }
  }
}

function applyMyTripsPageSafety() {
  const s = state.myTrips;
  const filteredTrips = s.trips.filter((trip) => (s.tripFilter === 'UPCOMING' ? isUpcomingTrip(trip) : !isUpcomingTrip(trip)))
    .filter((trip) => s.tripTypeFilter === 'ALL' || trip.tripType === s.tripTypeFilter);
  const filteredJoin = s.joinHistory.filter((item) => s.joinTab === 'ALL' || item.status === s.joinTab);
  const filteredRequest = s.requestHistory.filter((item) => s.requestTab === 'ALL' || item.status === s.requestTab);
  const filteredDriverOffer = s.driverOfferHistory.filter((item) => s.driverOfferTab === 'ALL' || item.status === s.driverOfferTab);
  const filteredNotifications = s.notifications.filter((item) => (s.notificationTab === 'UNREAD' ? !item.read : true));
  s.tripPage = Math.min(s.tripPage, Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE)));
  s.joinPage = Math.min(s.joinPage, Math.max(1, Math.ceil(filteredJoin.length / PAGE_SIZE)));
  s.requestPage = Math.min(s.requestPage, Math.max(1, Math.ceil(filteredRequest.length / PAGE_SIZE)));
  s.driverOfferPage = Math.min(s.driverOfferPage, Math.max(1, Math.ceil(filteredDriverOffer.length / PAGE_SIZE)));
  s.notificationPage = Math.min(s.notificationPage, Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE)));
}

function renderMyTripsNotifications() {
  const s = state.myTrips;
  const filtered = s.notifications.filter((item) => (s.notificationTab === 'UNREAD' ? !item.read : true));
  const paged = paginateItems(filtered, s.notificationPage, PAGE_SIZE);
  s.notificationPage = paged.page;
  return `
    <section class="section-card form-layout-card">
      <h2>Trip Confirmations and Notifications</h2>
      <div class="section-subtabs">
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.notificationTab === 'UNREAD' ? 'active' : ''}" type="button" data-notification-tab="UNREAD">Unread</button>
          <button class="story-chip ${s.notificationTab === 'ALL' ? 'active' : ''}" type="button" data-notification-tab="ALL">All</button>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" type="button" data-action="mark-all-read" ${s.notifications.length === 0 ? 'disabled' : ''}>Mark All Read</button>
        </div>
      </div>
      ${s.notificationError ? `<p class="status-error">${esc(s.notificationError)}</p>` : ''}
      ${s.notificationMessage ? `<p class="status-success">${esc(s.notificationMessage)}</p>` : ''}
      ${filtered.length === 0 ? '<p>No notifications in this tab.</p>' : `
        <div class="results-grid">
          ${paged.list.map((item) => `
            <article class="result-card">
              <p><strong>Title:</strong> ${esc(item.title)}</p>
              <p><strong>Type:</strong> ${esc(item.type)}</p>
              <p><strong>Message:</strong> ${esc(item.message)}</p>
              <p><strong>Created at:</strong> ${esc(formatDateTime(item.createdAt))}</p>
              ${item.relatedRideMatchId ? `<p><strong>Related match:</strong> #${esc(item.relatedRideMatchId)}</p>` : ''}
              <p><strong>Status:</strong> ${item.read ? 'Read' : 'Unread'}</p>
              ${item.read ? '' : `<div class="form-actions"><button class="btn btn-secondary" type="button" data-action="mark-read" data-notification-id="${esc(item.notificationId)}">Mark as Read</button></div>`}
            </article>
          `).join('')}
        </div>
        ${renderPager('notification', paged.page, paged.totalPages, paged.totalItems)}
      `}
    </section>
  `;
}

function renderMyTripsNoTripSection(session) {
  const s = state.myTrips;
  const hasAux = session.role === 'RIDER'
    ? s.requestHistory.length > 0 || s.joinHistory.length > 0
    : s.driverOfferHistory.length > 0;
  if (s.trips.length > 0) return '';
  if (hasAux) {
    return `
      <section class="section-card">
        <h2>No Confirmed Trips Yet</h2>
        <p>You currently have request/offer history records, but no confirmed trip match yet.</p>
        <p>Confirmed trips appear here after acceptance and match creation.</p>
      </section>
    `;
  }
  return `
    <section class="section-card form-layout-card">
      <h2>No Trips Yet</h2>
      <div class="section-subtabs">
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.noTripTab === 'GUIDE' ? 'active' : ''}" type="button" data-no-trip-tab="GUIDE">Getting Started</button>
          <button class="story-chip ${s.noTripTab === 'RIDER' ? 'active' : ''}" type="button" data-no-trip-tab="RIDER">Rider Actions</button>
          <button class="story-chip ${s.noTripTab === 'DRIVER' ? 'active' : ''}" type="button" data-no-trip-tab="DRIVER">Driver Actions</button>
        </div>
      </div>
      ${s.noTripTab === 'GUIDE' ? '<p class="status-note">No confirmed trips yet. Use rider or driver actions to create first match.</p>' : ''}
      ${s.noTripTab === 'RIDER' ? '<div class="form-actions"><a class="btn" href="/" data-nav="1">Find a Ride</a><a class="btn btn-secondary" href="/post-ride-request" data-nav="1">Post One-Off Request</a></div>' : ''}
      ${s.noTripTab === 'DRIVER' ? '<div class="form-actions"><a class="btn" href="/driver-hub" data-nav="1">Open Driver Hub</a><a class="btn btn-secondary" href="/profile" data-nav="1">Update Profile</a></div>' : ''}
    </section>
  `;
}

function renderMyTripsTripResults(session) {
  const s = state.myTrips;
  const filtered = s.trips
    .filter((trip) => (s.tripFilter === 'UPCOMING' ? isUpcomingTrip(trip) : !isUpcomingTrip(trip)))
    .filter((trip) => s.tripTypeFilter === 'ALL' || trip.tripType === s.tripTypeFilter);
  if (filtered.length === 0) return '';
  const paged = paginateItems(filtered, s.tripPage, PAGE_SIZE);
  s.tripPage = paged.page;
  return `
    <section class="section-card">
      <h2>Trip Results</h2>
      <div class="results-grid">
        ${paged.list.map((trip) => {
          const tripKey = resolveTripKey(trip);
          const form = ensureRatingForm(tripKey);
          const isHistory = !isUpcomingTrip(trip);
          const canRate = isHistory && trip.tripStatus === 'CONFIRMED';
          const target = resolveRatingTarget(trip, session.role);
          return `
            <article class="result-card">
              <p><strong>Match ID:</strong> ${esc(trip.rideMatchId)}</p>
              <p><strong>Type:</strong> ${esc(resolveTripTypeLabel(trip.tripType))}</p>
              <p><strong>Driver:</strong> ${esc(trip.driverName || '-')}</p>
              <p><strong>Rider:</strong> ${esc(trip.riderName || '-')}</p>
              <p><strong>Route:</strong> ${esc(trip.originAddress || trip.origin)} to ${esc(trip.destinationAddress || trip.destination)}</p>
              <p><strong>Date and time:</strong> ${esc(trip.tripDate || '-')} ${esc(trip.tripTime || '-')}</p>
              <p><strong>Meeting point:</strong> ${esc(trip.meetingPoint || 'Not provided')}</p>
              <p><strong>Status:</strong> ${esc(trip.tripStatus || '-')}</p>
              ${canRate ? `
                <div class="trip-rating-box">
                  <p><strong>Rate this trip partner:</strong> ${esc(target.targetName)}</p>
                  <div class="form-grid rating-form">
                    <label>Score
                      <select data-rating-field="${esc(tripKey)}.score" ${form.submitting || !target.targetUserId ? 'disabled' : ''}>
                        <option value="5" ${form.score === '5' ? 'selected' : ''}>5 - Excellent</option>
                        <option value="4" ${form.score === '4' ? 'selected' : ''}>4 - Good</option>
                        <option value="3" ${form.score === '3' ? 'selected' : ''}>3 - Okay</option>
                        <option value="2" ${form.score === '2' ? 'selected' : ''}>2 - Poor</option>
                        <option value="1" ${form.score === '1' ? 'selected' : ''}>1 - Very poor</option>
                      </select>
                    </label>
                    <label>Comment (optional)<textarea data-rating-field="${esc(tripKey)}.comment" maxLength="300" ${form.submitting || !target.targetUserId ? 'disabled' : ''}>${esc(form.comment)}</textarea></label>
                    ${form.error ? `<p class="status-error">${esc(form.error)}</p>` : ''}
                    ${form.message ? `<p class="status-success">${esc(form.message)}</p>` : ''}
                    <div class="form-actions">
                      <button class="btn btn-secondary" type="button" data-action="submit-rating" data-trip-key="${esc(tripKey)}" data-target-user-id="${esc(target.targetUserId || '')}" ${form.submitting || !target.targetUserId ? 'disabled' : ''}>
                        ${form.submitting ? 'Submitting...' : (form.submitted ? 'Submit Again' : 'Submit Rating')}
                      </button>
                    </div>
                  </div>
                </div>
              ` : ''}
            </article>
          `;
        }).join('')}
      </div>
      ${renderPager('trip', paged.page, paged.totalPages, paged.totalItems)}
    </section>
  `;
}

function renderMyTripsJoinHistory() {
  const s = state.myTrips;
  const filtered = s.joinHistory.filter((item) => s.joinTab === 'ALL' || item.status === s.joinTab);
  const paged = paginateItems(filtered, s.joinPage, PAGE_SIZE);
  s.joinPage = paged.page;
  return `
    <section class="section-card">
      <h2>My Join Request History</h2>
      <div class="section-subtabs">
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.joinTab === 'PENDING' ? 'active' : ''}" type="button" data-join-tab="PENDING">Pending</button>
          <button class="story-chip ${s.joinTab === 'ACCEPTED' ? 'active' : ''}" type="button" data-join-tab="ACCEPTED">Accepted</button>
          <button class="story-chip ${s.joinTab === 'REJECTED' ? 'active' : ''}" type="button" data-join-tab="REJECTED">Rejected</button>
          <button class="story-chip ${s.joinTab === 'ALL' ? 'active' : ''}" type="button" data-join-tab="ALL">All</button>
        </div>
      </div>
      ${filtered.length === 0 ? '<p>No join requests found in this tab.</p>' : `
        <div class="results-grid">
          ${paged.list.map((item) => `
            <article class="result-card">
              <p><strong>Join request ID:</strong> ${esc(item.joinRequestId)}</p>
              <p><strong>Ride offer ID:</strong> ${esc(item.rideOfferId)}</p>
              <p><strong>Driver:</strong> ${esc(item.driverName || '-')}</p>
              <p><strong>Route:</strong> ${esc(item.originAddress || item.origin)} to ${esc(item.destinationAddress || item.destination)}</p>
              <p><strong>Trip:</strong> ${esc(item.departureDate)} ${esc(item.departureTime)}</p>
              <p><strong>Requested seats:</strong> ${esc(item.requestedSeats)}</p>
              <p><strong>Status:</strong> <span class="${summarizeStatusClass(item.status)}">${esc(item.status)}</span></p>
              <p><strong>Submitted at:</strong> ${esc(formatDateTime(item.requestDateTime))}</p>
              ${item.rideMatchId ? `<p><strong>Ride match:</strong> #${esc(item.rideMatchId)} (${esc(item.rideMatchStatus || 'CONFIRMED')})</p>` : ''}
              ${item.meetingPoint ? `<p><strong>Meeting point:</strong> ${esc(item.meetingPoint)}</p>` : ''}
            </article>
          `).join('')}
        </div>
        ${renderPager('join', paged.page, paged.totalPages, paged.totalItems)}
      `}
    </section>
  `;
}

function renderMyTripsRequestHistory(session) {
  const s = state.myTrips;
  const filtered = s.requestHistory.filter((item) => s.requestTab === 'ALL' || item.status === s.requestTab);
  const paged = paginateItems(filtered, s.requestPage, PAGE_SIZE);
  s.requestPage = paged.page;
  return `
    <section class="section-card" id="request-history-anchor">
      <h2>My One-Off Request History</h2>
      ${s.requestActionError ? `<p class="status-error">${esc(s.requestActionError)}</p>` : ''}
      ${s.requestActionMessage ? `<p class="status-success">${esc(s.requestActionMessage)}</p>` : ''}
      <div class="section-subtabs">
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.requestTab === 'ALL' ? 'active' : ''}" type="button" data-request-tab="ALL">All</button>
          <button class="story-chip ${s.requestTab === 'OPEN' ? 'active' : ''}" type="button" data-request-tab="OPEN">Open</button>
          <button class="story-chip ${s.requestTab === 'MATCHED' ? 'active' : ''}" type="button" data-request-tab="MATCHED">Matched</button>
          <button class="story-chip ${s.requestTab === 'CLOSED' ? 'active' : ''}" type="button" data-request-tab="CLOSED">Closed</button>
        </div>
      </div>
      ${filtered.length === 0 ? '<p>No one-off requests found in this tab.</p>' : `
        <div class="results-grid">
          ${paged.list.map((request) => `
            <article class="result-card">
              <p><strong>Request ID:</strong> ${esc(request.requestId)}</p>
              <p><strong>Route:</strong> ${esc(request.origin)} to ${esc(request.destination)}</p>
              <p><strong>Trip:</strong> ${esc(request.tripDate)} ${esc(request.tripTime)}</p>
              <p><strong>Passengers:</strong> ${esc(request.passengerCount)}</p>
              <p><strong>Status:</strong> <span class="${summarizeStatusClass(request.status)}">${esc(request.status)}</span></p>
              <p><strong>Total offers:</strong> ${esc(request.totalOffers)}</p>
              <p><strong>Pending offers:</strong> ${esc(request.pendingOffers)}</p>
              <div class="form-actions">
                ${request.status !== 'CLOSED' ? `<a class="btn btn-secondary" href="/ride-requests/${esc(request.requestId)}/offers?riderId=${esc(session.userId)}" data-nav="1">Review Offers</a>` : ''}
                ${request.status === 'OPEN' ? `<button class="btn" type="button" data-action="cancel-request" data-request-id="${esc(request.requestId)}">Cancel Request</button>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
        ${renderPager('request', paged.page, paged.totalPages, paged.totalItems)}
      `}
    </section>
  `;
}

function renderMyTripsDriverOfferHistory() {
  const s = state.myTrips;
  const filtered = s.driverOfferHistory.filter((item) => s.driverOfferTab === 'ALL' || item.status === s.driverOfferTab);
  const paged = paginateItems(filtered, s.driverOfferPage, PAGE_SIZE);
  s.driverOfferPage = paged.page;
  return `
    <section class="section-card">
      <h2>My One-Off Offer History</h2>
      <div class="section-subtabs">
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.driverOfferTab === 'ALL' ? 'active' : ''}" type="button" data-driver-offer-tab="ALL">All</button>
          <button class="story-chip ${s.driverOfferTab === 'PENDING' ? 'active' : ''}" type="button" data-driver-offer-tab="PENDING">Pending</button>
          <button class="story-chip ${s.driverOfferTab === 'ACCEPTED' ? 'active' : ''}" type="button" data-driver-offer-tab="ACCEPTED">Accepted</button>
          <button class="story-chip ${s.driverOfferTab === 'REJECTED' ? 'active' : ''}" type="button" data-driver-offer-tab="REJECTED">Rejected</button>
        </div>
      </div>
      ${filtered.length === 0 ? '<p>No one-off offers found in this tab.</p>' : `
        <div class="results-grid">
          ${paged.list.map((offer) => `
            <article class="result-card">
              <p><strong>Offer ID:</strong> ${esc(offer.offerId)}</p>
              <p><strong>Request ID:</strong> ${esc(offer.requestId)}</p>
              <p><strong>Rider:</strong> ${esc(offer.riderName)}</p>
              <p><strong>Route:</strong> ${esc(offer.origin)} to ${esc(offer.destination)}</p>
              <p><strong>Trip:</strong> ${esc(offer.tripDate)} ${esc(offer.tripTime)}</p>
              <p><strong>Status:</strong> <span class="${summarizeStatusClass(offer.status)}">${esc(offer.status)}</span></p>
            </article>
          `).join('')}
        </div>
        ${renderPager('driverOffer', paged.page, paged.totalPages, paged.totalItems)}
      `}
    </section>
  `;
}

async function renderMyTrips(token) {
  const session = requireUser();
  if (!session) return;
  ensureMyTripsLoaded(token, session);
  applyMyTripsPageSafety();

  const s = state.myTrips;
  const filteredTripCount = s.trips.filter((trip) => (s.tripFilter === 'UPCOMING' ? isUpcomingTrip(trip) : !isUpcomingTrip(trip)))
    .filter((trip) => s.tripTypeFilter === 'ALL' || trip.tripType === s.tripTypeFilter)
    .length;

  userLayout('My Trips', `
    ${state.flash.requestHistoryFocus && !s.focusHandled ? `<p class="status-note">${state.flash.requestHistoryFocus.createdRequestId != null ? `Request #${esc(state.flash.requestHistoryFocus.createdRequestId)} has been created. It appears in My One-Off Request History.` : 'Your request has been created. It appears in My One-Off Request History.'}</p>` : ''}

    ${renderMyTripsNotifications()}

    <section class="section-card form-layout-card">
      <h2>Trip Filter</h2>
      <div class="section-subtabs">
        <p class="subtabs-label">Trip time category</p>
        <div class="subtabs-row">
          <button class="${s.tripFilter === 'UPCOMING' ? 'btn' : 'btn btn-secondary'}" type="button" data-trip-filter="UPCOMING">Upcoming</button>
          <button class="${s.tripFilter === 'HISTORY' ? 'btn' : 'btn btn-secondary'}" type="button" data-trip-filter="HISTORY">History</button>
        </div>
        <p class="subtabs-label">Trip type view</p>
        <div class="subtabs-chip-row">
          <button class="story-chip ${s.tripTypeFilter === 'ALL' ? 'active' : ''}" type="button" data-trip-type="ALL">All Types</button>
          <button class="story-chip ${s.tripTypeFilter === 'JOIN_REQUEST' ? 'active' : ''}" type="button" data-trip-type="JOIN_REQUEST">Join Request</button>
          <button class="story-chip ${s.tripTypeFilter === 'ONE_OFF_REQUEST' ? 'active' : ''}" type="button" data-trip-type="ONE_OFF_REQUEST">One-Off Request</button>
        </div>
        <p class="status-note">Showing ${filteredTripCount} trip(s) with this filter combination.</p>
      </div>
    </section>

    ${s.loading ? '<p>Loading trips...</p>' : ''}
    ${s.error ? `<p class="status-error">${esc(s.error)}</p>` : ''}

    ${!s.loading && !s.error ? renderMyTripsNoTripSection(session) : ''}
    ${!s.loading && !s.error ? renderMyTripsTripResults(session) : ''}
    ${!s.loading && !s.error && session.role === 'RIDER' ? renderMyTripsJoinHistory() : ''}
    ${!s.loading && !s.error && session.role === 'RIDER' ? renderMyTripsRequestHistory(session) : ''}
    ${!s.loading && !s.error && session.role === 'DRIVER' ? renderMyTripsDriverOfferHistory() : ''}
  `);

  if (state.flash.requestHistoryFocus && !s.focusHandled && !s.loading && !s.error) {
    s.focusHandled = true;
    state.flash.requestHistoryFocus = null;
    window.setTimeout(() => {
      const anchor = APP_ROOT.querySelector('#request-history-anchor');
      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  APP_ROOT.querySelectorAll('[data-no-trip-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.noTripTab = btn.dataset.noTripTab;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-notification-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.notificationTab = btn.dataset.notificationTab;
      s.notificationPage = 1;
      s.notificationError = '';
      s.notificationMessage = '';
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-trip-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.tripFilter = btn.dataset.tripFilter;
      s.tripPage = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-trip-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.tripTypeFilter = btn.dataset.tripType;
      s.tripPage = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-join-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.joinTab = btn.dataset.joinTab;
      s.joinPage = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-request-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.requestTab = btn.dataset.requestTab;
      s.requestPage = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-driver-offer-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      s.driverOfferTab = btn.dataset.driverOfferTab;
      s.driverOfferPage = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-pager]').forEach((container) => {
    const key = container.dataset.pager;
    const prev = container.querySelector('[data-page-action="prev"]');
    const next = container.querySelector('[data-page-action="next"]');
    const updatePage = (delta) => {
      if (key === 'trip') s.tripPage += delta;
      if (key === 'join') s.joinPage += delta;
      if (key === 'request') s.requestPage += delta;
      if (key === 'driverOffer') s.driverOfferPage += delta;
      if (key === 'notification') s.notificationPage += delta;
      renderApp();
    };
    prev?.addEventListener('click', () => updatePage(-1));
    next?.addEventListener('click', () => updatePage(1));
  });

  APP_ROOT.querySelectorAll('[data-action="mark-read"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const notificationId = Number(btn.dataset.notificationId);
      s.notificationError = '';
      s.notificationMessage = '';
      const restore = withLoadingButton(btn, 'Updating...');
      try {
        const updated = await api.markNotificationRead(session.userId, notificationId);
        s.notifications = s.notifications.map((item) => (item.notificationId === notificationId ? { ...item, read: updated.read } : item));
        s.notificationMessage = `Notification #${notificationId} marked as read.`;
      } catch (error) {
        s.notificationError = error.message || 'Unable to mark notification.';
        restore();
      }
      renderApp();
    });
  });

  const markAllBtn = APP_ROOT.querySelector('[data-action="mark-all-read"]');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      s.notificationError = '';
      s.notificationMessage = '';
      const restore = withLoadingButton(markAllBtn, 'Marking...');
      try {
        const response = await api.markAllNotificationsRead(session.userId);
        s.notifications = s.notifications.map((item) => ({ ...item, read: true }));
        s.notificationMessage = `Marked ${response.updatedCount || 0} notification(s) as read.`;
      } catch (error) {
        s.notificationError = error.message || 'Unable to mark all notifications.';
        restore();
      }
      renderApp();
    });
  }

  APP_ROOT.querySelectorAll('[data-action="cancel-request"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const requestId = Number(btn.dataset.requestId);
      s.requestActionError = '';
      s.requestActionMessage = '';
      const restore = withLoadingButton(btn, 'Cancelling...');
      try {
        const response = await api.cancelRideRequest(session.userId, requestId);
        s.requestHistory = s.requestHistory.map((item) => (Number(item.requestId) === requestId
          ? { ...item, status: response.status, pendingOffers: 0 }
          : item));
        s.requestActionMessage = `Request #${requestId} is now ${response.status}.`;
      } catch (error) {
        s.requestActionError = error.message || 'Unable to cancel request.';
        restore();
      }
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-rating-field]').forEach((input) => {
    input.addEventListener('input', () => {
      const [tripKey, field] = String(input.dataset.ratingField || '').split('.');
      const form = ensureRatingForm(tripKey);
      form[field] = input.value;
    });
  });

  APP_ROOT.querySelectorAll('[data-action="submit-rating"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tripKey = btn.dataset.tripKey;
      const targetUserId = Number(btn.dataset.targetUserId || 0);
      const form = ensureRatingForm(tripKey);
      form.error = '';
      form.message = '';
      if (!targetUserId) {
        form.error = 'Unable to identify rating target for this trip.';
        renderApp();
        return;
      }
      const score = Number(form.score);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        form.error = 'Score must be from 1 to 5.';
        renderApp();
        return;
      }
      form.submitting = true;
      renderApp();
      try {
        const response = await api.createRating({
          raterUserId: session.userId,
          targetUserId,
          score,
          comment: normalizeText(form.comment) || null,
        });
        form.message = `Rated ${response?.targetUserName || 'trip partner'} with ${score}/5.`;
        form.submitted = true;
      } catch (error) {
        form.error = error.message || 'Unable to submit rating.';
      } finally {
        form.submitting = false;
        renderApp();
      }
    });
  });
}

function getAdminSessionKey() {
  return normalizeText(state.session?.adminSessionKey);
}

function adminTabConfig(tabKey) {
  const configs = {
    users: {
      label: 'Users',
      dataKey: 'users',
      idField: 'userId',
      searchValues: (item) => [item.userId, item.role, item.fullName, item.email, item.accountStatus, item.phone, item.suburb],
      bulkField: 'accountStatus',
      bulkOptions: ['ACTIVE', 'INACTIVE'],
    },
    offers: {
      label: 'Ride Offers',
      dataKey: 'offers',
      idField: 'offerId',
      searchValues: (item) => [item.offerId, item.driverId, item.driverName, item.origin, item.destination, item.status],
      bulkField: 'status',
      bulkOptions: ['OPEN', 'CLOSED'],
    },
    requests: {
      label: 'Ride Requests',
      dataKey: 'requests',
      idField: 'rideRequestId',
      searchValues: (item) => [item.rideRequestId, item.riderId, item.riderName, item.origin, item.destination, item.status],
      bulkField: 'status',
      bulkOptions: ['OPEN', 'MATCHED', 'CLOSED'],
    },
    requestOffers: {
      label: 'Ride Request Offers',
      dataKey: 'requestOffers',
      idField: 'offerId',
      searchValues: (item) => [item.offerId, item.rideRequestId, item.driverName, item.riderName, item.status],
      bulkField: 'status',
      bulkOptions: ['PENDING', 'ACCEPTED', 'REJECTED'],
    },
    joins: {
      label: 'Join Requests',
      dataKey: 'joins',
      idField: 'joinRequestId',
      searchValues: (item) => [item.joinRequestId, item.rideOfferId, item.riderName, item.status],
      bulkField: 'status',
      bulkOptions: ['PENDING', 'ACCEPTED', 'REJECTED'],
    },
    matches: {
      label: 'Ride Matches',
      dataKey: 'matches',
      idField: 'rideMatchId',
      searchValues: (item) => [item.rideMatchId, item.driverName, item.riderName, item.tripStatus],
      bulkField: 'tripStatus',
      bulkOptions: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
    },
    ratings: {
      label: 'Ratings',
      dataKey: 'ratings',
      idField: 'ratingId',
      searchValues: (item) => [item.ratingId, item.targetUserName, item.raterUserName, item.score, item.comment],
      bulkField: null,
      bulkOptions: [],
    },
  };
  return configs[tabKey];
}

function filterAdminItems(items, search, valueGetter) {
  const normalized = normalizeText(search).toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => {
    const haystack = valueGetter(item)
      .filter((v) => v != null)
      .map((v) => String(v).toLowerCase())
      .join(' ');
    return haystack.includes(normalized);
  });
}

async function ensureAdminLoaded(token) {
  const admin = state.admin;
  if (admin.loading || admin.loaded) return;
  admin.loading = true;
  admin.error = '';
  try {
    const key = getAdminSessionKey();
    const [overview, users, offers, requests, requestOffers, joins, matches, ratings] = await Promise.all([
      api.getAdminOverview(key),
      api.getAdminUsers(key),
      api.getAdminRideOffers(key),
      api.getAdminRideRequests(key),
      api.getAdminRideRequestOffers(key),
      api.getAdminJoinRequests(key),
      api.getAdminRideMatches(key),
      api.getAdminRatings(key),
    ]);
    if (token !== renderToken) return;
    admin.data = {
      overview,
      users: Array.isArray(users) ? users : [],
      offers: Array.isArray(offers) ? offers : [],
      requests: Array.isArray(requests) ? requests : [],
      requestOffers: Array.isArray(requestOffers) ? requestOffers : [],
      joins: Array.isArray(joins) ? joins : [],
      matches: Array.isArray(matches) ? matches : [],
      ratings: Array.isArray(ratings) ? ratings : [],
    };
    admin.loaded = true;
  } catch (error) {
    if (token !== renderToken) return;
    admin.error = error.message || 'Unable to load admin dashboard.';
  } finally {
    if (token === renderToken) {
      admin.loading = false;
      renderApp();
    }
  }
}

function renderAdminPagination(tabKey, paged, section) {
  return `
    <div class="admin-pager" data-admin-pager="${esc(tabKey)}">
      <div class="admin-page-size">
        <span>Page size</span>
        <select data-action="admin-page-size" data-tab="${esc(tabKey)}">
          ${ADMIN_PAGE_SIZE_OPTIONS.map((size) => `<option value="${size}" ${section.pageSize === size ? 'selected' : ''}>${size}</option>`).join('')}
        </select>
      </div>
      <div class="admin-page-nav">
        <button class="btn btn-secondary" type="button" data-action="admin-page-prev" data-tab="${esc(tabKey)}" ${paged.page <= 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${paged.page} / ${paged.totalPages} (${paged.totalItems} items)</span>
        <button class="btn btn-secondary" type="button" data-action="admin-page-next" data-tab="${esc(tabKey)}" ${paged.page >= paged.totalPages ? 'disabled' : ''}>Next</button>
      </div>
    </div>
  `;
}

function renderAdminTable(tabKey, filtered, paged, section) {
  if (tabKey === 'users') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="users" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.userId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Role</th><th>Name</th><th>Email</th><th>Status</th><th>Verification</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.userId] ? 'is-selected' : ''}" data-row-id="${esc(item.userId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="users" data-id="${esc(item.userId)}" ${section.selected[item.userId] ? 'checked' : ''}></td>
              <td>${esc(item.userId)}</td>
              <td>${esc(item.role)}</td>
              <td>${esc(item.fullName || '-')}</td>
              <td>${esc(item.email || '-')}</td>
              <td>${esc(item.accountStatus || '-')}</td>
              <td>${esc(item.driverLicenceVerifiedStatus || '-')}</td>
              <td>
                <details class="admin-inline-actions">
                  <summary class="btn btn-secondary">Edit</summary>
                  <div class="admin-inline-form">
                    <input type="text" data-field="fullName" value="${esc(item.fullName || '')}" placeholder="Full name">
                    <input type="email" data-field="email" value="${esc(item.email || '')}" placeholder="Email">
                    <input type="text" data-field="phone" value="${esc(item.phone || '')}" placeholder="Phone">
                    <input type="text" data-field="suburb" value="${esc(item.suburb || '')}" placeholder="Suburb">
                    <select data-field="accountStatus">
                      <option value="ACTIVE" ${item.accountStatus === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
                      <option value="INACTIVE" ${item.accountStatus === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
                    </select>
                    <textarea data-field="bio" rows="2" placeholder="Bio">${esc(item.bio || '')}</textarea>
                    <textarea data-field="travelPreferences" rows="2" placeholder="Travel preferences">${esc(item.travelPreferences || '')}</textarea>
                    <textarea data-field="trustNotes" rows="2" placeholder="Trust notes">${esc(item.trustNotes || '')}</textarea>
                    ${item.role === 'DRIVER' ? `
                      <select data-field="driverLicenceVerifiedStatus">
                        <option value="PENDING" ${item.driverLicenceVerifiedStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
                        <option value="VERIFIED" ${item.driverLicenceVerifiedStatus === 'VERIFIED' ? 'selected' : ''}>VERIFIED</option>
                        <option value="REJECTED" ${item.driverLicenceVerifiedStatus === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                      </select>
                      <input type="text" data-field="driverVehicleInfo" value="${esc(item.driverVehicleInfo || '')}" placeholder="Vehicle info">
                      <input type="number" min="1" data-field="driverSpareSeatCapacity" value="${item.driverSpareSeatCapacity ?? ''}" placeholder="Spare seats">
                      <textarea data-field="driverVerificationNotes" rows="2" placeholder="Verification notes">${esc(item.driverVerificationNotes || '')}</textarea>
                      <div class="admin-doc-grid">
                        <p>Documents:</p>
                        <a href="${esc(`${api.API_BASE_URL}/driver-documents/${item.userId}/licence`)}" target="_blank" rel="noreferrer">Licence</a>
                        <a href="${esc(`${api.API_BASE_URL}/driver-documents/${item.userId}/seat-proof`)}" target="_blank" rel="noreferrer">Seat Proof</a>
                        <a href="${esc(`${api.API_BASE_URL}/driver-documents/${item.userId}/rego`)}" target="_blank" rel="noreferrer">Rego</a>
                      </div>
                    ` : `
                      <input type="text" data-field="riderPreferredTravelTimes" value="${esc(item.riderPreferredTravelTimes || '')}" placeholder="Preferred travel times">
                      <input type="text" data-field="riderUsualDestinations" value="${esc(item.riderUsualDestinations || '')}" placeholder="Usual destinations">
                    `}
                    <div class="admin-inline-toolbar"><button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="users" data-id="${esc(item.userId)}">Save</button></div>
                  </div>
                </details>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="8">No users match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  if (tabKey === 'offers') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="offers" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.offerId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Driver</th><th>Route</th><th>Departure</th><th>Seats</th><th>Status</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.offerId] ? 'is-selected' : ''}" data-row-id="${esc(item.offerId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="offers" data-id="${esc(item.offerId)}" ${section.selected[item.offerId] ? 'checked' : ''}></td>
              <td>${esc(item.offerId)}</td>
              <td>${esc(item.driverName)} (#${esc(item.driverId)})</td>
              <td>${esc(item.origin)} to ${esc(item.destination)}</td>
              <td>${esc(item.departureDate)} ${esc(item.departureTime)}</td>
              <td>${esc(item.availableSeats)}</td>
              <td>${esc(item.status)}</td>
              <td>
                <div class="admin-inline-form">
                  <input type="text" data-field="origin" value="${esc(item.origin || '')}" placeholder="Origin">
                  <input type="text" data-field="destination" value="${esc(item.destination || '')}" placeholder="Destination">
                  <input type="date" data-field="departureDate" value="${esc(item.departureDate || '')}">
                  <input type="time" data-field="departureTime" value="${esc(item.departureTime || '')}">
                  <input type="number" min="0" data-field="availableSeats" value="${item.availableSeats ?? ''}">
                  <select data-field="status">
                    <option value="OPEN" ${item.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                    <option value="CLOSED" ${item.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                  </select>
                  <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="offers" data-id="${esc(item.offerId)}">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="8">No ride offers match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  if (tabKey === 'requests') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="requests" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.rideRequestId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Rider</th><th>Route</th><th>Trip</th><th>Passengers</th><th>Status</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.rideRequestId] ? 'is-selected' : ''}" data-row-id="${esc(item.rideRequestId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="requests" data-id="${esc(item.rideRequestId)}" ${section.selected[item.rideRequestId] ? 'checked' : ''}></td>
              <td>${esc(item.rideRequestId)}</td>
              <td>${esc(item.riderName)} (#${esc(item.riderId)})</td>
              <td>${esc(item.origin)} to ${esc(item.destination)}</td>
              <td>${esc(item.tripDate)} ${esc(item.tripTime)}</td>
              <td>${esc(item.passengerCount)}</td>
              <td>${esc(item.status)}</td>
              <td>
                <div class="admin-inline-form">
                  <input type="text" data-field="origin" value="${esc(item.origin || '')}" placeholder="Origin">
                  <input type="text" data-field="destination" value="${esc(item.destination || '')}" placeholder="Destination">
                  <input type="date" data-field="tripDate" value="${esc(item.tripDate || '')}">
                  <input type="time" data-field="tripTime" value="${esc(item.tripTime || '')}">
                  <input type="number" min="1" data-field="passengerCount" value="${item.passengerCount ?? ''}">
                  <input type="text" data-field="notes" value="${esc(item.notes || '')}" placeholder="Notes">
                  <select data-field="status">
                    <option value="OPEN" ${item.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                    <option value="MATCHED" ${item.status === 'MATCHED' ? 'selected' : ''}>MATCHED</option>
                    <option value="CLOSED" ${item.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                  </select>
                  <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="requests" data-id="${esc(item.rideRequestId)}">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="8">No ride requests match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  if (tabKey === 'requestOffers') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="requestOffers" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.offerId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Request</th><th>Driver</th><th>Rider</th><th>Status</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.offerId] ? 'is-selected' : ''}" data-row-id="${esc(item.offerId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="requestOffers" data-id="${esc(item.offerId)}" ${section.selected[item.offerId] ? 'checked' : ''}></td>
              <td>${esc(item.offerId)}</td>
              <td>#${esc(item.rideRequestId)}</td>
              <td>${esc(item.driverName)} (#${esc(item.driverId)})</td>
              <td>${esc(item.riderName)} (#${esc(item.riderId)})</td>
              <td>${esc(item.status)}</td>
              <td>
                <div class="admin-inline-form">
                  <input type="number" min="1" data-field="proposedSeats" value="${item.proposedSeats ?? ''}">
                  <input type="text" data-field="meetingPoint" value="${esc(item.meetingPoint || '')}" placeholder="Meeting point">
                  <select data-field="status">
                    <option value="PENDING" ${item.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                    <option value="ACCEPTED" ${item.status === 'ACCEPTED' ? 'selected' : ''}>ACCEPTED</option>
                    <option value="REJECTED" ${item.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                  </select>
                  <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="requestOffers" data-id="${esc(item.offerId)}">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="7">No request offers match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  if (tabKey === 'joins') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="joins" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.joinRequestId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Offer</th><th>Rider</th><th>Seats</th><th>Status</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.joinRequestId] ? 'is-selected' : ''}" data-row-id="${esc(item.joinRequestId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="joins" data-id="${esc(item.joinRequestId)}" ${section.selected[item.joinRequestId] ? 'checked' : ''}></td>
              <td>${esc(item.joinRequestId)}</td>
              <td>#${esc(item.rideOfferId)}</td>
              <td>${esc(item.riderName)} (#${esc(item.riderId)})</td>
              <td>${esc(item.requestedSeats)}</td>
              <td>${esc(item.status)}</td>
              <td>
                <div class="admin-inline-form">
                  <input type="number" min="1" data-field="requestedSeats" value="${item.requestedSeats ?? ''}">
                  <select data-field="status">
                    <option value="PENDING" ${item.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                    <option value="ACCEPTED" ${item.status === 'ACCEPTED' ? 'selected' : ''}>ACCEPTED</option>
                    <option value="REJECTED" ${item.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                  </select>
                  <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="joins" data-id="${esc(item.joinRequestId)}">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="7">No join requests match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  if (tabKey === 'matches') {
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-action="admin-select-page" data-tab="matches" ${paged.list.length > 0 && paged.list.every((item) => section.selected[item.rideMatchId]) ? 'checked' : ''}></th>
            <th>ID</th><th>Driver</th><th>Rider</th><th>Source</th><th>Status</th><th>Admin Edit</th>
          </tr>
        </thead>
        <tbody>
          ${paged.list.map((item) => `
            <tr class="${section.selected[item.rideMatchId] ? 'is-selected' : ''}" data-row-id="${esc(item.rideMatchId)}">
              <td><input type="checkbox" data-action="admin-select-row" data-tab="matches" data-id="${esc(item.rideMatchId)}" ${section.selected[item.rideMatchId] ? 'checked' : ''}></td>
              <td>${esc(item.rideMatchId)}</td>
              <td>${esc(item.driverName)} (#${esc(item.driverId)})</td>
              <td>${esc(item.riderName)} (#${esc(item.riderId)})</td>
              <td>Join #${esc(item.acceptedJoinRequestId || '-')} / OneOffOffer #${esc(item.acceptedRideRequestOfferId || '-')}</td>
              <td>${esc(item.tripStatus)}</td>
              <td>
                <div class="admin-inline-form">
                  <input type="text" data-field="meetingPoint" value="${esc(item.meetingPoint || '')}" placeholder="Meeting point">
                  <select data-field="tripStatus">
                    <option value="CONFIRMED" ${item.tripStatus === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
                    <option value="COMPLETED" ${item.tripStatus === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
                    <option value="CANCELLED" ${item.tripStatus === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                  </select>
                  <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="matches" data-id="${esc(item.rideMatchId)}">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${filtered.length === 0 ? '<tr><td colspan="7">No ride matches match current search.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  }

  return `
    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>Target User</th><th>Rater User</th><th>Score</th><th>Comment</th><th>Created Date</th><th>Admin Edit</th></tr>
      </thead>
      <tbody>
        ${paged.list.map((item) => `
          <tr data-row-id="${esc(item.ratingId)}">
            <td>${esc(item.ratingId)}</td>
            <td>${esc(item.targetUserName)} (#${esc(item.targetUserId)})</td>
            <td>${esc(item.raterUserName)} (#${esc(item.raterUserId)})</td>
            <td>${esc(item.score)}</td>
            <td>${esc(item.comment || '-')}</td>
            <td>${esc(item.createdDate || '-')}</td>
            <td>
              <div class="admin-inline-form">
                <input type="number" min="1" data-field="raterUserId" value="${item.raterUserId ?? ''}">
                <input type="number" min="1" max="5" data-field="score" value="${item.score ?? ''}">
                <input type="text" data-field="comment" value="${esc(item.comment || '')}" placeholder="Comment">
                <button class="btn btn-secondary" type="button" data-action="admin-save-row" data-tab="ratings" data-id="${esc(item.ratingId)}">Save</button>
              </div>
            </td>
          </tr>
        `).join('')}
        ${filtered.length === 0 ? '<tr><td colspan="7">No ratings match current search.</td></tr>' : ''}
      </tbody>
    </table>
  `;
}

function renderAdminTabSection(tabKey) {
  const admin = state.admin;
  const config = adminTabConfig(tabKey);
  const section = admin.sections[tabKey];
  const rawItems = admin.data[config.dataKey] || [];
  const filtered = filterAdminItems(rawItems, section.search, config.searchValues);
  const paged = paginateItems(filtered, section.page, section.pageSize);
  section.page = paged.page;
  const selectedCount = Object.keys(section.selected).filter((id) => section.selected[id]).length;

  return `
    <section class="section-card">
      <div class="admin-filter-bar">
        <input type="search" data-action="admin-search" data-tab="${esc(tabKey)}" placeholder="Search ${esc(config.label.toLowerCase())}..." value="${esc(section.search)}">
        <span>${filtered.length}/${rawItems.length}</span>
      </div>
      ${config.bulkField ? `
        <div class="admin-bulk-bar">
          <span>${selectedCount} selected</span>
          <select data-action="admin-bulk-value" data-tab="${esc(tabKey)}">
            <option value="">Bulk ${esc(config.bulkField)}...</option>
            ${config.bulkOptions.map((value) => `<option value="${esc(value)}" ${section.bulkValue === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}
          </select>
          <button class="btn btn-secondary" type="button" data-action="admin-bulk-apply" data-tab="${esc(tabKey)}" ${selectedCount === 0 || !section.bulkValue ? 'disabled' : ''}>Apply</button>
          <button class="btn btn-secondary" type="button" data-action="admin-clear-selection" data-tab="${esc(tabKey)}" ${selectedCount === 0 ? 'disabled' : ''}>Clear</button>
        </div>
      ` : ''}
      <div class="admin-table-wrap">
        ${renderAdminTable(tabKey, filtered, paged, section)}
        ${renderAdminPagination(tabKey, paged, section)}
      </div>
    </section>
  `;
}

async function renderAdmin(token) {
  const session = requireAdmin();
  if (!session) return;
  ensureAdminLoaded(token);
  const admin = state.admin;

  adminLayout(`
    ${admin.loading ? '<section class="section-card"><p>Loading admin dashboard...</p></section>' : ''}
    ${admin.error ? `<section class="section-card"><p class="status-error">${esc(admin.error)}</p></section>` : ''}
    ${admin.message ? `<section class="section-card"><p class="status-success">${esc(admin.message)}</p></section>` : ''}
    ${!admin.error ? `
      <section class="section-card">
        <div class="admin-kpi-grid">
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.users ?? admin.data.users.length)}</strong><span>Users</span></article>
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.rideOffers ?? admin.data.offers.length)}</strong><span>Ride Offers</span></article>
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.rideRequests ?? admin.data.requests.length)}</strong><span>Ride Requests</span></article>
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.joinRequests ?? admin.data.joins.length)}</strong><span>Join Requests</span></article>
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.rideMatches ?? admin.data.matches.length)}</strong><span>Ride Matches</span></article>
          <article class="admin-kpi-card"><strong>${esc(admin.data.overview?.ratings ?? admin.data.ratings.length)}</strong><span>Ratings</span></article>
        </div>
      </section>

      <section class="section-card">
        <div class="subtabs-chip-row">
          ${['users', 'offers', 'requests', 'requestOffers', 'joins', 'matches', 'ratings']
            .map((tab) => `<button class="story-chip ${admin.tab === tab ? 'active' : ''}" type="button" data-action="admin-tab" data-tab="${tab}">${esc(adminTabConfig(tab).label)}</button>`)
            .join('')}
        </div>
      </section>

      ${renderAdminTabSection(admin.tab)}
    ` : ''}
  `);

  APP_ROOT.querySelectorAll('[data-action="admin-tab"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      admin.tab = btn.dataset.tab;
      admin.error = '';
      admin.message = '';
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-search"]').forEach((input) => {
    input.addEventListener('input', () => {
      const tab = input.dataset.tab;
      admin.sections[tab].search = input.value;
      admin.sections[tab].page = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-page-prev"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      admin.sections[tab].page -= 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-page-next"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      admin.sections[tab].page += 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-page-size"]').forEach((select) => {
    select.addEventListener('change', () => {
      const tab = select.dataset.tab;
      admin.sections[tab].pageSize = Number(select.value) || ADMIN_DEFAULT_PAGE_SIZE;
      admin.sections[tab].page = 1;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-select-row"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const tab = checkbox.dataset.tab;
      const id = checkbox.dataset.id;
      admin.sections[tab].selected[id] = checkbox.checked;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-select-page"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const tab = checkbox.dataset.tab;
      const cfg = adminTabConfig(tab);
      const section = admin.sections[tab];
      const filtered = filterAdminItems(admin.data[cfg.dataKey] || [], section.search, cfg.searchValues);
      const paged = paginateItems(filtered, section.page, section.pageSize);
      paged.list.forEach((item) => {
        section.selected[item[cfg.idField]] = checkbox.checked;
      });
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-bulk-value"]').forEach((select) => {
    select.addEventListener('change', () => {
      const tab = select.dataset.tab;
      admin.sections[tab].bulkValue = select.value;
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-clear-selection"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      admin.sections[tab].selected = {};
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-bulk-apply"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.tab;
      const cfg = adminTabConfig(tab);
      const section = admin.sections[tab];
      const ids = Object.keys(section.selected)
        .filter((id) => section.selected[id])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
      if (ids.length === 0 || !section.bulkValue) return;

      admin.message = '';
      admin.error = '';
      const restore = withLoadingButton(btn, 'Applying...');
      const key = getAdminSessionKey();
      try {
        if (tab === 'users') await Promise.all(ids.map((id) => api.updateAdminUser(key, id, { accountStatus: section.bulkValue })));
        if (tab === 'offers') await Promise.all(ids.map((id) => api.updateAdminRideOffer(key, id, { status: section.bulkValue })));
        if (tab === 'requests') await Promise.all(ids.map((id) => api.updateAdminRideRequest(key, id, { status: section.bulkValue })));
        if (tab === 'requestOffers') await Promise.all(ids.map((id) => api.updateAdminRideRequestOffer(key, id, { status: section.bulkValue })));
        if (tab === 'joins') await Promise.all(ids.map((id) => api.updateAdminJoinRequest(key, id, { status: section.bulkValue })));
        if (tab === 'matches') await Promise.all(ids.map((id) => api.updateAdminRideMatch(key, id, { tripStatus: section.bulkValue })));
        admin.message = `Applied ${section.bulkValue} to ${ids.length} selected row(s).`;
        section.selected = {};
        section.bulkValue = '';
        admin.loaded = false;
      } catch (error) {
        admin.error = error.message || 'Bulk update failed.';
        restore();
      }
      renderApp();
    });
  });

  APP_ROOT.querySelectorAll('[data-action="admin-save-row"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.tab;
      const id = Number(btn.dataset.id);
      const row = btn.closest('tr');
      if (!row || !Number.isInteger(id)) return;
      const patch = {};
      row.querySelectorAll('[data-field]').forEach((input) => {
        const field = input.dataset.field;
        if (input.type === 'number') {
          const raw = normalizeText(input.value);
          patch[field] = raw === '' ? null : Number(raw);
        } else {
          patch[field] = input.value;
        }
      });

      admin.message = '';
      admin.error = '';
      const restore = withLoadingButton(btn, 'Saving...');
      const key = getAdminSessionKey();
      try {
        if (tab === 'users') await api.updateAdminUser(key, id, patch);
        else if (tab === 'offers') await api.updateAdminRideOffer(key, id, patch);
        else if (tab === 'requests') await api.updateAdminRideRequest(key, id, patch);
        else if (tab === 'requestOffers') await api.updateAdminRideRequestOffer(key, id, patch);
        else if (tab === 'joins') await api.updateAdminJoinRequest(key, id, patch);
        else if (tab === 'matches') await api.updateAdminRideMatch(key, id, patch);
        else if (tab === 'ratings') await api.updateAdminRating(key, id, patch);
        admin.message = `Saved ${adminTabConfig(tab).label} #${id}.`;
        admin.loaded = false;
      } catch (error) {
        admin.error = error.message || 'Save failed.';
        restore();
      }
      renderApp();
    });
  });
}

function renderNotFound() {
  const fallback = state.session ? (state.session.role === 'ADMIN' ? '/admin' : '/') : '/intro';
  navigate(fallback, true);
}

async function renderApp() {
  renderToken += 1;
  const token = renderToken;
  const path = window.location.pathname;

  if (path !== '/post-ride-request') {
    clearPostRedirectTimer();
  }

  if (path === '/intro') return renderIntro();
  if (path === '/tutorial') return renderTutorial();
  if (path === '/login') return renderLogin();
  if (path === '/register') return renderRegister();
  if (path === '/admin/login') return renderAdminLogin();
  if (path === '/admin') return renderAdmin(token);
  if (path === '/') return renderFindRide();
  if (path === '/search-results') return renderSearchResults(token);
  if (path === '/post-ride-request') return renderPostRideRequest();
  if (path === '/my-trips') return renderMyTrips(token);
  if (path === '/profile') return renderProfile(token);
  if (path === '/driver-hub') return renderDriverHub(token);
  if (path === '/ride-confirmed') return renderRideConfirmed();

  const detail = match(path, '/ride-offer-details/:offerId');
  if (detail) return renderRideOfferDetails(token, detail.offerId);
  const requestOffers = match(path, '/ride-requests/:rideRequestId/offers');
  if (requestOffers) return renderRideRequestOffers(token, requestOffers.rideRequestId);
  return renderNotFound();
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[data-nav="1"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
  event.preventDefault();
  state.menuOpen = false;
  navigate(href);
});

window.addEventListener('popstate', renderApp);
renderApp();
