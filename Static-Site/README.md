# Static-Site

`Static-Site` is a fully front-end NeighbourLink demonstration that mirrors the current project feature set and current front-end design without any backend service owned by the project.

It is designed for browser-only walkthroughs, demos, marking, and presentation use.

## Visual documentation

- Full screenshot walkthrough: [docs/FEATURE_SCREENSHOT_WALKTHROUGH.md](./docs/FEATURE_SCREENSHOT_WALKTHROUGH.md)
- Screenshot index: [Pic/README.md](./Pic/README.md)
- Screenshot assets folder: `Static-Site/Pic`
- The screenshot pack is intentionally state-rich and now includes alternate driver/rider outcomes such as confirmed-payment entry states, password-reset success, and driver rejection handling.

## How to open

1. Open [index.html](./index.html) directly in a desktop browser.
2. Start from `#/login` automatically, or open routes manually after the hash if needed.
3. Use the built-in demo accounts shown on the sign-in page.
4. Keep internet access enabled if you want live map search, reverse lookup, and route previews.
5. All interaction data is hardcoded first, then persisted locally in browser `localStorage`.

## Demo accounts

- Rider: `daniel.rider@example.com / 123456`
- Rider: `maria.rider@example.com / demo1234`
- Rider: `olivia.rider@example.com / demo1234`
- Driver: `emma.driver@example.com / demo1234`
- Driver: `liam.driver@example.com / demo1234`
- Driver: `sophie.driver@example.com / demo1234`

## Included feature coverage

This static demo keeps the current runtime direction and removes backend dependency only.

- Rider login and local registration
- Unified `Find a Ride` entry
- Live OpenStreetMap-based rider location flow:
  - Leaflet map rendering
  - Nominatim address search
  - reverse lookup from map click
  - OSRM route preview between pickup and destination
- Automatic branch logic:
  - if trip time is within 3 hours, search ride offers first
  - if time is missing or the trip is beyond 3 hours, create a one-off ride request
  - if an eligible search finds no suitable offer, automatically fall back to a one-off request
- Search results and ride-offer details
- Trust display before rider seat-request action
- Join request submission
- Rider `My Trips` unified order stream
- Notifications
- Review and accept driver offers for one-off requests
- Payment demo page
- Driver Hub:
  - review / accept / reject join requests
  - respond to open one-off ride requests
  - inspect one-off response history
- Account page:
  - reset password
  - add / remove / set default payment methods
- Tutorial / training center for Rider and Driver walkthroughs via hidden direct route

## Seeded demo density

The static dataset is intentionally seeded with multiple records so the main demo lists do not look empty.

- default rider search returns 2 matching ride offers
- rider notifications show 2 or more records
- rider unified orders show multiple join-request and one-off records
- rider one-off offer review includes multiple driver offers
- driver pending join requests show 2 or more items
- driver open one-off ride requests show 2 or more items
- driver one-off offer history shows 2 or more items
- account payment methods are pre-seeded with more than one saved card on the main demo accounts

## Intentional alignment with current code

The static site follows the current product direction rather than old earlier versions, and its page structure/class styling is intentionally aligned to the current main front-end runtime.

- `Profile` editing is removed
- Driver flow now focuses on join-request decisions and one-off responses
- `Account` only keeps password reset and payment methods
- Navigation keeps route-style jumping, but uses browser hash routing so the demo still works from `file://`
- Where the main runtime used OpenStreetMap support through backend proxy endpoints, this static site now calls the public map services directly from the browser

## Main routes

- `#/login`
- `#/register`
- `#/`
- `#/search-results`
- `#/ride-offer-details/:id`
- `#/my-trips`
- `#/ride-requests/:id/offers`
- `#/ride-confirmed`
- `#/driver-hub`
- `#/account`
- `#/payment?rideMatchId=:id`
- `#/tutorial`

## Technical behaviour

- No project backend process is required
- No project database is required
- No build step is required
- State is stored only in the browser
- Public map services are called directly from the browser:
  - OpenStreetMap tiles through Leaflet
  - Nominatim for address search and reverse lookup
  - OSRM for route previews

## Verification

- Browser-level UI verification script: `Static-Site/tools/verify-static-site-ui.js`
- Direct `file://` end-to-end verification script: `Static-Site/tools/verify-static-site-file-e2e.js`
- Screenshot regeneration script aligned to the current UI: `Static-Site/tools/capture-static-site-screenshots.js`
- Verified routes in the current static mirror:
  - `#/login`
  - `#/`
  - `#/search-results`
  - `#/ride-offer-details/:id`
  - `#/my-trips`
  - `#/payment?rideMatchId=:id`
  - `#/tutorial`
  - `#/driver-hub`
  - `#/account`

## Operational notes

- `file://` direct opening has been verified with live map search, reverse lookup, and route preview
- Because public map services are used directly, speed and availability can vary with network conditions or rate limiting
- If a live lookup fails temporarily, the rider can still type or keep seeded demo locations and continue the business flow

## Recommended demo flow

1. Log in as `Maria Rider`
2. Use `Find a Ride` for a same-day within-3-hours search
3. Open a ride offer and submit a join request
4. Return to `My Trips`
5. Switch to `Emma Driver`
6. Open `Driver Hub` and accept the pending join request
7. Switch back to the rider and show confirmed status / payment
8. Open `#/tutorial` directly to walk through the rider and driver demo scripts
