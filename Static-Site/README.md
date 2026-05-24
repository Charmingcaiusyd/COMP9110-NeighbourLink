# Static-Site

`Static-Site` is the final Stage 2 submission-facing NeighbourLink prototype.

It runs as browser-openable static pages with lightweight JavaScript for:

- role-based login/register routing
- rider step flow navigation
- URL-carried state across pages
- OpenStreetMap preview rendering
- simple settings-form interactions

No backend service, database, or build step is required.

## Folder layout

- `html/` - all prototype pages
- `js/` - shared browser scripts
- `css/` - shared styles
- `tools/` - rebuild, verification, and screenshot utilities

## Purpose

This prototype is prepared for:

- Stage 2 report evidence
- video walkthrough demonstration
- UML-to-prototype alignment checking
- screenshot generation for submission assets

## How to open

1. Open [html/index.html](./html/index.html) in a desktop browser.
2. Use login or register to route into Rider or Driver surfaces.
3. Walk through flows directly through page links and buttons.

## Current page set (`html/`)

1. `index.html` - login entry
2. `register.html` - registration entry
3. `find-a-ride.html` - rider step flow (origin/destination/trip date)
4. `search-results.html` - matching offers and no-match state
5. `ride-offer-details.html` - offer review and join-request action
6. `my-trips.html` - rider notifications and trip records
7. `rider-record-501-details.html` - rider record detail
8. `rider-record-601-details.html` - rider record detail
9. `rider-settings.html` - rider password reset + payment preference (demo-only)
10. `driver-hub.html` - pending review + accepted/rejected records
11. `driver-accepted-details.html` - accepted detail view
12. `driver-rejected-details.html` - rejected detail view
13. `driver-decision-outcome.html` - accept/reject outcome with timed return
14. `driver-trip-workflow.html` - single-action staged trip workflow with full refresh per step
15. `driver-settings.html` - driver password reset + payment preference (demo-only)

## Notes on scope

- Matching and coordination remain the core scenario.
- One-off driver offer flow is removed from this static version.
- Trust/rating/profile surfaces are removed in this static version.
- Settings payment forms are presentation-only preferences, not live payment processing.

## Screenshot assets

All PNG evidence is under [Pic](./Pic/README.md).

Regenerate with:

- `node Static-Site/tools/capture-static-site-screenshots.js`

The script rebuilds:

- 26 primary screenshots
- Figure 4/5/6 composite report images

## Related docs

- [Feature screenshot walkthrough](./docs/FEATURE_SCREENSHOT_WALKTHROUGH.md)
- [Static-site simplification and UML alignment](./docs/STATIC_SITE_SIMPLIFICATION_AND_UML.md)
- [Appendix A/B/C revised PlantUML source](./docs/APPENDIX_A_B_C_REVISED_PLANTUML.md)
