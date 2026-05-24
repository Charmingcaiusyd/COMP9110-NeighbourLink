# Stage 2 High-Score Rework Plan

## Purpose

This note records the final direction that best supports a high-mark Stage 2 submission.

The strongest path is now:

1. present NeighbourLink as a reduced-budget pilot
2. foreground the existing-offer join path as the completed match flow
3. retain fallback requests only as reduced rider-visible records
4. keep the prototype small, static, and representative
5. keep the report, UML, screenshots, and prototype on one consistent scope

## What the current Static-Site now does well

The final `Static-Site` now aligns much more closely with the brief because it is:

- browser-openable as static pages
- directly openable in a browser
- free from backend dependency
- free from local data persistence
- centred on a representative page set rather than a runtime-heavy demo
- enhanced only with lightweight client-side step switching and OpenStreetMap place preview/search

## Core narrative to keep in the report

Use this position consistently:

> Stage 2 responds to the budget reduction by narrowing the pilot to the smallest coherent service that still demonstrates ride discovery, seat-aware request handling, explicit driver acceptance, and visible trip outcomes. When direct matching is unsuitable, the system records a fallback rider request and exposes that outcome in My Trips rather than opening a second negotiation workflow.

## Final prototype focus

Keep and foreground only these surfaces:

1. Login / Register
2. Find a Ride
3. Search Results
4. Ride Offer Details
5. Join Request Submitted
6. My Trips
7. Driver Hub
8. Driver Hub outcomes section

## Remove from the core narrative

Do not foreground these older ideas in the final report:

- trust / rating
- profile review
- one-off driver offers
- rider acceptance of driver one-off offers
- payment or account flows
- tutorial or training centre
- any duplicate driver-facing rider search page

## Final UML direction

The revised appendix should keep:

- `User`
- `RideOffer`
- `RideRequest`
- `JoinRequest`
- `RideMatch`
- `Notification`

The revised flow should keep:

- rider search
- rider offer review
- join-request submission
- driver accept / reject
- visible outcomes
- fallback request recording only as an alternate reduced path

## Remaining report priorities

For the written report, the highest-value edits remain:

1. remove outdated trust and rating language
2. remove outdated one-off negotiation language
3. align FR and NFR wording with the reduced pilot
4. describe the prototype as a representative static web prototype
5. use the revised Appendix A/B/C diagrams
6. add short accessibility and technical-feasibility reflections

## Final recommendation

The current design is strongest when it is described as a reduced-budget, static, representative prototype that proves the main confirmation path clearly and keeps fallback demand visible without expanding into a second matching workflow.
