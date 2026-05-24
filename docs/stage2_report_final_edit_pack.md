# Stage 2 Report Final Edit Pack

This file is the final edit guide for aligning the written report with the current reduced-budget `Static-Site` prototype and the revised Appendix A / B / C UML set.

## Score judgement

### Current estimated score

If the report is submitted in its current draft form while the prototype and UML remain in their updated reduced-budget form, the likely result is:

- **18.2 / 20**

### Estimated score after the edits below

If the report is revised so that it fully matches the current prototype and UML set, the likely result increases to:

- **19.1 - 19.4 / 20**

The main gap is no longer the prototype itself. The remaining risk is **report inconsistency**, especially where the draft still describes:

- trust / rating / profile review
- driver responses to one-off ride requests
- rider acceptance of driver one-off offers
- a broader runtime-like prototype surface

---

## How to use this guide

For each report section below:

1. identify the existing paragraph or table that still reflects the older system direction
2. replace it with the suggested wording
3. keep the revised wording consistent with:
   - [APPENDIX_A_B_C_REVISED_PLANTUML.md](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/docs/APPENDIX_A_B_C_REVISED_PLANTUML.md)
   - [Static-Site/README.md](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/README.md)
   - [stage2_high_score_rework_plan.md](/C:/Users/gs658/OneDrive/文档/NeighbourLink/docs/stage2_high_score_rework_plan.md)

---

## 1. Introduction and Stage 2 Context Change

### Current issue

The current introduction still frames the reduced system around:

- matching
- trust cues
- spare seats
- confirmation

That is close, but it still overstates the trust dimension and understates the actual reduced delivery.

### Suggested replacement paragraph

> NeighbourLink is a proposed web-based community ride-sharing information system for a local council pilot. In Stage 1, the system was framed as a bounded coordination platform for approximately 300 users within one metropolitan council area. Stage 2 changes the project context through a substantial budget reduction, which shifts the design problem from feature completeness to disciplined prioritisation. The final Stage 2 prototype therefore presents NeighbourLink as a reduced-budget pilot: a rider enters trip criteria, reviews an existing ride offer, submits a join request, a driver explicitly accepts or rejects that request, and the system displays the resulting trip outcome. If direct matching is unsuitable, the system records a fallback rider request and exposes that outcome in My Trips instead of opening a second negotiation workflow.

### Why this is stronger

- It defines the **completed core path** immediately.
- It removes overclaiming around trust and the old one-off negotiation loop.
- It creates a stable narrative for the rest of the report.

---

## 2. Problem Understanding and Revised Scope

### Current issue

Sections `2.2`, `2.3`, and `2.5` still assume the reduced system fully preserves:

- trust support as a retained core
- all three original use cases in complete form

That is no longer true for the final prototype.

### Suggested replacement for scope decision

> The revised Stage 2 scope focuses on the smallest coherent rider-driver coordination service that still demonstrates the purpose of NeighbourLink. The final pilot retains a complete existing-offer join path: riders search available ride offers, review an offer, submit a join request, drivers explicitly accept or reject that request, and the system shows the visible trip outcome. The design also retains a reduced fallback-demand path. When direct matching is unsuitable, the system records a fallback rider request and exposes that record in My Trips. This means the system still acknowledges unmet demand, but it no longer expands that path into a second full negotiation workflow.

### Suggested replacement for scope justification

> This scope is intentionally constrained. Stage 2 rewards design judgement under pressure, not platform breadth. The strongest response to the budget reduction is to preserve only the smallest set of functions that still allows riders and drivers to reach a visible, seat-aware, explicitly confirmed outcome. As a result, the design does not retain richer support features such as profile review, rating-based trust checking, one-off driver offer negotiation, or other extended workflow modules. The final pilot is therefore narrower than the Stage 1 baseline, but more feasible and more coherent under the reduced budget.

### Why this is stronger

- It makes the reduction feel deliberate, not accidental.
- It explains why `RideRequest` still exists without falsely claiming full Scenario 2 behaviour.

---

## 3. Updated User and Stakeholder Analysis

### Current issue

Sections `3.1` and `3.2` still describe:

- trust judgement as an active retained decision point
- one-off driver response as a live part of the system

### Suggested replacement for rider perspective

> Riders still need the same essential value in Stage 2: a dependable way to enter trip needs, compare available ride offers, submit a request against a suitable offer, and see whether that request has been confirmed or rejected. The budget reduction does not remove these needs, but it requires the system to meet them through a smaller and simpler prototype surface. This leads to three design consequences: the trip-entry flow must stay focused on essential details only; existing ride offers must show enough trip information to support a join decision; and visible outcome tracking must remain available in My Trips.

### Suggested replacement for driver perspective

> Drivers need a lean workflow that still protects their capacity and preserves control over acceptance. Under the reduced budget, the system should not ask drivers to manage several parallel workflows. Instead, the final pilot reduces the driver role to one operational surface: reviewing pending join requests, explicitly accepting or rejecting them, and seeing the resulting confirmed or rejected outcome. This keeps the driver workload coherent while still preserving the explicit decision rule at the centre of the ride-matching process.

### Why this is stronger

- It keeps actors stable.
- It avoids promising old behaviours that the final prototype no longer demonstrates.

---

## 4. Updated Requirements Analysis

### Current issue

This is the biggest mismatch in the draft.

The current FR set still includes:

- one-off request posting as a full retained use case
- driver responses to one-off requests
- rider acceptance of driver offers
- trust cues before acceptance

Those requirements must be replaced.

### Replace the current Functional Requirements table with this one

| ID | Functional Requirement | Status | Justification | System Realisation |
|---|---|---|---|---|
| FR1 | The system shall allow a rider to enter essential trip criteria through a Find a Ride flow. | Must Retain | This is the entry point to the main rider journey. | The rider uses one page with origin, destination, and trip-date sections. |
| FR2 | The system shall display matching ride offers when direct matching is suitable. | Must Retain | Existing-offer discovery remains the strongest low-cost matching path. | A search-results page presents candidate ride offers. |
| FR3 | The system shall allow a rider to review ride-offer details before submitting a join request. | Must Retain | Riders must see enough trip information before committing. | The offer-detail page presents route, timing, seats, and pickup details. |
| FR4 | The system shall allow a rider to submit a join request for an existing ride offer. | Must Retain | This is the essential action that turns browsing into possible matching. | The rider submits a request from the offer-detail page. |
| FR5 | The system shall allow the driver who owns a ride offer to accept or reject a join request explicitly. | Must Retain | Explicit driver decision is the key confirmation rule. | The driver uses Driver Hub to accept or reject pending requests. |
| FR6 | The system shall create a confirmed ride outcome only after explicit acceptance and shall update seat availability conceptually as part of that outcome. | Must Retain | Confirmation and seat control remain core business rules. | The accepted driver outcome shows a confirmed ride match and reduced seat count. |
| FR7 | The system shall display rider- and driver-visible trip outcomes after a driver decision. | Must Retain | Outcome visibility is essential for a useful pilot. | My Trips and Driver Hub expose pending, rejected, recorded, and confirmed states. |
| FR8 | The system shall record a fallback rider request when direct matching is unsuitable or no suitable ride offer is available. | Simplify | The system should still preserve unmet demand without expanding into a second matching workflow. | My Trips shows a reduced fallback request record. |

### Replace the current NFR direction with this table

| ID | Non-Functional Requirement | Quality Dimension | Target / Check |
|---|---|---|---|
| NFR1 | The prototype shall open locally in a browser with no backend or build step. | Process compliance | Browser-openable static pages load directly from the file system. |
| NFR2 | The prototype shall keep a small representative page set. | Structural clarity | The final prototype uses six HTML pages only. |
| NFR3 | Each page shall expose one clear primary action. | Usability | The user can identify the intended next action without runtime logic. |
| NFR4 | Rider and driver journeys shall remain on separate navigation surfaces. | Navigation consistency | Rider pages and Driver Hub use different navigation choices. |
| NFR5 | Trip outcomes shall use a small fixed set of visible statuses. | Understandability | Pending, rejected, confirmed, and recorded remain the only core outcome states. |
| NFR6 | The layout shall remain readable on mobile-width screens such as 320px, 375px, and 425px. | Accessibility / responsiveness | Labels, cards, and controls remain readable at narrow widths. |
| NFR7 | The reduced design shall remain feasible under the halved Stage 2 budget. | Feasibility | Only the smallest coherent ride-matching service is foregrounded. |

### Why this is stronger

- It is fully aligned with the current static prototype.
- It is much more measurable.
- It directly answers the Stage 1 feedback about better NFR precision.

---

## 5. Updated Modelling and Design Correctness

### Current issue

Section `5` still says:

- `UC3` remains one-off posting plus rider acceptance of driver offer
- class model includes `Profile`, `Rating`, `RideRequestOffer`

That is now incorrect.

### Suggested replacement for use case correctness

> The final use case model is intentionally narrower than the Stage 1 baseline. It keeps one complete rider-driver agreement path: the rider finds available ride offers, reviews ride-offer details, submits a join request, the driver explicitly accepts or rejects that request, and the system displays the resulting outcome. The model also keeps a reduced fallback path by recording a fallback rider request when direct matching is unsuitable. This preserves acknowledgement of unmet demand without requiring a second full driver-offer negotiation loop.

### Suggested replacement for activity correctness

> The activity model now focuses on one complete operational path plus one reduced alternate path. The complete path shows direct matching, rider review, join-request submission, driver response, and either confirmed or rejected outcomes. The alternate path shows fallback request recording when direct matching is unsuitable. This makes the activity diagram behaviourally complete for the final prototype without overstating functions that no longer appear in the submission-facing interface.

### Suggested replacement for class/domain correctness

> The final domain model is intentionally lean but now uses clearer UML relationship types. `Rider` and `Driver` specialise an abstract `User`. `RideOffer` represents available supply, `JoinRequest` represents a rider request against an existing offer, and `RideMatch` represents the confirmed outcome created only after driver acceptance. `RideRequest` is retained in reduced form as a fallback-demand record rather than as the beginning of a second full negotiation workflow. `Notification` supports the visible outcome design shown through My Trips. Composition is used for rider-owned and user-owned records, aggregation is used where a ride offer collects join requests, and directed associations are used where a join request leads to a confirmed ride match.

### Why this is stronger

- It aligns directly with the new UML appendix.
- It removes the biggest report/model contradiction.

---

## 6. Design Justification, Trade-offs, and Response to Context Change

### Current issue

The trade-off section still presents trust support and one-off negotiation as retained simplified modules.

### Suggested replacement paragraph

> The central Stage 2 trade-off was to preserve one complete and defensible rider-driver agreement path rather than several partially retained matching paths. This meant narrowing the pilot to the existing-offer join flow, keeping explicit driver acceptance as the confirmation rule, and exposing resulting states clearly through My Trips and Driver Hub. The design also retains a reduced fallback rider request record so that unmatched demand remains visible. In contrast, profile-based trust support, rating, one-off driver offers, and rider acceptance of those offers were removed from the final pilot because they increased interaction cost without strengthening the smallest coherent service that could still be justified under the reduced budget.

### Suggested replacement trade-off table

| Design Issue | Alternatives Considered | Final Decision | Benefit | Trade-off |
|---|---|---|---|---|
| Matching scope | retain multiple matching workflows, or narrow to one complete path | narrow to the existing-offer join path plus fallback recording | clearer feasibility and stronger coherence | reduced breadth compared with Stage 1 |
| Trust support | retain trust/rating, or remove it from the reduced core | remove trust/rating from the final prototype core | lower interaction and documentation cost | less social reassurance in the reduced pilot |
| Outcome handling | separate pages for each state, or consolidated outcome surfaces | consolidate outcomes into My Trips and Driver Hub | smaller page set and clearer navigation | less page-level detail |
| Map presentation | live or embedded maps, or static context only | static route-context cards only | lower implementation feel and better brief alignment | less realism |

### Why this is stronger

- It shows judgement instead of apologising for reduced scope.
- It makes the design look intentional and defensible.

---

## 7. Prototype Alignment

### Current issue

The current prototype section still describes:

- five older pages
- a one-off request page
- a one-off review and status page

### Suggested replacement

> The final Stage 2 prototype is a browser-openable static page set intended to demonstrate structure, navigation, and visible state communication rather than full backend behaviour. The representative page set is intentionally small: a Login page, a separate Register page, a single Find a Ride page with step-switched origin, destination, and trip-date sections, a Search Results page, a Ride Offer Details page, a My Trips page, and a single Driver Hub page. Together these pages demonstrate the reduced-budget lifecycle of ride discovery, join-request submission, explicit driver decision, and visible outcome tracking. Lightweight client-side step switching and OpenStreetMap preview/search are used only to make the rider journey easier to understand during the walkthrough.

### Suggested prototype table

| Prototype Page | Purpose | Related Requirement IDs | Related Use Cases |
|---|---|---|---|
| `index.html` | entry and onboarding structure | FR1, NFR1, NFR2 | sign in / register |
| `find-a-ride.html` | rider trip setup through three step-switched stages with OpenStreetMap preview/search | FR1, FR8 | find a ride / fallback |
| `search-results.html` | candidate ride-offer comparison | FR2 | find a ride |
| `ride-offer-details.html` | offer review and join-request action | FR3, FR4 | review offer / submit join request |
| `my-trips.html` | visible rider outcomes and fallback record | FR7, FR8 | view trip updates and outcomes |
| `driver-hub.html` | pending request review, driver decisions, and driver-visible outcomes | FR5, FR6, FR7 | respond to join request |

### Why this is stronger

- It matches the actual delivered prototype exactly.
- It supports the marking criterion of structural clarity and navigation logic.

---

## 8. Coherence and Consistency

### Current issue

This section still lists outdated terminology:

- `RideRequestOffer`
- `Profile`
- `Rating`

### Suggested replacement terminology paragraph

> The final report uses a smaller and more disciplined vocabulary set. The core terms are `RideOffer`, `RideRequest`, `JoinRequest`, `RideMatch`, `Notification`, `Rider`, and `Driver`. These terms are used consistently across requirements, UML, screenshots, and prototype labels. Removing outdated terms such as `Profile`, `Rating`, and `RideRequestOffer` is essential for consistency because those concepts no longer appear in the final reduced prototype surface.

### Suggested consistency paragraph

> Cross-artifact consistency is now achieved by keeping one stable story across all submission elements. The report describes a reduced-budget pilot. The UML appendix shows one complete join-request confirmation path plus a reduced fallback-record path. The prototype demonstrates the same scope through six browser-openable static pages. This consistency is especially important in Stage 2 because the marking focus is not only feature choice but also whether the final design rationale remains coherent under the changed project context.

### Why this is stronger

- It directly answers the coherence criterion.
- It removes the terminology drift still present in the draft.

---

## 9. GenAI Reflection

### Current issue

The current reflection is good, but one sentence still leans toward the old broader system framing.

### Suggested replacement sentence

Replace any sentence that says GenAI helped preserve all three original use cases in full with:

> GenAI was most useful in comparing simplification alternatives and exposing where the design was still too broad for the reduced Stage 2 budget. This helped the group narrow the pilot to one complete confirmed-match path while retaining a reduced fallback-demand path for coherence.

### Why this is stronger

- It demonstrates human judgement more clearly.
- It better reflects what the final prototype actually became.

---

## 10. Conclusion

### Current issue

The conclusion still says the draft preserves the three core use cases, which is now too broad.

### Suggested replacement conclusion

> The final Stage 2 design demonstrates adaptation through disciplined simplification rather than expansion. NeighbourLink is now presented as a reduced-budget pilot that preserves the smallest coherent rider-driver coordination service: ride discovery, join-request submission, explicit driver acceptance or rejection, and visible trip outcomes. The design also retains a reduced fallback rider-request record so that unmet demand remains visible without requiring a second full negotiation workflow. This gives the final report a stronger coherence across scope, requirements, UML, and prototype, and makes the Stage 2 submission more defensible under the reduced-budget context.

### Why this is stronger

- It gives the marker one clean final takeaway.
- It matches the prototype and UML exactly.

---

## Remove or rewrite these ideas everywhere

Before finalising the report, search the document and remove or rewrite any remaining references to:

- `trust`
- `rating`
- `profile`
- `RideRequestOffer`
- `driver response to one-off request`
- `rider acceptance of driver offer`
- `payment`
- `tutorial`
- `account settings`
- `interactive runtime`
- `heavy runtime-driven prototype`

---

## Final submission-safe wording to reuse

If you need one short paragraph to reuse across multiple sections, use this:

> In response to the Stage 2 budget reduction, the final NeighbourLink prototype has been narrowed into a reduced-budget pilot. The completed core path is the existing-offer join workflow: the rider enters trip criteria, reviews an existing ride offer, submits a join request, the driver explicitly accepts or rejects that request, and the system displays the resulting trip outcome. When direct matching is unsuitable, the system records a fallback rider request and exposes that record in My Trips instead of opening a second negotiation workflow.

---

## Final UML source to use in the report

Use the appendix code from:

- [APPENDIX_A_B_C_REVISED_PLANTUML.md](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/docs/APPENDIX_A_B_C_REVISED_PLANTUML.md)

Do not restore older UML elements such as:

- `Profile`
- `Rating`
- `RideRequestOffer`
- trust-review branches
- one-off driver-offer negotiation branches
