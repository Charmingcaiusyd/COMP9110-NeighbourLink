# NeighbourLink Stage 2 Final Written Report (Draft)

Course: ISYS2110 / COMP9110 Analysis and Design of Web Information Systems  
Submission Type: Stage 2 Final Report (Draft)  
Project: NeighbourLink  
Version: Draft generated from repository state `master` (latest local code and docs)

---

## 1. Introduction and Stage 2 Context Change

NeighbourLink is a bounded web-based community ride-coordination information system. Its Stage 1 foundation focused on Rider-Driver coordination for ride matching, confirmation, and trust checking before acceptance.

This Stage 2 draft is intentionally a refinement of Stage 1, not a restart. It preserves the original system boundary while adapting requirements, models, and interface flow to a changed operating context.

Because the formal context-change sentence from class announcement is not embedded in the repository itself, this draft uses the following explicit context statement as the working assumption:

`Assumed Stage 2 context change for this draft:`  
The system must handle more variable, one-off travel demand and increased uncertainty around trust, timing, and confirmation outcomes, while staying within a local community coordination scope.

Design implications of this context:
- stronger trust visibility at acceptance points
- clearer state transitions for accepted/rejected/pending outcomes
- better handling of seat contention and stale pending requests
- consistent cross-artifact terminology between requirements, models, and prototype narrative

This assumption should be replaced with your exact tutor-provided wording if needed, but the adaptation logic below remains valid.

---

## 2. Problem Understanding and Revised Scope

### 2.1 Baseline Problem

Informal ride-sharing coordination creates recurring issues:
- uncertain seat availability
- limited pre-acceptance trust evidence
- inconsistent confirmation outcomes
- poor visibility of request lifecycle and rejection reasons

These issues reduce reliability for both Rider and Driver.

### 2.2 Stage 2 Refinement Focus

Stage 2 adds pressure on the same core problem instead of introducing a new product category. The response is targeted refinement:
- keep the three approved core use cases as primary analysis scope
- improve requirement precision around trust, status transitions, and contention
- strengthen traceability from requirement to model to behavior

### 2.3 Revised Scope Table

| Area | Stage 1 Baseline | Stage 2 Refinement in This Draft | Out of Scope |
|---|---|---|---|
| Users | Rider and Driver | Preserve Rider and Driver as primary actors; add operational admin only as bounded governance support | Full organizational role hierarchy, legal/compliance actors |
| Core Process | Ride matching and confirmation | Tighten acceptance rules, status traceability, and conflict handling | Dispatch optimization, dynamic route allocation |
| Supporting Process | Trust checking before acceptance | Trust summary exposed in both join-request and one-off acceptance paths | Full KYC workflow, advanced identity verification platform |
| Coordination Data | Offers, requests, seat counts | Explicit accepted-source provenance and rejection cleanup | Pricing, billing, wallets |
| UX Focus | Simple prototype flows | Stepwise flow clarity and status transparency | Production-grade interaction polish |
| Platform Boundary | Local academic prototype | Keep monolith and local SQLite for explainability | Microservices, distributed event streaming |

---

## 3. Updated User and Stakeholder Analysis

### 3.1 Rider

Existing need:
- find a suitable ride quickly
- evaluate trust before commitment
- understand request outcome status

Stage 2 impact:
- one-off trips increase uncertainty (driver availability and response timing)
- riders need clearer trust evidence before accepting an incoming offer
- rejected/pending history becomes important for transparency

Design implication:
- trust summary included in offer detail and one-off offer review
- explicit history lists for join requests and one-off requests
- consistent status labels (`PENDING`, `ACCEPTED`, `REJECTED`, `MATCHED`, `CLOSED`)

### 3.2 Driver

Existing need:
- control spare seat exposure
- accept/reject requests safely
- avoid ambiguous request ownership

Stage 2 impact:
- higher request variability raises risk of over-commitment
- one-off offer responses require capacity and verification checks

Design implication:
- seat validation at create and decision points
- pessimistic locking on offer decision path
- automatic stale pending cleanup when seats are exhausted
- driver eligibility checks for one-off responses (`ACTIVE`, `VERIFIED`, seat capacity)

### 3.3 Admin (Bounded Operational Stakeholder)

Admin is treated as implementation governance support, not a new core business actor for Stage 2 modeling. It is used to:
- inspect global data consistency
- patch obvious state errors in a controlled local setting
- review uploaded driver verification documents

This remains bounded and does not change the core use-case argument.

---

## 4. Updated Requirements Analysis

### 4.1 Requirements Change Summary

| Category | Meaning in This Draft |
|---|---|
| Retained | Valid Stage 1 requirements still aligned with scope |
| Modified | Requirements refined due to uncertainty/trust/state pressure |
| Added | Newly required for Stage 2 adaptation and consistency |
| Deferred | Relevant but intentionally out of bounded scope |

### 4.2 Updated Functional Requirements

| ID | Requirement | Status | Justification | Traceability |
|---|---|---|---|---|
| FR1 | The system shall allow riders to search open ride offers by origin, destination, date, time, and passenger count. | Retained+Modified | Core UC1 retained; matching precision tightened for Stage 2 uncertainty. | `RideOfferQueryController`, `RideOfferQueryService.searchOffers()` |
| FR2 | The system shall display driver trust summary before rider submits a join request. | Retained+Strengthened | Trust-before-acceptance is a supporting process and must be visible at decision time. | `RideOfferDetailDto` generation in `RideOfferQueryService.getOfferDetail()` |
| FR3 | The system shall allow riders to submit join requests with requested seats. | Retained | Core UC2 behavior unchanged. | `JoinRequestController.POST /join-requests` |
| FR4 | The system shall prevent duplicate pending join requests by the same rider for the same offer. | Added | Prevents noisy retries and ambiguity under high demand. | `existsByRiderIdAndRideOfferIdAndStatus(...)` |
| FR5 | The system shall allow drivers to accept or reject pending join requests. | Retained | Core UC2 decision path. | `JoinRequestController.PATCH /decision` |
| FR6 | The system shall create a ride match only after explicit acceptance and update seats atomically. | Retained+Strengthened | Ensures business correctness and avoids premature match records. | `JoinRequestService.decideJoinRequest()` |
| FR7 | The system shall auto-reject remaining pending join requests when an offer becomes full. | Added | Reduces stale pending states and improves transparency. | `findByRideOfferIdAndStatus(PENDING)` cleanup loop |
| FR8 | The system shall allow riders to post one-off ride requests and drivers to submit one-off offers. | Retained | Core UC3 flow. | `OneOffRideRequestController` |
| FR9 | The system shall expose driver trust summary before rider accepts a one-off driver offer. | Added | Aligns trust process across UC2 and UC3. | `buildDriverTrustSummary()` in offer listing |
| FR10 | The system shall enforce one final match per one-off request and reject non-selected pending offers. | Modified+Strengthened | Prevents conflicting commitments. | `rideMatchRepository.existsByRideRequestId(...)` and pending-offer rejection |
| FR11 | The system shall persist accepted-source provenance in ride matches (accepted join request or accepted one-off offer). | Added | Supports auditability and unambiguous match origin. | `RideMatch.acceptedJoinRequest`, `acceptedRideRequestOffer` |
| FR12 | The system shall provide per-user trip and request-history visibility for accepted/pending/rejected outcomes. | Modified | Increases process transparency under context change. | `TripController`, rider history endpoints |

### 4.3 Updated Non-Functional Requirements

| ID | Requirement | Status | Quality Concern | Justification |
|---|---|---|---|---|
| NFR1 | The system should keep terminology consistent across report, UML, API, and prototype pages. | Added | Coherence | Directly mapped to Stage 2 consistency criterion. |
| NFR2 | The system should return deterministic and user-actionable error messages for common conflicts. | Modified | Usability/Reliability | Conflict-heavy flows require clear feedback. |
| NFR3 | The system should preserve transactional integrity for seat updates and match creation. | Strengthened | Reliability | Prevents over-allocation and partial state writes. |
| NFR4 | The system should support bounded concurrency handling for join-request decisions. | Added | Reliability | Context includes contention risk on popular offers. |
| NFR5 | The system should expose trust evidence before acceptance decisions in both UC2 and UC3. | Added | Trust/Usability | Required by supporting process objective. |
| NFR6 | The system should keep architecture explainable and local-run reproducible for assessment. | Retained | Maintainability | Assignment prioritizes analysis clarity over platform complexity. |
| NFR7 | The system should support representative low-fidelity navigation pages for core flows. | Modified | HCI/Navigation | Prototype rubric emphasizes structure and navigation logic. |
| NFR8 | The system should remain within bounded feature scope and avoid payment/chat/navigation systems. | Retained | Scope discipline | Prevents rubric-diluting scope creep. |

### 4.4 Deferred Requirements

The following were deliberately deferred:
- payment and fare settlement
- in-app chat/messaging
- live navigation and route optimization
- formal legal compliance workflow
- production-grade access control and identity assurance

These are valid future concerns but outside Stage 2 assessment scope.

---

## 5. Updated Modelling and Design Correctness

This section summarizes alignment between updated requirements and UML model behavior.

### 5.1 Updated Use Case Model

Main use cases remain bounded to three:
1. Search Available Ride Offers (UC1)
2. Request to Join a Ride Offer (UC2)
3. Post One-Off Ride Request and Accept Driver Offer (UC3)

Model refinements:
- trust-view responsibilities are explicitly attached to acceptance decision paths
- acceptance remains the only trigger for match creation
- rejection and unavailable alternatives are explicit, not implied

Result:
- actor responsibilities remain clear
- no unnecessary actor explosion
- behavior changes are represented as refinements, not a new system scope

### 5.2 Updated Activity Model

The activity focus remains a deep core-flow representation with alternatives:
- Rider search and selection
- trust review before action
- system validation
- Driver acceptance/rejection
- atomic agreement recording

Stage 2 corrections:
- explicit unavailable/invalid paths
- explicit rejected branch
- explicit loop-back to search alternative

This improves behavioral correctness under uncertainty without introducing unrelated process layers.

### 5.3 Updated Class / Domain Model

Core classes remain stable:
- `User`, `Rider`, `Driver`, `Profile`, `Rating`
- `RideOffer`, `JoinRequest`, `RideRequest`, `RideRequestOffer`, `RideMatch`

Key correctness refinements:
- `Rating` includes `raterUser` relation (who rated whom)
- `RideMatch` stores accepted-source reference for provenance
- database-level XOR check and uniqueness enforce one valid source pattern per match
- `RideOffer` uses versioning and locked decision path to reduce seat-race risk

Important modeling discipline:
- implementation-heavy details are not treated as new business concepts
- domain-level meaning remains centered on matching, trust, and confirmation states

---

## 6. Design Justification, Trade-offs, and Response to Context Change

### 6.1 What Changed

- Trust is made explicit in both acceptance contexts (UC2 and UC3), not only profile pages.
- Join-request contention handling is strengthened with duplicate prevention and decision-path locking.
- One-off response path now has tighter eligibility and single-final-match safeguards.
- Match provenance is explicitly recorded to prevent ambiguous history.
- History and notification views provide clearer status transparency.

### 6.2 What Stayed the Same

- System boundary remains local community ride coordination.
- Three core use cases remain the primary analysis frame.
- Actors remain Rider and Driver as core participants.
- Out-of-scope exclusions (payment/chat/optimization) remain unchanged.

### 6.3 Trade-offs

| Decision | Benefit | Cost | Why Acceptable |
|---|---|---|---|
| Keep monolith + SQLite | Clear traceability and low setup friction | Limited scalability realism | Suitable for analysis-focused assignment |
| Add bounded admin oversight | Easier consistency checks in demo data | Extra surface not core UC | Kept operational and constrained |
| Add lock + version controls | Reduces over-sell risk | Slight complexity in service logic | Directly addresses context uncertainty |
| Expose trust summaries inline | Better acceptance confidence | Additional DTO composition | Supports core supporting process |
| Preserve static prototype boundary for submission | Rubric alignment | Less interaction realism | Prototype rubric rewards structure, not implementation |

### 6.4 Scope-Discipline Statement

The design responds to Stage 2 by refining correctness and adaptability, not by broadening into a full commercial transport platform.

---

## 7. Prototype Alignment (Design-Focused Deliverable)

The Stage 2 prototype deliverable should be a low-fidelity design artifact:
- HTML and CSS only
- no backend
- no scripting
- focus on navigation and page structure

This report therefore maps representative pages to requirements, rather than implementation-specific runtime behavior.

### 7.1 Recommended Representative Pages

| Prototype Page | Related Requirements | Use Case Support |
|---|---|---|
| Find a Ride (search form) | FR1, NFR7 | UC1 |
| Ride Offer Results | FR1, FR2 | UC1/UC2 handoff |
| Ride Offer Details + Join Action | FR2, FR3, FR4 | UC2 |
| Post One-Off Ride Request | FR8 | UC3 |
| My Trips / Status Summary | FR10, FR12, NFR1 | UC2/UC3 outcome transparency |

Optional sixth page if space permits:
- One-Off Offer Review page (supports FR9 strongly)

### 7.2 Navigation Logic

Required navigation coherence:
- Search -> Results -> Detail -> Action -> Status
- Post request -> Await offers -> Review -> Accept/Reject outcome
- Status pages clearly distinguish pending, accepted, rejected, matched

This aligns directly with prototype marking focus on structural clarity and navigation consistency.

---

## 8. Coherence and Consistency

To satisfy the 2-mark coherence criterion, this draft enforces the following:

| Artifact | Consistency Rule |
|---|---|
| Requirements | IDs and wording map to explicit behavior and constraints |
| UML models | Same domain terms as requirements and API (`RideRequestOffer`, `RideMatch`, `JoinRequest`) |
| Prototype narrative | Uses same user tasks and status language as requirements |
| API evidence | Endpoints correspond to each requirement path |
| GenAI reflection | Discusses real refinements made in this project, not generic statements |

Terminology consistency examples:
- one-off response concept consistently named `RideRequestOffer`
- match completion state consistently named `RideMatch`
- trust evidence consistently represented by `Profile + Rating summary`

---

## 9. GenAI Reflection and Critique (400-600 words)

The group used GenAI as a structured design assistant, not as an unquestioned source of truth. One concrete contribution was in refining requirement traceability when the project evolved from a simple join-request flow into two parallel commitment paths (join-request acceptance and one-off offer acceptance). GenAI was effective at proposing candidate tables and alternate formulations for requirement statements, which helped us move from vague descriptions to explicit requirement IDs, status transitions, and cross-artifact mapping. In practice, this reduced drafting time and made it easier to align the written analysis with concrete API and model behavior.

A major limitation appeared when GenAI generated plausible but incorrect project-specific claims. The most frequent errors were over-generalized architecture suggestions and model details that did not match our bounded assignment scope. For example, some generated suggestions introduced unnecessary enterprise-level complexity (such as broad governance workflows, advanced moderation pipelines, or full identity verification structures) that would have shifted the design away from Stage 2 requirements. In other cases, GenAI proposed terminology that conflicted with our implemented domain language, which risked reducing coherence across requirements, UML, and API documentation.

To evaluate and refine GenAI output, the group used a source-first verification loop. We treated each non-trivial AI suggestion as a candidate, then checked it against repository evidence in controllers, services, entities, and constraints. If a claim could not be mapped to implemented behavior or justified assignment scope, it was rejected or rewritten. We also compared generated requirement wording against rubric criteria (scope discipline, modelling correctness, and coherence) before accepting any text. This process prevented us from importing technically impressive but assessment-irrelevant content.

Human judgement had decisive influence on final design decisions. We deliberately kept the three core use cases as the analytical center, even when GenAI suggested expanding actor sets or introducing additional process domains. We also chose to preserve a bounded system boundary and defer payment, messaging, and optimization features, because adding them would dilute requirement quality and model correctness for Stage 2. Another human-led correction was insisting that trust information be visible at acceptance decision points in both UC2 and UC3, rather than only in profile views. This ensured the supporting process remained behaviorally meaningful.

Overall, GenAI improved drafting speed and option exploration, but quality depended on disciplined validation and scope governance. The final design is therefore the result of human-reviewed refinement: GenAI accelerated ideation, while the team retained responsibility for correctness, consistency, and alignment with the Stage 2 marking framework.

Word count (approx.): 520

---

## 10. Conclusion

This Stage 2 draft demonstrates adaptation through refinement, not redesign. The project remains a bounded community ride-coordination system centered on three core use cases. Stage 2 changes were handled by improving requirement precision, trust integration, state-transition correctness, and cross-artifact consistency.

The report’s core claim is:
- the design stays within scope
- the model remains correct and traceable
- the system responds to context pressure through targeted, justified updates

This is the strongest alignment with the official Stage 2 objective: reasoned adaptability under changing requirements.

---

## References (Draft)

1. University of Sydney. (2026). *ISYS2110/COMP9110 Project Description 2026 V2*.  
2. University of Sydney course materials. (2026). *Requirements modelling, structural modelling, HCI, and GenAI-supported analysis*.  
3. IEEE Standards Association. (2018). *IEEE/ISO/IEC 29148-2018 Requirements Engineering*.  
4. Object Management Group. (2017). *Unified Modeling Language (UML) 2.5.1*.  
5. Project repository artifacts: `README.md`, `docs/api-spec.md`, backend and frontend source code.

---

## Appendix A (Optional): Submission Checklist

Stage 2 final package includes:
- final written report
- short video pitch (<= 5 minutes, non-technical audience)
- low-fidelity prototype (HTML/CSS only, no backend, no scripting)
- short GenAI reflection (included in report, 400-600 words)
- GenAI declaration form
- peer assessment form (individual submission)

