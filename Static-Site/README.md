# Static-Site

`Static-Site` is the final Stage 2 submission-facing NeighbourLink prototype.

It is intentionally implemented as a **browser-openable static page set** so it can be opened directly in a browser without any backend, database, build step, or local persistence. Lightweight client-side JavaScript is used only for rider-step switching and OpenStreetMap place preview/search inside `find-a-ride.html`.

## Purpose

This prototype is designed to support:

- Stage 2 marking
- low-fidelity walkthroughs
- UML alignment checks
- report screenshots and presentation evidence

The prototype now focuses only on the **reduced-budget core**:

- rider finds an existing ride offer
- rider reviews ride-offer details
- rider submits a join request
- driver accepts or rejects the join request
- the system shows visible trip outcomes
- if direct matching fails, the rider sees a clear no-match result in search results

## How to open

1. Open [index.html](./index.html) directly in any desktop browser.
2. Use the lightweight sign-in or register form to enter the Rider or Driver walkthrough.
3. No backend or storage is required; simple client-side logic routes the page to the correct static surface.

## Representative page set

The prototype is intentionally centred on a compact representative page set:

1. `index.html` - login entry
2. `register.html` - registration entry
3. `find-a-ride.html` - rider trip flow with simple step switching between origin, destination, and trip date
4. `search-results.html` - matching ride offers
5. `ride-offer-details.html` - rider review and join-request action
6. `my-trips.html` - rider notifications and trip records
7. `driver-hub.html` - driver review overview with join requests plus accepted and rejected records
8. `driver-accepted-details.html` - accepted-record detail page
9. `driver-rejected-details.html` - rejected-record detail page
10. `driver-decision-outcome.html` - immediate accept/reject result page with auto-return

## Design decisions retained in this version

- Driver no longer has a duplicate rider-facing search page.
- Driver no longer responds to one-off requests.
- The prototype no longer includes trust, rating, profile, payment, tutorial, or account-management flows.
- The fallback-request path has been removed from the static prototype surface.
- When no suitable offer is available, the rider now sees a direct matching-failed result instead of opening a second path.
- Route context is now shown through searchable OpenStreetMap previews inside the rider journey.
- Rider trip criteria now carry forward through URL parameters so search results, offer details, and My Trips feel like one continuous walkthrough.
- `My Trips` now separates notifications from trip records and uses lightweight front-end filter chips so join requests and confirmed trips can be demonstrated as focused outcome states on the same page.
- `Driver Review` now keeps only the essential driver-side surfaces: pending join requests, accepted records, rejected records, and dedicated detail/result pages.
- Accepting or rejecting a request now opens a dedicated result page, then automatically returns to `Driver Review` after 5 seconds.

## Stage 2 alignment

This version is intended to be easier to defend against the Stage 2 brief because it is now:

- browser-openable static pages with lightweight JS for step switching and map search
- browser-openable with no setup
- representative rather than overbuilt
- clearly centred on the main confirmation workflow
- easier to explain with a single main rider-driver coordination path

## Related documentation

- [Full screenshot walkthrough](./docs/FEATURE_SCREENSHOT_WALKTHROUGH.md)
- [Static-Site simplification and UML alignment notes](./docs/STATIC_SITE_SIMPLIFICATION_AND_UML.md)
- [Revised Appendix A/B/C PlantUML source](./docs/APPENDIX_A_B_C_REVISED_PLANTUML.md)
- [Screenshot index](./Pic/README.md)

## Recommended demonstration flow

1. Open `index.html`
2. Sign in with a Rider demo account such as `daniel.rider@example.com`
3. Move through the three step-switched rider sections on `find-a-ride.html`
4. Open `search-results.html`
5. Open `ride-offer-details.html`
6. Submit the join request into the confirmation section inside `my-trips.html`
7. Review rider outcomes on `my-trips.html`
8. Switch the `My Trips` filters to show join-request and confirmed outcome states
9. Open `register.html` to show the role-based registration layout, if needed for the prototype walkthrough
10. Return to `index.html` and sign in with a Driver demo account such as `emma.driver@example.com`
11. Open `driver-hub.html` and review the pending join requests plus accepted and rejected record lists
12. Open an accepted or rejected detail page, then trigger an accept or reject action to show the timed result page
