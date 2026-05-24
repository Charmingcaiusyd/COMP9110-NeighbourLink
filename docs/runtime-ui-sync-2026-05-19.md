# Runtime and Prototype UI Sync - 2026-05-24

This note records the current `Static-Site` submission-facing direction after the latest workflow and settings updates.

## Final prototype shape

`Static-Site` is a static multi-page HTML/CSS/JS prototype that opens directly in browser:

- `Static-Site/html/index.html`

No backend or database is required.

## Rider flow

Core rider walkthrough:

1. `html/index.html`
2. `html/find-a-ride.html`
3. `html/search-results.html`
4. `html/ride-offer-details.html`
5. `html/my-trips.html`
6. `html/rider-record-501-details.html` / `html/rider-record-601-details.html`
7. `html/rider-settings.html`

## Driver flow

Core driver walkthrough:

1. `html/index.html`
2. `html/driver-hub.html`
3. `html/driver-accepted-details.html` / `html/driver-rejected-details.html`
4. `html/driver-decision-outcome.html`
5. `html/driver-trip-workflow.html`
6. `html/driver-settings.html`

## Workflow behavior updates now in place

- Driver trip workflow is now a **single-card, single-action staged flow**.
- Each workflow click reloads page state through URL stage parameters:
  - `ready`
  - `pickup_departed`
  - `pickup_arrived`
  - `destination_departed`
  - `completed`
- OpenStreetMap preview updates per stage.
- Completed state shows `Trip Completed` and a single `Back` action.

## Current scope notes

- One-off driver response flow is removed from this static surface.
- Trust/rating/profile screens are removed.
- Settings pages exist for both roles with:
  - password reset form
  - payment preference form (presentation-only, no live payment processing)

## Screenshot and report alignment

- Screenshot set rebuilt to 29 PNG assets:
  - 26 primary flow screenshots
  - Figure 4/5/6 composites
- Authoritative screenshot docs:
  - `Static-Site/Pic/README.md`
  - `Static-Site/docs/FEATURE_SCREENSHOT_WALKTHROUGH.md`
