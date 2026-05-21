# Static-Site

`Static-Site` is a fully front-end NeighbourLink demonstration that mirrors the current project feature set without any backend service.

It is designed for browser-only walkthroughs, demos, marking, and presentation use.

## Visual documentation

- Full screenshot walkthrough: [docs/FEATURE_SCREENSHOT_WALKTHROUGH.md](./docs/FEATURE_SCREENSHOT_WALKTHROUGH.md)
- Screenshot index: [Pic/README.md](./Pic/README.md)
- Screenshot assets folder: `Static-Site/Pic`

## How to open

1. Open [index.html](./index.html) directly in a desktop browser.
2. Start from `#/login` automatically, or open routes manually after the hash if needed.
3. Use the built-in demo accounts shown on the sign-in page.
4. All interaction data is hardcoded first, then persisted locally in browser `localStorage`.

## Demo accounts

- Rider: `maria.rider@example.com / demo1234`
- Rider: `daniel.rider@example.com / 123456`
- Driver: `emma.driver@example.com / demo1234`
- Driver: `liam.driver@example.com / demo1234`
- Driver: `sophie.driver@example.com / demo1234`

## Included feature coverage

This static demo keeps the current runtime direction and removes backend dependency only.

- Rider login and local registration
- Unified `Find a Ride` entry
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

## Intentional alignment with current code

The static site follows the current product direction rather than old earlier versions.

- `Profile` editing is removed
- Driver flow now focuses on join-request decisions and one-off responses
- `Account` only keeps password reset and payment methods
- Navigation keeps route-style jumping, but uses browser hash routing so the demo still works from `file://`

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

- No API calls are made
- No database is required
- No backend process is required
- No build step is required
- State is stored only in the browser
- The "Reset Demo Data" button restores the seeded local dataset

## Recommended demo flow

1. Log in as `Maria Rider`
2. Use `Find a Ride` for a same-day within-3-hours search
3. Open a ride offer and submit a join request
4. Return to `My Trips`
5. Switch to `Emma Driver`
6. Open `Driver Hub` and accept the pending join request
7. Switch back to the rider and show confirmed status / payment
8. Open `#/tutorial` directly to walk through the rider and driver demo scripts
