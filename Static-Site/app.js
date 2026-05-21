(function () {
  const APP_ROOT = document.getElementById("app");
  const DB_KEY = "neighbourlink.static.site.db.v1";
  const SESSION_KEY = "neighbourlink.static.site.session.v1";
  const DEMO_NOW = new Date("2026-04-09T06:00:00");
  const LOCATION_OPTIONS = [
    "Clayton",
    "Melbourne",
    "Docklands",
    "Box Hill",
    "Southbank",
    "Glen Waverley",
    "Richmond",
    "Carlton",
  ];

  const PLACE_SYNONYMS = {
    clayton: ["clayton", "monash", "monash university"],
    melbourne: ["melbourne", "city", "city centre", "city center", "cbd"],
    docklands: ["docklands", "harbour", "harbor"],
    "box hill": ["box hill", "boxhill"],
    southbank: ["southbank", "arts centre", "arts center"],
    richmond: ["richmond"],
    carlton: ["carlton"],
    "glen waverley": ["glen waverley", "glen"],
  };

  const tutorialTracks = {
    RIDER: {
      label: "Rider Journey",
      intro: "Use one combined rider entry, search first, and automatically fall back to a one-off request when the trip is not an immediate ride-match case.",
      checklist: [
        "Open Find a Ride and complete Origin, Destination, Trip Date.",
        "Use a same-day trip within three hours to view matching ride offers.",
        "Use a later trip or leave time blank to auto-create a one-off request.",
        "Track all outcomes in My Trips and complete payment from a confirmed card."
      ],
      guided: [
        "Step 1: Search from Clayton to Melbourne on 2026-04-09 at 08:30 to surface live ride offers.",
        "Step 2: Open offer details, review driver trust cues, and submit a join request.",
        "Step 3: Return to My Trips to watch pending, confirmed, and closed outcomes in a single card stream.",
        "Step 4: Review driver offers for one-off requests and accept one to create a confirmed ride match."
      ],
      tasks: [
        "Use the quick login card for Maria Rider.",
        "Submit one new join request and one auto-created one-off request.",
        "Open Payment from a confirmed match and complete the card form."
      ],
      demo: [
        "00:00 Log in as Maria Rider.",
        "00:40 Search Clayton to Melbourne for the demo clock window.",
        "01:30 Submit a join request and point to trust + seats.",
        "02:30 Show auto-request fallback for a later trip.",
        "03:20 Review driver offers from My Trips.",
        "04:00 Complete the payment page."
      ],
      issues: [
        {
          title: "No search results",
          cause: "The trip may be more than three hours after the demo clock or no exact route matches exist.",
          fix: "Use the demo path Clayton to Melbourne on 2026-04-09 at 08:30, or continue with the auto-created request flow."
        },
        {
          title: "Join request still pending",
          cause: "A driver decision has not been made yet.",
          fix: "Switch to the driver account and accept the pending request from Driver Hub."
        }
      ],
      quiz: [
        {
          id: "r1",
          question: "When does the merged rider flow search live ride offers?",
          options: ["Only when a valid exact time is given and the trip is within three hours.", "Every time, no matter what."],
          answer: 0
        },
        {
          id: "r2",
          question: "Where do riders review pending, confirmed, and closed items?",
          options: ["My Trips", "Account Settings"],
          answer: 0
        }
      ]
    },
    DRIVER: {
      label: "Driver Operations",
      intro: "Drivers now focus on decisions and responses, not self-publishing ride offers. The static demo keeps the hub centred on acceptance and one-off response handling.",
      checklist: [
        "Review at least one pending join request.",
        "Accept or reject with a meeting point when needed.",
        "Respond to an open one-off request with seats and a meeting point.",
        "Verify notifications or history after a rider accepts an offer."
      ],
      guided: [
        "Step 1: Log in as Emma Driver and open Driver Hub.",
        "Step 2: Accept a pending join request and enter a meeting point.",
        "Step 3: Respond to an open one-off rider request with a seat proposal.",
        "Step 4: Inspect history cards for one-off offers you already submitted."
      ],
      tasks: [
        "Use Driver Hub to resolve a pending rider request.",
        "Respond to one open request with a clear meeting point.",
        "Confirm that rider-facing notifications update after driver actions."
      ],
      demo: [
        "00:00 Log in as Emma Driver.",
        "00:35 Review the pending join queue.",
        "01:20 Accept with meeting point details.",
        "02:20 Submit a one-off response.",
        "03:00 Mention verified licence and seat-capacity checks."
      ],
      issues: [
        {
          title: "Cannot respond to a one-off request",
          cause: "There may already be a pending offer from this driver for that request.",
          fix: "Open another request or inspect One-Off Offer History to review the existing response."
        },
        {
          title: "Accept action blocked",
          cause: "The meeting point is blank.",
          fix: "Enter a meeting point before submitting an accepted decision."
        }
      ],
      quiz: [
        {
          id: "d1",
          question: "What is the driver’s main action in UC2?",
          options: ["Review and decide a join request", "Publish a new ride offer from Driver Hub"],
          answer: 0
        }
      ]
    }
  };

  const ui = {
    loginMessage: "",
    registerMessage: "",
    registerRole: "RIDER",
    findStep: "ORIGIN",
    findDraft: createDefaultFindDraft(),
    flash: "",
    tutorialTrack: "RIDER",
    tutorialMode: "GUIDED",
    tutorialAnswers: {},
    tutorialScoreMessage: "",
    lastConfirmedMatchId: null,
    rideConfirmed: null,
    autoRequestKey: "",
    autoRequestId: null
  };

  let db = loadDatabase();
  let session = loadSession();

  function createDefaultFindDraft() {
    return {
      origin: "Clayton",
      destination: "Melbourne",
      tripDate: "2026-04-09",
      departureTime: "08:30",
      timeFlexHours: "1",
      passengerCount: "1",
      notes: "Weekday commute demo"
    };
  }

  function seedDatabase() {
    return {
      users: [
        {
          id: 1,
          role: "RIDER",
          fullName: "Maria Gomez",
          email: "maria.rider@example.com",
          password: "demo1234",
          suburb: "Box Hill",
          phone: "0400000004",
          accountStatus: "ACTIVE"
        },
        {
          id: 2,
          role: "RIDER",
          fullName: "Daniel Chen",
          email: "daniel.rider@example.com",
          password: "123456",
          suburb: "Clayton",
          phone: "0400000003",
          accountStatus: "ACTIVE"
        },
        {
          id: 11,
          role: "DRIVER",
          fullName: "Emma Lee",
          email: "emma.driver@example.com",
          password: "demo1234",
          suburb: "Clayton",
          phone: "0400000001",
          accountStatus: "ACTIVE",
          licenceVerifiedStatus: "VERIFIED",
          vehicleInfo: "Toyota Corolla - White",
          spareSeatCapacity: 3,
          verificationNotes: "Licence and rego verified for static demo."
        },
        {
          id: 12,
          role: "DRIVER",
          fullName: "Liam Patel",
          email: "liam.driver@example.com",
          password: "demo1234",
          suburb: "Box Hill",
          phone: "0400000002",
          accountStatus: "ACTIVE",
          licenceVerifiedStatus: "VERIFIED",
          vehicleInfo: "Honda Civic - Blue",
          spareSeatCapacity: 2,
          verificationNotes: "Community sports club driver."
        },
        {
          id: 13,
          role: "DRIVER",
          fullName: "Sophie Martin",
          email: "sophie.driver@example.com",
          password: "demo1234",
          suburb: "Glen Waverley",
          phone: "0400000007",
          accountStatus: "ACTIVE",
          licenceVerifiedStatus: "VERIFIED",
          vehicleInfo: "Mazda CX-5 - Silver",
          spareSeatCapacity: 4,
          verificationNotes: "Family-friendly demo driver."
        }
      ],
      rideOffers: [
        {
          id: 101,
          driverId: 11,
          origin: "Clayton",
          originAddress: "Clayton Railway Station",
          originSuburb: "Clayton",
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          departureDate: "2026-04-09",
          departureTime: "08:30",
          availableSeats: 2,
          status: "OPEN"
        },
        {
          id: 102,
          driverId: 12,
          origin: "Box Hill",
          originAddress: "Box Hill Library",
          originSuburb: "Box Hill",
          destination: "Docklands",
          destinationAddress: "Docklands Community Hub",
          destinationSuburb: "Docklands",
          departureDate: "2026-04-09",
          departureTime: "08:45",
          availableSeats: 1,
          status: "OPEN"
        },
        {
          id: 103,
          driverId: 11,
          origin: "Clayton",
          originAddress: "Monash University Clayton Campus",
          originSuburb: "Clayton",
          destination: "Docklands",
          destinationAddress: "Docklands Library",
          destinationSuburb: "Docklands",
          departureDate: "2026-04-09",
          departureTime: "09:15",
          availableSeats: 1,
          status: "OPEN"
        },
        {
          id: 104,
          driverId: 13,
          origin: "Glen Waverley",
          originAddress: "Glen Waverley Station",
          originSuburb: "Glen Waverley",
          destination: "Clayton",
          destinationAddress: "Monash University Clayton Campus",
          destinationSuburb: "Clayton",
          departureDate: "2026-04-10",
          departureTime: "07:40",
          availableSeats: 3,
          status: "OPEN"
        }
      ],
      joinRequests: [
        {
          id: 301,
          rideOfferId: 101,
          riderId: 2,
          requestedSeats: 1,
          status: "ACCEPTED",
          requestDateTime: "2026-04-09T06:05:00",
          meetingPoint: "Clayton Station Gate 2"
        },
        {
          id: 302,
          rideOfferId: 103,
          riderId: 2,
          requestedSeats: 1,
          status: "PENDING",
          requestDateTime: "2026-04-09T06:20:00",
          meetingPoint: ""
        },
        {
          id: 303,
          rideOfferId: 102,
          riderId: 1,
          requestedSeats: 1,
          status: "REJECTED",
          requestDateTime: "2026-04-09T06:10:00",
          meetingPoint: ""
        }
      ],
      rideRequests: [
        {
          id: 201,
          riderId: 1,
          origin: "Box Hill",
          originAddress: "Box Hill Library",
          originSuburb: "Box Hill",
          destination: "Docklands",
          destinationAddress: "Docklands Community Hub",
          destinationSuburb: "Docklands",
          tripDate: "2026-04-10",
          tripTime: "10:00",
          passengerCount: 2,
          notes: "Weekend event travel",
          status: "OPEN",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T06:15:00"
        },
        {
          id: 202,
          riderId: 2,
          origin: "Clayton",
          originAddress: "Clayton Railway Station",
          originSuburb: "Clayton",
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          tripDate: "2026-04-09",
          tripTime: "08:15",
          passengerCount: 1,
          notes: "Work commute backup",
          status: "MATCHED",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T05:55:00"
        },
        {
          id: 203,
          riderId: 1,
          origin: "Clayton",
          originAddress: "Clayton Railway Station",
          originSuburb: "Clayton",
          destination: "Southbank",
          destinationAddress: "Southbank Arts Centre",
          destinationSuburb: "Southbank",
          tripDate: "2026-04-09",
          tripTime: "15:30",
          passengerCount: 1,
          notes: "Late afternoon backup",
          status: "CLOSED",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T06:00:00"
        },
        {
          id: 204,
          riderId: 1,
          origin: "Clayton",
          originAddress: "Clayton Railway Station",
          originSuburb: "Clayton",
          destination: "Docklands",
          destinationAddress: "Docklands Library",
          destinationSuburb: "Docklands",
          tripDate: "2026-04-09",
          tripTime: "17:00",
          passengerCount: 1,
          notes: "Harbour event backup",
          status: "OPEN",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T06:40:00"
        }
      ],
      rideRequestOffers: [
        {
          id: 501,
          rideRequestId: 201,
          driverId: 11,
          proposedSeats: 2,
          meetingPoint: "Box Hill Library Main Entry",
          status: "PENDING",
          createdAt: "2026-04-09T06:30:00"
        },
        {
          id: 502,
          rideRequestId: 202,
          driverId: 12,
          proposedSeats: 1,
          meetingPoint: "Melbourne Central Clock",
          status: "ACCEPTED",
          createdAt: "2026-04-09T06:00:00"
        },
        {
          id: 503,
          rideRequestId: 201,
          driverId: 12,
          proposedSeats: 2,
          meetingPoint: "Box Hill Station Bus Bay",
          status: "PENDING",
          createdAt: "2026-04-09T06:35:00"
        }
      ],
      rideMatches: [
        {
          id: 401,
          driverId: 11,
          riderId: 2,
          rideOfferId: 101,
          rideRequestId: null,
          acceptedJoinRequestId: 301,
          acceptedRideRequestOfferId: null,
          confirmedDateTime: "2026-04-09T06:25:00",
          meetingPoint: "Clayton Station Gate 2",
          tripStatus: "CONFIRMED",
          paymentStatus: "UNPAID"
        },
        {
          id: 402,
          driverId: 12,
          riderId: 2,
          rideOfferId: null,
          rideRequestId: 202,
          acceptedJoinRequestId: null,
          acceptedRideRequestOfferId: 502,
          confirmedDateTime: "2026-04-09T06:05:00",
          meetingPoint: "Melbourne Central Clock",
          tripStatus: "CONFIRMED",
          paymentStatus: "PAID"
        }
      ],
      ratings: [
        { id: 601, ratedUserId: 11, raterUserId: 2, score: 5, comment: "Very reliable and friendly.", createdDate: "2026-04-08T09:00:00" },
        { id: 602, ratedUserId: 11, raterUserId: 1, score: 4, comment: "Safe driving and clear pickup.", createdDate: "2026-04-08T18:20:00" },
        { id: 603, ratedUserId: 12, raterUserId: 2, score: 4, comment: "Good communication.", createdDate: "2026-04-08T17:05:00" },
        { id: 604, ratedUserId: 13, raterUserId: 1, score: 5, comment: "Comfortable ride.", createdDate: "2026-04-07T10:15:00" }
      ],
      notifications: [
        { id: 701, userId: 2, kind: "RIDE_MATCH_CONFIRMED", title: "Ride match confirmed", message: "Your join request #301 was accepted by Emma Lee.", createdAt: "2026-04-09T06:26:00", read: false },
        { id: 702, userId: 11, kind: "RIDE_MATCH_CONFIRMED", title: "Driver confirmation", message: "You accepted Daniel Chen on offer #101.", createdAt: "2026-04-09T06:26:30", read: false },
        { id: 703, userId: 1, kind: "REQUEST_OFFERS_READY", title: "Driver offers available", message: "Request #201 now has driver offers ready to review.", createdAt: "2026-04-09T06:35:30", read: false },
        { id: 704, userId: 1, kind: "JOIN_REQUEST_REJECTED", title: "Join request rejected", message: "Liam Patel rejected join request #303.", createdAt: "2026-04-09T06:12:00", read: true }
      ],
      paymentMethodsByUser: {
        "1": [
          { id: "pm-1", cardType: "Visa", last4: "4242", expiry: "12/29", primary: true }
        ],
        "2": [
          { id: "pm-2", cardType: "Mastercard", last4: "5454", expiry: "08/28", primary: true }
        ]
      }
    };
  }

  function loadDatabase() {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (!raw) return seedDatabase();
      return JSON.parse(raw);
    } catch (error) {
      return seedDatabase();
    }
  }

  function saveDatabase() {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function loadSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(nextSession) {
    session = nextSession;
    if (nextSession) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }

  function resetDemoData() {
    db = seedDatabase();
    saveDatabase();
    saveSession(null);
    ui.loginMessage = "Demo data has been reset.";
    ui.registerMessage = "";
    ui.flash = "";
    ui.lastConfirmedMatchId = null;
    ui.rideConfirmed = null;
    ui.autoRequestKey = "";
    ui.autoRequestId = null;
    navigate("/login");
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getHashRouteInfo() {
    const hash = window.location.hash.replace(/^#/, "");
    const queryIndex = hash.indexOf("?");
    const path = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
    const queryString = queryIndex >= 0 ? hash.slice(queryIndex + 1) : "";
    return {
      path: path || (session ? defaultRouteForSession(session.role) : "/login"),
      queryString,
      query: new URLSearchParams(queryString)
    };
  }

  function routePath() {
    return getHashRouteInfo().path;
  }

  function routeQuery() {
    return getHashRouteInfo().query;
  }

  function routeQueryString() {
    const queryString = getHashRouteInfo().queryString;
    return queryString ? "?" + queryString : "";
  }

  function navigate(path, message) {
    if (message) ui.flash = message;
    const target = "#" + path;
    if (window.location.hash === target) {
      render();
      return;
    }
    window.location.hash = path;
  }

  function defaultRouteForSession(role) {
    return role === "DRIVER" ? "/driver-hub" : "/";
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizePlaceKey(value) {
    const input = normalizeText(value).toLowerCase().replace(/\s+/g, " ");
    if (!input) return "";
    const match = Object.keys(PLACE_SYNONYMS).find((key) => PLACE_SYNONYMS[key].includes(input));
    return match || input;
  }

  function samePlace(a, b) {
    return normalizePlaceKey(a) === normalizePlaceKey(b);
  }

  function parseDateTime(dateValue, timeValue) {
    const date = normalizeText(dateValue);
    const time = normalizeText(timeValue);
    if (!date || !time) return null;
    const parsed = new Date(date + "T" + time + ":00");
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDate(dateValue) {
    return normalizeText(dateValue) || "-";
  }

  function formatDateTime(dateValue) {
    if (!dateValue) return "-";
    const clean = String(dateValue).replace("T", " ");
    return clean.slice(0, 16);
  }

  function getUser(userId) {
    return db.users.find((item) => item.id === Number(userId)) || null;
  }

  function getOffer(offerId) {
    return db.rideOffers.find((item) => item.id === Number(offerId)) || null;
  }

  function getRideRequest(requestId) {
    return db.rideRequests.find((item) => item.id === Number(requestId)) || null;
  }

  function getJoinRequest(joinRequestId) {
    return db.joinRequests.find((item) => item.id === Number(joinRequestId)) || null;
  }

  function getRideRequestOffer(offerId) {
    return db.rideRequestOffers.find((item) => item.id === Number(offerId)) || null;
  }

  function getRideMatch(matchId) {
    return db.rideMatches.find((item) => item.id === Number(matchId)) || null;
  }

  function getRatingSummary(userId) {
    const list = db.ratings.filter((item) => item.ratedUserId === Number(userId));
    if (list.length === 0) return { averageRating: null, ratingCount: 0 };
    const total = list.reduce((sum, item) => sum + item.score, 0);
    return {
      averageRating: Number((total / list.length).toFixed(1)),
      ratingCount: list.length
    };
  }

  function getDriverTrust(driverId) {
    const driver = getUser(driverId);
    const rating = getRatingSummary(driverId);
    return {
      driverId,
      driverName: driver ? driver.fullName : "Unknown driver",
      averageRating: rating.averageRating,
      ratingCount: rating.ratingCount,
      licenceVerifiedStatus: driver ? driver.licenceVerifiedStatus || "PENDING" : "PENDING",
      vehicleInfo: driver ? driver.vehicleInfo || "Not provided" : "Not provided",
      spareSeatCapacity: driver ? driver.spareSeatCapacity || 0 : 0,
      verificationNotes: driver ? driver.verificationNotes || "No verification note." : "No verification note."
    };
  }

  function nextId(list) {
    return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  function addNotification(userId, kind, title, message) {
    db.notifications.unshift({
      id: nextId(db.notifications),
      userId: Number(userId),
      kind,
      title,
      message,
      createdAt: new Date().toISOString().slice(0, 19),
      read: false
    });
  }

  function requireSession() {
    if (!session) {
      navigate("/login");
      return null;
    }
    return getUser(session.userId);
  }

  function requireRole(role) {
    const user = requireSession();
    if (!user) return null;
    if (user.role !== role) {
      navigate(defaultRouteForSession(user.role));
      return null;
    }
    return user;
  }

  function buildMapPreview(origin, destination) {
    const originPos = pseudoMapPoint(origin, 24);
    const destinationPos = pseudoMapPoint(destination, 61);
    return `
      <div class="map-card">
        <div class="map-preview">
          <div class="map-grid-line"></div>
          <svg class="map-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M ${originPos.x} ${originPos.y} Q 50 12 ${destinationPos.x} ${destinationPos.y}" fill="none" stroke="rgba(15,118,110,0.55)" stroke-width="1.8" stroke-dasharray="4 4"></path>
          </svg>
          <span class="map-node origin" style="left:${originPos.x}%; top:${originPos.y}%;"></span>
          <span class="map-node destination" style="left:${destinationPos.x}%; top:${destinationPos.y}%;"></span>
        </div>
        <div class="summary-bar">
          <span class="summary-pill">Origin: ${esc(origin || "Not selected")}</span>
          <span class="summary-pill">Destination: ${esc(destination || "Not selected")}</span>
        </div>
      </div>
    `;
  }

  function pseudoMapPoint(value, seed) {
    const text = normalizeText(value) || "neighbourlink";
    const sum = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), seed);
    return {
      x: 12 + (sum % 62),
      y: 18 + ((sum * 3) % 54)
    };
  }

  function searchRideOffers(filters) {
    const tripDate = normalizeText(filters.tripDate || filters.departureDate);
    const departureTime = normalizeText(filters.departureTime || filters.tripTime);
    const passengers = Number(filters.passengerCount || 1);
    const timeFlexHours = Math.max(0, Math.min(6, Number(filters.timeFlexHours || 0)));
    return db.rideOffers.filter((offer) => {
      if (offer.status !== "OPEN") return false;
      if (!samePlace(offer.origin, filters.origin) && !samePlace(offer.originSuburb, filters.origin)) return false;
      if (!samePlace(offer.destination, filters.destination) && !samePlace(offer.destinationSuburb, filters.destination)) return false;
      if (offer.departureDate !== tripDate) return false;
      if (offer.availableSeats < passengers) return false;
      if (!departureTime) return false;
      const filterTime = parseDateTime(tripDate, departureTime);
      const offerTime = parseDateTime(offer.departureDate, offer.departureTime);
      if (!filterTime || !offerTime) return false;
      const diffHours = Math.abs(offerTime.getTime() - filterTime.getTime()) / 3600000;
      return diffHours <= timeFlexHours;
    });
  }

  function resolveFindMode(draft) {
    const tripDate = normalizeText(draft.tripDate || draft.departureDate);
    const departureTime = normalizeText(draft.departureTime || draft.tripTime);
    if (!departureTime) {
      return { mode: "REQUEST", reason: "NO_TIME" };
    }
    const tripAt = parseDateTime(tripDate, departureTime);
    if (!tripAt) {
      return { mode: "REQUEST", reason: "INVALID_TIME" };
    }
    const hours = (tripAt.getTime() - DEMO_NOW.getTime()) / 3600000;
    if (hours > 3) {
      return { mode: "REQUEST", reason: "OVER_3H" };
    }
    return { mode: "FIND", reason: "WITHIN_3H" };
  }

  function createRideRequestFromFind(user, sourceDraft, reason) {
    const draft = sourceDraft || ui.findDraft;
    const tripDate = normalizeText(draft.tripDate || draft.departureDate);
    const departureTime = normalizeText(draft.departureTime || draft.tripTime);
    const request = {
      id: nextId(db.rideRequests),
      riderId: user.id,
      origin: normalizeText(draft.origin),
      originAddress: normalizeText(draft.origin) + " Pickup",
      originSuburb: normalizeText(draft.origin),
      destination: normalizeText(draft.destination),
      destinationAddress: normalizeText(draft.destination) + " Drop-off",
      destinationSuburb: normalizeText(draft.destination),
      tripDate,
      tripTime: departureTime || "09:00",
      passengerCount: Math.max(1, Number(draft.passengerCount || 1)),
      notes: normalizeText(draft.notes) || "Auto-created from Find a Ride demo flow.",
      status: "OPEN",
      source: "AUTO_FIND",
      createdAt: new Date().toISOString().slice(0, 19)
    };
    db.rideRequests.unshift(request);
    addNotification(
      user.id,
      "REQUEST_CREATED",
      "One-off request created",
      reason === "NO_TIME"
        ? "Your trip had no exact time, so the demo created a one-off request."
        : reason === "NO_RESULTS"
          ? "No matching ride offers were found, so the demo created a one-off request automatically."
          : "The trip did not qualify for instant offer search, so a one-off request was created."
    );
    saveDatabase();
    return request;
  }

  function buildFindSearchParams(draft) {
    const params = new URLSearchParams();
    params.set("origin", normalizeText(draft.origin));
    params.set("destination", normalizeText(draft.destination));
    params.set("departureDate", normalizeText(draft.tripDate));
    if (normalizeText(draft.departureTime)) {
      params.set("departureTime", normalizeText(draft.departureTime));
      params.set("timeFlexHours", normalizeText(draft.timeFlexHours) || "0");
    }
    params.set("passengerCount", normalizeText(draft.passengerCount) || "1");
    if (normalizeText(draft.notes)) {
      params.set("notes", normalizeText(draft.notes));
    }
    return params;
  }

  function readSearchFiltersFromRoute() {
    const query = routeQuery();
    const departureDate = normalizeText(query.get("departureDate"));
    return {
      origin: normalizeText(query.get("origin")),
      destination: normalizeText(query.get("destination")),
      departureDate,
      tripDate: departureDate,
      departureTime: normalizeText(query.get("departureTime")),
      timeFlexHours: normalizeText(query.get("timeFlexHours")) || "0",
      passengerCount: normalizeText(query.get("passengerCount")) || "1",
      notes: normalizeText(query.get("notes"))
    };
  }

  function describeFindMode(mode) {
    if (mode.mode === "REQUEST") {
      return mode.reason === "OVER_3H"
        ? "Request a Ride (trip is more than 3 hours away)"
        : "Request a Ride (no exact departure time, auto fallback)";
    }
    return "Find a Ride (trip is within 3 hours)";
  }

  function createJoinRequest(user, offerId, requestedSeats) {
    const existingPending = db.joinRequests.find((item) =>
      item.riderId === user.id &&
      item.rideOfferId === Number(offerId) &&
      item.status === "PENDING"
    );
    if (existingPending) {
      throw new Error("A pending join request for this offer already exists.");
    }
    const offer = getOffer(offerId);
    if (!offer || offer.status !== "OPEN") {
      throw new Error("This ride offer is no longer open.");
    }
    if (requestedSeats > offer.availableSeats) {
      throw new Error("Requested seats exceed available seats.");
    }
    const created = {
      id: nextId(db.joinRequests),
      rideOfferId: offer.id,
      riderId: user.id,
      requestedSeats,
      status: "PENDING",
      requestDateTime: new Date().toISOString().slice(0, 19),
      meetingPoint: ""
    };
    db.joinRequests.unshift(created);
    addNotification(
      offer.driverId,
      "JOIN_REQUEST_PENDING",
      "New join request pending",
      user.fullName + " requested " + requestedSeats + " seat(s) on offer #" + offer.id + "."
    );
    saveDatabase();
    return created;
  }

  function decideJoinRequest(driver, joinRequestId, decision, meetingPoint) {
    const request = getJoinRequest(joinRequestId);
    const offer = request ? getOffer(request.rideOfferId) : null;
    const rider = request ? getUser(request.riderId) : null;
    if (!request || !offer || !rider) {
      throw new Error("Join request data is incomplete.");
    }
    if (offer.driverId !== driver.id) {
      throw new Error("This join request does not belong to the active driver.");
    }
    if (decision === "ACCEPTED") {
      if (!normalizeText(meetingPoint)) {
        throw new Error("Meeting point is required for acceptance.");
      }
      if (request.requestedSeats > offer.availableSeats) {
        throw new Error("Offer does not have enough remaining seats.");
      }
      request.status = "ACCEPTED";
      request.meetingPoint = normalizeText(meetingPoint);
      offer.availableSeats -= request.requestedSeats;
      if (offer.availableSeats <= 0) {
        offer.availableSeats = 0;
        offer.status = "CLOSED";
      }
      const match = {
        id: nextId(db.rideMatches),
        driverId: driver.id,
        riderId: rider.id,
        rideOfferId: offer.id,
        rideRequestId: null,
        acceptedJoinRequestId: request.id,
        acceptedRideRequestOfferId: null,
        confirmedDateTime: new Date().toISOString().slice(0, 19),
        meetingPoint: normalizeText(meetingPoint),
        tripStatus: "CONFIRMED",
        paymentStatus: "UNPAID"
      };
      db.rideMatches.unshift(match);
      if (offer.status === "CLOSED") {
        db.joinRequests.forEach((item) => {
          if (item.rideOfferId === offer.id && item.status === "PENDING") {
            item.status = "REJECTED";
            addNotification(item.riderId, "JOIN_REQUEST_REJECTED", "Join request closed", "Offer #" + offer.id + " became full, so your pending request was closed.");
          }
        });
      }
      addNotification(rider.id, "RIDE_MATCH_CONFIRMED", "Ride match confirmed", "Driver " + driver.fullName + " accepted join request #" + request.id + ".");
      addNotification(driver.id, "RIDE_MATCH_CONFIRMED", "Join request accepted", "You confirmed rider " + rider.fullName + " on offer #" + offer.id + ".");
      saveDatabase();
      return match;
    }
    request.status = "REJECTED";
    request.meetingPoint = "";
    addNotification(rider.id, "JOIN_REQUEST_REJECTED", "Join request rejected", "Driver " + driver.fullName + " rejected join request #" + request.id + ".");
    saveDatabase();
    return null;
  }

  function createDriverOffer(driver, rideRequestId, proposedSeats, meetingPoint) {
    const request = getRideRequest(rideRequestId);
    if (!request || request.status !== "OPEN") {
      throw new Error("Ride request is not open.");
    }
    if (request.riderId === driver.id) {
      throw new Error("Drivers cannot respond to their own ride requests.");
    }
    const existingPending = db.rideRequestOffers.find((item) =>
      item.rideRequestId === request.id &&
      item.driverId === driver.id &&
      item.status === "PENDING"
    );
    if (existingPending) {
      throw new Error("You already have a pending driver offer for this request.");
    }
    if (driver.licenceVerifiedStatus !== "VERIFIED") {
      throw new Error("Driver verification is required.");
    }
    if (Number(driver.spareSeatCapacity || 0) < proposedSeats) {
      throw new Error("Driver seat capacity is too low for this offer.");
    }
    if (proposedSeats < request.passengerCount) {
      throw new Error("Proposed seats must cover the passenger count.");
    }
    const created = {
      id: nextId(db.rideRequestOffers),
      rideRequestId: request.id,
      driverId: driver.id,
      proposedSeats,
      meetingPoint: normalizeText(meetingPoint),
      status: "PENDING",
      createdAt: new Date().toISOString().slice(0, 19)
    };
    db.rideRequestOffers.unshift(created);
    addNotification(request.riderId, "REQUEST_OFFERS_READY", "New driver offer", driver.fullName + " responded to ride request #" + request.id + ".");
    saveDatabase();
    return created;
  }

  function acceptRideRequestOffer(rider, rideRequestId, offerId) {
    const request = getRideRequest(rideRequestId);
    const offer = getRideRequestOffer(offerId);
    if (!request || !offer) {
      throw new Error("The request or driver offer cannot be found.");
    }
    if (request.riderId !== rider.id) {
      throw new Error("This request does not belong to the active rider.");
    }
    if (offer.status !== "PENDING") {
      throw new Error("Only pending driver offers can be accepted.");
    }
    request.status = "MATCHED";
    db.rideRequestOffers.forEach((item) => {
      if (item.rideRequestId === request.id) {
        item.status = item.id === offer.id ? "ACCEPTED" : "REJECTED";
      }
    });
    const match = {
      id: nextId(db.rideMatches),
      driverId: offer.driverId,
      riderId: rider.id,
      rideOfferId: null,
      rideRequestId: request.id,
      acceptedJoinRequestId: null,
      acceptedRideRequestOfferId: offer.id,
      confirmedDateTime: new Date().toISOString().slice(0, 19),
      meetingPoint: offer.meetingPoint,
      tripStatus: "CONFIRMED",
      paymentStatus: "UNPAID"
    };
    db.rideMatches.unshift(match);
    const driver = getUser(offer.driverId);
    addNotification(rider.id, "RIDE_MATCH_CONFIRMED", "Driver offer accepted", "You accepted offer #" + offer.id + " from " + (driver ? driver.fullName : "the driver") + ".");
    if (driver) {
      addNotification(driver.id, "RIDE_MATCH_CONFIRMED", "Your one-off offer was accepted", rider.fullName + " accepted your offer #" + offer.id + ".");
    }
    saveDatabase();
    ui.lastConfirmedMatchId = match.id;
    return match;
  }

  function cancelRideRequest(rider, rideRequestId) {
    const request = getRideRequest(rideRequestId);
    if (!request || request.riderId !== rider.id) {
      throw new Error("Ride request could not be found for this rider.");
    }
    if (request.status !== "OPEN") {
      throw new Error("Only open ride requests can be cancelled.");
    }
    request.status = "CLOSED";
    db.rideRequestOffers.forEach((offer) => {
      if (offer.rideRequestId === request.id && offer.status === "PENDING") {
        offer.status = "REJECTED";
      }
    });
    saveDatabase();
  }

  function markAllNotificationsRead(userId) {
    db.notifications.forEach((item) => {
      if (item.userId === Number(userId)) item.read = true;
    });
    saveDatabase();
  }

  function getNotificationsForUser(userId) {
    return db.notifications
      .filter((item) => item.userId === Number(userId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function buildRiderUnifiedOrders(userId) {
    const joinCards = db.joinRequests
      .filter((item) => item.riderId === Number(userId))
      .map((item) => {
        const offer = getOffer(item.rideOfferId);
        const driver = offer ? getUser(offer.driverId) : null;
        const match = db.rideMatches.find((entry) => entry.acceptedJoinRequestId === item.id) || null;
        return {
          id: "join-" + item.id,
          sortTime: item.requestDateTime,
          type: "JOIN_REQUEST",
          status: item.status,
          stage: item.status === "ACCEPTED" ? "CONFIRMED" : item.status === "PENDING" ? "IN_PROGRESS" : "CLOSED",
          title: "Join Request #" + item.id,
          route: (offer ? offer.origin : "Unknown") + " to " + (offer ? offer.destination : "Unknown"),
          subtext: driver ? "Driver: " + driver.fullName : "Driver unavailable",
          detail: "Requested seats: " + item.requestedSeats,
          matchId: match ? match.id : null,
          paymentAvailable: Boolean(match)
        };
      });

    const requestCards = db.rideRequests
      .filter((item) => item.riderId === Number(userId))
      .map((item) => {
        const offerCount = db.rideRequestOffers.filter((offer) => offer.rideRequestId === item.id).length;
        const match = db.rideMatches.find((entry) => entry.rideRequestId === item.id) || null;
        return {
          id: "request-" + item.id,
          sortTime: item.createdAt,
          type: "ONE_OFF_REQUEST",
          status: item.status,
          stage: item.status === "MATCHED" ? "CONFIRMED" : item.status === "OPEN" ? "IN_PROGRESS" : "CLOSED",
          title: "One-Off Request #" + item.id,
          route: item.origin + " to " + item.destination,
          subtext: "Offers received: " + offerCount,
          detail: "Path: Find to Auto Request",
          requestId: item.id,
          reviewAvailable: item.status === "OPEN" && offerCount > 0,
          cancelAvailable: item.status === "OPEN",
          matchId: match ? match.id : null,
          paymentAvailable: Boolean(match)
        };
      });

    return joinCards
      .concat(requestCards)
      .sort((a, b) => String(b.sortTime).localeCompare(String(a.sortTime)));
  }

  function buildDriverStory(userId) {
    const matches = db.rideMatches
      .filter((item) => item.driverId === Number(userId))
      .map((item) => {
        const rider = getUser(item.riderId);
        const offer = item.rideOfferId ? getOffer(item.rideOfferId) : null;
        const request = item.rideRequestId ? getRideRequest(item.rideRequestId) : null;
        return {
          id: "match-" + item.id,
          sortTime: item.confirmedDateTime,
          type: item.rideOfferId ? "JOIN_REQUEST" : "ONE_OFF_REQUEST",
          status: item.tripStatus,
          stage: item.tripStatus === "CONFIRMED" ? "CONFIRMED" : "CLOSED",
          title: "Ride Match #" + item.id,
          route: offer ? offer.origin + " to " + offer.destination : request ? request.origin + " to " + request.destination : "Unknown route",
          subtext: rider ? "Rider: " + rider.fullName : "Rider unavailable",
          detail: "Meeting point: " + (item.meetingPoint || "Not set"),
          matchId: item.id,
          paymentAvailable: false
        };
      });

    const offers = db.rideRequestOffers
      .filter((item) => item.driverId === Number(userId))
      .map((item) => {
        const request = getRideRequest(item.rideRequestId);
        return {
          id: "driver-offer-" + item.id,
          sortTime: item.createdAt,
          type: "DRIVER_OFFER",
          status: item.status,
          stage: item.status === "PENDING" ? "IN_PROGRESS" : item.status === "ACCEPTED" ? "CONFIRMED" : "CLOSED",
          title: "Driver Offer #" + item.id,
          route: request ? request.origin + " to " + request.destination : "Unknown route",
          subtext: request ? "Request #" + request.id : "Request unavailable",
          detail: "Meeting point: " + item.meetingPoint,
          matchId: null,
          paymentAvailable: false
        };
      });

    return matches.concat(offers).sort((a, b) => String(b.sortTime).localeCompare(String(a.sortTime)));
  }

  function getOpenJoinRequestsForDriver(driverId) {
    return db.joinRequests
      .filter((item) => {
        const offer = getOffer(item.rideOfferId);
        return offer && offer.driverId === Number(driverId) && item.status === "PENDING";
      })
      .sort((a, b) => String(b.requestDateTime).localeCompare(String(a.requestDateTime)));
  }

  function getOpenRideRequestsForDriver(driverId) {
    return db.rideRequests
      .filter((item) => item.status === "OPEN" && item.riderId !== Number(driverId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function pathLabel(type) {
    if (type === "JOIN_REQUEST") return "Join Request";
    if (type === "ONE_OFF_REQUEST") return "One-Off Request";
    if (type === "DRIVER_OFFER") return "Driver Offer";
    return type;
  }

  function render() {
    const route = routePath();
    if (!session && route !== "/login" && route !== "/register" && route !== "/tutorial") {
      navigate("/login");
      return;
    }

    if (session && (route === "/login" || route === "/register")) {
      navigate(defaultRouteForSession(session.role));
      return;
    }

    let html = "";
    if (route === "/login") html = renderLogin();
    else if (route === "/register") html = renderRegister();
    else if (route === "/tutorial") html = renderTutorial();
    else if (route === "/") html = renderFindRide();
    else if (route === "/search-results") html = renderSearchResults();
    else if (matchRoute(route, "/ride-offer-details/:id")) html = renderRideOfferDetails(Number(matchRoute(route, "/ride-offer-details/:id").id));
    else if (route === "/my-trips") html = renderMyTrips();
    else if (route === "/driver-hub") html = renderDriverHub();
    else if (route === "/account") html = renderAccount();
    else if (route === "/ride-confirmed") html = renderRideConfirmed();
    else if (matchRoute(route, "/ride-requests/:id/offers")) html = renderRideRequestOffers(Number(matchRoute(route, "/ride-requests/:id/offers").id));
    else if (route === "/payment") html = renderPayment();
    else if (matchRoute(route, "/payment/:id")) html = renderPayment(Number(matchRoute(route, "/payment/:id").id));
    else html = renderNotFound();

    APP_ROOT.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function matchRoute(route, pattern) {
    const routeParts = String(route).split("/").filter(Boolean);
    const patternParts = String(pattern).split("/").filter(Boolean);
    if (routeParts.length !== patternParts.length) return null;
    const params = {};
    for (let index = 0; index < patternParts.length; index += 1) {
      const expected = patternParts[index];
      const actual = routeParts[index];
      if (expected.startsWith(":")) {
        params[expected.slice(1)] = actual;
      } else if (expected !== actual) {
        return null;
      }
    }
    return params;
  }

  function renderPublicShell(title, subtitle, content) {
    return `
      <div class="auth-shell">
        <header class="auth-topbar">
          <div class="brand-block">
            <div class="brand-mark">NL</div>
            <div class="brand-copy">
              <h1>NeighbourLink Static Demo</h1>
              <p>Front-end only demonstration with hardcoded local data and browser-first routing.</p>
            </div>
          </div>
          <div class="actions-row">
            <button class="btn btn-secondary" type="button" data-action="reset-demo">Reset Demo Data</button>
          </div>
        </header>
        <main class="page-grid">
          <section class="hero-card">
            <div class="hero-copy">
              <span class="route-chip">Static path demo</span>
              <h2>${esc(title)}</h2>
              <p>${esc(subtitle)}</p>
            </div>
          </section>
          ${content}
        </main>
        <footer class="demo-footer">Open this file directly in a browser. No API calls, no backend, and all demo state stays local to the browser.</footer>
      </div>
    `;
  }

  function renderUserShell(title, subtitle, content) {
    const user = getUser(session.userId);
    return `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-block">
            <div class="brand-mark">NL</div>
            <div class="brand-copy">
              <h2>${esc(title)}</h2>
              <p>${esc(subtitle)}</p>
            </div>
          </div>
          <div class="nav-row">
            <button class="nav-link ${routePath() === "/" ? "active" : ""}" type="button" data-route="/">Find a Ride</button>
            <button class="nav-link ${routePath() === "/my-trips" ? "active" : ""}" type="button" data-route="/my-trips">My Trips</button>
            <button class="nav-link ${routePath() === "/account" ? "active" : ""}" type="button" data-route="/account">Account</button>
            ${user.role === "DRIVER" ? `<button class="nav-link ${routePath() === "/driver-hub" ? "active" : ""}" type="button" data-route="/driver-hub">Driver Hub</button>` : ""}
            <button class="btn btn-secondary" type="button" data-action="logout">Log Out</button>
          </div>
        </header>
        ${content}
        <footer class="demo-footer">Signed in as ${esc(user.fullName)} (${esc(user.role)}). Demo clock: ${esc(formatDateTime(DEMO_NOW.toISOString().slice(0, 19)))}.</footer>
      </div>
    `;
  }

  function renderLogin() {
    const accountCards = [
      { label: "Maria Rider", email: "maria.rider@example.com", password: "demo1234", note: "Best for rider search, requests, trips, and payment demo." },
      { label: "Emma Driver", email: "emma.driver@example.com", password: "demo1234", note: "Best for join decisions and one-off request responses." },
    ];
    return renderPublicShell(
      "Demo Sign In",
      "Use fixed local credentials or the quick-fill buttons below. The static site mirrors the current runtime flow set, but every record lives inside browser storage only.",
      `
        <div class="auth-grid">
          <section class="hero-card">
            <div class="hero-copy">
              <span class="pill">Current code-aligned route demo</span>
              <h1>Static delivery of the current NeighbourLink feature set</h1>
              <p>The rider side keeps the merged Find a Ride entry. Drivers focus on decisions and one-off responses. Account only keeps password reset and payment methods.</p>
            </div>
            <div class="auth-accent-list">
              ${accountCards.map((card) => `
                <article class="auth-accent-item">
                  <strong>${esc(card.label)}</strong>
                  <code>${esc(card.email)} / ${esc(card.password)}</code>
                  <span class="helper">${esc(card.note)}</span>
                  <div class="actions-row">
                    <button class="btn btn-secondary" type="button" data-action="fill-login" data-email="${esc(card.email)}" data-password="${esc(card.password)}">Use This Account</button>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
          <section class="auth-panel">
            <div class="page-header">
              <span class="route-chip">/login</span>
              <h2>Sign In</h2>
              <p>Static authentication checks local demo credentials only.</p>
            </div>
            ${ui.loginMessage ? `<p class="message info">${esc(ui.loginMessage)}</p>` : ""}
            <form class="form-grid" data-form="login">
              <label class="field">
                Email
                <input type="email" name="email" placeholder="maria.rider@example.com">
              </label>
              <label class="field">
                Password
                <input type="password" name="password" placeholder="demo1234">
              </label>
              <div class="actions-row">
                <button class="btn" type="submit">Log In</button>
                <button class="btn btn-secondary" type="button" data-route="/register">Open Register</button>
              </div>
            </form>
          </section>
        </div>
      `
    );
  }

  function renderRegister() {
    return renderPublicShell(
      "Register Static Demo Account",
      "Registration is front-end only here, but it still demonstrates Rider and Driver onboarding, including the driver document requirement path.",
      `
        <div class="split-grid">
          <section class="hero-card">
            <div class="hero-copy">
              <span class="route-chip">/register</span>
              <h1>Create a local demo account</h1>
              <p>You can create a Rider or Driver record and immediately sign in. Driver registration still asks for licence, spare-seat proof, and rego filenames so the demo reflects the current product behaviour.</p>
            </div>
            <div class="flow-stepper">
              <button class="flow-step ${ui.registerRole === "RIDER" ? "active" : ""}" type="button" data-action="register-role" data-role="RIDER">
                <strong>Rider</strong>
                <small>Find, request, review, pay</small>
              </button>
              <button class="flow-step ${ui.registerRole === "DRIVER" ? "active" : ""}" type="button" data-action="register-role" data-role="DRIVER">
                <strong>Driver</strong>
                <small>Decision hub, verified response path</small>
              </button>
            </div>
          </section>
          <section class="auth-panel">
            ${ui.registerMessage ? `<p class="message info">${esc(ui.registerMessage)}</p>` : ""}
            <form class="form-grid two" data-form="register">
              <label class="field">
                Full name
                <input type="text" name="fullName" required>
              </label>
              <label class="field">
                Email
                <input type="email" name="email" required>
              </label>
              <label class="field">
                Password
                <input type="password" name="password" required>
              </label>
              <label class="field">
                Suburb
                <input type="text" name="suburb" value="Clayton" required>
              </label>
              <label class="field">
                Phone
                <input type="text" name="phone" placeholder="0400 000 000">
              </label>
              <div class="field">
                <span>Role</span>
                <input type="text" name="roleLabel" value="${esc(ui.registerRole)}" disabled>
              </div>
              ${ui.registerRole === "DRIVER" ? `
                <label class="field">
                  Vehicle info
                  <input type="text" name="vehicleInfo" placeholder="Toyota Corolla - White">
                </label>
                <label class="field">
                  Spare seat capacity
                  <input type="number" name="spareSeatCapacity" min="1" value="2">
                </label>
                <label class="field">
                  Licence file
                  <input type="file" name="licenceDoc">
                </label>
                <label class="field">
                  Spare-seat proof
                  <input type="file" name="seatProofDoc">
                </label>
                <label class="field">
                  Rego file
                  <input type="file" name="regoDoc">
                </label>
              ` : ""}
              <div class="actions-row">
                <button class="btn" type="submit">Create Local Account</button>
                <button class="btn btn-secondary" type="button" data-route="/login">Back to Login</button>
              </div>
            </form>
          </section>
        </div>
      `
    );
  }

  function renderFindRide() {
    const user = requireRole("RIDER");
    if (!user) return "";
    const step = ui.findStep;
    const draft = ui.findDraft;
    const suggestions = LOCATION_OPTIONS.map((option) => `
      <button class="chip-btn" type="button" data-action="find-suggestion" data-step="${step}" data-value="${esc(option)}">${esc(option)}</button>
    `).join("");

    let stepHtml = "";
    if (step === "ORIGIN") {
      stepHtml = `
        <div class="split-grid">
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Origin</span>
              <h2>Choose pickup location</h2>
              <p>Use a known suburb to align with the demo offer dataset and front-end matching rules.</p>
            </div>
            <div class="form-grid">
              <label class="field">
                Origin (pickup)
                <input data-sync="find" name="origin" type="text" value="${esc(draft.origin)}" placeholder="Clayton">
              </label>
              <div class="chip-row">${suggestions}</div>
            </div>
            <div class="actions-row">
              <button class="btn" type="button" data-action="find-next">Continue to Destination</button>
            </div>
          </section>
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Preview</span>
              <h2>Map-style static preview</h2>
              <p>No live map service is used here, but the demo still visualises pickup and destination intent.</p>
            </div>
            ${buildMapPreview(draft.origin, draft.destination)}
          </section>
        </div>
      `;
    } else if (step === "DESTINATION") {
      stepHtml = `
        <div class="split-grid">
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Destination</span>
              <h2>Choose drop-off suburb</h2>
              <p>Try Melbourne for same-day ride-offer matching, or another location to exercise fallback behaviour.</p>
            </div>
            <div class="form-grid">
              <label class="field">
                Destination
                <input data-sync="find" name="destination" type="text" value="${esc(draft.destination)}" placeholder="Melbourne">
              </label>
              <div class="chip-row">${suggestions}</div>
            </div>
            <div class="actions-row">
              <button class="btn btn-secondary" type="button" data-action="find-back">Back</button>
              <button class="btn" type="button" data-action="find-next">Continue to Trip Date</button>
            </div>
          </section>
          <section class="section-card">
            ${buildMapPreview(draft.origin, draft.destination)}
          </section>
        </div>
      `;
    } else {
      stepHtml = `
        <div class="split-grid">
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Trip Date</span>
              <h2>Confirm timing and passengers</h2>
              <p>Same-day trips within three hours search offers first. Future trips or blank times auto-create one-off requests.</p>
            </div>
            <div class="form-grid two">
              <label class="field">
                Trip date
                <input data-sync="find" name="tripDate" type="date" value="${esc(draft.tripDate)}">
              </label>
              <label class="field">
                Departure time (optional)
                <input data-sync="find" name="departureTime" type="time" value="${esc(draft.departureTime)}">
              </label>
              <label class="field">
                Time flexibility (0-6h)
                <select data-sync="find" name="timeFlexHours">
                  ${[0, 1, 2, 3, 4, 5, 6].map((value) => `<option value="${value}" ${String(value) === String(draft.timeFlexHours) ? "selected" : ""}>${value} hour${value === 1 ? "" : "s"}</option>`).join("")}
                </select>
              </label>
              <label class="field">
                Passengers
                <input data-sync="find" name="passengerCount" type="number" min="1" max="6" value="${esc(draft.passengerCount)}">
              </label>
            </div>
            <label class="field">
              Notes to drivers
              <textarea data-sync="find" name="notes">${esc(draft.notes)}</textarea>
            </label>
            <div class="actions-row">
              <button class="btn btn-secondary" type="button" data-action="find-back">Back</button>
              <button class="btn" type="button" data-action="confirm-find">Confirm and Continue</button>
            </div>
          </section>
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Demo clock</span>
              <h2>Routing logic preview</h2>
              <p>The static flow uses a fixed demo clock so the same search can be repeated consistently during marking.</p>
            </div>
            <div class="summary-bar">
              <span class="summary-pill">Demo now: ${esc(formatDateTime(DEMO_NOW.toISOString().slice(0, 19)))}</span>
              <span class="summary-pill">Origin: ${esc(draft.origin)}</span>
              <span class="summary-pill">Destination: ${esc(draft.destination)}</span>
              <span class="summary-pill">Date: ${esc(draft.tripDate)}</span>
              <span class="summary-pill">Time: ${esc(draft.departureTime || "Auto request")}</span>
            </div>
            ${buildMapPreview(draft.origin, draft.destination)}
          </section>
        </div>
      `;
    }

    return renderUserShell(
      "Find a Ride",
      "Unified rider entry. Search existing offers first, then fall back to a one-off request without leaving the flow.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/</span>
              <h2>Step-by-step flow</h2>
              <p>Origin, Destination, then Trip Date confirmation. Navigation matches the current runtime concept, but every action is local to the browser.</p>
            </div>
            <div class="flow-stepper">
              <button class="flow-step ${step === "ORIGIN" ? "active" : ""}" type="button" data-action="set-find-step" data-step="ORIGIN">
                <strong>Origin</strong>
                <small>Pickup setup</small>
              </button>
              <button class="flow-step ${step === "DESTINATION" ? "active" : ""}" type="button" data-action="set-find-step" data-step="DESTINATION">
                <strong>Destination</strong>
                <small>Drop-off setup</small>
              </button>
              <button class="flow-step ${step === "TRIP_DATE" ? "active" : ""}" type="button" data-action="set-find-step" data-step="TRIP_DATE">
                <strong>Trip Date</strong>
                <small>Time, flex, passengers</small>
              </button>
            </div>
            <div class="spacer-sm"></div>
            <div class="summary-bar">
              <span class="summary-pill">Origin: ${esc(draft.origin || "Not set")}</span>
              <span class="summary-pill">Destination: ${esc(draft.destination || "Not set")}</span>
              <span class="summary-pill">Trip date: ${esc(draft.tripDate || "Not set")}</span>
            </div>
          </section>
          ${stepHtml}
        </main>
      `
    );
  }

  function renderSearchResults() {
    const user = requireRole("RIDER");
    if (!user) return "";
    const filters = readSearchFiltersFromRoute();
    const mode = resolveFindMode(filters);
    const results = mode.mode === "FIND" ? searchRideOffers(filters) : [];
    const querySuffix = routeQueryString();
    const autoRequestReason = mode.mode === "REQUEST" ? mode.reason : results.length === 0 ? "NO_RESULTS" : null;
    const autoModeLabel = describeFindMode(mode);

    if (!filters.origin || !filters.destination || !filters.departureDate) {
      return renderUserShell(
        "Search Results",
        "This static route expects the Find a Ride flow to provide origin, destination, and date values.",
        `
          <main class="page-grid">
            <div class="empty-state">
              <p>No valid search criteria were supplied.</p>
              <div class="actions-row">
                <button class="btn" type="button" data-route="/">Back to Find a Ride</button>
              </div>
            </div>
          </main>
        `
      );
    }

    if (autoRequestReason) {
      const autoKey = routePath() + querySuffix + "::" + autoRequestReason;
      let created = ui.autoRequestKey === autoKey ? getRideRequest(ui.autoRequestId) : null;
      if (!created) {
        created = createRideRequestFromFind(user, filters, autoRequestReason);
        ui.autoRequestKey = autoKey;
        ui.autoRequestId = created.id;
      }
      const currentHash = window.location.hash;
      window.setTimeout(function () {
        if (window.location.hash === currentHash) {
          navigate("/my-trips");
        }
      }, 3000);
      return renderUserShell(
        "Search Results",
        "The rider flow keeps the same route but automatically switches to a one-off request when live offer search is not the correct path.",
        `
          <main class="page-grid">
            <section class="section-card search-summary-card">
              <div class="page-header">
                <span class="route-chip">/search-results</span>
                <h2>Search Summary</h2>
                <p>The same merged entry is still being used. This step is now routing to the request path automatically.</p>
              </div>
              <div class="summary-bar">
                <span class="summary-pill">From: ${esc(filters.origin)}</span>
                <span class="summary-pill">To: ${esc(filters.destination)}</span>
                <span class="summary-pill">Date: ${esc(filters.departureDate)}</span>
                <span class="summary-pill">Time: ${esc(filters.departureTime || "Any")}</span>
                <span class="summary-pill">Passengers: ${esc(filters.passengerCount)}</span>
                <span class="summary-pill">Auto mode: ${esc(autoModeLabel)}</span>
              </div>
            </section>
            <section class="section-card">
              <div class="support-guide-card ${autoRequestReason === "NO_RESULTS" ? "support-guide-card-empty" : ""}">
                <p class="support-guide-kicker">${autoRequestReason === "NO_RESULTS" ? "Auto fallback activated" : "Auto request created"}</p>
                <h2>${autoRequestReason === "NO_RESULTS" ? "No suitable ride offers found" : "One-off ride request submitted"}</h2>
                <p>${autoRequestReason === "OVER_3H"
                  ? "Because this trip is more than 3 hours away, the flow automatically switched from Find a Ride to a one-off request."
                  : autoRequestReason === "NO_TIME"
                    ? "Because no exact departure time was provided, the flow automatically created a one-off request."
                    : "No suitable ride offers matched, so the flow automatically created a one-off request."}</p>
                <p><strong>Request ID:</strong> ${esc(created ? created.id : "-")}</p>
                <p>Redirecting to My Trips in 3 seconds...</p>
              </div>
            </section>
          </main>
        `
      );
    }

    ui.autoRequestKey = "";
    ui.autoRequestId = null;
    return renderUserShell(
      "Search Results",
      "Matching ride offers from the static dataset. Offer cards preserve trust, seat, and explicit join-request entry points.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/search-results</span>
              <h2>Matching Ride Offers</h2>
              <p>${results.length} offer(s) matched the current rider criteria.</p>
            </div>
            <div class="summary-bar">
              <span class="summary-pill">From: ${esc(filters.origin)}</span>
              <span class="summary-pill">To: ${esc(filters.destination)}</span>
              <span class="summary-pill">Date: ${esc(filters.departureDate)}</span>
              <span class="summary-pill">Time: ${esc(filters.departureTime || "Any")}</span>
              <span class="summary-pill">Time tolerance: ${filters.departureTime ? "+/- " + esc(filters.timeFlexHours || "0") + "h" : "Not applied"}</span>
              <span class="summary-pill">Passengers: ${esc(filters.passengerCount)}</span>
              <span class="summary-pill">Auto mode: ${esc(autoModeLabel)}</span>
            </div>
          </section>
          ${results.length === 0 ? `
            <div class="empty-state">
              <p>No suitable ride offers found.</p>
              <div class="actions-row">
                <button class="btn" type="button" data-route="/">Back to Find a Ride</button>
              </div>
            </div>
          ` : `
            <section class="results-grid">
              ${results.map((offer) => {
                const trust = getDriverTrust(offer.driverId);
                return `
                  <article class="offer-card">
                    <div class="card-meta">
                      <strong>Offer #${esc(offer.id)}</strong>
                      <span class="status-pill ${offer.status.toLowerCase()}">${esc(offer.status)}</span>
                    </div>
                    <p><strong>${esc(offer.origin)}</strong> to <strong>${esc(offer.destination)}</strong></p>
                    <p>${esc(offer.departureDate)} at ${esc(offer.departureTime)} with ${esc(offer.availableSeats)} seat(s)</p>
                    <div class="chip-row">
                      <span class="pill">${esc(trust.driverName)}</span>
                      <span class="pill">${trust.averageRating != null ? trust.averageRating + " rating" : "New driver"}</span>
                      <span class="pill">${esc(trust.licenceVerifiedStatus)}</span>
                    </div>
                    <div class="actions-row">
                      <button class="btn" type="button" data-route="/ride-offer-details/${offer.id}${querySuffix}">View Offer Details</button>
                    </div>
                  </article>
                `;
              }).join("")}
            </section>
          `}
        </main>
      `
    );
  }

  function renderRideOfferDetails(offerId) {
    const user = requireRole("RIDER");
    if (!user) return "";
    const offer = getOffer(offerId);
    const backQuery = routeQueryString();
    const backToResults = "/search-results" + backQuery;
    if (!offer) {
      return renderUserShell("Ride Offer Details", "Offer not found.", `<main class="page-grid"><div class="empty-state"><p>The selected offer does not exist in the static dataset.</p></div></main>`);
    }
    const trust = getDriverTrust(offer.driverId);
    return renderUserShell(
      "Ride Offer Details",
      "Trust cues, seat visibility, and explicit join request submission are all handled locally in this browser demo.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/ride-offer-details/${offer.id}</span>
              <h2>Offer #${esc(offer.id)}</h2>
              <p>Use this page to inspect trust information before requesting a seat.</p>
            </div>
            <div class="summary-bar">
              <span class="summary-pill">Origin: ${esc(offer.origin)}</span>
              <span class="summary-pill">Destination: ${esc(offer.destination)}</span>
              <span class="summary-pill">Date: ${esc(offer.departureDate)}</span>
              <span class="summary-pill">Time: ${esc(offer.departureTime)}</span>
              <span class="summary-pill">Available seats: ${esc(offer.availableSeats)}</span>
            </div>
          </section>
          <div class="split-grid">
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">Driver trust</span>
                <h2>${esc(trust.driverName)}</h2>
                <p>The current runtime no longer uses profile editing, so trust is shown through rating, verification, vehicle, and seat capacity.</p>
              </div>
              <div class="chip-row">
                <span class="pill">${trust.averageRating != null ? trust.averageRating + " / 5" : "No ratings yet"}</span>
                <span class="pill">${esc(trust.ratingCount)} ratings</span>
                <span class="pill">${esc(trust.licenceVerifiedStatus)}</span>
              </div>
              <p><strong>Vehicle:</strong> ${esc(trust.vehicleInfo)}</p>
              <p><strong>Seat capacity:</strong> ${esc(trust.spareSeatCapacity)}</p>
              <p><strong>Verification notes:</strong> ${esc(trust.verificationNotes)}</p>
            </section>
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">Request a seat</span>
                <h2>Join this offer</h2>
                <p>Create a pending join request. Drivers still decide explicitly from Driver Hub.</p>
              </div>
              <form class="form-grid" data-form="join-request" data-offer-id="${offer.id}">
                <label class="field">
                  Requested seats
                  <select name="requestedSeats">
                    ${Array.from({ length: Math.max(1, offer.availableSeats) }, (_, index) => index + 1).map((value) => `<option value="${value}">${value}</option>`).join("")}
                  </select>
                </label>
                <div class="actions-row">
                  <button class="btn" type="submit">Submit Join Request</button>
                  <button class="btn btn-secondary" type="button" data-route="${backToResults}">Back to Results</button>
                </div>
              </form>
            </section>
          </div>
        </main>
      `
    );
  }

  function renderMyTrips() {
    const user = requireSession();
    if (!user) return "";
    const stories = user.role === "RIDER" ? buildRiderUnifiedOrders(user.id) : buildDriverStory(user.id);
    const stageFilter = ui.myTripsStage || "ALL";
    const pathFilter = ui.myTripsPath || "ALL";
    const filtered = stories.filter((item) => {
      const stageOk = stageFilter === "ALL" || item.stage === stageFilter;
      const pathOk = pathFilter === "ALL" || item.type === pathFilter;
      return stageOk && pathOk;
    });
    const notifications = getNotificationsForUser(user.id);
    return renderUserShell(
      "My Trips",
      "All rider or driver outcomes stay visible in one place, with notifications kept in a dedicated section.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/my-trips</span>
              <h2>${user.role === "RIDER" ? "My Unified Orders" : "Driver Activity Stream"}</h2>
              <p>Notifications remain separate. Everything else is grouped into one scrollable card feed for demo clarity.</p>
            </div>
            <div class="filters-row">
              ${["ALL", "IN_PROGRESS", "CONFIRMED", "CLOSED"].map((value) => `<button class="chip-btn ${stageFilter === value ? "active" : ""}" type="button" data-action="trips-stage" data-value="${value}">${value.replace("_", " ")}</button>`).join("")}
            </div>
            <div class="filters-row">
              ${(user.role === "RIDER" ? ["ALL", "JOIN_REQUEST", "ONE_OFF_REQUEST"] : ["ALL", "JOIN_REQUEST", "ONE_OFF_REQUEST", "DRIVER_OFFER"]).map((value) => `<button class="chip-btn ${pathFilter === value ? "active" : ""}" type="button" data-action="trips-path" data-value="${value}">${pathLabel(value)}</button>`).join("")}
            </div>
          </section>

          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Notifications</span>
              <h2>Recent notifications</h2>
            </div>
            <div class="actions-row">
              <button class="btn btn-secondary" type="button" data-action="mark-notifications-read">Mark all read</button>
            </div>
            ${notifications.length === 0 ? `<div class="empty-state"><p>No notifications yet.</p></div>` : `
              <div class="timeline-grid">
                ${notifications.slice(0, 6).map((item) => `
                  <article class="notification-card">
                    <div class="card-meta">
                      <strong>${esc(item.title)}</strong>
                      <span class="status-pill ${item.read ? "closed" : "pending"}">${item.read ? "READ" : "UNREAD"}</span>
                    </div>
                    <p>${esc(item.message)}</p>
                    <span class="helper">${esc(formatDateTime(item.createdAt))}</span>
                  </article>
                `).join("")}
              </div>
            `}
          </section>

          <section class="section-card">
            ${filtered.length === 0 ? `
              <div class="empty-state">
                <p>No items match the current filters.</p>
              </div>
            ` : `
              <div class="story-grid">
                ${filtered.map((item) => renderStoryCard(item)).join("")}
              </div>
            `}
          </section>
        </main>
      `
    );
  }

  function renderStoryCard(item) {
    const actions = [];
    if (item.reviewAvailable) {
      actions.push(`<button class="btn" type="button" data-route="/ride-requests/${item.requestId}/offers">Review Offers</button>`);
    }
    if (item.cancelAvailable) {
      actions.push(`<button class="btn btn-danger" type="button" data-action="cancel-request" data-request-id="${item.requestId}">Cancel Request</button>`);
    }
    if (item.paymentAvailable && item.matchId) {
      actions.push(`<button class="btn btn-secondary" type="button" data-route="/payment?rideMatchId=${item.matchId}">Open Payment</button>`);
    }
    return `
      <article class="story-card">
        <div class="card-meta">
          <strong>${esc(item.title)}</strong>
          <span class="status-pill ${esc(item.stage.toLowerCase().replace("_", "-"))}">${esc(item.stage.replace("_", " "))}</span>
        </div>
        <p><strong>Route:</strong> ${esc(item.route)}</p>
        <p><strong>Path:</strong> ${esc(pathLabel(item.type))}</p>
        <p>${esc(item.subtext)}</p>
        <p>${esc(item.detail)}</p>
        ${actions.length ? `<div class="actions-row">${actions.join("")}</div>` : ""}
      </article>
    `;
  }

  function renderRideRequestOffers(requestId) {
    const user = requireRole("RIDER");
    if (!user) return "";
    const request = getRideRequest(requestId);
    const offers = db.rideRequestOffers
      .filter((item) => item.rideRequestId === Number(requestId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (!request || request.riderId !== user.id) {
      return renderUserShell("Review Driver Offers", "Request not available.", `<main class="page-grid"><div class="empty-state"><p>This rider request is not available for the active account.</p></div></main>`);
    }
    return renderUserShell(
      "Review Driver Offers",
      "Accepting one driver offer creates a confirmed ride match and rejects the remaining offers for the same request.",
      `
        <main class="page-grid">
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/ride-requests/${request.id}/offers</span>
              <h2>Ride Request #${esc(request.id)}</h2>
              <p>${esc(request.origin)} to ${esc(request.destination)} on ${esc(request.tripDate)} at ${esc(request.tripTime)}</p>
            </div>
          </section>
          ${offers.length === 0 ? `<div class="empty-state"><p>No driver offers are available yet.</p></div>` : `
            <section class="offer-grid">
              ${offers.map((offer) => {
                const trust = getDriverTrust(offer.driverId);
                return `
                  <article class="offer-card">
                    <div class="card-meta">
                      <strong>Driver Offer #${esc(offer.id)}</strong>
                      <span class="status-pill ${offer.status.toLowerCase()}">${esc(offer.status)}</span>
                    </div>
                    <p><strong>Driver:</strong> ${esc(trust.driverName)}</p>
                    <p><strong>Seats:</strong> ${esc(offer.proposedSeats)}</p>
                    <p><strong>Meeting point:</strong> ${esc(offer.meetingPoint)}</p>
                    <p><strong>Trust:</strong> ${trust.averageRating != null ? trust.averageRating + " / 5 from " + trust.ratingCount + " rating(s)" : "No ratings yet"}</p>
                    <p><strong>Verification:</strong> ${esc(trust.licenceVerifiedStatus)}</p>
                    <div class="actions-row">
                      ${offer.status === "PENDING" && request.status === "OPEN"
                        ? `<button class="btn" type="button" data-action="accept-driver-offer" data-request-id="${request.id}" data-offer-id="${offer.id}">Accept This Offer</button>`
                        : `<button class="btn btn-secondary" type="button" disabled>${offer.status === "ACCEPTED" ? "Accepted" : "Not Available"}</button>`}
                      <button class="btn btn-secondary" type="button" data-route="/my-trips">Back to My Trips</button>
                    </div>
                  </article>
                `;
              }).join("")}
            </section>
          `}
        </main>
      `
    );
  }

  function renderRideConfirmed() {
    const user = requireSession();
    if (!user) return "";
    const payload = ui.rideConfirmed;
    const match = ui.lastConfirmedMatchId ? getRideMatch(ui.lastConfirmedMatchId) : null;
    if (!payload && !match) {
      return renderUserShell("Ride Confirmed", "No newly confirmed trip context is stored yet.", `<main class="page-grid"><div class="empty-state"><p>Submit a join request or accept a driver offer to populate this page.</p></div></main>`);
    }
    let title = "Ride Confirmed";
    let subtitle = "Your ride arrangement has been processed.";
    let summary = `<p><strong>Status:</strong> Confirmation ready.</p><p>If this page is refreshed, the transient confirmation payload may be lost.</p>`;
    let next = "<p>Open My Trips to review the latest records.</p>";
    let paymentAction = "";

    if (payload && payload.type === "JOIN_REQUEST_SUBMITTED") {
      title = "Ride Request Submitted";
      subtitle = "Your join request has been sent to the driver for review.";
      summary = `
        <p><strong>Request ID:</strong> ${esc(payload.joinRequest ? payload.joinRequest.id : "-")}</p>
        <p><strong>Route:</strong> ${esc(payload.offerDetail ? payload.offerDetail.origin : "-")} to ${esc(payload.offerDetail ? payload.offerDetail.destination : "-")}</p>
        <p><strong>Date and time:</strong> ${esc(payload.offerDetail ? payload.offerDetail.departureDate : "-")} ${esc(payload.offerDetail ? payload.offerDetail.departureTime : "-")}</p>
        <p><strong>Requested seats:</strong> ${esc(payload.requestedSeats || "-")}</p>
        <p><strong>Status:</strong> ${esc(payload.joinRequest ? payload.joinRequest.status : "PENDING")}</p>
      `;
      next = "<p>The driver will review this request in Driver Hub. Track updates in My Trips.</p>";
    } else if (payload && payload.type === "ONE_OFF_ACCEPTED") {
      title = "One-Off Ride Matched";
      subtitle = "You accepted a driver offer and the trip is now matched.";
      summary = `
        <p><strong>Ride request ID:</strong> ${esc(payload.acceptedOneOff ? payload.acceptedOneOff.rideRequestId : "-")}</p>
        <p><strong>Accepted offer ID:</strong> ${esc(payload.acceptedOneOff ? payload.acceptedOneOff.acceptedOfferId : "-")}</p>
        <p><strong>Ride match ID:</strong> ${esc(payload.acceptedOneOff ? payload.acceptedOneOff.rideMatchId : "-")}</p>
        <p><strong>Driver:</strong> ${esc(payload.selectedOneOffOffer ? payload.selectedOneOffOffer.driverName : "-")}</p>
        <p><strong>Meeting point:</strong> ${esc(payload.selectedOneOffOffer ? payload.selectedOneOffOffer.meetingPoint : "Not provided")}</p>
        <p><strong>Request status:</strong> ${esc(payload.acceptedOneOff ? payload.acceptedOneOff.rideRequestStatus : "-")}</p>
      `;
      next = "<p>This one-off request is now closed for further accepted offers. Check My Trips for the final record.</p>";
      if (payload.acceptedOneOff && payload.acceptedOneOff.rideMatchId != null) {
        paymentAction = `<button class="btn btn-secondary" type="button" data-route="/payment?rideMatchId=${esc(payload.acceptedOneOff.rideMatchId)}">Go to Payment</button>`;
      }
    } else if (match) {
      const driver = getUser(match.driverId);
      const rider = getUser(match.riderId);
      summary = `
        <p><strong>Ride Match ID:</strong> ${esc(match.id)}</p>
        <p><strong>Driver:</strong> ${driver ? esc(driver.fullName) : "Unknown driver"}</p>
        <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown rider"}</p>
        <p><strong>Meeting point:</strong> ${esc(match.meetingPoint)}</p>
        <p><strong>Status:</strong> ${esc(match.tripStatus)}</p>
      `;
      if (match.id != null) {
        paymentAction = `<button class="btn btn-secondary" type="button" data-route="/payment?rideMatchId=${esc(match.id)}">Go to Payment</button>`;
      }
    }
    return renderUserShell(
      title,
      subtitle,
      `
        <main class="page-grid">
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/ride-confirmed</span>
              <h2>${esc(title)}</h2>
              <p>${esc(subtitle)}</p>
            </div>
            ${summary}
            <div class="actions-row">
              <button class="btn" type="button" data-route="/my-trips">Open My Trips</button>
              <button class="btn btn-secondary" type="button" data-route="/">Start Another Ride Flow</button>
              ${paymentAction}
            </div>
            <div class="spacer-sm"></div>
            ${next}
          </section>
        </main>
      `
    );
  }

  function renderDriverHub() {
    const driver = requireRole("DRIVER");
    if (!driver) return "";
    const pending = getOpenJoinRequestsForDriver(driver.id);
    const openRequests = getOpenRideRequestsForDriver(driver.id);
    const history = db.rideRequestOffers
      .filter((item) => item.driverId === driver.id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return renderUserShell(
      "Driver Hub",
      "Driver work focuses on join-request decisions and one-off request responses.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">/driver-hub</span>
              <h2>Pending Join Requests</h2>
              <p>Each acceptance still requires an explicit decision and a meeting point.</p>
            </div>
            ${pending.length === 0 ? `<div class="empty-state"><p>No pending join requests for this driver.</p></div>` : `
              <div class="results-grid">
                ${pending.map((item) => {
                  const rider = getUser(item.riderId);
                  const offer = getOffer(item.rideOfferId);
                  return `
                    <article class="result-card">
                      <div class="card-meta">
                        <strong>Join Request #${esc(item.id)}</strong>
                        <span class="status-pill pending">PENDING</span>
                      </div>
                      <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown"}</p>
                      <p><strong>Offer route:</strong> ${offer ? esc(offer.origin + " to " + offer.destination) : "Unavailable"}</p>
                      <p><strong>Requested seats:</strong> ${esc(item.requestedSeats)}</p>
                      <p><strong>Current seats left:</strong> ${offer ? esc(offer.availableSeats) : "-"}</p>
                      <form class="form-grid" data-form="driver-join" data-join-id="${item.id}">
                        <label class="field">
                          Decision
                          <select name="decision">
                            <option value="ACCEPTED">Accept</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </label>
                        <label class="field">
                          Meeting point
                          <input type="text" name="meetingPoint" placeholder="Clayton Station Gate 2">
                        </label>
                        <div class="actions-row">
                          <button class="btn" type="submit">Submit Decision</button>
                        </div>
                      </form>
                    </article>
                  `;
                }).join("")}
              </div>
            `}
          </section>

          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">Driver response path</span>
              <h2>Open One-Off Ride Requests</h2>
              <p>Respond only if verification and spare-seat capacity allow the proposed offer.</p>
            </div>
            ${openRequests.length === 0 ? `<div class="empty-state"><p>No open one-off requests right now.</p></div>` : `
              <div class="results-grid">
                ${openRequests.map((request) => {
                  const rider = getUser(request.riderId);
                  const existing = history.find((item) => item.rideRequestId === request.id && item.status === "PENDING");
                  return `
                    <article class="result-card">
                      <div class="card-meta">
                        <strong>Ride Request #${esc(request.id)}</strong>
                        <span class="status-pill open">${esc(request.status)}</span>
                      </div>
                      <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown"}</p>
                      <p><strong>Route:</strong> ${esc(request.origin)} to ${esc(request.destination)}</p>
                      <p><strong>Trip:</strong> ${esc(request.tripDate)} at ${esc(request.tripTime)}</p>
                      <p><strong>Passengers:</strong> ${esc(request.passengerCount)}</p>
                      <p><strong>Notes:</strong> ${esc(request.notes || "None")}</p>
                      ${existing ? `<p class="message info">You already have pending offer #${esc(existing.id)} on this request.</p>` : `
                        <form class="form-grid" data-form="driver-request-offer" data-request-id="${request.id}">
                          <label class="field">
                            Proposed seats
                            <input type="number" name="proposedSeats" min="${esc(request.passengerCount)}" value="${esc(request.passengerCount)}">
                          </label>
                          <label class="field">
                            Meeting point
                            <input type="text" name="meetingPoint" placeholder="Box Hill Library front gate">
                          </label>
                          <div class="actions-row">
                            <button class="btn" type="submit">Respond to Request</button>
                          </div>
                        </form>
                      `}
                    </article>
                  `;
                }).join("")}
              </div>
            `}
          </section>

          <section class="section-card">
            <div class="page-header">
              <span class="route-chip">History</span>
              <h2>My One-Off Offer History</h2>
            </div>
            ${history.length === 0 ? `<div class="empty-state"><p>No one-off responses yet.</p></div>` : `
              <div class="story-grid">
                ${history.map((item) => {
                  const request = getRideRequest(item.rideRequestId);
                  return `
                    <article class="story-card">
                      <div class="card-meta">
                        <strong>Offer #${esc(item.id)}</strong>
                        <span class="status-pill ${item.status.toLowerCase()}">${esc(item.status)}</span>
                      </div>
                      <p><strong>Request:</strong> #${esc(item.rideRequestId)}</p>
                      <p><strong>Route:</strong> ${request ? esc(request.origin + " to " + request.destination) : "Unavailable"}</p>
                      <p><strong>Seats:</strong> ${esc(item.proposedSeats)}</p>
                      <p><strong>Meeting point:</strong> ${esc(item.meetingPoint)}</p>
                    </article>
                  `;
                }).join("")}
              </div>
            `}
          </section>
        </main>
      `
    );
  }

  function renderAccount() {
    const user = requireSession();
    if (!user) return "";
    const methods = db.paymentMethodsByUser[String(user.id)] || [];
    return renderUserShell(
      "Account Settings",
      "Only reset password and payment methods remain from the original account/profile surface.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <div class="split-grid">
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">/account</span>
                <h2>Reset Password</h2>
                <p>Updates are stored locally in the static demo database.</p>
              </div>
              <form class="form-grid" data-form="reset-password">
                <label class="field">
                  Current password
                  <input type="password" name="currentPassword" required>
                </label>
                <label class="field">
                  New password
                  <input type="password" name="newPassword" required>
                </label>
                <label class="field">
                  Confirm new password
                  <input type="password" name="confirmPassword" required>
                </label>
                <div class="actions-row">
                  <button class="btn" type="submit">Reset Password</button>
                </div>
              </form>
            </section>
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">Payment</span>
                <h2>Payment Methods</h2>
                <p>Saved card methods are used by the payment demo page only.</p>
              </div>
              ${methods.length === 0 ? `<div class="empty-state"><p>No payment methods saved yet.</p></div>` : `
                <div class="story-grid">
                  ${methods.map((item) => `
                    <article class="story-card">
                      <div class="card-meta">
                        <strong>${esc(item.cardType)} ending ${esc(item.last4)}</strong>
                        <span class="status-pill ${item.primary ? "confirmed" : "info"}">${item.primary ? "DEFAULT" : "SAVED"}</span>
                      </div>
                      <p><strong>Expiry:</strong> ${esc(item.expiry)}</p>
                      <div class="actions-row">
                        ${item.primary ? "" : `<button class="btn btn-secondary" type="button" data-action="set-payment-default" data-payment-id="${esc(item.id)}">Set Default</button>`}
                        <button class="btn btn-danger" type="button" data-action="remove-payment" data-payment-id="${esc(item.id)}">Remove</button>
                      </div>
                    </article>
                  `).join("")}
                </div>
              `}
              <div class="spacer-sm"></div>
              <form class="form-grid two" data-form="payment-method">
                <label class="field">
                  Card type
                  <select name="cardType">
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </label>
                <label class="field">
                  Last 4 digits
                  <input type="text" name="last4" maxlength="4" required>
                </label>
                <label class="field">
                  Expiry (MM/YY)
                  <input type="text" name="expiry" placeholder="12/29" required>
                </label>
                <label class="field">
                  Make default
                  <select name="primary">
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                  </select>
                </label>
                <div class="actions-row">
                  <button class="btn" type="submit">Save Payment Method</button>
                </div>
              </form>
            </section>
          </div>
        </main>
      `
    );
  }

  function renderPayment(matchId) {
    const user = requireRole("RIDER");
    if (!user) return "";
    const queryMatchId = Number(routeQuery().get("rideMatchId"));
    const effectiveMatchId = Number.isFinite(matchId) && matchId > 0 ? matchId : queryMatchId;
    const match = getRideMatch(effectiveMatchId);
    const methods = db.paymentMethodsByUser[String(user.id)] || [];
    if (!match) {
      return renderUserShell("Payment", "Match not found.", `<main class="page-grid"><div class="empty-state"><p>This payment target is not available.</p></div></main>`);
    }
    return renderUserShell(
      "Payment Demo",
      "Prototype-only payment page with local form handling and no real financial processing.",
      `
        <main class="page-grid">
          ${ui.flash ? `<p class="message success">${esc(ui.flash)}</p>` : ""}
          <div class="split-grid">
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">/payment?rideMatchId=${esc(match.id)}</span>
                <h2>Ride Match #${esc(match.id)}</h2>
                <p>Meeting point: ${esc(match.meetingPoint)}</p>
              </div>
              <div class="summary-bar">
                <span class="summary-pill">Trip status: ${esc(match.tripStatus)}</span>
                <span class="summary-pill">Payment status: ${esc(match.paymentStatus)}</span>
              </div>
              <form class="form-grid two" data-form="payment" data-match-id="${match.id}">
                <label class="field">
                  Card holder
                  <input type="text" name="cardHolder" value="${esc(user.fullName)}" required>
                </label>
                <label class="field">
                  Card number
                  <input type="text" name="cardNumber" placeholder="4111 1111 1111 1111" required>
                </label>
                <label class="field">
                  Expiry
                  <input type="text" name="expiry" placeholder="12/29" required>
                </label>
                <label class="field">
                  CVV
                  <input type="text" name="cvv" placeholder="123" required>
                </label>
                <div class="actions-row">
                  <button class="btn" type="submit">Confirm Demo Payment</button>
                  <button class="btn btn-secondary" type="button" data-route="/my-trips">Back to My Trips</button>
                </div>
              </form>
            </section>
            <section class="section-card">
              <div class="page-header">
                <span class="route-chip">Saved cards</span>
                <h2>Available payment methods</h2>
              </div>
              ${methods.length === 0 ? `<div class="empty-state"><p>No saved cards. Add one from Account Settings first.</p></div>` : `
                <div class="story-grid">
                  ${methods.map((item) => `
                    <article class="story-card">
                      <div class="card-meta">
                        <strong>${esc(item.cardType)} ending ${esc(item.last4)}</strong>
                        <span class="status-pill ${item.primary ? "confirmed" : "info"}">${item.primary ? "DEFAULT" : "OPTIONAL"}</span>
                      </div>
                      <p><strong>Expiry:</strong> ${esc(item.expiry)}</p>
                    </article>
                  `).join("")}
                </div>
              `}
            </section>
          </div>
        </main>
      `
    );
  }

  function renderTutorial() {
    const track = tutorialTracks[ui.tutorialTrack];
    const mode = ui.tutorialMode;
    const modeContent = mode === "GUIDED"
      ? `<div class="checklist">${track.guided.map((item) => `<div class="checklist-item"><span class="check-dot"></span><span>${esc(item)}</span></div>`).join("")}</div>`
      : mode === "TASKS"
        ? `<div class="checklist">${track.tasks.map((item) => `<div class="checklist-item"><span class="check-dot"></span><span>${esc(item)}</span></div>`).join("")}</div>`
        : mode === "DEMO"
          ? `<div class="checklist">${track.demo.map((item) => `<div class="checklist-item"><span class="check-dot"></span><span>${esc(item)}</span></div>`).join("")}</div>`
          : mode === "TROUBLE"
            ? `<div class="tutorial-grid">${track.issues.map((item) => `
                <article class="tutorial-panel">
                  <h3 class="panel-title">${esc(item.title)}</h3>
                  <p><strong>Likely cause:</strong> ${esc(item.cause)}</p>
                  <p><strong>How to fix:</strong> ${esc(item.fix)}</p>
                </article>
              `).join("")}</div>`
            : `
              <form class="form-grid" data-form="tutorial-quiz">
                ${track.quiz.map((item) => `
                  <section class="tutorial-panel">
                    <h3 class="panel-title">${esc(item.question)}</h3>
                    <div class="quiz-options">
                      ${item.options.map((option, index) => `
                        <label class="option-row">
                          <input type="radio" name="${item.id}" value="${index}" ${String(ui.tutorialAnswers[item.id]) === String(index) ? "checked" : ""}>
                          <span>${esc(option)}</span>
                        </label>
                      `).join("")}
                    </div>
                  </section>
                `).join("")}
                <div class="actions-row">
                  <button class="btn" type="submit">Check Answers</button>
                  ${ui.tutorialScoreMessage ? `<span class="pill">${esc(ui.tutorialScoreMessage)}</span>` : ""}
                </div>
              </form>
            `;

    const content = `
      <div class="dashboard-grid">
        <aside class="tutorial-side">
          <section class="tutorial-panel">
            <div class="page-header">
              <span class="route-chip">/tutorial</span>
              <h2>Tutorial Training Center</h2>
              <p>Static walkthroughs for riders and drivers. This route is intentionally direct-access rather than part of the main navigation.</p>
            </div>
            <div class="chip-row">
              ${Object.keys(tutorialTracks).map((key) => `<button class="track-btn ${ui.tutorialTrack === key ? "active" : ""}" type="button" data-action="tutorial-track" data-track="${key}">${esc(tutorialTracks[key].label)}</button>`).join("")}
            </div>
            <p>${esc(track.intro)}</p>
          </section>
          <section class="tutorial-panel">
            <h3 class="panel-title">Readiness checklist</h3>
            <div class="checklist">
              ${track.checklist.map((item) => `<div class="checklist-item"><span class="check-dot"></span><span>${esc(item)}</span></div>`).join("")}
            </div>
          </section>
        </aside>
        <section class="page-grid">
          <section class="tutorial-panel">
            <div class="chip-row">
              ${["GUIDED", "TASKS", "DEMO", "TROUBLE", "QUIZ"].map((item) => `<button class="mode-btn ${ui.tutorialMode === item ? "active" : ""}" type="button" data-action="tutorial-mode" data-mode="${item}">${item}</button>`).join("")}
            </div>
          </section>
          ${modeContent}
        </section>
      </div>
    `;
    if (session) {
      return renderUserShell("Tutorial", "Guided scripts, troubleshooting, and role-based demo prompts.", `<main class="page-grid">${content}</main>`);
    }
    return renderPublicShell("Tutorial Training Center", "You can open the tutorial before login or while signed in.", content);
  }

  function renderNotFound() {
    return renderPublicShell(
      "Route Not Found",
      "This static demo only supports the current front-end route set mapped into browser hash navigation.",
      `
        <div class="auth-panel centered">
          <p>The requested static route does not exist.</p>
          <div class="actions-row">
            <button class="btn" type="button" data-route="${session ? defaultRouteForSession(session.role) : "/login"}">Go to a valid page</button>
          </div>
        </div>
      `
    );
  }

  function handleLogin(form) {
    const email = normalizeText(form.email.value).toLowerCase();
    const password = normalizeText(form.password.value);
    const user = db.users.find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) {
      ui.loginMessage = "Invalid static demo credentials.";
      render();
      return;
    }
    saveSession({ userId: user.id, role: user.role });
    ui.loginMessage = "";
    ui.flash = "Welcome back, " + user.fullName + ".";
    ui.rideConfirmed = null;
    ui.autoRequestKey = "";
    ui.autoRequestId = null;
    navigate(defaultRouteForSession(user.role));
  }

  function handleRegister(form) {
    const fullName = normalizeText(form.fullName.value);
    const email = normalizeText(form.email.value).toLowerCase();
    const password = normalizeText(form.password.value);
    const suburb = normalizeText(form.suburb.value);
    const phone = normalizeText(form.phone.value);
    if (!fullName || !email || !password || !suburb) {
      ui.registerMessage = "Please fill all required registration fields.";
      render();
      return;
    }
    if (db.users.some((item) => item.email.toLowerCase() === email)) {
      ui.registerMessage = "That email already exists in the static demo.";
      render();
      return;
    }
    const created = {
      id: nextId(db.users),
      role: ui.registerRole,
      fullName,
      email,
      password,
      suburb,
      phone,
      accountStatus: "ACTIVE"
    };
    if (ui.registerRole === "DRIVER") {
      const vehicleInfo = normalizeText(form.vehicleInfo.value);
      const spareSeatCapacity = Math.max(1, Number(form.spareSeatCapacity.value || 1));
      const licenceDoc = form.licenceDoc.files[0] ? form.licenceDoc.files[0].name : "licence-demo.pdf";
      const seatProofDoc = form.seatProofDoc.files[0] ? form.seatProofDoc.files[0].name : "seat-proof-demo.pdf";
      const regoDoc = form.regoDoc.files[0] ? form.regoDoc.files[0].name : "rego-demo.pdf";
      created.licenceVerifiedStatus = "PENDING";
      created.vehicleInfo = vehicleInfo || "Vehicle not yet reviewed";
      created.spareSeatCapacity = spareSeatCapacity;
      created.verificationNotes = "Documents received for driver verification: " + [licenceDoc, seatProofDoc, regoDoc].join(", ");
    }
    db.users.push(created);
    saveDatabase();
    saveSession({ userId: created.id, role: created.role });
    ui.registerMessage = "";
    ui.flash = created.fullName + " was created in the static demo.";
    ui.rideConfirmed = null;
    ui.autoRequestKey = "";
    ui.autoRequestId = null;
    navigate(defaultRouteForSession(created.role));
  }

  function handleConfirmFind() {
    const user = requireRole("RIDER");
    if (!user) return;
    const draft = ui.findDraft;
    if (!normalizeText(draft.origin) || !normalizeText(draft.destination) || !normalizeText(draft.tripDate)) {
      ui.flash = "Origin, destination, and trip date are required.";
      render();
      return;
    }
    ui.flash = "";
    ui.rideConfirmed = null;
    const params = buildFindSearchParams(draft);
    navigate("/search-results?" + params.toString());
  }

  function handleResetPassword(form) {
    const user = requireSession();
    if (!user) return;
    const currentPassword = normalizeText(form.currentPassword.value);
    const newPassword = normalizeText(form.newPassword.value);
    const confirmPassword = normalizeText(form.confirmPassword.value);
    if (!currentPassword || !newPassword || !confirmPassword) {
      ui.flash = "Please fill all password fields.";
      render();
      return;
    }
    if (user.password !== currentPassword) {
      ui.flash = "Current password is incorrect.";
      render();
      return;
    }
    if (newPassword.length < 8) {
      ui.flash = "New password must be at least 8 characters.";
      render();
      return;
    }
    if (newPassword !== confirmPassword) {
      ui.flash = "New password and confirmation do not match.";
      render();
      return;
    }
    user.password = newPassword;
    saveDatabase();
    ui.flash = "Password updated for " + user.fullName + ".";
    render();
  }

  function handlePaymentMethod(form) {
    const user = requireSession();
    if (!user) return;
    const last4 = normalizeText(form.last4.value).replace(/\D/g, "");
    const expiry = normalizeText(form.expiry.value);
    if (last4.length !== 4) {
      ui.flash = "Card last 4 digits must be exactly 4 numbers.";
      render();
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      ui.flash = "Expiry format must be MM/YY.";
      render();
      return;
    }
    const primary = normalizeText(form.primary.value) === "YES";
    const list = (db.paymentMethodsByUser[String(user.id)] || []).slice();
    if (primary) {
      list.forEach((item) => {
        item.primary = false;
      });
    }
    const created = {
      id: "pm-" + Date.now(),
      cardType: normalizeText(form.cardType.value) || "Visa",
      last4,
      expiry,
      primary: primary || list.length === 0
    };
    list.unshift(created);
    db.paymentMethodsByUser[String(user.id)] = list;
    saveDatabase();
    ui.flash = created.cardType + " ending " + created.last4 + " saved.";
    render();
  }

  function handleDriverJoin(form) {
    const driver = requireRole("DRIVER");
    if (!driver) return;
    const joinId = Number(form.dataset.joinId);
    const decision = normalizeText(form.decision.value);
    const meetingPoint = normalizeText(form.meetingPoint.value);
    try {
      const match = decideJoinRequest(driver, joinId, decision, meetingPoint);
      ui.lastConfirmedMatchId = match ? match.id : ui.lastConfirmedMatchId;
      ui.flash = decision === "ACCEPTED" ? "Join request #" + joinId + " accepted." : "Join request #" + joinId + " rejected.";
    } catch (error) {
      ui.flash = error.message;
    }
    render();
  }

  function handleDriverRequestOffer(form) {
    const driver = requireRole("DRIVER");
    if (!driver) return;
    const requestId = Number(form.dataset.requestId);
    const proposedSeats = Math.max(1, Number(form.proposedSeats.value || 1));
    const meetingPoint = normalizeText(form.meetingPoint.value);
    try {
      const offer = createDriverOffer(driver, requestId, proposedSeats, meetingPoint);
      ui.flash = "Driver offer #" + offer.id + " submitted.";
    } catch (error) {
      ui.flash = error.message;
    }
    render();
  }

  function handlePayment(form) {
    const user = requireSession();
    if (!user) return;
    const match = getRideMatch(form.dataset.matchId);
    if (!match) {
      ui.flash = "Ride match not found for payment.";
      render();
      return;
    }
    const cardNumber = normalizeText(form.cardNumber.value).replace(/\s+/g, "");
    if (cardNumber.length < 12) {
      ui.flash = "Card number looks too short for the demo.";
      render();
      return;
    }
    match.paymentStatus = "PAID";
    saveDatabase();
    ui.flash = "Demo payment completed for ride match #" + match.id + ".";
    render();
  }

  document.addEventListener("click", function (event) {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      navigate(routeButton.getAttribute("data-route"));
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.getAttribute("data-action");

    if (action === "logout") {
      saveSession(null);
      ui.flash = "";
      ui.rideConfirmed = null;
      ui.autoRequestKey = "";
      ui.autoRequestId = null;
      navigate("/login");
      return;
    }
    if (action === "reset-demo") {
      resetDemoData();
      return;
    }
    if (action === "fill-login") {
      const email = actionButton.getAttribute("data-email");
      const password = actionButton.getAttribute("data-password");
      const loginForm = document.querySelector('[data-form="login"]');
      if (loginForm) {
        loginForm.email.value = email;
        loginForm.password.value = password;
      }
      return;
    }
    if (action === "register-role") {
      ui.registerRole = actionButton.getAttribute("data-role");
      render();
      return;
    }
    if (action === "set-find-step") {
      ui.findStep = actionButton.getAttribute("data-step");
      render();
      return;
    }
    if (action === "find-next") {
      ui.findStep = ui.findStep === "ORIGIN" ? "DESTINATION" : "TRIP_DATE";
      render();
      return;
    }
    if (action === "find-back") {
      ui.findStep = ui.findStep === "TRIP_DATE" ? "DESTINATION" : "ORIGIN";
      render();
      return;
    }
    if (action === "find-suggestion") {
      const step = actionButton.getAttribute("data-step");
      const value = actionButton.getAttribute("data-value");
      if (step === "ORIGIN") ui.findDraft.origin = value;
      if (step === "DESTINATION") ui.findDraft.destination = value;
      render();
      return;
    }
    if (action === "confirm-find") {
      handleConfirmFind();
      return;
    }
    if (action === "trips-stage") {
      ui.myTripsStage = actionButton.getAttribute("data-value");
      render();
      return;
    }
    if (action === "trips-path") {
      ui.myTripsPath = actionButton.getAttribute("data-value");
      render();
      return;
    }
    if (action === "mark-notifications-read") {
      const user = requireSession();
      if (user) {
        markAllNotificationsRead(user.id);
        ui.flash = "Notifications marked as read.";
        render();
      }
      return;
    }
    if (action === "accept-driver-offer") {
      const rider = requireRole("RIDER");
      if (!rider) return;
      try {
        const requestId = Number(actionButton.getAttribute("data-request-id"));
        const offerId = Number(actionButton.getAttribute("data-offer-id"));
        const selectedOffer = getRideRequestOffer(offerId);
        const selectedDriver = selectedOffer ? getUser(selectedOffer.driverId) : null;
        const match = acceptRideRequestOffer(
          rider,
          requestId,
          offerId
        );
        const request = getRideRequest(requestId);
        ui.rideConfirmed = {
          type: "ONE_OFF_ACCEPTED",
          acceptedOneOff: {
            rideRequestId: requestId,
            acceptedOfferId: offerId,
            rideMatchId: match.id,
            rideRequestStatus: request ? request.status : "MATCHED"
          },
          selectedOneOffOffer: {
            driverName: selectedDriver ? selectedDriver.fullName : "Unknown driver",
            meetingPoint: selectedOffer ? selectedOffer.meetingPoint : ""
          }
        };
        ui.flash = "";
        navigate("/ride-confirmed");
      } catch (error) {
        ui.flash = error.message;
        render();
      }
      return;
    }
    if (action === "cancel-request") {
      const rider = requireRole("RIDER");
      if (!rider) return;
      try {
        cancelRideRequest(rider, Number(actionButton.getAttribute("data-request-id")));
        ui.flash = "Ride request cancelled.";
      } catch (error) {
        ui.flash = error.message;
      }
      render();
      return;
    }
    if (action === "remove-payment") {
      const user = requireSession();
      if (!user) return;
      const paymentId = actionButton.getAttribute("data-payment-id");
      const list = (db.paymentMethodsByUser[String(user.id)] || []).filter((item) => item.id !== paymentId);
      if (list.length > 0 && !list.some((item) => item.primary)) {
        list[0].primary = true;
      }
      db.paymentMethodsByUser[String(user.id)] = list;
      saveDatabase();
      ui.flash = "Payment method removed.";
      render();
      return;
    }
    if (action === "set-payment-default") {
      const user = requireSession();
      if (!user) return;
      const paymentId = actionButton.getAttribute("data-payment-id");
      const list = (db.paymentMethodsByUser[String(user.id)] || []).map((item) => Object.assign({}, item, { primary: item.id === paymentId }));
      db.paymentMethodsByUser[String(user.id)] = list;
      saveDatabase();
      ui.flash = "Default payment method updated.";
      render();
      return;
    }
    if (action === "tutorial-track") {
      ui.tutorialTrack = actionButton.getAttribute("data-track");
      ui.tutorialMode = "GUIDED";
      ui.tutorialScoreMessage = "";
      render();
      return;
    }
    if (action === "tutorial-mode") {
      ui.tutorialMode = actionButton.getAttribute("data-mode");
      ui.tutorialScoreMessage = "";
      render();
      return;
    }
  });

  document.addEventListener("input", function (event) {
    const target = event.target;
    if (target.getAttribute("data-sync") === "find") {
      ui.findDraft[target.name] = target.value;
    }
  });

  document.addEventListener("change", function (event) {
    const input = event.target;
    if (input.closest('[data-form="tutorial-quiz"]')) {
      ui.tutorialAnswers[input.name] = Number(input.value);
    }
  });

  document.addEventListener("submit", function (event) {
    const form = event.target;
    const formType = form.getAttribute("data-form");
    if (!formType) return;
    event.preventDefault();
    if (formType === "login") handleLogin(form);
    else if (formType === "register") handleRegister(form);
    else if (formType === "join-request") {
      const rider = requireRole("RIDER");
      if (!rider) return;
      try {
        const offerId = Number(form.dataset.offerId);
        const requestedSeats = Number(form.requestedSeats.value);
        const created = createJoinRequest(rider, offerId, requestedSeats);
        const offer = getOffer(offerId);
        ui.rideConfirmed = {
          type: "JOIN_REQUEST_SUBMITTED",
          joinRequest: created,
          offerDetail: offer ? {
            offerId: offer.id,
            origin: offer.origin,
            destination: offer.destination,
            departureDate: offer.departureDate,
            departureTime: offer.departureTime,
            availableSeats: offer.availableSeats
          } : null,
          requestedSeats
        };
        ui.flash = "";
        navigate("/ride-confirmed");
      } catch (error) {
        ui.flash = error.message;
        render();
      }
    } else if (formType === "reset-password") {
      handleResetPassword(form);
    } else if (formType === "payment-method") {
      handlePaymentMethod(form);
    } else if (formType === "driver-join") {
      handleDriverJoin(form);
    } else if (formType === "driver-request-offer") {
      handleDriverRequestOffer(form);
    } else if (formType === "payment") {
      handlePayment(form);
    } else if (formType === "tutorial-quiz") {
      const track = tutorialTracks[ui.tutorialTrack];
      let correct = 0;
      track.quiz.forEach((item) => {
        if (Number(ui.tutorialAnswers[item.id]) === item.answer) correct += 1;
      });
      ui.tutorialScoreMessage = "Score: " + correct + " / " + track.quiz.length;
      render();
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();




