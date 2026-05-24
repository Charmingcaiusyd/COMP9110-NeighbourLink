# Stage 2 Report Replacement Notes

This note helps replace outdated report wording so the final written submission matches the current reduced-budget `Static-Site` prototype.

---

## 1. Scope description

### Original direction to remove

Any wording that still says the final prototype retains:

- trust checking through profile and rating
- driver responses to one-off ride requests
- rider acceptance of driver one-off offers
- a broad runtime-style interactive front end

### Replace with

> The Stage 2 prototype has been deliberately narrowed into a reduced-budget pilot. The completed core path is now the existing-offer join workflow: the rider enters trip criteria, reviews an existing ride offer, submits a join request, the driver explicitly accepts or rejects that request, and the system displays the resulting trip outcome. If direct matching is unsuitable, the prototype records a fallback rider request and shows that record in My Trips instead of opening a second negotiation workflow.

### Why

This wording aligns with the final prototype, UML appendix, and current demonstration flow.

---

## 2. Prototype description

### Original direction to remove

Any wording that describes the prototype as:

- heavily script-driven
- route-driven
- data-persistent
- a full runtime mirror

### Replace with

> The final Stage 2 prototype is implemented as a browser-openable static web page set. It is intended to demonstrate navigation, layout, page sequencing, and visible state communication rather than full backend behaviour. A small representative page set is used to show the rider and driver journeys clearly, while lightweight client-side step switching and OpenStreetMap preview/search support the Find a Ride walkthrough.

### Why

This wording is now true for the final `Static-Site` and matches the project brief much more closely.

---

## 3. Functional requirements wording

### Replace older one-off negotiation emphasis with this direction

- The system shall allow a rider to enter essential trip criteria through a Find a Ride flow.
- The system shall display matching ride offers when direct matching is suitable.
- The system shall allow a rider to review ride-offer details before submitting a join request.
- The system shall allow a rider to submit a join request for an existing ride offer.
- The system shall allow a driver to accept or reject a join request explicitly.
- The system shall display trip outcomes to riders and drivers after a driver decision.
- The system shall record a fallback rider request when direct matching is unsuitable or no suitable result is available.

---

## 4. Non-functional requirements direction

Use more measurable language such as:

- each page shall expose one primary action only
- trip outcomes shall be shown using a small named set of statuses
- rider and driver pages shall keep separate navigation surfaces
- the prototype shall open locally in a browser with no backend or build step
- the prototype shall preserve readable labels and mobile-friendly spacing

---

## 5. Modelling section replacement

### Replace older class-model explanation with

> The final domain model is intentionally lean. `Rider` and `Driver` specialise the abstract `User`, `RideOffer` represents available supply, `JoinRequest` represents the rider request against an existing offer, and `RideMatch` represents the confirmed outcome created only after driver acceptance. `RideRequest` is retained in reduced form as a fallback-demand record rather than as the beginning of a second full negotiation workflow. `Notification` supports the visible outcome design shown through My Trips. The class diagram now also uses more explicit composition, aggregation, and directed association links so the structural logic is easier to defend.

### Why

This is the clearest way to explain why `RideRequest` still exists without falsely claiming the prototype still supports one-off driver offers.

---

## 6. Prototype alignment section replacement

### Replace with

> The representative prototype surface is intentionally compact: a Login page, a separate Register page, a single Find a Ride page with three step-switched rider stages, Search Results, Ride Offer Details, My Trips, and a single Driver Hub page. Together these pages demonstrate the reduced-budget lifecycle of discovery, request submission, explicit driver decision, and visible outcome tracking. Lightweight client-side step switching and OpenStreetMap search/preview are used only to make the rider flow easier to understand during the walkthrough.

---

## 7. Quick final checklist

Before final submission, make sure the report no longer claims:

- trust and rating remain part of the final pilot core
- one-off driver offers remain part of the final pilot core
- payment, tutorial, or account flows are part of the assessed prototype core
- the prototype covers the original Scenario 2 negotiation path end to end

Instead, keep the report focused on the reduced-budget confirmed-match path plus fallback request visibility.
