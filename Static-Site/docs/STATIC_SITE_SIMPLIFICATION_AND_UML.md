# Static-Site Simplification and UML Alignment

## Current design position

The final `Static-Site` now behaves like a submission-facing Stage 2 prototype rather than a runtime-heavy front-end mirror.

The current version keeps a single clear pilot story:

- riders use `Find a Ride`
- riders review an existing ride offer
- riders submit a join request
- drivers explicitly accept or reject that join request
- outcomes are shown in `My Trips`
- when no suitable offer exists, the rider sees a direct matching-failed result in search results

## Why this direction is stronger

This reduced prototype is easier to defend because it now:

- uses browser-openable static pages with lightweight JS for rider step switching and OpenStreetMap preview/search
- removes local persistence and heavy runtime logic from the submitted surface
- keeps a smaller representative page set
- avoids opening a second reduced path that distracts from the main confirmation flow
- avoids overstating Scenario 2 behaviour that the final prototype no longer demonstrates

## What has been removed from the submission-facing core

The final static prototype no longer presents these as part of the assessed flow:

- trust and rating
- profile review
- one-off driver response
- rider acceptance of driver one-off offers
- fallback request recording and fallback-request outcome views
- payment pages
- account settings
- tutorial centre

## What the static prototype still emphasises

The current static surface now puts most of its explanatory weight on:

- `Rider` and `Driver` as specialisations of the abstract `User`
- `RideOffer` as the existing supply object
- `JoinRequest` as the rider decision object
- `RideMatch` as the confirmed outcome object
- `Notification` as the visible outcome object shown in `My Trips`

## How the class relationships are now typed

The revised class diagram now uses more explicit relationship types so the model looks closer to a formal UML submission:

- `Rider` and `Driver` use **generalisation** from `User`
- `Driver *-- RideOffer` uses **composition** because the displayed offer records belong to a driver role
- `Rider *-- JoinRequest` uses **composition** because rider-owned join requests are part of the rider journey
- `User *-- Notification` uses **composition** because notifications are shown as user-specific outcome records
- `RideOffer o-- JoinRequest` uses **aggregation** because an offer collects join requests for review
- `JoinRequest --> RideMatch` uses a directed association because a match is created only if that request is accepted
- `RideMatch --> Rider` and `RideMatch --> Driver` keep the confirmed-trip participants explicit

## Final judgement

This version is stronger for Stage 2 because the prototype now tells one tight rider-driver coordination story without relying on hidden runtime logic or a second reduced fallback workflow.
