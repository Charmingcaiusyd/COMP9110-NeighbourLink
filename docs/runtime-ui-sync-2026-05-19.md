# Runtime and Prototype UI Sync - 2026-05-23

This note records the current `Static-Site` submission-facing UI direction.

## Final prototype shape

`Static-Site` is now a compact static multi-page HTML/CSS prototype rather than a script-driven single-page demo.

It now opens through:

- `Static-Site/index.html`

## Primary rider flow

The rider-facing path is:

1. `index.html`
2. `find-a-ride.html`
3. `search-results.html`
4. `ride-offer-details.html`
5. `my-trips.html`

## Reduced fallback path

The rider fallback example is now shown inside anchored sections of `my-trips.html` rather than on a separate page.

This path is retained only as a reduced rider-visible record.

## Driver flow

The driver-facing path is:

1. `index.html`
2. `driver-hub.html`

## Scope intentionally removed from the final prototype surface

The current submission-facing `Static-Site` no longer includes:

- account settings
- payment pages
- tutorial centre
- trust / rating
- one-off driver response
- rider acceptance of driver one-off offers
- a duplicate driver `Find a Ride` surface
- live embedded mapping

It also no longer relies on separate HTML files for each rider filter state inside `My Trips`.
It also no longer relies on separate HTML files for the three rider setup stages.
It also no longer relies on separate HTML files for driver decisions or driver history.

## Alignment judgement

The current static pages, reduced UML appendix, and report-replacement notes should now be treated as the main authoritative submission set.
