document.addEventListener('DOMContentLoaded', () => {
  const panels = Array.from(document.querySelectorAll('.flow-panel'));
  const steps = Array.from(document.querySelectorAll('.step[data-step]'));

  if (!panels.length || !steps.length) {
    return;
  }

  document.documentElement.classList.add('js-enabled');

  const panelIds = new Set(panels.map((panel) => panel.id));

  const seedPlaces = {
    origin: [
      { label: 'Clayton Station Gate 2', detail: 'Clayton VIC 3168, Australia', lat: -37.91557, lon: 145.12132 },
      { label: 'Monash Bus Interchange', detail: 'Wellington Road, Clayton VIC 3800, Australia', lat: -37.91083, lon: 145.13462 },
      { label: 'Box Hill Central', detail: 'Main Street, Box Hill VIC 3128, Australia', lat: -37.81842, lon: 145.12515 }
    ],
    destination: [
      { label: 'Southern Cross Station', detail: 'Spencer Street, Docklands VIC 3008, Australia', lat: -37.81827, lon: 144.95275 },
      { label: 'Melbourne Central', detail: 'La Trobe Street, Melbourne VIC 3000, Australia', lat: -37.81024, lon: 144.96269 },
      { label: 'Docklands Library', detail: '107 Victoria Harbour Promenade, Docklands VIC 3008, Australia', lat: -37.8137, lon: 144.94426 }
    ]
  };

  const state = {
    origin: { ...seedPlaces.origin[0] },
    destination: { ...seedPlaces.destination[0] }
  };

  const originInput = document.getElementById('origin-search');
  const destinationInput = document.getElementById('destination-search');
  const originSuggestions = document.getElementById('origin-suggestions');
  const destinationSuggestions = document.getElementById('destination-suggestions');
  const originMap = document.getElementById('origin-map');
  const destinationMap = document.getElementById('destination-map');
  const summaryMap = document.getElementById('summary-map');
  const originCaption = document.getElementById('origin-map-caption');
  const destinationCaption = document.getElementById('destination-map-caption');
  const summaryCaption = document.getElementById('summary-map-caption');
  const originLabel = document.getElementById('origin-label');
  const destinationLabel = document.getElementById('destination-label');
  const destinationOriginSummary = document.getElementById('destination-origin-summary');
  const tripOriginSummary = document.getElementById('trip-origin-summary');
  const tripDestinationSummary = document.getElementById('trip-destination-summary');
  const tripDateInput = document.getElementById('trip-date-input');
  const tripTimeInput = document.getElementById('trip-time-input');
  const tripPassengersInput = document.getElementById('trip-passengers-input');
  const tripNotesInput = document.getElementById('trip-notes-input');
  const searchResultsLink = document.getElementById('search-results-link');

  const searchTimers = {};

  function getActiveStepId() {
    const hash = window.location.hash.replace('#', '');
    return panelIds.has(hash) ? hash : panels[0].id;
  }

  function showStep(stepId) {
    const activeId = panelIds.has(stepId) ? stepId : panels[0].id;

    panels.forEach((panel) => {
      panel.classList.toggle('is-visible', panel.id === activeId);
    });

    steps.forEach((step) => {
      const isActive = step.dataset.step === activeId;
      step.classList.toggle('is-active', isActive);
      step.setAttribute('aria-current', isActive ? 'step' : 'false');
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function buildSingleBbox(place, zoomPad = 0.025) {
    const south = place.lat - zoomPad;
    const north = place.lat + zoomPad;
    const west = place.lon - zoomPad;
    const east = place.lon + zoomPad;
    return `${west},${south},${east},${north}`;
  }

  function buildSharedBbox(first, second) {
    const south = clamp(Math.min(first.lat, second.lat) - 0.06, -89, 89);
    const north = clamp(Math.max(first.lat, second.lat) + 0.06, -89, 89);
    const west = clamp(Math.min(first.lon, second.lon) - 0.08, -179, 179);
    const east = clamp(Math.max(first.lon, second.lon) + 0.08, -179, 179);
    return `${west},${south},${east},${north}`;
  }

  function buildEmbedUrl(bbox, markerPlace) {
    const params = new URLSearchParams({
      bbox,
      layer: 'mapnik'
    });
    if (markerPlace) {
      params.set('marker', `${markerPlace.lat},${markerPlace.lon}`);
    }
    return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
  }

  function buildRouteSearchParams() {
    return new URLSearchParams({
      origin: state.origin.label,
      originLat: String(state.origin.lat),
      originLon: String(state.origin.lon),
      destination: state.destination.label,
      destinationLat: String(state.destination.lat),
      destinationLon: String(state.destination.lon),
      date: tripDateInput.value,
      time: tripTimeInput.value,
      passengers: tripPassengersInput.value,
      notes: tripNotesInput.value
    });
  }

  function updateActionLinks() {
    const params = buildRouteSearchParams();
    searchResultsLink.href = `./search-results.html?${params.toString()}`;
  }

  function updateMapState() {
    originMap.src = buildEmbedUrl(buildSingleBbox(state.origin), state.origin);
    destinationMap.src = buildEmbedUrl(buildSingleBbox(state.destination), state.destination);

    const summaryCenter = {
      lat: (state.origin.lat + state.destination.lat) / 2,
      lon: (state.origin.lon + state.destination.lon) / 2
    };
    summaryMap.src = buildEmbedUrl(buildSharedBbox(state.origin, state.destination), summaryCenter);

    originCaption.textContent = `OpenStreetMap preview for ${state.origin.label}.`;
    destinationCaption.textContent = `OpenStreetMap preview for ${state.destination.label}.`;
    summaryCaption.textContent = `OpenStreetMap route context from ${state.origin.label} to ${state.destination.label}.`;

    originLabel.textContent = state.origin.label;
    destinationLabel.textContent = state.destination.label;
    destinationOriginSummary.textContent = state.origin.label;
    tripOriginSummary.textContent = state.origin.label;
    tripDestinationSummary.textContent = state.destination.label;

    updateActionLinks();
  }

  function normaliseRemotePlace(item) {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }

    const primaryName = item.display_name ? item.display_name.split(',')[0] : 'Selected place';
    return {
      label: primaryName.trim(),
      detail: item.display_name || 'OpenStreetMap search result',
      lat,
      lon
    };
  }

  function getLocalMatches(type, query) {
    const lowered = query.trim().toLowerCase();
    if (!lowered) {
      return seedPlaces[type];
    }
    return seedPlaces[type].filter((place) => {
      return place.label.toLowerCase().includes(lowered) || place.detail.toLowerCase().includes(lowered);
    });
  }

  function renderSuggestions(type, suggestions) {
    const container = type === 'origin' ? originSuggestions : destinationSuggestions;
    container.innerHTML = '';

    suggestions.slice(0, 5).forEach((place) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggestion-item';
      button.innerHTML = `<strong>${place.label}</strong><span>${place.detail}</span>`;
      button.addEventListener('click', () => {
        applyPlace(type, place);
      });
      container.appendChild(button);
    });
  }

  function applyPlace(type, place) {
    state[type] = { ...place };
    const input = type === 'origin' ? originInput : destinationInput;
    input.value = place.label;
    updateMapState();
    renderSuggestions(type, getLocalMatches(type, place.label));
  }

  async function searchPlaces(type, query) {
    const localMatches = getLocalMatches(type, query);
    renderSuggestions(type, localMatches);

    if (query.trim().length < 3) {
      return;
    }

    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        q: query,
        limit: '4',
        countrycodes: 'au'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const remoteMatches = data
        .map(normaliseRemotePlace)
        .filter(Boolean);

      const merged = [...localMatches];
      remoteMatches.forEach((remotePlace) => {
        const exists = merged.some((place) => {
          return place.label === remotePlace.label || (Math.abs(place.lat - remotePlace.lat) < 0.0001 && Math.abs(place.lon - remotePlace.lon) < 0.0001);
        });
        if (!exists) {
          merged.push(remotePlace);
        }
      });

      if (merged.length) {
        renderSuggestions(type, merged);
      }
    } catch (_error) {
      renderSuggestions(type, localMatches);
    }
  }

  function attachSearch(type, input) {
    input.addEventListener('input', () => {
      clearTimeout(searchTimers[type]);
      searchTimers[type] = window.setTimeout(() => {
        searchPlaces(type, input.value);
      }, 220);
      updateActionLinks();
    });
  }

  function applyParamsToForm() {
    const params = new URLSearchParams(window.location.search);
    const originLabel = params.get('origin');
    const destinationLabel = params.get('destination');
    const originLat = Number(params.get('originLat'));
    const originLon = Number(params.get('originLon'));
    const destinationLat = Number(params.get('destinationLat'));
    const destinationLon = Number(params.get('destinationLon'));

    if (originLabel) {
      originInput.value = originLabel;
      if (Number.isFinite(originLat) && Number.isFinite(originLon)) {
        state.origin = { label: originLabel, detail: `${originLabel}, Australia`, lat: originLat, lon: originLon };
      } else {
        const match = seedPlaces.origin.find((place) => place.label === originLabel);
        if (match) {
          state.origin = { ...match };
        }
      }
    }

    if (destinationLabel) {
      destinationInput.value = destinationLabel;
      if (Number.isFinite(destinationLat) && Number.isFinite(destinationLon)) {
        state.destination = { label: destinationLabel, detail: `${destinationLabel}, Australia`, lat: destinationLat, lon: destinationLon };
      } else {
        const match = seedPlaces.destination.find((place) => place.label === destinationLabel);
        if (match) {
          state.destination = { ...match };
        }
      }
    }

    if (params.get('date')) {
      tripDateInput.value = params.get('date');
    }
    if (params.get('time')) {
      tripTimeInput.value = params.get('time');
    }
    if (params.get('passengers')) {
      tripPassengersInput.value = params.get('passengers');
    }
    if (params.get('notes')) {
      tripNotesInput.value = params.get('notes');
    }
  }

  window.addEventListener('hashchange', () => {
    showStep(getActiveStepId());
  });

  [tripDateInput, tripTimeInput, tripPassengersInput, tripNotesInput].forEach((field) => {
    field.addEventListener('input', updateActionLinks);
    field.addEventListener('change', updateActionLinks);
  });

  attachSearch('origin', originInput);
  attachSearch('destination', destinationInput);

  applyParamsToForm();
  renderSuggestions('origin', seedPlaces.origin);
  renderSuggestions('destination', seedPlaces.destination);
  updateMapState();
  showStep(getActiveStepId());
  searchPlaces('origin', originInput.value);
  searchPlaces('destination', destinationInput.value);
});
