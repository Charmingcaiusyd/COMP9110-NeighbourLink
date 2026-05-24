document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const params = new URLSearchParams(window.location.search);

  const offers = {
    emma: {
      driver: 'Emma Driver',
      route: 'Clayton to Melbourne CBD',
      departure: '2026-04-09 at 07:30',
      seats: '2',
      vehicle: 'Silver Toyota Corolla',
      pickup: 'Clayton Station Gate 2'
    },
    liam: {
      driver: 'Liam Driver',
      route: 'Clayton to Docklands',
      departure: '2026-04-09 at 08:05',
      seats: '1',
      vehicle: 'Blue Hyundai i30',
      pickup: 'Monash northern pickup zone'
    }
  };

  const acceptedDriverRecords = {
    '501': {
      request: '501',
      rider: 'Daniel Rider',
      driver: 'Emma Driver',
      route: 'Clayton to Melbourne CBD',
      seats: '1',
      meeting: 'Clayton Station Gate 2',
      driverStart: 'Monash University northern carpark',
      driverStartLat: -37.9108,
      driverStartLon: 145.1365,
      pickup: 'Clayton Station Gate 2',
      pickupLat: -37.9263641,
      pickupLon: 145.1230003,
      destination: 'Melbourne CBD drop-off zone',
      destinationLat: -37.8136,
      destinationLon: 144.9631
    },
    '504': {
      request: '504',
      rider: 'Olivia Chen',
      driver: 'Liam Driver',
      route: 'Clayton to Docklands',
      seats: '1',
      meeting: 'Monash northern pickup zone',
      driverStart: 'Monash University western parking',
      driverStartLat: -37.9106,
      driverStartLon: 145.1318,
      pickup: 'Monash northern pickup zone',
      pickupLat: -37.9099,
      pickupLon: 145.1348,
      destination: 'Docklands drop-off bay',
      destinationLat: -37.8147,
      destinationLon: 144.9475
    }
  };

  const rejectedDriverRecords = {
    '498': {
      request: '498',
      rider: 'Mia Santos',
      driver: 'Liam Driver',
      route: 'Clayton to Docklands',
      seats: '1',
      reason: 'Vehicle already full at decision time'
    },
    '499': {
      request: '499',
      rider: 'Zoe Patel',
      driver: 'Emma Driver',
      route: 'Clayton to Melbourne CBD',
      seats: '1',
      reason: 'Departure timing changed before confirmation'
    }
  };

  const placeCoords = {
    clayton: { lat: -37.9154, lon: 145.1300 },
    melbourne: { lat: -37.8136, lon: 144.9631 },
    docklands: { lat: -37.8147, lon: 144.9475 }
  };

  const accountDefaults = {
    rider: {
      roleLabel: 'Rider',
      name: 'Daniel Rider',
      email: 'daniel.rider@example.com',
      payment: {
        method: 'Visa',
        holder: 'Daniel Rider',
        reference: '4242',
        expiry: '2027-09',
        isDefault: true
      }
    },
    driver: {
      roleLabel: 'Driver',
      name: 'Emma Driver',
      email: 'emma.driver@example.com',
      payment: {
        method: 'Mastercard',
        holder: 'Emma Driver',
        reference: '7788',
        expiry: '2027-11',
        isDefault: true
      }
    }
  };

  function getParam(name, fallback) {
    return params.get(name) || fallback;
  }

  function contextParams() {
    const next = new URLSearchParams();
    ['origin', 'originLat', 'originLon', 'destination', 'destinationLat', 'destinationLon', 'date', 'time', 'passengers', 'notes'].forEach((key) => {
      if (params.get(key)) {
        next.set(key, params.get(key));
      }
    });
    return next;
  }

  function buildHref(targetPage, extra = {}, hash = '') {
    const next = contextParams();
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        next.set(key, String(value));
      }
    });
    const query = next.toString();
    return `${targetPage}${query ? `?${query}` : ''}${hash}`;
  }

  function parseCoord(name, fallback) {
    const raw = params.get(name);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function buildTripMapUrl(defaultOrigin, defaultDestination) {
    const originLat = parseCoord('originLat', defaultOrigin.lat);
    const originLon = parseCoord('originLon', defaultOrigin.lon);
    const destinationLat = parseCoord('destinationLat', defaultDestination.lat);
    const destinationLon = parseCoord('destinationLon', defaultDestination.lon);
    const south = clamp(Math.min(originLat, destinationLat) - 0.06, -89, 89);
    const north = clamp(Math.max(originLat, destinationLat) + 0.06, -89, 89);
    const west = clamp(Math.min(originLon, destinationLon) - 0.08, -179, 179);
    const east = clamp(Math.max(originLon, destinationLon) + 0.08, -179, 179);
    const mapParams = new URLSearchParams({
      bbox: `${west},${south},${east},${north}`,
      layer: 'mapnik',
      marker: `${originLat},${originLon}`
    });
    return `https://www.openstreetmap.org/export/embed.html?${mapParams.toString()}`;
  }

  function buildSegmentMapUrl(start, end, markerAt = 'start') {
    const south = clamp(Math.min(start.lat, end.lat) - 0.06, -89, 89);
    const north = clamp(Math.max(start.lat, end.lat) + 0.06, -89, 89);
    const west = clamp(Math.min(start.lon, end.lon) - 0.08, -179, 179);
    const east = clamp(Math.max(start.lon, end.lon) + 0.08, -179, 179);
    const marker = markerAt === 'end' ? end : start;
    const mapParams = new URLSearchParams({
      bbox: `${west},${south},${east},${north}`,
      layer: 'mapnik',
      marker: `${marker.lat},${marker.lon}`
    });
    return `https://www.openstreetmap.org/export/embed.html?${mapParams.toString()}`;
  }

  function defaultDestinationFromOffer(offerId) {
    return offerId === 'liam' ? placeCoords.docklands : placeCoords.melbourne;
  }

  function hasSuitableOffer(destination) {
    return /(melbourne|cbd|central|southern cross|docklands)/i.test(destination);
  }

  function highlightTarget() {
    if (!window.location.hash) {
      return;
    }
    document.querySelectorAll('.section-highlight').forEach((node) => {
      node.classList.remove('section-highlight');
    });
    const target = document.querySelector(window.location.hash);
    if (!target) {
      return;
    }
    target.classList.add('section-highlight');
  }

  function showNotice(node, tone, message) {
    if (!node) {
      return;
    }
    const toneClass = tone === 'success'
      ? 'notice-success'
      : tone === 'danger'
        ? 'notice-danger'
        : 'notice-warning';
    node.className = `notice ${toneClass}`;
    node.textContent = message;
    node.classList.remove('is-hidden');
  }

  function formatTimestamp(isoValue) {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
      return 'recently';
    }
    return date.toLocaleString();
  }

  function setupSearchResults() {
    const from = getParam('origin', 'Clayton');
    const to = getParam('destination', 'Melbourne');
    const date = getParam('date', '2026-04-09');
    const time = getParam('time', '07:30');
    const passengers = getParam('passengers', '1');

    const summaryFields = {
      'results-from': from,
      'results-to': to,
      'results-date': date,
      'results-time': time || 'Any',
      'results-passengers': passengers
    };

    Object.entries(summaryFields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const editTripLink = document.getElementById('edit-trip-link');
    const editDestinationLink = document.getElementById('edit-destination-link');
    const failedEditTripLink = document.getElementById('failed-edit-trip-link');
    const failedStartSearchLink = document.getElementById('failed-start-search-link');
    const failedPanel = document.getElementById('matching-failed');
    const failedMessage = document.getElementById('matching-failed-message');
    const resultsPanel = Array.from(document.querySelectorAll('.panel')).find((panel) => {
      const heading = panel.querySelector('h2');
      return heading && heading.textContent.trim() === 'Matching Ride Offers';
    });
    if (editTripLink) {
      editTripLink.href = buildHref('./find-a-ride.html', {}, '#trip-date');
    }
    if (editDestinationLink) {
      editDestinationLink.href = buildHref('./find-a-ride.html', {}, '#destination');
    }
    if (failedEditTripLink) {
      failedEditTripLink.href = buildHref('./find-a-ride.html', {}, '#trip-date');
    }
    if (failedStartSearchLink) {
      failedStartSearchLink.href = './find-a-ride.html';
    }

    document.querySelectorAll('.offer-details-link').forEach((link) => {
      const offer = link.getAttribute('data-offer') || 'emma';
      link.href = buildHref('./ride-offer-details.html', { offer });
    });

    const isMatchSuccessful = hasSuitableOffer(to);
    if (!isMatchSuccessful) {
      if (resultsPanel) {
        resultsPanel.classList.add('is-hidden');
      }
      if (failedPanel) {
        failedPanel.classList.remove('is-hidden');
      }
      if (failedMessage) {
        failedMessage.textContent = `No suitable existing ride offer was found from ${from} to ${to} on ${date}.`;
      }
      return;
    }

    if (resultsPanel) {
      resultsPanel.classList.remove('is-hidden');
    }
    if (failedPanel) {
      failedPanel.classList.add('is-hidden');
    }

    const bestOffer = /docklands/i.test(to) ? 'liam' : 'emma';
    const card = document.querySelector(`[data-offer-card="${bestOffer}"]`);
    const context = document.querySelector(`[data-offer-context="${bestOffer}"]`);
    if (card) {
      card.classList.add('is-emphasis');
    }
    if (context) {
      context.textContent = 'Recommended for this search.';
    }
  }

  function setupRideOfferDetails() {
    const offerId = getParam('offer', 'emma');
    const offer = offers[offerId] || offers.emma;

    const fields = {
      'offer-driver': offer.driver,
      'offer-route': offer.route,
      'offer-departure': offer.departure,
      'offer-seats': offer.seats,
      'offer-vehicle': offer.vehicle,
      'offer-pickup': offer.pickup,
      'details-search-route': `${getParam('origin', 'Clayton')} to ${getParam('destination', 'Melbourne')}`,
      'details-search-date': getParam('date', '2026-04-09'),
      'details-search-passengers': getParam('passengers', '1')
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const passengersSelect = document.getElementById('details-passengers');
    if (passengersSelect && getParam('passengers', '1')) {
      passengersSelect.value = getParam('passengers', '1');
      Array.from(passengersSelect.options).forEach((option) => {
        option.selected = option.value === passengersSelect.value;
      });
    }

    const notes = params.get('notes');
    const message = document.getElementById('details-message');
    if (message && notes) {
      message.value = `${notes} Requesting pickup from ${offer.pickup}.`;
    }

    const backLink = document.getElementById('back-to-results-link');
    if (backLink) {
      backLink.href = buildHref('./search-results.html');
    }

    const submitLink = document.getElementById('submit-join-request-link');
    if (submitLink) {
      const seatValue = passengersSelect ? passengersSelect.value : getParam('passengers', '1');
      submitLink.href = buildHref('./my-trips.html', { offer: offerId, selectedSeats: seatValue }, '#join-request-submitted');
    }

    if (passengersSelect && submitLink) {
      passengersSelect.addEventListener('change', () => {
        submitLink.href = buildHref('./my-trips.html', { offer: offerId, selectedSeats: passengersSelect.value }, '#join-request-submitted');
      });
    }
  }

  function setupMyTrips() {
    const offerId = getParam('offer', 'emma');
    const offer = offers[offerId] || offers.emma;
    const passengers = getParam('selectedSeats', getParam('passengers', '1'));
    const decision = getParam('decision', '');
    const notificationPill = document.getElementById('notification-pill');
    const notificationTitle = document.getElementById('notification-title');
    const notificationPrimaryLink = document.getElementById('notification-primary-link');

    const joinMessage = document.getElementById('join-request-message');
    if (joinMessage) {
      joinMessage.textContent = `Your join request for ${offer.driver}'s ${offer.route} trip is now pending driver review.`;
    }

    if (notificationPill) {
      notificationPill.className = 'pill pending';
      notificationPill.textContent = 'Pending';
    }

    if (notificationTitle) {
      notificationTitle.textContent = 'Join Request Submitted';
    }

    if (decision === 'accepted') {
      if (notificationPill) {
        notificationPill.className = 'pill confirmed';
        notificationPill.textContent = 'Confirmed';
      }
      if (notificationTitle) {
        notificationTitle.textContent = 'Join Request Accepted';
      }
      if (joinMessage) {
        joinMessage.textContent = `${offer.driver} accepted your join request for ${offer.route}. The trip now appears in your confirmed records.`;
      }
    } else if (decision === 'rejected') {
      if (notificationPill) {
        notificationPill.className = 'pill rejected';
        notificationPill.textContent = 'Rejected';
      }
      if (notificationTitle) {
        notificationTitle.textContent = 'Join Request Rejected';
      }
      if (joinMessage) {
        joinMessage.textContent = `${offer.driver} rejected your join request for ${offer.route}. The rejected request remains visible in your trip records.`;
      }
    }

    if (notificationPrimaryLink) {
      notificationPrimaryLink.href = decision === 'accepted' || decision === 'rejected'
        ? './my-trips.html#completed'
        : './my-trips.html#in-progress';
    }

    const tripFields = {
      'primary-order-route': offer.route,
      'primary-order-status': decision === 'accepted' ? 'Confirmed by driver' : decision === 'rejected' ? 'Rejected by driver' : 'Pending driver decision'
    };

    Object.entries(tripFields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const primaryCard = document.getElementById('primary-order-card');
    if (primaryCard) {
      const nextOrderType = decision === 'accepted' || decision === 'rejected' ? 'completed' : 'in-progress';
      primaryCard.setAttribute('data-order-type', nextOrderType);
    }
    if (decision === 'accepted' || decision === 'rejected') {
      primaryCard?.classList.add('is-emphasis');
    }

    const primaryOrderPill = document.getElementById('primary-order-pill');
    if (primaryOrderPill) {
      if (decision === 'accepted') {
        primaryOrderPill.className = 'pill confirmed';
        primaryOrderPill.textContent = 'Completed';
      } else if (decision === 'rejected') {
        primaryOrderPill.className = 'pill rejected';
        primaryOrderPill.textContent = 'Rejected';
      } else {
        primaryOrderPill.className = 'pill pending';
        primaryOrderPill.textContent = 'In Progress';
      }
    }

    const record501Link = document.getElementById('record-501-link');
    if (record501Link) {
      record501Link.href = buildHref('./rider-record-501-details.html', {
        offer: offerId,
        selectedSeats: passengers,
        decision: decision || 'pending'
      });
    }
    const record601Link = document.getElementById('record-601-link');
    if (record601Link) {
      record601Link.href = buildHref('./rider-record-601-details.html', {
        offer: offerId
      });
    }

    const chipLinks = Array.from(document.querySelectorAll('.trip-filter-link'));
    const orderCards = Array.from(document.querySelectorAll('[data-order-type]'));

    function resolveFilterFromHash() {
      const hash = window.location.hash || '#all';
      if (hash === '#join-request-submitted' || hash === '#in-progress') {
        return 'in-progress';
      }
      if (hash === '#completed') {
        return 'completed';
      }
      return 'all';
    }

    function applyTripsFilter(filter) {
      chipLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.filter === filter);
      });

      orderCards.forEach((card) => {
        const kind = card.getAttribute('data-order-type');
        card.classList.toggle('is-hidden', filter !== 'all' && kind !== filter);
      });
    }

    function refreshTripsFilter() {
      applyTripsFilter(resolveFilterFromHash());
    }

    refreshTripsFilter();

    chipLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const filter = link.dataset.filter || 'all';
        applyTripsFilter(filter);
      });
    });

    window.addEventListener('hashchange', () => {
      refreshTripsFilter();
      highlightTarget();
    });

    if (window.location.hash === '#all') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }

  function setupRiderRecord501Details() {
    const offerId = getParam('offer', 'emma');
    const offer = offers[offerId] || offers.emma;
    const decision = getParam('decision', 'pending');
    const seats = getParam('selectedSeats', getParam('passengers', '1'));
    const status = decision === 'accepted'
      ? 'Confirmed by driver'
      : decision === 'rejected'
        ? 'Rejected by driver'
        : 'Pending driver decision';

    const fields = {
      'rider-record-501-driver': offer.driver,
      'rider-record-501-route': offer.route,
      'rider-record-501-seats': seats,
      'rider-record-501-status': status
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const pill = document.getElementById('rider-record-501-pill');
    if (pill) {
      if (decision === 'accepted') {
        pill.className = 'pill confirmed';
        pill.textContent = 'Completed';
      } else if (decision === 'rejected') {
        pill.className = 'pill rejected';
        pill.textContent = 'Rejected';
      } else {
        pill.className = 'pill pending';
        pill.textContent = 'In Progress';
      }
    }

    const mapFrame = document.getElementById('rider-record-501-map');
    if (mapFrame) {
      mapFrame.src = buildTripMapUrl(placeCoords.clayton, defaultDestinationFromOffer(offerId));
    }

    const backLink = document.getElementById('rider-record-501-back-link');
    if (backLink) {
      backLink.href = buildHref('./my-trips.html', {
        offer: offerId,
        selectedSeats: seats,
        decision
      }, '#trip-records');
    }
  }

  function setupRiderRecord601Details() {
    const offerId = getParam('offer', 'emma');
    const offer = offers[offerId] || offers.emma;
    const fields = {
      'rider-record-601-driver': offer.driver,
      'rider-record-601-route': offer.route
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const mapFrame = document.getElementById('rider-record-601-map');
    if (mapFrame) {
      mapFrame.src = buildTripMapUrl(placeCoords.clayton, defaultDestinationFromOffer(offerId));
    }

    const backLink = document.getElementById('rider-record-601-back-link');
    if (backLink) {
      backLink.href = buildHref('./my-trips.html', { offer: offerId }, '#trip-records');
    }
  }

  function setupAccountSettings(role) {
    const account = accountDefaults[role] || accountDefaults.rider;
    const passwordStorageKey = `nl_${role}_password_meta`;
    const paymentStorageKey = `nl_${role}_payment_pref`;

    const roleLabel = document.getElementById('settings-role-label');
    const userName = document.getElementById('settings-user-name');
    const userEmail = document.getElementById('settings-user-email');
    const passwordSummary = document.getElementById('settings-password-summary');
    const paymentSummary = document.getElementById('settings-payment-summary');

    if (roleLabel) {
      roleLabel.textContent = account.roleLabel;
    }
    if (userName) {
      userName.textContent = account.name;
    }
    if (userEmail) {
      userEmail.textContent = account.email;
    }

    let storedPasswordMeta = null;
    try {
      const rawPasswordMeta = window.localStorage.getItem(passwordStorageKey);
      storedPasswordMeta = rawPasswordMeta ? JSON.parse(rawPasswordMeta) : null;
    } catch (_error) {
      storedPasswordMeta = null;
    }
    if (passwordSummary) {
      passwordSummary.textContent = storedPasswordMeta?.updatedAt
        ? `Password reset saved on ${formatTimestamp(storedPasswordMeta.updatedAt)}`
        : 'Default demo password in use';
    }

    const defaultPayment = { ...account.payment };
    let storedPayment = null;
    try {
      const rawPayment = window.localStorage.getItem(paymentStorageKey);
      storedPayment = rawPayment ? JSON.parse(rawPayment) : null;
    } catch (_error) {
      storedPayment = null;
    }
    const paymentData = storedPayment || defaultPayment;
    if (paymentSummary) {
      paymentSummary.textContent = `${paymentData.method} (${paymentData.reference})${paymentData.isDefault ? ' set as default' : ''}`;
    }

    const passwordForm = document.getElementById('settings-password-form');
    const passwordStatus = document.getElementById('settings-password-status');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentPassword = (document.getElementById('settings-current-password') || {}).value || '';
        const newPassword = (document.getElementById('settings-new-password') || {}).value || '';
        const confirmPassword = (document.getElementById('settings-confirm-password') || {}).value || '';

        if (!currentPassword || !newPassword || !confirmPassword) {
          showNotice(passwordStatus, 'danger', 'Please complete all password fields.');
          return;
        }
        if (newPassword.length < 6) {
          showNotice(passwordStatus, 'danger', 'New password must be at least 6 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          showNotice(passwordStatus, 'danger', 'New password and confirmation do not match.');
          return;
        }
        if (newPassword === currentPassword) {
          showNotice(passwordStatus, 'warning', 'New password should be different from current password.');
          return;
        }

        const meta = { updatedAt: new Date().toISOString() };
        window.localStorage.setItem(passwordStorageKey, JSON.stringify(meta));
        if (passwordSummary) {
          passwordSummary.textContent = `Password reset saved on ${formatTimestamp(meta.updatedAt)}`;
        }
        showNotice(passwordStatus, 'success', 'Password reset saved for this demo account.');
        passwordForm.reset();
      });
    }

    const paymentMethod = document.getElementById('settings-payment-method');
    const paymentHolder = document.getElementById('settings-payment-holder');
    const paymentReference = document.getElementById('settings-payment-reference');
    const paymentExpiry = document.getElementById('settings-payment-expiry');
    const paymentDefault = document.getElementById('settings-payment-default');
    const paymentForm = document.getElementById('settings-payment-form');
    const paymentStatus = document.getElementById('settings-payment-status');

    if (paymentMethod) {
      paymentMethod.value = paymentData.method;
    }
    if (paymentHolder) {
      paymentHolder.value = paymentData.holder;
    }
    if (paymentReference) {
      paymentReference.value = paymentData.reference;
    }
    if (paymentExpiry) {
      paymentExpiry.value = paymentData.expiry;
    }
    if (paymentDefault) {
      paymentDefault.checked = Boolean(paymentData.isDefault);
    }

    if (paymentForm) {
      paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nextMethod = paymentMethod ? paymentMethod.value : '';
        const nextHolder = paymentHolder ? paymentHolder.value.trim() : '';
        const nextReference = paymentReference ? paymentReference.value.trim() : '';
        const nextExpiry = paymentExpiry ? paymentExpiry.value : '';
        const nextIsDefault = paymentDefault ? paymentDefault.checked : true;

        if (!nextMethod || !nextHolder || !nextReference || !nextExpiry) {
          showNotice(paymentStatus, 'danger', 'Please complete all payment preference fields.');
          return;
        }
        if (nextReference.length < 4) {
          showNotice(paymentStatus, 'warning', 'Reference should include at least 4 characters.');
          return;
        }

        const nextPayment = {
          method: nextMethod,
          holder: nextHolder,
          reference: nextReference,
          expiry: nextExpiry,
          isDefault: nextIsDefault
        };
        window.localStorage.setItem(paymentStorageKey, JSON.stringify(nextPayment));
        if (paymentSummary) {
          paymentSummary.textContent = `${nextPayment.method} (${nextPayment.reference})${nextPayment.isDefault ? ' set as default' : ''}`;
        }
        showNotice(paymentStatus, 'success', 'Payment preference saved for this demo account.');
      });
    }
  }

  function setupDriverHub() {
    document.querySelectorAll('.driver-review-decision-link').forEach((link) => {
      const nextRequest = link.getAttribute('data-request') || '501';
      const nextRider = link.getAttribute('data-rider') || 'Daniel Rider';
      const nextDriver = link.getAttribute('data-driver') || 'Emma Driver';
      const nextRoute = link.getAttribute('data-route') || 'Clayton to Melbourne CBD';
      const nextSeats = link.getAttribute('data-seats') || '1';
      const nextAvailable = link.getAttribute('data-available') || '2';
      const nextDecision = link.getAttribute('data-decision') || 'accepted';
      link.href = buildHref('./driver-decision-outcome.html', {
        request: nextRequest,
        rider: nextRider,
        driver: nextDriver,
        route: nextRoute,
        seats: nextSeats,
        available: nextAvailable,
        decision: nextDecision
      });
    });

    document.querySelectorAll('.driver-accepted-details-link').forEach((link) => {
      link.href = buildHref('./driver-accepted-details.html', {
        request: link.getAttribute('data-request') || '501',
        rider: link.getAttribute('data-rider') || 'Daniel Rider',
        driver: link.getAttribute('data-driver') || 'Emma Driver',
        route: link.getAttribute('data-route') || 'Clayton to Melbourne CBD',
        seats: link.getAttribute('data-seats') || '1',
        meeting: link.getAttribute('data-meeting') || 'Clayton Station Gate 2'
      });
    });

    document.querySelectorAll('.driver-workflow-link').forEach((link) => {
      const requestId = link.getAttribute('data-request') || '501';
      const record = acceptedDriverRecords[requestId] || acceptedDriverRecords['501'];
      link.href = buildHref('./driver-trip-workflow.html', {
        request: requestId,
        rider: link.getAttribute('data-rider') || record.rider,
        driver: link.getAttribute('data-driver') || record.driver,
        route: link.getAttribute('data-route') || record.route,
        seats: link.getAttribute('data-seats') || record.seats,
        meeting: link.getAttribute('data-meeting') || record.meeting,
        destination: record.destination,
        stage: 'ready'
      });
    });

    document.querySelectorAll('.driver-rejected-details-link').forEach((link) => {
      link.href = buildHref('./driver-rejected-details.html', {
        request: link.getAttribute('data-request') || '498',
        rider: link.getAttribute('data-rider') || 'Mia Santos',
        driver: link.getAttribute('data-driver') || 'Liam Driver',
        route: link.getAttribute('data-route') || 'Clayton to Docklands',
        seats: link.getAttribute('data-seats') || '1',
        reason: link.getAttribute('data-reason') || 'Vehicle already full at decision time'
      });
    });
  }

  function setupDriverAcceptedDetails() {
    const requestId = getParam('request', '501');
    const record = acceptedDriverRecords[requestId] || acceptedDriverRecords['501'];
    const fields = {
      'accepted-detail-request': `#${record.request}`,
      'accepted-detail-rider': getParam('rider', record.rider),
      'accepted-detail-driver': getParam('driver', record.driver),
      'accepted-detail-route': getParam('route', record.route),
      'accepted-detail-seats': getParam('seats', record.seats),
      'accepted-detail-meeting': getParam('meeting', record.meeting)
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const backLink = document.getElementById('accepted-detail-back-link');
    if (backLink) {
      backLink.href = './driver-hub.html#accepted-records';
    }

    const workflowLink = document.getElementById('accepted-detail-workflow-link');
    if (workflowLink) {
      workflowLink.href = buildHref('./driver-trip-workflow.html', {
        request: record.request,
        rider: getParam('rider', record.rider),
        driver: getParam('driver', record.driver),
        route: getParam('route', record.route),
        seats: getParam('seats', record.seats),
        meeting: getParam('meeting', record.meeting),
        destination: record.destination,
        stage: 'ready'
      });
    }
  }

  function setupDriverRejectedDetails() {
    const requestId = getParam('request', '498');
    const record = rejectedDriverRecords[requestId] || rejectedDriverRecords['498'];
    const fields = {
      'rejected-detail-request': `#${record.request}`,
      'rejected-detail-rider': getParam('rider', record.rider),
      'rejected-detail-driver': getParam('driver', record.driver),
      'rejected-detail-route': getParam('route', record.route),
      'rejected-detail-seats': getParam('seats', record.seats),
      'rejected-detail-reason': getParam('reason', record.reason)
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const backLink = document.getElementById('rejected-detail-back-link');
    if (backLink) {
      backLink.href = './driver-hub.html#rejected-records';
    }
  }

  function setupDriverDecisionOutcome() {
    const requestId = getParam('request', '501');
    const rider = getParam('rider', 'Daniel Rider');
    const driver = getParam('driver', 'Emma Driver');
    const route = getParam('route', 'Clayton to Melbourne CBD');
    const seats = getParam('seats', '1');
    const available = getParam('available', '2');
    const decision = getParam('decision', 'accepted');
    const isAccepted = decision === 'accepted';

    const pill = document.getElementById('decision-outcome-pill');
    const title = document.getElementById('decision-outcome-title');
    const message = document.getElementById('decision-outcome-message');
    const backLink = document.getElementById('decision-back-link');

    if (pill) {
      pill.className = isAccepted ? 'pill confirmed' : 'pill rejected';
      pill.textContent = isAccepted ? 'Accepted' : 'Rejected';
    }
    if (title) {
      title.textContent = isAccepted ? 'Request Accepted' : 'Request Rejected';
    }
    if (message) {
      message.textContent = isAccepted
        ? `Join Request #${requestId} from ${rider} was accepted. The seat allocation has been confirmed for ${route}.`
        : `Join Request #${requestId} from ${rider} was rejected. No ride match was created for ${route}.`;
    }

    const fields = {
      'decision-request-id': `#${requestId}`,
      'decision-rider': rider,
      'decision-driver': driver,
      'decision-route': route,
      'decision-seats': seats,
      'decision-available': available,
      'decision-next-state': isAccepted
        ? 'This request now appears in the accepted record list.'
        : 'This request now appears in the rejected record list.'
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const destinationHash = isAccepted ? '#accepted-records' : '#rejected-records';
    if (backLink) {
      backLink.href = `./driver-hub.html${destinationHash}`;
    }

    const countdownNode = document.getElementById('decision-countdown');
    let remaining = 5;
    if (countdownNode) {
      countdownNode.textContent = String(remaining);
    }

    const timer = window.setInterval(() => {
      remaining -= 1;
      if (countdownNode) {
        countdownNode.textContent = String(Math.max(remaining, 0));
      }
      if (remaining <= 0) {
        window.clearInterval(timer);
        window.location.href = `./driver-hub.html${destinationHash}`;
      }
    }, 1000);
  }

  function setupDriverTripWorkflow() {
    const requestId = getParam('request', '501');
    const record = acceptedDriverRecords[requestId] || acceptedDriverRecords['501'];
    const validStages = ['ready', 'pickup_departed', 'pickup_arrived', 'destination_departed', 'completed'];
    const stage = getParam('stage', 'ready');
    if (!validStages.includes(stage)) {
      window.location.href = buildHref('./driver-trip-workflow.html', {
        request: record.request,
        rider: getParam('rider', record.rider),
        driver: getParam('driver', record.driver),
        route: getParam('route', record.route),
        seats: getParam('seats', record.seats),
        meeting: getParam('meeting', record.meeting),
        destination: getParam('destination', record.destination),
        stage: 'ready'
      });
      return;
    }

    const riderName = getParam('rider', record.rider);
    const driverName = getParam('driver', record.driver);
    const routeName = getParam('route', record.route);
    const seatsValue = getParam('seats', record.seats);
    const meetingPoint = getParam('meeting', record.meeting);
    const destinationName = getParam('destination', record.destination);

    const fields = {
      'workflow-request-id': `#${record.request}`,
      'workflow-rider': riderName,
      'workflow-driver': driverName,
      'workflow-route': routeName,
      'workflow-pickup': meetingPoint,
      'workflow-destination': destinationName
    };

    Object.entries(fields).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) {
        node.textContent = value;
      }
    });

    const statusPill = document.getElementById('workflow-status-pill');
    const statusText = document.getElementById('workflow-status-text');
    const stepStatus = document.getElementById('workflow-step-status');
    const segmentLabel = document.getElementById('workflow-segment-label');
    const mapTitle = document.getElementById('workflow-map-title');
    const mapSubtitle = document.getElementById('workflow-map-subtitle');
    const mapCaption = document.getElementById('workflow-map-caption');
    const mapFrame = document.getElementById('workflow-map-main');
    const routePanel = document.getElementById('workflow-route-panel');
    const completedPanel = document.getElementById('workflow-complete-panel');
    const nextStageLink = document.getElementById('workflow-next-stage-link');
    const completeBackLink = document.getElementById('workflow-complete-back-link');

    function workflowHref(nextStage) {
      return buildHref('./driver-trip-workflow.html', {
        request: record.request,
        rider: riderName,
        driver: driverName,
        route: routeName,
        seats: seatsValue,
        meeting: meetingPoint,
        destination: destinationName,
        stage: nextStage
      });
    }

    const stageConfig = {
      ready: {
        pillClass: 'pill pending',
        pillText: 'Ready',
        status: 'Ready to begin segment 1: depart to the pickup point.',
        step: 'Waiting to depart',
        segment: 'Segment 1: Driver to Pickup',
        mapNote: 'OpenStreetMap preview for travelling from current driver location to pickup.',
        mapSource: buildSegmentMapUrl(
          { lat: record.driverStartLat, lon: record.driverStartLon },
          { lat: record.pickupLat, lon: record.pickupLon },
          'start'
        ),
        nextLabel: 'Depart to Pickup',
        nextStage: 'pickup_departed'
      },
      pickup_departed: {
        pillClass: 'pill pending',
        pillText: 'Segment 1 Active',
        status: 'Driver is on the way to pickup.',
        step: 'Travelling to pickup',
        segment: 'Segment 1: Driver to Pickup',
        mapNote: 'OpenStreetMap preview now marks the pickup endpoint.',
        mapSource: buildSegmentMapUrl(
          { lat: record.driverStartLat, lon: record.driverStartLon },
          { lat: record.pickupLat, lon: record.pickupLon },
          'end'
        ),
        nextLabel: 'Arrived at Pickup',
        nextStage: 'pickup_arrived'
      },
      pickup_arrived: {
        pillClass: 'pill pending',
        pillText: 'At Pickup',
        status: 'Pickup reached. Prepare to depart for destination.',
        step: 'Ready for destination segment',
        segment: 'Segment 2: Pickup to Destination',
        mapNote: 'OpenStreetMap preview for travelling from pickup to destination.',
        mapSource: buildSegmentMapUrl(
          { lat: record.pickupLat, lon: record.pickupLon },
          { lat: record.destinationLat, lon: record.destinationLon },
          'start'
        ),
        nextLabel: 'Depart to Destination',
        nextStage: 'destination_departed'
      },
      destination_departed: {
        pillClass: 'pill pending',
        pillText: 'Segment 2 Active',
        status: 'Driver is travelling to the destination.',
        step: 'Travelling to destination',
        segment: 'Segment 2: Pickup to Destination',
        mapNote: 'OpenStreetMap preview now marks the destination endpoint.',
        mapSource: buildSegmentMapUrl(
          { lat: record.pickupLat, lon: record.pickupLon },
          { lat: record.destinationLat, lon: record.destinationLon },
          'end'
        ),
        nextLabel: 'Arrived at Destination and Complete',
        nextStage: 'completed'
      },
      completed: {
        pillClass: 'pill confirmed',
        pillText: 'Completed',
        status: 'Destination reached. This accepted trip workflow is now complete.',
        step: 'Trip completed',
        segment: 'Completed',
        mapNote: 'Final OpenStreetMap state for completed trip.',
        mapSource: buildSegmentMapUrl(
          { lat: record.pickupLat, lon: record.pickupLon },
          { lat: record.destinationLat, lon: record.destinationLon },
          'end'
        ),
        nextLabel: '',
        nextStage: ''
      }
    };

    const current = stageConfig[stage];
    if (!current) {
      return;
    }

    if (statusPill) {
      statusPill.className = current.pillClass;
      statusPill.textContent = current.pillText;
    }
    if (statusText) {
      statusText.textContent = current.status;
    }
    if (stepStatus) {
      stepStatus.textContent = current.step;
    }
    if (segmentLabel) {
      segmentLabel.textContent = current.segment;
    }
    if (mapTitle) {
      mapTitle.textContent = current.segment === 'Completed' ? 'Final Route State' : current.segment;
    }
    if (mapSubtitle) {
      mapSubtitle.textContent = current.mapNote;
    }
    if (mapCaption) {
      mapCaption.textContent = current.mapNote;
    }
    if (mapFrame) {
      mapFrame.src = current.mapSource;
    }

    if (completedPanel) {
      completedPanel.classList.toggle('is-hidden', stage !== 'completed');
    }
    if (routePanel) {
      routePanel.classList.toggle('is-hidden', stage === 'completed');
    }

    if (nextStageLink) {
      if (stage === 'completed') {
        nextStageLink.classList.add('is-hidden');
      } else {
        nextStageLink.classList.remove('is-hidden');
        nextStageLink.textContent = current.nextLabel;
        nextStageLink.href = workflowHref(current.nextStage);
      }
    }

    if (completeBackLink) {
      completeBackLink.href = './driver-hub.html#accepted-records';
    }
  }

  if (page === 'search-results.html') {
    setupSearchResults();
  }
  if (page === 'ride-offer-details.html') {
    setupRideOfferDetails();
  }
  if (page === 'my-trips.html') {
    setupMyTrips();
  }
  if (page === 'driver-hub.html') {
    setupDriverHub();
  }
  if (page === 'driver-accepted-details.html') {
    setupDriverAcceptedDetails();
  }
  if (page === 'driver-rejected-details.html') {
    setupDriverRejectedDetails();
  }
  if (page === 'driver-decision-outcome.html') {
    setupDriverDecisionOutcome();
  }
  if (page === 'driver-trip-workflow.html') {
    setupDriverTripWorkflow();
  }
  if (page === 'rider-record-501-details.html') {
    setupRiderRecord501Details();
  }
  if (page === 'rider-record-601-details.html') {
    setupRiderRecord601Details();
  }
  if (page === 'rider-settings.html') {
    setupAccountSettings('rider');
  }
  if (page === 'driver-settings.html') {
    setupAccountSettings('driver');
  }

  if (page === 'my-trips.html' || page === 'driver-hub.html') {
    highlightTarget();
    window.addEventListener('hashchange', highlightTarget);
  }
});
