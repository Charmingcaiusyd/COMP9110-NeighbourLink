(function () {
  const APP_ROOT = document.getElementById("app");
  const DB_KEY = "neighbourlink.static.site.db.v3";
  const SESSION_KEY = "neighbourlink.static.site.session.v1";
  const DEMO_NOW = new Date("2026-04-09T06:00:00");
  const DEFAULT_MAP_CENTER = { latitude: -37.8136, longitude: 144.9631 };
  const mapInstances = new Map();
  const LOCATION_PRESETS = {
    Clayton: {
      name: "Clayton",
      address: "Clayton Railway Station",
      suburb: "Clayton",
      state: "VIC",
      postcode: "3168",
      latitude: -37.9241,
      longitude: 145.1207
    },
    Melbourne: {
      name: "Melbourne",
      address: "Melbourne CBD",
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      latitude: -37.8136,
      longitude: 144.9631
    },
    Docklands: {
      name: "Docklands",
      address: "Docklands Community Hub",
      suburb: "Docklands",
      state: "VIC",
      postcode: "3008",
      latitude: -37.8148,
      longitude: 144.9472
    },
    "Box Hill": {
      name: "Box Hill",
      address: "Box Hill Library",
      suburb: "Box Hill",
      state: "VIC",
      postcode: "3128",
      latitude: -37.8191,
      longitude: 145.126
    },
    Southbank: {
      name: "Southbank",
      address: "Southbank Arts Centre",
      suburb: "Southbank",
      state: "VIC",
      postcode: "3006",
      latitude: -37.821,
      longitude: 144.968
    },
    "Glen Waverley": {
      name: "Glen Waverley",
      address: "Glen Waverley Station",
      suburb: "Glen Waverley",
      state: "VIC",
      postcode: "3150",
      latitude: -37.8794,
      longitude: 145.1633
    },
    Richmond: {
      name: "Richmond",
      address: "Richmond Station",
      suburb: "Richmond",
      state: "VIC",
      postcode: "3121",
      latitude: -37.8241,
      longitude: 144.9988
    },
    Carlton: {
      name: "Carlton",
      address: "Carlton Gardens",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      latitude: -37.8048,
      longitude: 144.9717
    },
    "Monash University": {
      name: "Monash University",
      address: "Monash University Clayton Campus",
      suburb: "Clayton",
      state: "VIC",
      postcode: "3800",
      latitude: -37.9105,
      longitude: 145.134
    }
  };
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
          question: "What is the driverâ€™s main action in UC2?",
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
    menuOpen: false,
    findStep: "ORIGIN",
    findDraft: createDefaultFindDraft(),
    flash: "",
    tutorialTrack: "RIDER",
    tutorialMode: "GUIDED",
    tutorialChecklistByTrack: {},
    tutorialTroubleIndex: 0,
    tutorialQuizSubmitted: false,
    tutorialCopyFeedback: "",
    tutorialAnswers: {},
    tutorialScoreMessage: "",
    lastConfirmedMatchId: null,
    rideConfirmed: null,
    autoRequestKey: "",
    autoRequestId: null
  };

  let db = loadDatabase();
  let session = loadSession();

  function createLocationState(seed) {
    const baseName = normalizeText(seed?.name || seed?.suburb || seed?.address || "");
    const baseAddress = normalizeText(seed?.address || seed?.displayName || baseName);
    return {
      name: baseName,
      address: baseAddress,
      suburb: normalizeText(seed?.suburb || baseName),
      state: normalizeText(seed?.state || ""),
      postcode: normalizeText(seed?.postcode || ""),
      latitude: seed?.latitude ?? null,
      longitude: seed?.longitude ?? null,
      searchQuery: normalizeText(seed?.displayName || baseAddress || baseName),
      searchResults: [],
      searchLoading: false,
      searchError: "",
      mapResolving: false,
      searchTicket: 0,
      mapTicket: 0
    };
  }

  function createDefaultFindDraft() {
    return {
      origin: createLocationState(LOCATION_PRESETS.Clayton),
      destination: createLocationState(LOCATION_PRESETS.Melbourne),
      tripDate: "2026-04-09",
      departureTime: "08:30",
      timeFlexHours: "1",
      passengerCount: "1",
      notes: "Weekday commute demo",
      routePreview: null,
      routePreviewKey: "",
      routeLoading: false,
      routeError: "",
      routeTicket: 0
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
          id: 3,
          role: "RIDER",
          fullName: "Olivia Brown",
          email: "olivia.rider@example.com",
          password: "demo1234",
          suburb: "Southbank",
          phone: "0400000008",
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
          originState: "VIC",
          originPostcode: "3168",
          originLatitude: -37.9241,
          originLongitude: 145.1207,
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          destinationState: "VIC",
          destinationPostcode: "3000",
          destinationLatitude: -37.8136,
          destinationLongitude: 144.9631,
          departureDate: "2026-04-09",
          departureTime: "08:30",
          availableSeats: 1,
          status: "OPEN"
        },
        {
          id: 102,
          driverId: 12,
          origin: "Box Hill",
          originAddress: "Box Hill Library",
          originSuburb: "Box Hill",
          originState: "VIC",
          originPostcode: "3128",
          originLatitude: -37.8191,
          originLongitude: 145.126,
          destination: "Docklands",
          destinationAddress: "Docklands Community Hub",
          destinationSuburb: "Docklands",
          destinationState: "VIC",
          destinationPostcode: "3008",
          destinationLatitude: -37.8148,
          destinationLongitude: 144.9472,
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
          originState: "VIC",
          originPostcode: "3800",
          originLatitude: -37.9105,
          originLongitude: 145.134,
          destination: "Docklands",
          destinationAddress: "Docklands Library",
          destinationSuburb: "Docklands",
          destinationState: "VIC",
          destinationPostcode: "3008",
          destinationLatitude: -37.8148,
          destinationLongitude: 144.9472,
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
          originState: "VIC",
          originPostcode: "3150",
          originLatitude: -37.8794,
          originLongitude: 145.1633,
          destination: "Clayton",
          destinationAddress: "Monash University Clayton Campus",
          destinationSuburb: "Clayton",
          destinationState: "VIC",
          destinationPostcode: "3800",
          destinationLatitude: -37.9105,
          destinationLongitude: 145.134,
          departureDate: "2026-04-10",
          departureTime: "07:40",
          availableSeats: 3,
          status: "OPEN"
        },
        {
          id: 105,
          driverId: 13,
          origin: "Clayton",
          originAddress: "Monash University Clayton Campus",
          originSuburb: "Clayton",
          originState: "VIC",
          originPostcode: "3800",
          originLatitude: -37.9105,
          originLongitude: 145.134,
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          destinationState: "VIC",
          destinationPostcode: "3000",
          destinationLatitude: -37.8136,
          destinationLongitude: 144.9631,
          departureDate: "2026-04-09",
          departureTime: "09:00",
          availableSeats: 2,
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
        },
        {
          id: 304,
          rideOfferId: 104,
          riderId: 1,
          requestedSeats: 1,
          status: "ACCEPTED",
          requestDateTime: "2026-04-09T06:18:00",
          meetingPoint: "Glen Waverley Station Main Entry"
        },
        {
          id: 305,
          rideOfferId: 103,
          riderId: 1,
          requestedSeats: 1,
          status: "ACCEPTED",
          requestDateTime: "2026-04-09T06:19:00",
          meetingPoint: "Monash North Gate"
        },
        {
          id: 306,
          rideOfferId: 101,
          riderId: 3,
          requestedSeats: 1,
          status: "PENDING",
          requestDateTime: "2026-04-09T06:24:00",
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
          originState: "VIC",
          originPostcode: "3128",
          originLatitude: -37.8191,
          originLongitude: 145.126,
          destination: "Docklands",
          destinationAddress: "Docklands Community Hub",
          destinationSuburb: "Docklands",
          destinationState: "VIC",
          destinationPostcode: "3008",
          destinationLatitude: -37.8148,
          destinationLongitude: 144.9472,
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
          originState: "VIC",
          originPostcode: "3168",
          originLatitude: -37.9241,
          originLongitude: 145.1207,
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          destinationState: "VIC",
          destinationPostcode: "3000",
          destinationLatitude: -37.8136,
          destinationLongitude: 144.9631,
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
          originState: "VIC",
          originPostcode: "3168",
          originLatitude: -37.9241,
          originLongitude: 145.1207,
          destination: "Southbank",
          destinationAddress: "Southbank Arts Centre",
          destinationSuburb: "Southbank",
          destinationState: "VIC",
          destinationPostcode: "3006",
          destinationLatitude: -37.821,
          destinationLongitude: 144.968,
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
          originState: "VIC",
          originPostcode: "3168",
          originLatitude: -37.9241,
          originLongitude: 145.1207,
          destination: "Docklands",
          destinationAddress: "Docklands Library",
          destinationSuburb: "Docklands",
          destinationState: "VIC",
          destinationPostcode: "3008",
          destinationLatitude: -37.8148,
          destinationLongitude: 144.9472,
          tripDate: "2026-04-09",
          tripTime: "17:00",
          passengerCount: 1,
          notes: "Harbour event backup",
          status: "OPEN",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T06:40:00"
        },
        {
          id: 205,
          riderId: 2,
          origin: "Clayton",
          originAddress: "Monash University Clayton Campus",
          originSuburb: "Clayton",
          originState: "VIC",
          originPostcode: "3800",
          originLatitude: -37.9105,
          originLongitude: 145.134,
          destination: "Southbank",
          destinationAddress: "Southbank Arts Centre",
          destinationSuburb: "Southbank",
          destinationState: "VIC",
          destinationPostcode: "3006",
          destinationLatitude: -37.821,
          destinationLongitude: 144.968,
          tripDate: "2026-04-10",
          tripTime: "09:30",
          passengerCount: 1,
          notes: "Client meeting backup plan",
          status: "OPEN",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T06:50:00"
        },
        {
          id: 206,
          riderId: 3,
          origin: "Box Hill",
          originAddress: "Box Hill Library",
          originSuburb: "Box Hill",
          originState: "VIC",
          originPostcode: "3128",
          originLatitude: -37.8191,
          originLongitude: 145.126,
          destination: "Melbourne",
          destinationAddress: "Melbourne CBD",
          destinationSuburb: "Melbourne",
          destinationState: "VIC",
          destinationPostcode: "3000",
          destinationLatitude: -37.8136,
          destinationLongitude: 144.9631,
          tripDate: "2026-04-09",
          tripTime: "07:50",
          passengerCount: 1,
          notes: "Early shift commute fallback",
          status: "MATCHED",
          source: "AUTO_FIND",
          createdAt: "2026-04-09T05:45:00"
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
        },
        {
          id: 504,
          rideRequestId: 204,
          driverId: 11,
          proposedSeats: 1,
          meetingPoint: "Docklands Harbour Steps",
          status: "PENDING",
          createdAt: "2026-04-09T06:42:00"
        },
        {
          id: 505,
          rideRequestId: 203,
          driverId: 11,
          proposedSeats: 1,
          meetingPoint: "Arts Centre Forecourt",
          status: "REJECTED",
          createdAt: "2026-04-09T06:07:00"
        },
        {
          id: 506,
          rideRequestId: 206,
          driverId: 13,
          proposedSeats: 1,
          meetingPoint: "Parliament Station Exit",
          status: "ACCEPTED",
          createdAt: "2026-04-09T05:50:00"
        },
        {
          id: 507,
          rideRequestId: 205,
          driverId: 12,
          proposedSeats: 1,
          meetingPoint: "Monash Bus Loop",
          status: "PENDING",
          createdAt: "2026-04-09T06:55:00"
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
        },
        {
          id: 403,
          driverId: 13,
          riderId: 1,
          rideOfferId: 104,
          rideRequestId: null,
          acceptedJoinRequestId: 304,
          acceptedRideRequestOfferId: null,
          confirmedDateTime: "2026-04-09T06:21:00",
          meetingPoint: "Glen Waverley Station Main Entry",
          tripStatus: "CONFIRMED",
          paymentStatus: "UNPAID"
        },
        {
          id: 404,
          driverId: 11,
          riderId: 1,
          rideOfferId: 103,
          rideRequestId: null,
          acceptedJoinRequestId: 305,
          acceptedRideRequestOfferId: null,
          confirmedDateTime: "2026-04-09T06:23:00",
          meetingPoint: "Monash North Gate",
          tripStatus: "CONFIRMED",
          paymentStatus: "UNPAID"
        },
        {
          id: 405,
          driverId: 13,
          riderId: 3,
          rideOfferId: null,
          rideRequestId: 206,
          acceptedJoinRequestId: null,
          acceptedRideRequestOfferId: 506,
          confirmedDateTime: "2026-04-09T05:54:00",
          meetingPoint: "Parliament Station Exit",
          tripStatus: "CONFIRMED",
          paymentStatus: "UNPAID"
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
        { id: 704, userId: 1, kind: "JOIN_REQUEST_REJECTED", title: "Join request rejected", message: "Liam Patel rejected join request #303.", createdAt: "2026-04-09T06:12:00", read: true },
        { id: 705, userId: 2, kind: "REQUEST_MATCHED", title: "Backup request matched", message: "Your one-off request #202 was matched with Liam Patel.", createdAt: "2026-04-09T06:06:00", read: false },
        { id: 706, userId: 11, kind: "JOIN_REQUEST_PENDING", title: "New join request pending", message: "Olivia Brown requested 1 seat on offer #101.", createdAt: "2026-04-09T06:24:30", read: false },
        { id: 707, userId: 1, kind: "RIDE_MATCH_CONFIRMED", title: "Ride match confirmed", message: "Your join request #305 was accepted by Emma Lee.", createdAt: "2026-04-09T06:23:30", read: false },
        { id: 708, userId: 3, kind: "RIDE_MATCH_CONFIRMED", title: "One-off request matched", message: "Sophie Martin accepted request #206 and confirmed your ride.", createdAt: "2026-04-09T05:54:30", read: false }
      ],
      paymentMethodsByUser: {
        "1": [
          { id: "pm-1", cardType: "Visa", last4: "4242", expiry: "12/29", primary: true },
          { id: "pm-1b", cardType: "Mastercard", last4: "1199", expiry: "03/30", primary: false }
        ],
        "2": [
          { id: "pm-2", cardType: "Mastercard", last4: "5454", expiry: "08/28", primary: true },
          { id: "pm-2b", cardType: "Visa", last4: "7788", expiry: "11/30", primary: false }
        ],
        "3": [
          { id: "pm-3", cardType: "Visa", last4: "3300", expiry: "05/29", primary: true },
          { id: "pm-3b", cardType: "Amex", last4: "4401", expiry: "09/30", primary: false }
        ],
        "11": [
          { id: "pm-11", cardType: "Visa", last4: "6611", expiry: "06/30", primary: true },
          { id: "pm-11b", cardType: "Mastercard", last4: "8822", expiry: "02/31", primary: false }
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
    ui.menuOpen = false;
    const target = "#" + path;
    if (window.location.hash === target) {
      render();
      return;
    }
    window.location.hash = path;
  }

  function hashHref(path) {
    return "#" + path;
  }

  function defaultRouteForSession(role) {
    return role === "DRIVER" ? "/driver-hub" : "/";
  }

  function teardownMaps() {
    mapInstances.forEach((map) => {
      try {
        if (typeof map.stop === "function") {
          map.stop();
        }
        map.off();
        map.remove();
      } catch (error) {
        // Ignore cleanup issues when nodes are already gone.
      }
    });
    mapInstances.clear();
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeLocationText(location) {
    if (location && typeof location === "object") {
      return normalizeText(location.name || location.suburb || location.address || "");
    }
    return normalizeText(location);
  }

  function toNullableCoordinate(value) {
    const text = normalizeText(value);
    if (!text) return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function hasCoordinates(location) {
    return toNullableCoordinate(location?.latitude) != null && toNullableCoordinate(location?.longitude) != null;
  }

  function mapOpenStreetMapUrl(latitude, longitude, zoom = 16) {
    const lat = toNullableCoordinate(latitude);
    const lng = toNullableCoordinate(longitude);
    if (lat == null || lng == null) return "";
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
  }

  function getPresetLocation(name) {
    return LOCATION_PRESETS[normalizeText(name)] || null;
  }

  function resolveLocationDisplayName(payload) {
    return normalizeText(payload?.displayName || payload?.address || payload?.suburb || payload?.name || "");
  }

  function buildLocationAddress(payload) {
    const parts = [
      normalizeText(payload?.address),
      normalizeText(payload?.suburb),
      normalizeText(payload?.state),
      normalizeText(payload?.postcode)
    ].filter(Boolean);
    return parts.join(", ");
  }

  function extractNominatimSuburb(address) {
    return normalizeText(
      address?.suburb ||
      address?.city_district ||
      address?.town ||
      address?.city ||
      address?.village ||
      address?.hamlet ||
      address?.municipality ||
      address?.county
    );
  }

  function mapNominatimItem(item) {
    const address = item?.address || {};
    const suburb = extractNominatimSuburb(address);
    const stateText = normalizeText(address?.state || address?.territory || "");
    const postcode = normalizeText(address?.postcode || "");
    const displayName = normalizeText(item?.display_name || item?.name || suburb || "");
    const addressText = buildLocationAddress({
      address: normalizeText(
        address?.road ||
        address?.pedestrian ||
        address?.footway ||
        address?.building ||
        address?.house_number
      ),
      suburb,
      state: stateText,
      postcode
    }) || displayName;
    return {
      name: suburb || normalizeText(item?.name) || displayName,
      displayName,
      address: addressText,
      suburb: suburb || normalizeText(item?.name) || displayName,
      state: stateText,
      postcode,
      latitude: toNullableCoordinate(item?.lat),
      longitude: toNullableCoordinate(item?.lon)
    };
  }

  function applyLocationSelection(location, payload, fallback = {}) {
    const displayName = resolveLocationDisplayName(payload);
    const suburb = normalizeText(payload?.suburb || location?.suburb || "");
    const address = normalizeText(payload?.address || payload?.displayName || location?.address || displayName);
    const stateText = normalizeText(payload?.state || location?.state || "");
    const postcode = normalizeText(payload?.postcode || location?.postcode || "");
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
    location.searchError = "";
  }

  async function fetchOpenMapJson(url, fallbackMessage) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await window.fetch(url, {
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-AU,en;q=0.9"
        },
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`Map service returned ${response.status}.`);
      }
      return await response.json();
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Map service timed out. Please try again.");
      }
      throw new Error(error?.message || fallbackMessage);
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function searchAustralianLocations(query, limit = 8) {
    const endpoint = new URL("https://nominatim.openstreetmap.org/search");
    endpoint.searchParams.set("format", "jsonv2");
    endpoint.searchParams.set("addressdetails", "1");
    endpoint.searchParams.set("countrycodes", "au");
    endpoint.searchParams.set("limit", String(limit));
    endpoint.searchParams.set("q", normalizeText(query));
    const payload = await fetchOpenMapJson(endpoint.toString(), "Unable to search map locations.");
    return Array.isArray(payload) ? payload.map(mapNominatimItem) : [];
  }

  async function reverseLookupAustralia(latitude, longitude) {
    const endpoint = new URL("https://nominatim.openstreetmap.org/reverse");
    endpoint.searchParams.set("format", "jsonv2");
    endpoint.searchParams.set("addressdetails", "1");
    endpoint.searchParams.set("zoom", "18");
    endpoint.searchParams.set("lat", String(latitude));
    endpoint.searchParams.set("lon", String(longitude));
    const payload = await fetchOpenMapJson(endpoint.toString(), "Unable to resolve selected map point.");
    return mapNominatimItem(payload);
  }

  async function fetchRouteOverview(origin, destination) {
    const originLat = toNullableCoordinate(origin?.latitude);
    const originLng = toNullableCoordinate(origin?.longitude);
    const destinationLat = toNullableCoordinate(destination?.latitude);
    const destinationLng = toNullableCoordinate(destination?.longitude);
    if (originLat == null || originLng == null || destinationLat == null || destinationLng == null) {
      return null;
    }
    const endpoint = new URL(`https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}`);
    endpoint.searchParams.set("overview", "full");
    endpoint.searchParams.set("geometries", "geojson");
    const payload = await fetchOpenMapJson(endpoint.toString(), "Unable to load route preview.");
    const route = Array.isArray(payload?.routes) ? payload.routes[0] : null;
    if (!route) {
      throw new Error("No route preview available for the selected points.");
    }
    return {
      distanceKm: Number((route.distance / 1000).toFixed(1)),
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      coordinates: Array.isArray(route?.geometry?.coordinates)
        ? route.geometry.coordinates.map((pair) => [pair[1], pair[0]])
        : []
    };
  }

  async function searchLocationSuggestions(location, forceQuery = "") {
    const query = normalizeText(forceQuery || location.searchQuery || location.name || location.address);
    if (!query) {
      location.searchResults = [];
      location.searchError = "Enter suburb, postcode, or address first.";
      render();
      return;
    }

    location.searchTicket += 1;
    const ticket = location.searchTicket;
    location.searchLoading = true;
    location.searchError = "";
    render();

    try {
      const payload = await searchAustralianLocations(query, 8);
      if (ticket !== location.searchTicket) return;
      location.searchResults = Array.isArray(payload) ? payload : [];
      location.searchError = location.searchResults.length === 0
        ? "No matching locations found. Try suburb, postcode, or a fuller address."
        : "";
    } catch (error) {
      if (ticket !== location.searchTicket) return;
      location.searchResults = [];
      location.searchError = error.message || "Unable to search locations right now.";
    } finally {
      if (ticket === location.searchTicket) {
        location.searchLoading = false;
        render();
      }
    }
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

  function setupLocationMap(mapContainerId, location, { disabled = false } = {}) {
    const container = document.getElementById(mapContainerId);
    if (!container || typeof window.L === "undefined") return;

    const selectedLat = toNullableCoordinate(location.latitude);
    const selectedLng = toNullableCoordinate(location.longitude);
    const centerLat = selectedLat ?? DEFAULT_MAP_CENTER.latitude;
    const centerLng = selectedLng ?? DEFAULT_MAP_CENTER.longitude;

    const map = window.L.map(mapContainerId, {
      zoomControl: true,
      scrollWheelZoom: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    }).setView([centerLat, centerLng], selectedLat != null && selectedLng != null ? 15 : 11);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    if (selectedLat != null && selectedLng != null) {
      window.L.marker([selectedLat, selectedLng]).addTo(map);
    }

    if (!disabled) {
      map.on("click", async (event) => {
        const latitude = Number(event.latlng.lat.toFixed(6));
        const longitude = Number(event.latlng.lng.toFixed(6));
        location.mapTicket += 1;
        const ticket = location.mapTicket;
        location.mapResolving = true;
        location.searchError = "";
        try {
          const payload = await reverseLookupAustralia(latitude, longitude);
          if (ticket !== location.mapTicket) return;
          applyLocationSelection(location, payload, { latitude, longitude });
        } catch (error) {
          if (ticket !== location.mapTicket) return;
          applyLocationSelection(location, location, { latitude, longitude });
          location.searchError = error.message || "Unable to resolve selected map point.";
        } finally {
          if (ticket === location.mapTicket) {
            location.mapResolving = false;
            render();
            window.setTimeout(() => {
              ensureFindRoutePreview();
            }, 0);
          }
        }
      });
    }

    mapInstances.set(mapContainerId, map);
  }

  function setupRoutePreviewMap(mapContainerId, origin, destination, routePreview) {
    const container = document.getElementById(mapContainerId);
    if (!container || typeof window.L === "undefined") return;
    const originLat = toNullableCoordinate(origin?.latitude);
    const originLng = toNullableCoordinate(origin?.longitude);
    const destinationLat = toNullableCoordinate(destination?.latitude);
    const destinationLng = toNullableCoordinate(destination?.longitude);
    if (originLat == null || originLng == null || destinationLat == null || destinationLng == null) return;

    const map = window.L.map(mapContainerId, {
      zoomControl: true,
      scrollWheelZoom: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    }).setView([originLat, originLng], 12);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    const originMarker = window.L.marker([originLat, originLng]).addTo(map);
    originMarker.bindPopup(`Origin: ${esc(normalizeLocationText(origin))}`);
    const destinationMarker = window.L.marker([destinationLat, destinationLng]).addTo(map);
    destinationMarker.bindPopup(`Destination: ${esc(normalizeLocationText(destination))}`);

    const boundsPoints = [
      [originLat, originLng],
      [destinationLat, destinationLng]
    ];

    if (Array.isArray(routePreview?.coordinates) && routePreview.coordinates.length > 0) {
      window.L.polyline(routePreview.coordinates, {
        color: "#0f766e",
        weight: 4,
        opacity: 0.82
      }).addTo(map);
      boundsPoints.push(...routePreview.coordinates);
    }

    const bounds = window.L.latLngBounds(boundsPoints);
    map.fitBounds(bounds.pad(0.18));
    mapInstances.set(mapContainerId, map);
  }

  function renderLocationPanel(prefix, location, placeholder, scope) {
    const mapId = `location-map-find-${scope}`;
    const hasPoint = hasCoordinates(location);
    const coordLabel = hasPoint
      ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}`
      : "Not selected";
    const osmLink = hasPoint ? mapOpenStreetMapUrl(location.latitude, location.longitude) : "";
    return `
      <div class="location-picker" data-location-picker="${esc(scope)}">
        <p class="location-picker-title">${esc(prefix)}</p>
        <label class="field">
          Search location
          <div class="location-search-row">
            <input
              type="text"
              data-loc-query="${esc(scope)}"
              value="${esc(location.searchQuery || "")}"
              placeholder="${esc(placeholder)}"
            >
            <button class="btn btn-secondary" type="button" data-action="loc-search" data-scope="${esc(scope)}">
              ${location.searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </label>

        <div class="subtabs-chip-row">
          ${LOCATION_OPTIONS.map((option) => `
            <button class="story-chip" type="button" data-action="find-suggestion" data-step="${esc(scope.toUpperCase())}" data-value="${esc(option)}">${esc(option)}</button>
          `).join("")}
        </div>

        ${Array.isArray(location.searchResults) && location.searchResults.length > 0 ? `
          <div class="location-results">
            ${location.searchResults.map((item, index) => `
              <button
                class="location-result-item"
                type="button"
                data-action="loc-select"
                data-scope="${esc(scope)}"
                data-index="${index}"
              >
                <strong>${esc(resolveLocationDisplayName(item) || "Unknown location")}</strong>
                <small>${esc(normalizeText(item?.suburb || "-"))} | ${esc(normalizeText(item?.state || "-"))} | ${esc(normalizeText(item?.postcode || "-"))}</small>
              </button>
            `).join("")}
          </div>
        ` : ""}

        <div class="location-meta">
          <span><strong>Address:</strong> ${esc(location.address || "-")}</span>
          <span><strong>Suburb:</strong> ${esc(location.suburb || "-")}</span>
          <span><strong>State:</strong> ${esc(location.state || "-")}</span>
          <span><strong>Postcode:</strong> ${esc(location.postcode || "-")}</span>
          <span><strong>Coordinates:</strong> ${esc(coordLabel)}</span>
          ${osmLink ? `<span><a href="${esc(osmLink)}" target="_blank" rel="noreferrer">Open in OpenStreetMap</a></span>` : ""}
        </div>

        <p class="trip-map-note">Search by address or click a point on the live map to reverse-fill the location.</p>
        <div class="location-map-shell">
          <div id="${esc(mapId)}" class="location-map" data-location-map="1" data-scope="${esc(scope)}"></div>
        </div>

        ${location.mapResolving ? '<p class="status-note">Resolving selected map point...</p>' : ""}
        ${location.searchError ? `<p class="status-error">${esc(location.searchError)}</p>` : ""}

        <div class="flow-summary-grid">
          <label class="field">Place name<input type="text" data-loc-field="${esc(scope)}.name" value="${esc(location.name || "")}"></label>
          <label class="field">Address<input type="text" data-loc-field="${esc(scope)}.address" value="${esc(location.address || "")}"></label>
          <label class="field">Suburb<input type="text" data-loc-field="${esc(scope)}.suburb" value="${esc(location.suburb || "")}"></label>
          <label class="field">State<input type="text" data-loc-field="${esc(scope)}.state" value="${esc(location.state || "")}"></label>
          <label class="field">Postcode<input type="text" data-loc-field="${esc(scope)}.postcode" value="${esc(location.postcode || "")}"></label>
          <label class="field">Latitude<input type="number" step="any" data-loc-field="${esc(scope)}.latitude" value="${location.latitude ?? ""}"></label>
          <label class="field">Longitude<input type="number" step="any" data-loc-field="${esc(scope)}.longitude" value="${location.longitude ?? ""}"></label>
        </div>
      </div>
    `;
  }

  function renderRoutePreviewCard(routeMapId, draft, kicker, title, description) {
    const originLabel = normalizeLocationText(draft.origin) || "Not selected";
    const destinationLabel = normalizeLocationText(draft.destination) || "Not selected";
    const hasRoutePoints = hasCoordinates(draft.origin) && hasCoordinates(draft.destination);
    return `
      <div class="journey-summary-card">
        <div class="journey-summary-head">
          <p class="journey-summary-kicker">${esc(kicker)}</p>
          <h3>${esc(title)}</h3>
          <p>${esc(description)}</p>
        </div>
        <div class="journey-summary-route">
          <article class="journey-stop-card">
            <span class="journey-stop-label">Origin</span>
            <strong>${esc(originLabel)}</strong>
            <small>Live pickup point preview</small>
          </article>
          <span class="journey-route-arrow">to</span>
          <article class="journey-stop-card journey-stop-card-destination">
            <span class="journey-stop-label">Destination</span>
            <strong>${esc(destinationLabel)}</strong>
            <small>Arrival point preview</small>
          </article>
        </div>
      </div>
      <div class="search-summary-facts">
        <span class="summary-fact-chip"><strong>Date</strong>${esc(draft.tripDate || "Not set")}</span>
        <span class="summary-fact-chip"><strong>Time</strong>${esc(draft.departureTime || "Auto request")}</span>
        <span class="summary-fact-chip"><strong>Flex</strong>${esc(String(draft.timeFlexibilityHours || 0))} hour(s)</span>
      </div>
      ${hasRoutePoints ? `
        <div class="location-map-shell">
          <div id="${esc(routeMapId)}" class="location-map route-preview-map" data-route-map="1"></div>
        </div>
      ` : `
        <p class="status-note">Select both Origin and Destination with map-ready points to preview the route.</p>
      `}
      ${draft.routeLoading ? '<p class="status-note">Loading live route preview from OpenStreetMap services...</p>' : ""}
      ${draft.routePreview ? `
        <div class="search-summary-facts">
          <span class="summary-fact-chip"><strong>Distance</strong>${esc(String(draft.routePreview.distanceKm))} km</span>
          <span class="summary-fact-chip"><strong>Estimated drive</strong>${esc(String(draft.routePreview.durationMinutes))} min</span>
        </div>
      ` : ""}
      ${draft.routeError ? `<p class="status-error">${esc(draft.routeError)}</p>` : ""}
    `;
  }

  function routePreviewKey(origin, destination) {
    const originLat = toNullableCoordinate(origin?.latitude);
    const originLng = toNullableCoordinate(origin?.longitude);
    const destinationLat = toNullableCoordinate(destination?.latitude);
    const destinationLng = toNullableCoordinate(destination?.longitude);
    if (originLat == null || originLng == null || destinationLat == null || destinationLng == null) return "";
    return [originLat, originLng, destinationLat, destinationLng].join("|");
  }

  function clearFindRoutePreview() {
    ui.findDraft.routePreview = null;
    ui.findDraft.routePreviewKey = "";
    ui.findDraft.routeLoading = false;
    ui.findDraft.routeError = "";
  }

  async function ensureFindRoutePreview() {
    const draft = ui.findDraft;
    const nextKey = routePreviewKey(draft.origin, draft.destination);
    if (!nextKey) {
      clearFindRoutePreview();
      return;
    }
    if (draft.routePreviewKey === nextKey && (draft.routeLoading || draft.routePreview || draft.routeError)) {
      return;
    }
    draft.routePreviewKey = nextKey;
    draft.routePreview = null;
    draft.routeLoading = true;
    draft.routeError = "";
    draft.routeTicket += 1;
    const ticket = draft.routeTicket;
    render();
    try {
      const preview = await fetchRouteOverview(draft.origin, draft.destination);
      if (ticket !== draft.routeTicket) return;
      draft.routePreview = preview;
    } catch (error) {
      if (ticket !== draft.routeTicket) return;
      draft.routePreview = null;
      draft.routeError = error.message || "Unable to load route preview.";
    } finally {
      if (ticket === draft.routeTicket) {
        draft.routeLoading = false;
        render();
      }
    }
  }

  function searchRideOffers(filters) {
    const tripDate = normalizeText(filters.tripDate || filters.departureDate);
    const departureTime = normalizeText(filters.departureTime || filters.tripTime);
    const passengers = Number(filters.passengerCount || 1);
    const timeFlexHours = Math.max(0, Math.min(6, Number(filters.timeFlexHours || 0)));
    const originText = normalizeLocationText(filters.origin);
    const destinationText = normalizeLocationText(filters.destination);
    return db.rideOffers.filter((offer) => {
      if (offer.status !== "OPEN") return false;
      if (!samePlace(offer.origin, originText) && !samePlace(offer.originSuburb, originText)) return false;
      if (!samePlace(offer.destination, destinationText) && !samePlace(offer.destinationSuburb, destinationText)) return false;
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
    const originLabel = normalizeLocationText(draft.origin);
    const destinationLabel = normalizeLocationText(draft.destination);
    const request = {
      id: nextId(db.rideRequests),
      riderId: user.id,
      origin: originLabel,
      originAddress: normalizeText(draft.origin?.address) || originLabel + " Pickup",
      originSuburb: normalizeText(draft.origin?.suburb) || originLabel,
      originState: normalizeText(draft.origin?.state),
      originPostcode: normalizeText(draft.origin?.postcode),
      originLatitude: toNullableCoordinate(draft.origin?.latitude),
      originLongitude: toNullableCoordinate(draft.origin?.longitude),
      destination: destinationLabel,
      destinationAddress: normalizeText(draft.destination?.address) || destinationLabel + " Drop-off",
      destinationSuburb: normalizeText(draft.destination?.suburb) || destinationLabel,
      destinationState: normalizeText(draft.destination?.state),
      destinationPostcode: normalizeText(draft.destination?.postcode),
      destinationLatitude: toNullableCoordinate(draft.destination?.latitude),
      destinationLongitude: toNullableCoordinate(draft.destination?.longitude),
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

  function appendLocationParams(params, prefix, location) {
    params.set(prefix, normalizeLocationText(location));
    params.set(prefix + "Address", normalizeText(location?.address));
    params.set(prefix + "State", normalizeText(location?.state));
    params.set(prefix + "Suburb", normalizeText(location?.suburb));
    params.set(prefix + "Postcode", normalizeText(location?.postcode));
    params.set(prefix + "Latitude", normalizeText(location?.latitude));
    params.set(prefix + "Longitude", normalizeText(location?.longitude));
  }

  function readLocationFromQuery(prefix) {
    const query = routeQuery();
    return createLocationState({
      name: query.get(prefix) || "",
      address: query.get(prefix + "Address") || "",
      suburb: query.get(prefix + "Suburb") || query.get(prefix) || "",
      state: query.get(prefix + "State") || "",
      postcode: query.get(prefix + "Postcode") || "",
      latitude: query.get(prefix + "Latitude") || null,
      longitude: query.get(prefix + "Longitude") || null
    });
  }

  function buildFindSearchParams(draft) {
    const params = new URLSearchParams();
    appendLocationParams(params, "origin", draft.origin);
    appendLocationParams(params, "destination", draft.destination);
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
      origin: readLocationFromQuery("origin"),
      destination: readLocationFromQuery("destination"),
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

  function statusPillClass(status) {
    const normalized = normalizeText(status).toUpperCase();
    if (["PENDING", "OPEN", "IN_PROGRESS", "UNREAD"].includes(normalized)) return "status-pill is-pending";
    if (["ACCEPTED", "CONFIRMED", "MATCHED", "READ", "COMPLETED", "DEFAULT", "SAVED"].includes(normalized)) return "status-pill is-positive";
    if (["REJECTED", "CLOSED", "CANCELLED", "NOT_AVAILABLE"].includes(normalized)) return "status-pill is-warning";
    return "status-pill";
  }

  function getTutorialTrack(trackKey) {
    const raw = tutorialTracks[trackKey] || tutorialTracks.RIDER;
    return {
      label: raw.label,
      objective: raw.objective || raw.intro || "",
      checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
      guided: Array.isArray(raw.guided) ? raw.guided.map((step) => {
        if (typeof step === "string") {
          const parts = step.split(":");
          return parts.length > 1
            ? { title: parts[0].trim(), detail: step.slice(step.indexOf(":") + 1).trim() }
            : { title: step, detail: step };
        }
        return step;
      }) : [],
      tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
      demo: Array.isArray(raw.demo) ? raw.demo : [],
      trouble: Array.isArray(raw.trouble)
        ? raw.trouble
        : Array.isArray(raw.issues)
          ? raw.issues.map((item) => ({
            issue: item.issue || item.title || "Issue",
            cause: item.cause || "",
            fix: item.fix || "",
          }))
          : [],
      quiz: Array.isArray(raw.quiz) ? raw.quiz.map((item) => ({
        id: item.id,
        q: item.q || item.question || "",
        options: Array.isArray(item.options) ? item.options : [],
        answer: Number(item.answer || 0),
      })) : [],
    };
  }

  function buildTutorialCheatSheet(trackKey) {
    const track = getTutorialTrack(trackKey);
    const lines = [
      `NeighbourLink Tutorial Cheat Sheet - ${track.label}`,
      "",
      track.objective,
      "",
      "Checklist:",
    ];
    track.checklist.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push("", "Guided Steps:");
    track.guided.forEach((step, index) => lines.push(`${index + 1}. ${step.title} - ${step.detail}`));
    lines.push("", "Tasks:");
    track.tasks.forEach((task, index) => lines.push(`${index + 1}. ${task}`));
    return lines.join("\n");
  }

  function canAccessFindStep(step) {
    const draft = ui.findDraft;
    const originReady = Boolean(normalizeLocationText(draft.origin));
    const destinationReady = Boolean(normalizeLocationText(draft.destination));
    if (step === "ORIGIN") return true;
    if (step === "DESTINATION") return originReady;
    if (step === "TRIP") return originReady && destinationReady;
    return false;
  }

  function validateFindFlow() {
    const draft = ui.findDraft;
    if (!normalizeLocationText(draft.origin)) return { step: "ORIGIN", message: "Origin is required before moving on." };
    if (!normalizeLocationText(draft.destination)) return { step: "DESTINATION", message: "Destination is required before setting trip date." };
    if (!normalizeText(draft.tripDate)) return { step: "TRIP", message: "Trip date is required." };
    const passengerCount = Number(draft.passengerCount);
    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      return { step: "TRIP", message: "Passengers must be at least 1." };
    }
    return null;
  }

  function mountFindRideOpenMaps() {
    const draft = ui.findDraft;
    APP_ROOT.querySelectorAll("[data-find-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.findStep;
        if (canAccessFindStep(next)) {
          ui.findStep = next;
          ui.flash = "";
          render();
        }
      });
    });
    APP_ROOT.querySelectorAll("[data-find-field]").forEach((input) => {
      const eventName = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(eventName, () => {
        ui.findDraft[input.dataset.findField] = String(input.value ?? "");
        if (input.dataset.findField === "departureTime" && !normalizeText(input.value)) {
          ui.findDraft.timeFlexHours = "0";
        }
      });
    });
    APP_ROOT.querySelectorAll("[data-location-map]").forEach((node) => {
      const scope = node.getAttribute("data-scope");
      const location = scope === "origin" ? draft.origin : scope === "destination" ? draft.destination : null;
      if (!location) return;
      setupLocationMap(node.id, location);
    });
    APP_ROOT.querySelectorAll("[data-route-map]").forEach((node) => {
      setupRoutePreviewMap(node.id, draft.origin, draft.destination, draft.routePreview);
    });
    if (hasCoordinates(draft.origin) && hasCoordinates(draft.destination)) {
      ensureFindRoutePreview();
    } else {
      clearFindRoutePreview();
    }
  }

  function mountRegisterPage() {
    const form = APP_ROOT.querySelector("#register-form");
    if (!form) return;
    const roleSelect = form.querySelector('select[name="role"]');
    const driverFields = APP_ROOT.querySelector("#driver-fields");
    if (!roleSelect || !driverFields) return;
    const sync = () => {
      driverFields.style.display = roleSelect.value === "DRIVER" ? "grid" : "none";
      ui.registerRole = roleSelect.value;
    };
    sync();
    roleSelect.addEventListener("change", sync);
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

    teardownMaps();
    APP_ROOT.innerHTML = html;
    if (route === "/" && session?.role === "RIDER") {
      mountFindRideOpenMaps();
    }
    if (route === "/register") {
      mountRegisterPage();
    }
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
      <div class="intro-shell intro-shell-rich">
        <header class="intro-nav">
          <div class="intro-nav-inner">
            <a class="brand" href="${hashHref("/")}" data-nav="1">
              <span class="brand-mark">NL</span>
              <span class="brand-text"><strong>NeighbourLink</strong><span class="brand-subtitle">Native Frontend</span></span>
            </a>
            <div class="intro-nav-actions">
              <button class="intro-nav-toggle" data-action="toggle-menu" type="button">${ui.menuOpen ? "Close Menu" : "Menu"}</button>
              <nav class="intro-nav-links ${ui.menuOpen ? "is-open" : ""}">
                ${session ? `<a class="btn" href="${hashHref(defaultRouteForSession(session.role))}" data-nav="1">Open App</a>` : `<a class="btn" href="${hashHref("/login")}" data-nav="1">Log In</a>`}
              </nav>
            </div>
          </div>
        </header>
        <main class="intro-main intro-main-rich">
          <section class="intro-section">
            <h2 class="intro-section-title">${esc(title)}</h2>
            ${subtitle ? `<p class="intro-section-subtitle">${esc(subtitle)}</p>` : ""}
            ${content}
          </section>
        </main>
      </div>
    `;
  }

  function renderUserShell(title, subtitle, content) {
    const user = getUser(session.userId);
    return `
      <div class="app-shell">
        <header class="top-nav">
          <div class="nav-row">
            <a class="brand" href="${hashHref("/")}" data-nav="1">
              <span class="brand-mark">NL</span>
              <span class="brand-text"><strong>NeighbourLink</strong><span class="brand-subtitle">Community Rides</span></span>
            </a>
            <div class="nav-actions">
              <button class="nav-toggle" data-action="toggle-menu" type="button">${ui.menuOpen ? "Close Menu" : "Menu"}</button>
              <nav class="app-nav ${ui.menuOpen ? "is-open" : ""}">
                <a class="nav-link ${routePath() === "/" ? "is-active" : ""}" href="${hashHref("/")}" data-nav="1">Find a Ride</a>
                <a class="nav-link ${routePath() === "/my-trips" ? "is-active" : ""}" href="${hashHref("/my-trips")}" data-nav="1">My Trips</a>
                <a class="nav-link ${routePath() === "/account" ? "is-active" : ""}" href="${hashHref("/account")}" data-nav="1">Account</a>
                ${user.role === "DRIVER" ? `<a class="nav-link ${routePath() === "/driver-hub" ? "is-active" : ""}" href="${hashHref("/driver-hub")}" data-nav="1">Driver Hub</a>` : ""}
                <button class="btn btn-secondary nav-btn" type="button" data-action="logout">Log Out</button>
              </nav>
            </div>
          </div>
          <p class="nav-user">Signed in as <strong>${esc(user.fullName)}</strong> (${esc(user.role)})</p>
        </header>
        <main class="page-content">
          <div class="page-stack">
            <header>
              <h2>${esc(title)}</h2>
              ${subtitle ? `<p class="status-note">${esc(subtitle)}</p>` : ""}
            </header>
            ${content}
          </div>
        </main>
      </div>
    `;
  }

  function renderLogin() {
    return renderPublicShell(
      "User Login",
      "Sign in with your NeighbourLink account.",
      `
        <section class="auth-shell"><div class="auth-card">
          <form class="form-grid" data-form="login" id="login-form">
            <label>Email<input type="email" name="email" value="daniel.rider@example.com" required></label>
            <label>Password<input type="password" name="password" value="123456" required></label>
            ${ui.loginMessage ? `<p class="status-note">${esc(ui.loginMessage)}</p>` : ""}
            <p id="login-error" class="status-error" style="display:none;"></p>
            <div class="form-actions">
              <button class="btn" type="submit">Log In</button>
              <a class="btn btn-secondary" href="${hashHref("/register")}" data-nav="1">Register</a>
            </div>
          </form>
          <div class="trust-panel trust-panel-rich">
            <p><strong>Demo accounts</strong></p>
            <p><strong>Rider:</strong> <code>daniel.rider@example.com / 123456</code>, <code>maria.rider@example.com / demo1234</code>, <code>olivia.rider@example.com / demo1234</code></p>
            <p><strong>Driver:</strong> <code>emma.driver@example.com / demo1234</code>, <code>liam.driver@example.com / demo1234</code>, <code>sophie.driver@example.com / demo1234</code></p>
          </div>
        </div></section>
      `
    );
  }

  function renderRegister() {
    return renderPublicShell(
      "Register Account",
      "Create a NeighbourLink account to search rides or post one-off requests.",
      `
        <section class="auth-shell"><div class="auth-card">
          <form class="form-grid" data-form="register" id="register-form">
            <label>Full name<input name="fullName" required></label>
            <label>Email<input type="email" name="email" required></label>
            <label>Password<input type="password" name="password" minlength="8" required></label>
            <label>Phone<input name="phone" required></label>
            <label>Suburb<input name="suburb" required></label>
            <label>Role<select name="role"><option value="RIDER">RIDER</option><option value="DRIVER">DRIVER</option></select></label>
            <div id="driver-fields" class="form-grid" style="display:none;">
              <label>Vehicle info<input name="vehicleInfo"></label>
              <label>Spare seat capacity<input type="number" min="1" name="spareSeatCapacity" value="2"></label>
              <label>Driver licence file<input type="file" name="licenceDoc" accept="image/*,.pdf"></label>
              <label>Spare seat proof file<input type="file" name="seatProofDoc" accept="image/*,.pdf"></label>
              <label>Vehicle rego file<input type="file" name="regoDoc" accept="image/*,.pdf"></label>
            </div>
            ${ui.registerMessage ? `<p class="status-note">${esc(ui.registerMessage)}</p>` : ""}
            <p id="register-error" class="status-error" style="display:none;"></p>
            <div class="form-actions">
              <button class="btn" type="submit">Create Account</button>
              <a class="btn btn-secondary" href="${hashHref("/login")}" data-nav="1">Back</a>
            </div>
          </form>
        </div></section>
      `
    );
  }

  function renderFindRide() {
    const user = requireRole("RIDER");
    if (!user) return "";
    const step = ui.findStep;
    const draft = ui.findDraft;
    return renderUserShell(
      "Find a Ride",
      "",
      `
        <section class="section-card form-layout-card">
          <p>Step-by-step flow: Origin, Destination, Trip Date confirmation.</p>
          <div class="flow-step-tabs">
            <button type="button" class="flow-step-tab ${step === "ORIGIN" ? "is-active" : ""}" data-find-step="ORIGIN">Origin</button>
            <button type="button" class="flow-step-tab ${step === "DESTINATION" ? "is-active" : ""}" data-find-step="DESTINATION" ${canAccessFindStep("DESTINATION") ? "" : "disabled"}>Destination</button>
            <button type="button" class="flow-step-tab ${step === "TRIP" ? "is-active" : ""}" data-find-step="TRIP" ${canAccessFindStep("TRIP") ? "" : "disabled"}>Trip Date</button>
          </div>

          ${step === "ORIGIN" ? `<div class="flow-step-panel">${renderLocationPanel("Origin", draft.origin, "Search pickup suburb/address", "origin")}</div>` : ""}
          ${step === "DESTINATION" ? `<div class="flow-step-panel"><p class="status-note"><strong>Current origin:</strong> ${esc(normalizeLocationText(draft.origin))}. You can return to edit.</p>${renderLocationPanel("Destination", draft.destination, "Search destination suburb/address", "destination")}</div>` : ""}
          ${step === "TRIP" ? `
            <div class="flow-step-panel flow-step-panel-rich">
              <div class="journey-summary-card">
                <div class="journey-summary-head">
                  <p class="journey-summary-kicker">Search summary</p>
                  <h3>Confirm your ride search filters</h3>
                  <p>Check the route first, then fine-tune timing flexibility and passenger demand before searching available offers.</p>
                </div>
                <div class="journey-summary-route">
                  <article class="journey-stop-card">
                    <span class="journey-stop-label">Origin</span>
                    <strong>${esc(normalizeLocationText(draft.origin))}</strong>
                    <small>${esc(normalizeText(draft.origin.address) || normalizeLocationText(draft.origin))}</small>
                  </article>
                  <span class="journey-route-arrow">to</span>
                  <article class="journey-stop-card journey-stop-card-destination">
                    <span class="journey-stop-label">Destination</span>
                    <strong>${esc(normalizeLocationText(draft.destination))}</strong>
                    <small>${esc(normalizeText(draft.destination.address) || normalizeLocationText(draft.destination))}</small>
                  </article>
                </div>
              </div>

              <div class="request-detail-grid request-detail-grid-search">
                <label class="request-detail-card">
                  <span class="request-detail-label">Trip date</span>
                  <input type="date" data-find-field="tripDate" value="${esc(draft.tripDate)}">
                  <small>Search only checks offers that depart on the same day.</small>
                </label>
                <label class="request-detail-card">
                  <span class="request-detail-label">Departure time (optional)</span>
                  <input type="time" data-find-field="departureTime" value="${esc(draft.departureTime)}">
                  <small>Leave blank to search across the day instead of a specific time.</small>
                </label>
                <label class="request-detail-card">
                  <span class="request-detail-label">Time flexibility (0-6h)</span>
                  <select data-find-field="timeFlexHours">
                    ${[0, 1, 2, 3, 4, 5, 6].map((h) => `<option value="${h}" ${String(h) === String(draft.timeFlexHours || "0") ? "selected" : ""}>${h} hour${h === 1 ? "" : "s"}</option>`).join("")}
                  </select>
                  <small>Broaden the time window when you want nearby departures included.</small>
                </label>
                <label class="request-detail-card">
                  <span class="request-detail-label">Passengers</span>
                  <input type="number" min="1" data-find-field="passengerCount" value="${esc(draft.passengerCount)}">
                  <small>Only offers with enough spare seats will appear in the results.</small>
                </label>
              </div>
            </div>
          ` : ""}

          ${ui.flash ? `<p class="status-success">${esc(ui.flash)}</p>` : ""}
          <div class="form-actions">
            ${step !== "ORIGIN" ? '<button class="btn btn-secondary" type="button" data-action="find-back">Back</button>' : ""}
            ${step !== "TRIP" ? '<button class="btn" type="button" data-action="find-next">Continue</button>' : '<button class="btn" type="button" data-action="find-confirm">Confirm Flow</button>'}
          </div>
        </section>

        <section class="section-card support-guide-card">
          <p class="support-guide-kicker">Search tips</p>
          <h2>Make the search work for you</h2>
          <div class="support-guide-grid">
            <article class="support-guide-item">
              <strong>Adjust before confirm</strong>
              <p>You can move back to Origin or Destination at any time before running the final search.</p>
            </article>
            <article class="support-guide-item">
              <strong>Use time flexibility carefully</strong>
              <p>If you want more options, widen the departure window instead of locking to one exact time.</p>
            </article>
            <article class="support-guide-item">
              <strong>Fallback path available</strong>
              <p>If no ride offers match within 3 hours, the system automatically creates a one-off request and tracks it in My Trips.</p>
            </article>
          </div>
        </section>
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

    if (!normalizeLocationText(filters.origin) || !normalizeLocationText(filters.destination) || !filters.departureDate) {
      return renderUserShell(
        "Search Results",
        "",
        `
          <section class="section-card">
            <p class="status-note">This static route expects the Find a Ride flow to provide origin, destination, and date values.</p>
            <p>No valid search criteria were supplied.</p>
            <div class="form-actions">
              <a class="btn" href="${hashHref("/")}" data-nav="1">Back to Find a Ride</a>
            </div>
          </section>
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
          <section class="section-card search-summary-card">
            <div class="search-summary-head">
              <p class="support-guide-kicker">Search summary</p>
              <h2>Matching filters for this ride search</h2>
              <p>These are the criteria used to look for open ride offers before you review trust details and request a seat.</p>
            </div>
            <div class="journey-summary-route">
              <article class="journey-stop-card">
                <span class="journey-stop-label">Origin</span>
                <strong>${esc(normalizeLocationText(filters.origin) || "Any")}</strong>
                <small>Pickup suburb or address preference</small>
              </article>
              <span class="journey-route-arrow">to</span>
              <article class="journey-stop-card journey-stop-card-destination">
                <span class="journey-stop-label">Destination</span>
                <strong>${esc(normalizeLocationText(filters.destination) || "Any")}</strong>
                <small>Drop-off suburb or destination preference</small>
              </article>
            </div>
            <div class="search-summary-facts">
              <span class="summary-fact-chip"><strong>Date</strong>${esc(filters.departureDate || "Any")}</span>
              <span class="summary-fact-chip"><strong>Time</strong>${esc(filters.departureTime || "Any")}</span>
              <span class="summary-fact-chip"><strong>Time tolerance</strong>${filters.departureTime ? `+/- ${esc(filters.timeFlexHours || "0")}h` : "Not applied"}</span>
              <span class="summary-fact-chip"><strong>Passengers</strong>${esc(filters.passengerCount || "Any")}</span>
              <span class="summary-fact-chip"><strong>Auto mode</strong>${esc(autoModeLabel)}</span>
            </div>
          </section>
          <section class="section-card support-guide-card ${autoRequestReason === "NO_RESULTS" ? "support-guide-card-empty" : ""}">
            <p class="support-guide-kicker">${autoRequestReason === "NO_RESULTS" ? "Auto fallback activated" : "Auto request created"}</p>
            <h2>${autoRequestReason === "NO_RESULTS" ? "No suitable ride offers found" : "One-off ride request has been submitted"}</h2>
            <p>${autoRequestReason === "OVER_3H"
              ? "Because this trip is more than 3 hours away, the system routed your flow to Request a Ride automatically."
              : autoRequestReason === "NO_TIME"
                ? "Because no exact departure time was provided, the system routed your flow to Request a Ride automatically."
                : "Your Find a Ride flow has been automatically converted into a one-off ride request."}</p>
            <p><strong>Request ID:</strong> ${esc(created ? created.id : "-")}</p>
            <p>Redirecting to My Trips in 3 seconds...</p>
          </section>
        `
      );
    }

    ui.autoRequestKey = "";
    ui.autoRequestId = null;
    return renderUserShell(
      "Search Results",
      "Matching ride offers from the static dataset. Offer cards preserve trust, seat, and explicit join-request entry points.",
      `
        ${ui.flash ? `<p class="status-success">${esc(ui.flash)}</p>` : ""}
        <section class="section-card search-summary-card">
          <div class="search-summary-head">
            <p class="support-guide-kicker">Search summary</p>
            <h2>Matching filters for this ride search</h2>
            <p>These are the criteria used to look for open ride offers before you review trust details and request a seat.</p>
          </div>
          <div class="journey-summary-route">
            <article class="journey-stop-card">
              <span class="journey-stop-label">Origin</span>
              <strong>${esc(normalizeLocationText(filters.origin) || "Any")}</strong>
              <small>Pickup suburb or address preference</small>
            </article>
            <span class="journey-route-arrow">to</span>
            <article class="journey-stop-card journey-stop-card-destination">
              <span class="journey-stop-label">Destination</span>
              <strong>${esc(normalizeLocationText(filters.destination) || "Any")}</strong>
              <small>Drop-off suburb or destination preference</small>
            </article>
          </div>
          <div class="search-summary-facts">
            <span class="summary-fact-chip"><strong>Date</strong>${esc(filters.departureDate || "Any")}</span>
            <span class="summary-fact-chip"><strong>Time</strong>${esc(filters.departureTime || "Any")}</span>
            <span class="summary-fact-chip"><strong>Time tolerance</strong>${filters.departureTime ? `+/- ${esc(filters.timeFlexHours || "0")}h` : "Not applied"}</span>
            <span class="summary-fact-chip"><strong>Passengers</strong>${esc(filters.passengerCount || "Any")}</span>
            <span class="summary-fact-chip"><strong>Auto mode</strong>${esc(autoModeLabel)}</span>
          </div>
        </section>
        ${results.length === 0 ? `
          <div class="support-guide-card support-guide-card-empty">
            <p class="support-guide-kicker">No results</p>
            <h2>No suitable ride offers found</h2>
            <p>Try adjusting the search timing, location, or seat filters and search again.</p>
            <div class="form-actions">
              <a class="btn" href="${hashHref("/")}" data-nav="1">Back to Find a Ride</a>
            </div>
          </div>
        ` : `
          <section class="section-card">
            <div class="results-head">
              <div>
                <p class="support-guide-kicker">Search results</p>
                <h2>Matching Ride Offers</h2>
              </div>
              <p class="results-count">${results.length} offer${results.length === 1 ? "" : "s"} available</p>
            </div>
            <div class="results-grid">
              ${results.map((offer) => {
                const trust = getDriverTrust(offer.driverId);
                return `
                  <article class="result-card">
                    <div class="offer-card-head">
                      <span class="offer-card-id">Offer #${esc(offer.id)}</span>
                      <span class="offer-card-trust">${trust.averageRating != null ? `${Number(trust.averageRating).toFixed(1)} rating` : "New driver"}</span>
                    </div>
                    <h3 class="offer-card-title">${esc(trust.driverName || "Driver")}</h3>
                    <p class="offer-card-route">${esc(offer.origin)} to ${esc(offer.destination)}</p>
                    <div class="offer-card-metrics">
                      <span class="offer-metric"><strong>Date</strong>${esc(offer.departureDate)}</span>
                      <span class="offer-metric"><strong>Time</strong>${esc(offer.departureTime || "Flexible")}</span>
                      <span class="offer-metric"><strong>Seats</strong>${esc(offer.availableSeats)}</span>
                      <span class="offer-metric"><strong>Trust</strong>${trust.averageRating != null ? `${Number(trust.averageRating).toFixed(1)} (${trust.ratingCount || 0})` : "No ratings yet"}</span>
                    </div>
                    <div class="form-actions">
                      <a class="btn" href="${hashHref(`/ride-offer-details/${offer.id}${querySuffix}`)}" data-nav="1">View Details</a>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          </section>
        `}
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
      return renderUserShell("Ride Offer Details", "", `<section class="section-card"><p class="status-error">The selected offer does not exist in the static dataset.</p></section>`);
    }
    const trust = getDriverTrust(offer.driverId);
    return renderUserShell(
      "Ride Offer Details",
      "Trust cues, seat visibility, and explicit join request submission are all handled locally in this browser demo.",
      `
        ${ui.flash ? `<p class="status-success">${esc(ui.flash)}</p>` : ""}
        <section class="section-card search-summary-card detail-hero-card">
          <div class="search-summary-head">
            <p class="support-guide-kicker">Ride overview</p>
            <h2>Review trust and trip details before requesting a seat</h2>
            <p>The request action stays separate until you finish checking the driver context, timing, and remaining capacity.</p>
          </div>
          <div class="journey-summary-route">
            <article class="journey-stop-card">
              <span class="journey-stop-label">Origin</span>
              <strong>${esc(offer.origin)}</strong>
              <small>Pickup location for this offer</small>
            </article>
            <span class="journey-route-arrow">to</span>
            <article class="journey-stop-card journey-stop-card-destination">
              <span class="journey-stop-label">Destination</span>
              <strong>${esc(offer.destination)}</strong>
              <small>Drop-off destination for this offer</small>
            </article>
          </div>
        </section>

        <div class="two-column detail-card-grid">
          <section class="section-card detail-info-card">
            <p class="support-guide-kicker">Driver trust</p>
            <h2>${esc(trust.driverName || "-")}</h2>
            <div class="search-summary-facts detail-fact-grid">
              <span class="summary-fact-chip"><strong>Rating</strong>${trust.averageRating != null ? `${Number(trust.averageRating).toFixed(1)} (${trust.ratingCount || 0} ratings)` : "No ratings yet"}</span>
              <span class="summary-fact-chip"><strong>Trust signal</strong>${trust.averageRating != null ? "Rated driver" : "New driver"}</span>
            </div>
          </section>
          <section class="section-card detail-info-card">
            <p class="support-guide-kicker">Trip information</p>
            <h2>Offer conditions</h2>
            <div class="search-summary-facts detail-fact-grid">
              <span class="summary-fact-chip"><strong>Date</strong>${esc(offer.departureDate)}</span>
              <span class="summary-fact-chip"><strong>Time</strong>${esc(offer.departureTime || "Flexible")}</span>
              <span class="summary-fact-chip"><strong>Available seats</strong>${esc(offer.availableSeats)}</span>
              <span class="summary-fact-chip"><strong>Status</strong>${esc(offer.status || "")}</span>
            </div>
          </section>
        </div>
        <section class="section-card support-guide-card">
          <p class="support-guide-kicker">Seat request</p>
          <h2>Request This Ride</h2>
          <p>Choose the number of seats you need and submit the join request. The driver will review it before any match is created.</p>
          <form class="form-grid compact-form" data-form="join-request" data-offer-id="${offer.id}">
            <label>Requested seats
              <input type="number" min="1" max="${esc(Math.max(1, offer.availableSeats))}" name="requestedSeats" value="1">
            </label>
            <p id="join-error" class="status-error" style="display:none;"></p>
            <div class="form-actions">
              <button class="btn" type="submit" ${offer.availableSeats < 1 ? "disabled" : ""}>${offer.availableSeats < 1 ? "No Seats Left" : "Request This Ride"}</button>
              <a class="btn btn-secondary" href="${hashHref(backToResults)}" data-nav="1">Back to Results</a>
            </div>
          </form>
        </section>
      `
    );
  }

  function renderMyTrips() {
    const user = requireSession();
    if (!user) return "";
    const stories = user.role === "RIDER" ? buildRiderUnifiedOrders(user.id) : buildDriverStory(user.id);
    const notifications = getNotificationsForUser(user.id);
    const stageFilter = ui.myTripsStage || "ALL";
    const pathFilter = ui.myTripsPath || "ALL";
    const notificationFilter = ui.myTripsNotification || "UNREAD";
    const tripTimeFilter = ui.myTripsTripFilter || "UPCOMING";
    const tripTypeFilter = ui.myTripsTripType || "ALL";
    const filteredStories = stories.filter((item) => {
      const stageOk = stageFilter === "ALL" || item.stage === stageFilter;
      const pathOk = pathFilter === "ALL" || item.type === pathFilter;
      return stageOk && pathOk;
    });
    const filteredNotifications = notifications.filter((item) => notificationFilter === "ALL" || !item.read);
    const driverMatches = db.rideMatches
      .filter((item) => item.driverId === user.id)
      .map((item) => {
        const offer = item.rideOfferId ? getOffer(item.rideOfferId) : null;
        const request = item.rideRequestId ? getRideRequest(item.rideRequestId) : null;
        const rider = getUser(item.riderId);
        const tripDate = offer?.departureDate || request?.tripDate || "";
        const tripTime = offer?.departureTime || request?.tripTime || "";
        return {
          matchId: item.id,
          tripType: item.rideOfferId ? "JOIN_REQUEST" : "ONE_OFF_REQUEST",
          tripDate,
          tripTime,
          route: offer ? `${offer.origin} to ${offer.destination}` : request ? `${request.origin} to ${request.destination}` : "Unknown route",
          riderName: rider?.fullName || "Unknown rider",
          meetingPoint: item.meetingPoint || "Not provided",
          tripStatus: item.tripStatus || "CONFIRMED",
        };
      });
    const filteredDriverMatches = driverMatches.filter((trip) => {
      const tripAt = parseDateTime(trip.tripDate, trip.tripTime || "00:00");
      const isUpcoming = tripAt ? tripAt.getTime() >= DEMO_NOW.getTime() : true;
      const timeOk = tripTimeFilter === "UPCOMING" ? isUpcoming : !isUpcoming;
      const typeOk = tripTypeFilter === "ALL" || trip.tripType === tripTypeFilter;
      return timeOk && typeOk;
    });
    const driverOffers = db.rideRequestOffers
      .filter((item) => item.driverId === user.id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    const renderNotificationCards = filteredNotifications.length === 0
      ? "<p>No notifications in this tab.</p>"
      : `
        <div class="results-grid">
          ${filteredNotifications.map((item) => `
            <article class="result-card">
              <p><strong>Title:</strong> ${esc(item.title)}</p>
              <p><strong>Type:</strong> ${esc(item.kind || "-")}</p>
              <p><strong>Message:</strong> ${esc(item.message)}</p>
              <p><strong>Created at:</strong> ${esc(formatDateTime(item.createdAt))}</p>
              <p><strong>Status:</strong> <span class="${statusPillClass(item.read ? "READ" : "UNREAD")}">${item.read ? "Read" : "Unread"}</span></p>
            </article>
          `).join("")}
        </div>
      `;

    const renderRiderCards = filteredStories.length === 0
      ? "<p>No records found in this stage/path combination.</p>"
      : `
        <div class="results-grid unified-order-grid">
          ${filteredStories.map((item) => `
            <article class="result-card">
              <p><strong>${esc(item.title)}</strong></p>
              <p><strong>Path:</strong> ${esc(pathLabel(item.type))}</p>
              <p><strong>Route:</strong> ${esc(item.route)}</p>
              <p><strong>Summary:</strong> ${esc(item.subtext)}</p>
              <p><strong>Details:</strong> ${esc(item.detail)}</p>
              <p><strong>Time:</strong> ${esc(formatDateTime(item.sortTime))}</p>
              <p><strong>Status:</strong> <span class="${statusPillClass(item.status || item.stage)}">${esc(item.status || item.stage)}</span></p>
              <div class="form-actions">
                ${item.reviewAvailable ? `<a class="btn btn-secondary" href="${hashHref(`/ride-requests/${item.requestId}/offers`)}" data-nav="1">Review Offers</a>` : ""}
                ${item.cancelAvailable ? `<button class="btn" type="button" data-action="cancel-request" data-request-id="${esc(item.requestId)}">Cancel Request</button>` : ""}
                ${item.paymentAvailable && item.matchId ? `<a class="btn btn-secondary" href="${hashHref(`/payment?rideMatchId=${item.matchId}`)}" data-nav="1">Open Payment</a>` : ""}
              </div>
            </article>
          `).join("")}
        </div>
      `;

    const renderDriverTrips = filteredDriverMatches.length === 0
      ? ""
      : `
        <section class="section-card">
          <h2>Trip Results</h2>
          <div class="results-grid">
            ${filteredDriverMatches.map((trip) => `
              <article class="result-card">
                <p><strong>Match ID:</strong> ${esc(trip.matchId)}</p>
                <p><strong>Type:</strong> ${esc(pathLabel(trip.tripType))}</p>
                <p><strong>Rider:</strong> ${esc(trip.riderName)}</p>
                <p><strong>Route:</strong> ${esc(trip.route)}</p>
                <p><strong>Date and time:</strong> ${esc(trip.tripDate || "-")} ${esc(trip.tripTime || "-")}</p>
                <p><strong>Meeting point:</strong> ${esc(trip.meetingPoint)}</p>
                <p><strong>Status:</strong> <span class="${statusPillClass(trip.tripStatus)}">${esc(trip.tripStatus)}</span></p>
              </article>
            `).join("")}
          </div>
        </section>
      `;

    const renderDriverOfferHistory = `
      <section class="section-card">
        <h2>My One-Off Offer History</h2>
        ${driverOffers.length === 0 ? "<p>No one-off offers found in this tab.</p>" : `
          <div class="results-grid">
            ${driverOffers.map((offer) => {
              const request = getRideRequest(offer.rideRequestId);
              return `
                <article class="result-card">
                  <p><strong>Offer ID:</strong> ${esc(offer.id)}</p>
                  <p><strong>Request ID:</strong> ${esc(offer.rideRequestId)}</p>
                  <p><strong>Route:</strong> ${request ? esc(`${request.origin} to ${request.destination}`) : "Unknown route"}</p>
                  <p><strong>Trip:</strong> ${request ? esc(`${request.tripDate} ${request.tripTime}`) : "-"}</p>
                  <p><strong>Status:</strong> <span class="${statusPillClass(offer.status)}">${esc(offer.status)}</span></p>
                </article>
              `;
            }).join("")}
          </div>
        `}
      </section>
    `;

    return renderUserShell(
      "My Trips",
      "",
      `
        ${ui.flash ? `<p class="status-note">${esc(ui.flash)}</p>` : ""}
        <section class="section-card form-layout-card">
          <h2>Trip Confirmations and Notifications</h2>
          <div class="section-subtabs">
            <div class="subtabs-chip-row">
              <button class="story-chip ${notificationFilter === "UNREAD" ? "active" : ""}" type="button" data-action="trips-notification-filter" data-value="UNREAD">Unread</button>
              <button class="story-chip ${notificationFilter === "ALL" ? "active" : ""}" type="button" data-action="trips-notification-filter" data-value="ALL">All</button>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" type="button" data-action="mark-notifications-read" ${notifications.length === 0 ? "disabled" : ""}>Mark All Read</button>
            </div>
          </div>
          ${renderNotificationCards}
        </section>

        ${user.role === "RIDER" ? `
          <section class="section-card" id="unified-order-anchor">
            <h2>My Unified Orders</h2>
            <p class="status-note">All rider records are merged into one timeline card stream, newest first.</p>
            <div class="section-subtabs">
              <p class="subtabs-label">Stage</p>
              <div class="subtabs-chip-row">
                <button class="story-chip ${stageFilter === "IN_PROGRESS" ? "active" : ""}" type="button" data-action="trips-stage" data-value="IN_PROGRESS">In Progress</button>
                <button class="story-chip ${stageFilter === "CONFIRMED" ? "active" : ""}" type="button" data-action="trips-stage" data-value="CONFIRMED">Confirmed</button>
                <button class="story-chip ${stageFilter === "CLOSED" ? "active" : ""}" type="button" data-action="trips-stage" data-value="CLOSED">Closed</button>
                <button class="story-chip ${stageFilter === "ALL" ? "active" : ""}" type="button" data-action="trips-stage" data-value="ALL">All</button>
              </div>
              <p class="subtabs-label">Business path</p>
              <div class="subtabs-chip-row">
                <button class="story-chip ${pathFilter === "ALL" ? "active" : ""}" type="button" data-action="trips-path" data-value="ALL">All Paths</button>
                <button class="story-chip ${pathFilter === "JOIN_REQUEST" ? "active" : ""}" type="button" data-action="trips-path" data-value="JOIN_REQUEST">Join Path</button>
                <button class="story-chip ${pathFilter === "ONE_OFF_REQUEST" ? "active" : ""}" type="button" data-action="trips-path" data-value="ONE_OFF_REQUEST">One-Off Path</button>
              </div>
            </div>
            ${renderRiderCards}
          </section>
        ` : `
          <section class="section-card form-layout-card">
            <h2>Trip Filter</h2>
            <div class="section-subtabs">
              <p class="subtabs-label">Trip time category</p>
              <div class="subtabs-row">
                <button class="${tripTimeFilter === "UPCOMING" ? "btn" : "btn btn-secondary"}" type="button" data-action="trips-trip-filter" data-value="UPCOMING">Upcoming</button>
                <button class="${tripTimeFilter === "HISTORY" ? "btn" : "btn btn-secondary"}" type="button" data-action="trips-trip-filter" data-value="HISTORY">History</button>
              </div>
              <p class="subtabs-label">Trip type view</p>
              <div class="subtabs-chip-row">
                <button class="story-chip ${tripTypeFilter === "ALL" ? "active" : ""}" type="button" data-action="trips-trip-type" data-value="ALL">All Types</button>
                <button class="story-chip ${tripTypeFilter === "JOIN_REQUEST" ? "active" : ""}" type="button" data-action="trips-trip-type" data-value="JOIN_REQUEST">Join Request</button>
                <button class="story-chip ${tripTypeFilter === "ONE_OFF_REQUEST" ? "active" : ""}" type="button" data-action="trips-trip-type" data-value="ONE_OFF_REQUEST">One-Off Request</button>
              </div>
              <p class="status-note">Showing ${filteredDriverMatches.length} trip(s) with this filter combination.</p>
            </div>
          </section>
          ${filteredDriverMatches.length === 0 ? `
            <section class="section-card">
              <h2>No Confirmed Trips Yet</h2>
              <p>You currently have request or offer activity, but no confirmed driver trip matches in this filter.</p>
            </section>
          ` : ""}
          ${renderDriverTrips}
          ${renderDriverOfferHistory}
        `}
      `
    );
  }

  function renderRideRequestOffers(requestId) {
    const user = requireRole("RIDER");
    if (!user) return "";
    const request = getRideRequest(requestId);
    const offers = db.rideRequestOffers
      .filter((item) => item.rideRequestId === Number(requestId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (!request || request.riderId !== user.id) {
      return renderUserShell("Ride Request Offers", "", `<section class="section-card"><p class="status-error">This rider request is not available for the active account.</p></section>`);
    }
    return renderUserShell(
      "Ride Request Offers",
      "",
      `
        <section class="section-card" id="request-offer-box">
          ${offers.length === 0 ? `
            <h2>No Offers Yet</h2>
            <p>No driver responses have arrived for this request.</p>
          ` : `
            <h2>Available Driver Offers</h2>
            <div class="results-grid">
              ${offers.map((offer) => {
                const trust = getDriverTrust(offer.driverId);
                return `
                  <article class="result-card">
                    <p><strong>Offer #${esc(offer.id)}</strong></p>
                    <p><strong>Driver:</strong> ${esc(trust.driverName || "-")}</p>
                    <p><strong>Proposed seats:</strong> ${esc(offer.proposedSeats)}</p>
                    <p><strong>Meeting point:</strong> ${esc(offer.meetingPoint || "Not provided")}</p>
                    <p><strong>Status:</strong> ${esc(offer.status)}</p>
                    <p><strong>Submitted:</strong> ${esc(formatDateTime(offer.createdAt))}</p>
                    <div class="trust-panel">
                      <p><strong>Driver trust summary</strong></p>
                      <p><strong>Rating:</strong> ${trust.averageRating != null ? `${Number(trust.averageRating).toFixed(1)} (${trust.ratingCount || 0} ratings)` : "No ratings yet"}</p>
                      <p><strong>Trust signal:</strong> ${trust.averageRating != null ? "Rated driver" : "New driver"}</p>
                    </div>
                    <div class="form-actions">
                      ${offer.status === "PENDING" && request.status === "OPEN"
                        ? `<button class="btn" type="button" data-action="accept-driver-offer" data-request-id="${request.id}" data-offer-id="${offer.id}">Accept This Offer</button>`
                        : `<button class="btn btn-secondary" type="button" disabled>${offer.status === "ACCEPTED" ? "Already Accepted" : "Not Acceptable"}</button>`}
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
            <div class="form-actions form-actions-top">
              <a class="btn btn-secondary" href="${hashHref("/")}" data-nav="1">Start a New Ride Flow</a>
              <a class="btn" href="${hashHref("/my-trips")}" data-nav="1">Back to My Trips</a>
            </div>
          `}
        </section>
      `
    );
  }

  function renderRideConfirmed() {
    const user = requireSession();
    if (!user) return "";
    const payload = ui.rideConfirmed;
    const match = ui.lastConfirmedMatchId ? getRideMatch(ui.lastConfirmedMatchId) : null;
    if (!payload && !match) {
      return renderUserShell("Ride Confirmed", "", `<section class="section-card"><p>No newly confirmed trip context is stored yet.</p><p>Submit a join request or accept a driver offer to populate this page.</p></section>`);
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
        paymentAction = `<a class="btn btn-secondary" href="${hashHref(`/payment?rideMatchId=${payload.acceptedOneOff.rideMatchId}`)}" data-nav="1">Go to Payment</a>`;
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
        paymentAction = `<a class="btn btn-secondary" href="${hashHref(`/payment?rideMatchId=${match.id}`)}" data-nav="1">Go to Payment</a>`;
      }
    }
    return renderUserShell(
      title,
      "",
      `
        <p>${esc(subtitle)}</p>
        <section class="section-card"><h2>Trip Summary</h2>${summary}</section>
        <section class="section-card">
          <h2>Next Steps</h2>
          ${next}
          <div class="form-actions">
            <a class="btn" href="${hashHref("/my-trips")}" data-nav="1">Open My Trips</a>
            <a class="btn btn-secondary" href="${hashHref("/")}" data-nav="1">Return Home</a>
            <a class="btn btn-secondary" href="${hashHref("/")}" data-nav="1">Start Another Ride Flow</a>
            ${paymentAction}
          </div>
        </section>
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
      "",
      `
        <p>Manage rider join requests and respond to open one-off requests.</p>
        ${ui.flash ? `<p class="status-note">${esc(ui.flash)}</p>` : ""}
        <section class="section-card">
          <h2>Pending Join Requests</h2>
          ${pending.length === 0 ? `<p>No pending join requests.</p>` : `
            <div class="results-grid">
              ${pending.map((item) => {
                const rider = getUser(item.riderId);
                const offer = getOffer(item.rideOfferId);
                return `
                  <article class="result-card">
                    <p><strong>Request ID:</strong> ${esc(item.id)}</p>
                    <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown"}</p>
                    <p><strong>Route:</strong> ${offer ? esc(`${offer.origin} to ${offer.destination}`) : "Unavailable"}</p>
                    <p><strong>Trip:</strong> ${offer ? esc(`${offer.departureDate} ${offer.departureTime}`) : "-"}</p>
                    <p><strong>Requested seats:</strong> ${esc(item.requestedSeats)}</p>
                    <p><strong>Current available seats:</strong> ${offer ? esc(offer.availableSeats) : "-"}</p>
                    <form class="form-grid compact-form" data-form="driver-join" data-join-id="${item.id}">
                      <label>Decision
                        <select name="decision">
                          <option value="ACCEPTED">Accept</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </label>
                      <label>Meeting point (for accept)
                        <input type="text" name="meetingPoint" placeholder="Clayton Station Gate 2">
                      </label>
                      <div class="form-actions">
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
          <h2>Open One-Off Ride Requests</h2>
          <p class="status-note">Respond only when your account is active, verified, and seat capacity is sufficient.</p>
          ${openRequests.length === 0 ? `<p>No open one-off requests right now.</p>` : `
            <div class="results-grid">
              ${openRequests.map((request) => {
                const rider = getUser(request.riderId);
                const existing = history.find((item) => item.rideRequestId === request.id && item.status === "PENDING");
                return `
                  <article class="result-card">
                    <p><strong>Request ID:</strong> ${esc(request.id)}</p>
                    <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown"}</p>
                    <p><strong>Route:</strong> ${esc(request.origin)} to ${esc(request.destination)}</p>
                    <p><strong>Trip:</strong> ${esc(request.tripDate)} ${esc(request.tripTime)}</p>
                    <p><strong>Passenger count:</strong> ${esc(request.passengerCount)}</p>
                    ${request.notes ? `<p><strong>Notes:</strong> ${esc(request.notes)}</p>` : ""}
                    ${existing ? `<p class="status-note"><strong>Existing response:</strong> Offer #${esc(existing.id)} is still ${esc(existing.status)}.</p>` : `
                      <form class="form-grid compact-form" data-form="driver-request-offer" data-request-id="${request.id}">
                        <label>Proposed seats
                          <input type="number" name="proposedSeats" min="${esc(request.passengerCount)}" value="${esc(request.passengerCount)}">
                        </label>
                        <label>Meeting point
                          <input type="text" name="meetingPoint" placeholder="Box Hill Library front gate">
                        </label>
                        <div class="form-actions">
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
          <h2>My One-Off Offer History</h2>
          ${history.length === 0 ? `<p>You have not submitted one-off offers yet.</p>` : `
            <div class="results-grid">
              ${history.map((item) => {
                const request = getRideRequest(item.rideRequestId);
                const rider = request ? getUser(request.riderId) : null;
                return `
                  <article class="result-card">
                    <p><strong>Offer ID:</strong> ${esc(item.id)}</p>
                    <p><strong>Request ID:</strong> ${esc(item.rideRequestId)}</p>
                    <p><strong>Rider:</strong> ${rider ? esc(rider.fullName) : "Unknown"}</p>
                    <p><strong>Route:</strong> ${request ? esc(`${request.origin} to ${request.destination}`) : "Unavailable"}</p>
                    <p><strong>Trip:</strong> ${request ? esc(`${request.tripDate} ${request.tripTime}`) : "-"}</p>
                    <p><strong>Proposed seats:</strong> ${esc(item.proposedSeats)}</p>
                    <p><strong>Meeting point:</strong> ${esc(item.meetingPoint || "Not provided")}</p>
                    <p><strong>Status:</strong> <span class="${statusPillClass(item.status)}">${esc(item.status)}</span></p>
                  </article>
                `;
              }).join("")}
            </div>
          `}
        </section>
      `
    );
  }

  function renderAccount() {
    const user = requireSession();
    if (!user) return "";
    const methods = db.paymentMethodsByUser[String(user.id)] || [];
    return renderUserShell(
      "Account Settings",
      "",
      `
        <section class="section-card">
          <h2>Reset Password</h2>
          <p class="status-note">Update your account password securely.</p>
          ${ui.flash ? `<p class="status-note">${esc(ui.flash)}</p>` : ""}
          <form class="form-grid compact-form" data-form="reset-password">
            <label>Current password<input type="password" name="currentPassword" autocomplete="current-password" required></label>
            <label>New password<input type="password" name="newPassword" autocomplete="new-password" required></label>
            <label>Confirm new password<input type="password" name="confirmPassword" autocomplete="new-password" required></label>
            <div class="form-actions">
              <button class="btn" type="submit">Reset Password</button>
            </div>
          </form>
        </section>
        <section class="section-card">
          <h2>Payment Methods</h2>
          <p class="status-note">Basic payment setup for demo checkout pages.</p>
          ${methods.length === 0 ? "<p>No payment methods saved yet.</p>" : `
            <div class="results-grid">
              ${methods.map((item) => `
                <article class="result-card">
                  <p><strong>${esc(item.cardType)}</strong>${item.primary ? " (Default)" : ""}</p>
                  <p><strong>Card:</strong> **** **** **** ${esc(item.last4)}</p>
                  <p><strong>Expiry:</strong> ${esc(item.expiry)}</p>
                  <div class="form-actions">
                    ${item.primary ? "" : `<button class="btn btn-secondary" type="button" data-action="set-payment-default" data-payment-id="${esc(item.id)}">Set Default</button>`}
                    <button class="btn btn-secondary" type="button" data-action="remove-payment" data-payment-id="${esc(item.id)}">Remove</button>
                  </div>
                </article>
              `).join("")}
            </div>
          `}
          <form class="form-grid compact-form" data-form="payment-method">
            <label>
              Card type
              <select name="cardType">
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">Amex</option>
              </select>
            </label>
            <label>Card last 4 digits<input type="text" name="last4" inputmode="numeric" maxlength="4" placeholder="4242" required></label>
            <label>Expiry (MM/YY)<input type="text" name="expiry" maxlength="5" placeholder="12/29" required></label>
            <label>
              Set as default
              <select name="primary">
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </label>
            <div class="form-actions">
              <button class="btn" type="submit">Save Payment Method</button>
            </div>
          </form>
        </section>
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
      return renderUserShell("Payment (Demo)", "", `<section class="section-card"><p class="status-error">This payment target is not available.</p></section>`);
    }
    return renderUserShell(
      "Payment (Demo)",
      "",
      `
        <section class="section-card form-layout-card">
          <p class="status-note">Prototype-only payment template. No real card processing is performed.</p>
          ${ui.flash ? `<p class="status-note">${esc(ui.flash)}</p>` : ""}
          <h2>Credit Card Checkout</h2>
          <p><strong>Ride Match ID:</strong> ${esc(match.id)}</p>
          <p><strong>Meeting point:</strong> ${esc(match.meetingPoint || "Not provided")}</p>
          <p><strong>Trip status:</strong> ${esc(match.tripStatus || "CONFIRMED")}</p>
          <p><strong>Payment status:</strong> ${esc(match.paymentStatus || "UNPAID")}</p>
          <form class="form-grid compact-form" data-form="payment" data-match-id="${match.id}">
            <label>Cardholder name<input type="text" name="cardHolder" value="${esc(user.fullName)}" required></label>
            <label>Card number<input type="text" name="cardNumber" placeholder="4242 4242 4242 4242" required></label>
            <label>Expiry<input type="text" name="expiry" placeholder="MM/YY" required></label>
            <label>CVV<input type="text" name="cvv" placeholder="123" required></label>
            <div class="form-actions">
              <button class="btn" type="submit">Pay Now (Demo)</button>
              <a class="btn btn-secondary" href="${hashHref("/my-trips")}" data-nav="1">Back to My Trips</a>
            </div>
          </form>
          ${methods.length === 0 ? "<p class=\"status-note\">No saved cards. Add one from Account Settings first.</p>" : `
            <div class="results-grid">
              ${methods.map((item) => `
                <article class="result-card">
                  <p><strong>${esc(item.cardType)}</strong>${item.primary ? " (Default)" : ""}</p>
                  <p><strong>Card:</strong> **** **** **** ${esc(item.last4)}</p>
                  <p><strong>Expiry:</strong> ${esc(item.expiry)}</p>
                </article>
              `).join("")}
            </div>
          `}
        </section>
      `
    );
  }

  function renderTutorial() {
    const track = getTutorialTrack(ui.tutorialTrack);
    const checklistState = ui.tutorialChecklistByTrack[ui.tutorialTrack] || {};
    const done = track.checklist.reduce((sum, _item, idx) => (checklistState[idx] ? sum + 1 : sum), 0);
    const progress = track.checklist.length ? Math.round((done / track.checklist.length) * 100) : 0;
    const quizScore = track.quiz.reduce((sum, item) => (Number(ui.tutorialAnswers[item.id]) === item.answer ? sum + 1 : sum), 0);

    return renderPublicShell(
      "Tutorial Training Center",
      "Practical onboarding with guided steps, tasks, demo script, troubleshooting, and quiz.",
      `
        <section class="tutorial-master tutorial-master-rich">
          <div class="tutorial-top-grid">
            <aside class="tutorial-sidebar tutorial-sidebar-rich">
              <p class="tutorial-label">Choose Track</p>
              <div class="tutorial-role-list">
                ${Object.keys(tutorialTracks).map((key) => `<button type="button" class="tutorial-role-btn ${ui.tutorialTrack === key ? "active" : ""}" data-action="tutorial-track" data-track="${key}">${esc(getTutorialTrack(key).label)}</button>`).join("")}
              </div>
              <div class="tutorial-progress-card ${progress >= 80 ? "is-high" : progress >= 45 ? "is-mid" : "is-low"}">
                <div class="tutorial-progress-head"><strong>Progress</strong><span>${progress}%</span></div>
                <div class="tutorial-progress-bar"><span class="tutorial-progress-fill" style="width:${progress}%"></span></div>
                <p class="tutorial-progress-meta">${done}/${track.checklist.length} readiness items completed.</p>
                <ul class="tutorial-checklist">
                  ${track.checklist.map((item, idx) => `
                    <li><label><input type="checkbox" data-check-index="${idx}" ${checklistState[idx] ? "checked" : ""}><span>${esc(item)}</span></label></li>
                  `).join("")}
                </ul>
              </div>
            </aside>

            <article class="tutorial-board tutorial-board-rich">
              <header class="tutorial-board-head">
                <p class="tutorial-pill">${esc(track.label)}</p>
                <h3>${esc(track.objective)}</h3>
              </header>

              <div class="tutorial-mode-tabs">
                <button type="button" class="tutorial-mode-btn ${ui.tutorialMode === "GUIDED" ? "active" : ""}" data-action="tutorial-mode" data-mode="GUIDED"><span class="mode-title">Guided Path</span><span class="mode-desc">Scenario checkpoints</span></button>
                <button type="button" class="tutorial-mode-btn ${ui.tutorialMode === "TASKS" ? "active" : ""}" data-action="tutorial-mode" data-mode="TASKS"><span class="mode-title">Task Playbooks</span><span class="mode-desc">Execution cards</span></button>
                <button type="button" class="tutorial-mode-btn ${ui.tutorialMode === "DEMO" ? "active" : ""}" data-action="tutorial-mode" data-mode="DEMO"><span class="mode-title">Demo Script</span><span class="mode-desc">Timeline cues</span></button>
                <button type="button" class="tutorial-mode-btn ${ui.tutorialMode === "TROUBLE" ? "active" : ""}" data-action="tutorial-mode" data-mode="TROUBLE"><span class="mode-title">Troubleshooting</span><span class="mode-desc">Issue-fix pairs</span></button>
                <button type="button" class="tutorial-mode-btn ${ui.tutorialMode === "QUIZ" ? "active" : ""}" data-action="tutorial-mode" data-mode="QUIZ"><span class="mode-title">Knowledge Check</span><span class="mode-desc">Self validation</span></button>
              </div>

              ${ui.tutorialMode === "GUIDED" ? `
                <ol class="tutorial-step-list">
                  ${track.guided.map((step, idx) => `
                    <li class="tutorial-step-card">
                      <span class="tutorial-step-index">Step ${idx + 1}</span>
                      <div class="tutorial-step-content"><h5>${esc(step.title)}</h5><p>${esc(step.detail)}</p></div>
                    </li>
                  `).join("")}
                </ol>
              ` : ""}

              ${ui.tutorialMode === "TASKS" ? `<div class="tutorial-task-grid">${track.tasks.map((task) => `<article class="tutorial-card tutorial-task-card"><p>${esc(task)}</p></article>`).join("")}</div>` : ""}
              ${ui.tutorialMode === "DEMO" ? `<div class="tutorial-demo-list">${track.demo.map((line) => `<article class="tutorial-card tutorial-demo-item"><div class="tutorial-demo-content"><p>${esc(line)}</p></div></article>`).join("")}</div>` : ""}

              ${ui.tutorialMode === "TROUBLE" ? `
                <div class="tutorial-trouble-list">
                  ${track.trouble.map((item, idx) => `
                    <article class="tutorial-card tutorial-trouble-item">
                      <button type="button" class="tutorial-trouble-toggle" data-action="tutorial-trouble-toggle" data-trouble-index="${idx}">
                        <span>${esc(item.issue)}</span><span>${ui.tutorialTroubleIndex === idx ? "-" : "+"}</span>
                      </button>
                      ${ui.tutorialTroubleIndex === idx ? `<div class="tutorial-trouble-body"><p><strong>Likely cause:</strong> ${esc(item.cause)}</p><p><strong>How to fix:</strong> ${esc(item.fix)}</p></div>` : ""}
                    </article>
                  `).join("")}
                </div>
              ` : ""}

              ${ui.tutorialMode === "QUIZ" ? `
                <form class="tutorial-quiz-form" data-form="tutorial-quiz">
                  ${track.quiz.map((item, idx) => `
                    <article class="tutorial-card tutorial-question-card">
                      <p class="tutorial-card-title">Q${idx + 1}. ${esc(item.q)}</p>
                      <div class="tutorial-option-list">
                        ${item.options.map((option, optionIdx) => `
                          <label class="tutorial-option-item">
                            <input type="radio" name="${esc(item.id)}" data-quiz-id="${esc(item.id)}" value="${optionIdx}" ${Number(ui.tutorialAnswers[item.id]) === optionIdx ? "checked" : ""}>
                            <span>${esc(option)}</span>
                          </label>
                        `).join("")}
                      </div>
                      ${ui.tutorialQuizSubmitted ? `<p class="${Number(ui.tutorialAnswers[item.id]) === item.answer ? "status-success" : "status-note"}">${Number(ui.tutorialAnswers[item.id]) === item.answer ? "Correct." : "Not correct yet."}</p>` : ""}
                    </article>
                  `).join("")}
                  <div class="tutorial-cta">
                    <button class="btn" type="submit">Submit Answers</button>
                    <button class="btn btn-secondary" type="button" data-action="tutorial-reset-quiz">Reset Quiz</button>
                    ${ui.tutorialQuizSubmitted ? `<p class="tutorial-quiz-score">Score: ${quizScore}/${track.quiz.length}</p>` : ""}
                  </div>
                </form>
              ` : ""}

              <div class="tutorial-cta">
                <button class="btn btn-secondary" type="button" data-action="tutorial-copy">Copy 1-Page Cheat Sheet</button>
                ${ui.tutorialCopyFeedback ? `<span class="tutorial-copy-feedback">${esc(ui.tutorialCopyFeedback)}</span>` : ""}
              </div>
              <div class="tutorial-cta">
                <a class="btn" href="${hashHref(session ? "/" : "/login")}" data-nav="1">${session ? "Open App" : "Log In"}</a>
                <a class="btn btn-secondary" href="${hashHref("/my-trips")}" data-nav="1">Open My Trips</a>
              </div>
            </article>
          </div>
        </section>
      `
    );
  }

  function renderNotFound() {
    return renderPublicShell(
      "Route Not Found",
      "This static demo only supports the current front-end route set mapped into browser hash navigation.",
      `
        <section class="auth-shell">
          <div class="auth-card">
          <p>The requested static route does not exist.</p>
          <div class="form-actions">
            <a class="btn" href="${hashHref(session ? defaultRouteForSession(session.role) : "/login")}" data-nav="1">Go to a valid page</a>
          </div>
          </div>
        </section>
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
    const role = normalizeText(form.role?.value || ui.registerRole || "RIDER");
    if (!fullName || !email || !password || !suburb) {
      ui.registerMessage = "Please fill all required registration fields.";
      render();
      return;
    }
    if (password.length < 8) {
      ui.registerMessage = "Password must be at least 8 characters.";
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
      role,
      fullName,
      email,
      password,
      suburb,
      phone,
      accountStatus: "ACTIVE"
    };
    if (role === "DRIVER") {
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
    if (!normalizeLocationText(draft.origin) || !normalizeLocationText(draft.destination) || !normalizeText(draft.tripDate)) {
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
    const navAnchor = event.target.closest('a[data-nav="1"]');
    if (navAnchor) {
      event.preventDefault();
      const href = navAnchor.getAttribute("href") || "";
      if (href.startsWith("#")) {
        navigate(href.slice(1));
      } else {
        navigate(href);
      }
      return;
    }

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
    if (action === "toggle-menu") {
      ui.menuOpen = !ui.menuOpen;
      render();
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
      const next = actionButton.getAttribute("data-step");
      if (canAccessFindStep(next)) {
        ui.findStep = next;
        ui.flash = "";
        render();
      }
      return;
    }
    if (action === "find-next") {
      ui.flash = "";
      if (ui.findStep === "ORIGIN") {
        if (!normalizeLocationText(ui.findDraft.origin)) {
          ui.flash = "Origin is required before moving on.";
          render();
          return;
        }
        ui.findStep = "DESTINATION";
      } else if (ui.findStep === "DESTINATION") {
        if (!normalizeLocationText(ui.findDraft.destination)) {
          ui.flash = "Destination is required before moving on.";
          render();
          return;
        }
        ui.findStep = "TRIP";
      }
      render();
      return;
    }
    if (action === "find-back") {
      ui.flash = "";
      ui.findStep = ui.findStep === "TRIP" ? "DESTINATION" : "ORIGIN";
      render();
      return;
    }
    if (action === "loc-search") {
      const scope = actionButton.getAttribute("data-scope");
      const location = scope === "origin" ? ui.findDraft.origin : scope === "destination" ? ui.findDraft.destination : null;
      if (location) {
        searchLocationSuggestions(location);
      }
      return;
    }
    if (action === "loc-select") {
      const scope = actionButton.getAttribute("data-scope");
      const index = Number(actionButton.getAttribute("data-index"));
      const location = scope === "origin" ? ui.findDraft.origin : scope === "destination" ? ui.findDraft.destination : null;
      if (location && Number.isInteger(index) && Array.isArray(location.searchResults)) {
        const selected = location.searchResults[index];
        if (selected) {
          applyLocationSelection(location, selected);
          ensureFindRoutePreview();
          render();
        }
      }
      return;
    }
    if (action === "find-suggestion") {
      const step = actionButton.getAttribute("data-step");
      const value = actionButton.getAttribute("data-value");
      const preset = getPresetLocation(value);
      if (step === "ORIGIN") {
        if (preset) applyLocationSelection(ui.findDraft.origin, preset);
        else ui.findDraft.origin.searchQuery = value;
      }
      if (step === "DESTINATION") {
        if (preset) applyLocationSelection(ui.findDraft.destination, preset);
        else ui.findDraft.destination.searchQuery = value;
      }
      ensureFindRoutePreview();
      render();
      return;
    }
    if (action === "confirm-find") {
      handleConfirmFind();
      return;
    }
    if (action === "find-confirm") {
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
    if (action === "trips-notification-filter") {
      ui.myTripsNotification = actionButton.getAttribute("data-value");
      render();
      return;
    }
    if (action === "trips-trip-filter") {
      ui.myTripsTripFilter = actionButton.getAttribute("data-value");
      render();
      return;
    }
    if (action === "trips-trip-type") {
      ui.myTripsTripType = actionButton.getAttribute("data-value");
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
      ui.tutorialTroubleIndex = 0;
      ui.tutorialQuizSubmitted = false;
      ui.tutorialCopyFeedback = "";
      ui.tutorialScoreMessage = "";
      ui.tutorialAnswers = {};
      render();
      return;
    }
    if (action === "tutorial-mode") {
      ui.tutorialMode = actionButton.getAttribute("data-mode");
      ui.tutorialCopyFeedback = "";
      if (ui.tutorialMode !== "QUIZ") {
        ui.tutorialQuizSubmitted = false;
      }
      render();
      return;
    }
    if (action === "tutorial-trouble-toggle") {
      const index = Number(actionButton.getAttribute("data-trouble-index"));
      ui.tutorialTroubleIndex = ui.tutorialTroubleIndex === index ? -1 : index;
      render();
      return;
    }
    if (action === "tutorial-reset-quiz") {
      ui.tutorialAnswers = {};
      ui.tutorialQuizSubmitted = false;
      ui.tutorialScoreMessage = "";
      render();
      return;
    }
    if (action === "tutorial-copy") {
      const text = buildTutorialCheatSheet(ui.tutorialTrack);
      const finish = (message) => {
        ui.tutorialCopyFeedback = message;
        render();
      };
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => finish("Cheat sheet copied to clipboard."),
          () => finish("Copy failed. Use this page directly.")
        );
      } else {
        try {
          const area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          document.body.removeChild(area);
          finish("Cheat sheet copied to clipboard.");
        } catch (_error) {
          finish("Copy failed. Use this page directly.");
        }
      }
      render();
      return;
    }
  });

  document.addEventListener("input", function (event) {
    const target = event.target;
    if (target.getAttribute("data-sync") === "find") {
      ui.findDraft[target.name] = target.value;
    }
    const locQueryScope = target.getAttribute("data-loc-query");
    if (locQueryScope) {
      const location = locQueryScope === "origin" ? ui.findDraft.origin : locQueryScope === "destination" ? ui.findDraft.destination : null;
      if (location) {
        location.searchQuery = target.value;
      }
    }
    const locField = target.getAttribute("data-loc-field");
    if (locField) {
      const [scope, field] = String(locField).split(".");
      const location = scope === "origin" ? ui.findDraft.origin : scope === "destination" ? ui.findDraft.destination : null;
      if (location) {
        location[field] = target.value;
        if (field === "name") {
          location.suburb = target.value;
          location.searchQuery = target.value;
        }
        if (field === "address" && !normalizeText(location.searchQuery)) {
          location.searchQuery = target.value;
        }
        if (field === "latitude" || field === "longitude") {
          ensureFindRoutePreview();
        }
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    const target = event.target;
    if (event.key !== "Enter") return;
    const scope = target.getAttribute("data-loc-query");
    if (!scope) return;
    event.preventDefault();
    const location = scope === "origin" ? ui.findDraft.origin : scope === "destination" ? ui.findDraft.destination : null;
    if (location) {
      searchLocationSuggestions(location);
    }
  });

  document.addEventListener("change", function (event) {
    const input = event.target;
    if (input.hasAttribute("data-check-index")) {
      const trackKey = ui.tutorialTrack;
      const index = Number(input.getAttribute("data-check-index"));
      ui.tutorialChecklistByTrack[trackKey] = {
        ...(ui.tutorialChecklistByTrack[trackKey] || {}),
        [index]: input.checked
      };
    }
    if (input.hasAttribute("data-quiz-id")) {
      ui.tutorialAnswers[input.getAttribute("data-quiz-id")] = Number(input.value);
    }
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
      ui.tutorialQuizSubmitted = true;
      render();
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();





