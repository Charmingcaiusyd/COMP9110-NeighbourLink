# NeighbourLink Stage 2 Code Adjustment Range Analysis

## 1. Purpose

This document defines the recommended modification range for adapting the current NeighbourLink project to the new Stage 2 requirement set.

The goal is not to start coding immediately. The goal is to:

1. identify what the new Stage 2 requirement actually changes
2. compare that requirement to the current project
3. define a safe and realistic modification boundary
4. separate `must change`, `should change`, and `do not change yet`
5. establish the target functionality before implementation begins

This document is intended to be the working scope baseline for the next coding phase.

---

## 2. Source Documents Reviewed

The scope in this file is based on the following sources:

- `C:/Users/gs658/Downloads/NeighbourLink_Stage1_to_Stage2_Code_Adjustment_Spec.md`
- `C:/Users/gs658/Downloads/CLAUDE.md`
- the current project `README.md`
- the current `docs/api-spec.md`
- the current frontend route surface in `frontend/src/main.js`
- the current backend controller surface in `backend/src/main/java/com/neighbourlink/controller/`

---

## 3. Executive Conclusion

The current project already contains the three core NeighbourLink business flows:

1. search available ride offers
2. request to join a ride offer and receive driver decision
3. post a one-off ride request and accept a driver offer

From a business-logic perspective, the project is not missing the core NeighbourLink behaviour.

However, the new Stage 2 adjustment specification changes the expected *presentation and visible scope* of the system very significantly.

The main issue is not "missing core backend logic". The main issue is that the current project exposes a much broader system surface than the reduced-budget Stage 2 submission should present.

The most important gap is:

> The current project behaves like an extended runnable application, while the new Stage 2 specification wants a reduced-budget, minimum viable coordination platform with a small visible scope and an official low-fidelity HTML/CSS-only prototype deliverable.

Because of that, the safest and most defensible next step is:

- keep the existing core matching logic
- do **not** immediately rewrite or delete the whole backend
- create a reduced Stage 2 submission slice
- hide or isolate non-core features from the official Stage 2 prototype and report-facing surface

---

## 4. What the New Stage 2 Requirement Means

According to the new specification, Stage 2 must be interpreted as:

- a continuation of Stage 1, not a redesign
- a response to a budget cut from `AUD 60,000` to `AUD 30,000`
- a move toward a minimum viable coordination platform
- a simplification exercise, not a feature expansion exercise

The reduced-budget core must still support:

1. Rider searches ride offers
2. Rider sees essential ride details
3. Rider sees basic trust cues
4. Rider submits join request
5. Driver responds to join request
6. system checks seat availability
7. system shows confirmed or rejected or unavailable outcome
8. Rider posts one-off ride request
9. Driver submits a simple response offer
10. Rider reviews and accepts that driver offer
11. system shows basic match status

The specification explicitly says that the following should not be part of the visible Stage 2 reduced-budget core:

- payment
- live map or route optimisation
- map tracking
- in-app chat or rich messaging
- formal verification workflows
- document upload workflows
- admin dashboard exposure
- moderation/dispute processes
- analytics dashboards
- heavy model or concurrency details in analysis-facing artefacts

This is the most important scope rule for the next implementation phase.

---

## 5. Current Project Baseline

The current project already goes beyond the reduced-budget Stage 2 surface.

### 5.1 Core capabilities already present

These are already aligned enough to Stage 2 and should be treated as retained assets:

- ride offer search
- ride offer detail review
- trust-first join request flow
- driver decision flow
- one-off ride request posting
- driver response offer flow
- rider acceptance flow
- ride status / history visibility
- seat availability handling

### 5.2 Currently exposed expanded features

The current project also visibly includes:

- `tutorial` page
- `login` and `register`
- `admin/login` and `admin`
- `my-trips`
- `profile`
- `driver-hub`
- map/location search with Leaflet
- route overview endpoint
- notifications
- driver document upload/review support
- fixed admin credentials and admin governance UI

These do not all need to be deleted from the codebase immediately, but many of them should not remain part of the visible Stage 2 submission surface.

---

## 6. Gap Analysis: Current Project Versus New Stage 2 Target

### 6.1 Summary table

| Area | Current Project State | Stage 2 Target | Range Decision |
|---|---|---|---|
| UC1 search flow | Present | Must retain | Keep |
| UC2 join request flow | Present | Must retain | Keep |
| UC3 one-off request flow | Present | Must retain | Keep |
| Trust cues | Present but somewhat richer | Keep only in lightweight form | Simplify |
| Match status | Present through histories/notifications | Keep only basic status | Simplify |
| Main navigation | Broad, many routes | Small reduced-budget set | Must change |
| Prototype format | Current app is JS SPA | Official submission prototype should be HTML/CSS only | Must add new slice |
| Admin surface | Visible route and UI | Should not appear in Stage 2 prototype | Hide/isolate |
| Driver document workflow | Visible in project | Should not appear in reduced-budget core | Hide/isolate |
| Maps/location UX | Visible and integrated | Should not appear in Stage 2 core | Hide/isolate |
| Route overview | Present | Out of scope for Stage 2 visible core | Hide/isolate |
| Notifications | Visible as separate capability | Reduce to basic status | Simplify |
| Profile management | Visible as separate page | Trust should be embedded, not a separate large module | Hide/simplify |
| Tutorial and other support pages | Visible | Not part of Stage 2 official prototype core | Hide from submission slice |
| API documentation | Includes admin and other extended features | Should be split into core versus extended | Should change |
| Backend controllers | Broad but usable | Core backend can remain; visible Stage 2 scope must narrow | Mostly keep for now |

### 6.2 Key interpretation

The current project is not "wrong". It is simply broader than the new Stage 2 submission strategy supports.

That means the first implementation question should not be:

> Which backend classes do we delete?

It should be:

> Which features must remain visible in the official Stage 2 submission, and which existing features should be hidden, isolated, or documented as extended implementation only?

---

## 7. Recommended Scope Boundary

## 7.1 Must change in the next implementation phase

These are the highest-priority changes because they directly affect Stage 2 compliance.

### A. Create a dedicated reduced-budget Stage 2 submission surface

This is the most important scope decision.

Recommended action:

- add a separate static prototype slice, likely under a new folder such as `prototype/`
- keep it independent from the current JS SPA
- make it the official Stage 2 prototype deliverable

Recommended page set:

1. `index.html` or `home.html`
2. `search-rides.html`
3. `ride-offer-detail.html`
4. `post-ride-request.html`
5. `offer-review-status.html`

This directly matches the new specification and avoids risky surgery on the working application.

### B. Narrow the visible Stage 2 navigation

The official Stage 2 prototype should only expose:

- Home
- Search Ride Offers
- Ride Offer Detail / Join Request
- Post One-Off Ride Request
- Offer Review / Basic Match Status

Optional reduced driver-oriented labels may appear only if needed to make the scenario understandable.

The following should not appear in the official Stage 2 prototype navigation:

- Admin
- Tutorial
- Profile
- My Trips as a large hub
- Driver Hub as a broad panel
- Notifications as a distinct module
- Map or route tools

### C. Simplify trust presentation

Trust must remain visible, but only as lightweight cues.

Recommended visible trust content:

- driver name
- suburb / community area
- short bio
- travel preference summary
- average rating

Do not present:

- rating management interface
- rating history management
- moderation tooling
- document approval states

### D. Simplify status vocabulary

Visible status labels should be reduced to:

- Pending
- Accepted
- Rejected
- Unavailable
- Confirmed

This should apply to:

- prototype content
- user-facing labels
- mock data
- report screenshots or appendix content

### E. Prepare reduced-budget Stage 2 mock data

The Stage 2 prototype should use a very small scenario dataset:

- one Rider for UC2
- one Driver for UC2
- one Rider for UC3
- one ride offer
- one one-off ride request
- one driver response offer
- one confirmed match example

The current demo dataset can remain in the system, but the official submission prototype should use the lean scenario set.

### F. Split "core Stage 2" from "extended implementation"

The project should stop speaking as if every current module belongs to the Stage 2 core.

This means:

- Stage 2 report and prototype should describe only the reduced-budget core
- README and API docs may later need a clearer distinction between `core` and `extended`
- video and presentation should not lead with admin, maps, or document workflows

---

## 7.2 Should change after the core submission slice is established

These changes are recommended, but they are secondary to the prototype boundary.

### A. Simplify the existing SPA main navigation

If we want the runnable application itself to visually align better with Stage 2, then we should also simplify the live app navigation.

Recommended app-level changes:

- remove direct nav links to `/admin`
- remove direct nav links to `/tutorial`
- remove direct nav links to `/profile`
- reduce emphasis on `/my-trips`
- reduce emphasis on `/driver-hub`

This is optional in the first pass if a separate static prototype is created.

### B. Hide map-first interaction patterns from the Stage 2-facing experience

The current find/post flows rely on location search and map interaction. The new specification argues against maps as part of the reduced-budget core.

Recommended adjustment:

- in the official prototype, use plain text fields or static selectors
- in the runnable app, optionally keep map logic but remove it from submission-facing narrative

### C. Reduce notifications into basic status messaging

Notifications currently exist as a separate visible capability. In Stage 2, this should become simpler.

Recommended adjustment:

- treat notifications as implementation detail or extended feature
- show only outcome banners/cards in the reduced-budget prototype

### D. Reframe profile pages

Profile data should support trust, but profile management should not become a major standalone use case in the Stage 2 prototype.

Recommended adjustment:

- do not expose a dedicated large profile-management page in the prototype
- embed trust summary into offer detail and offer review pages

### E. Tighten documentation

`docs/api-spec.md` and possibly `README.md` should eventually be updated so that:

- the reduced-budget Stage 2 core is clearly separated
- extended modules are labelled as non-core or implementation-only
- the official prototype strategy is clear

---

## 7.3 Should not be changed in the first implementation pass

These are areas where aggressive refactoring is not recommended yet.

### A. Do not delete the core backend flows

Do not rewrite or remove:

- `RideOfferQueryController`
- `RideOfferManagementController`
- `JoinRequestController`
- `OneOffRideRequestController`
- `TripController` core trip retrieval if still useful for status

Reason:

- these already support the core NeighbourLink logic
- deleting them creates unnecessary risk
- the new requirement is about visible scope reduction, not backend replacement

### B. Do not do a full domain-model rewrite in code yet

The new specification allows a leaner `User/Profile` presentation model, but it explicitly says not to force a dangerous deletion of separate Rider/Driver code if the project is already working.

Recommended first-pass decision:

- keep the current domain implementation if it already works
- simplify the visible model in prototype, report, and UML artefacts
- only revisit deeper model consolidation if there is a clear payoff later

### C. Do not immediately remove every extended controller

These controllers are likely extended-scope rather than core:

- `AdminController`
- `DriverDocumentController`
- `NotificationController`
- `LocationController`
- `RouteController`
- possibly some `ProfileController` and `RatingController` surface depending on visibility

But the first-pass recommendation is:

- keep them in code
- hide them from the Stage 2 prototype and submission-facing narrative
- decide later whether cleanup is worth the risk

### D. Do not merge everything into one single live app flow yet

Trying to convert the current full app into the only Stage 2 deliverable surface will create more risk than value in the first pass.

The safer path is:

- keep current app intact enough to remain runnable
- add a separate reduced-budget prototype slice
- optionally align the live app later

---

## 8. Proposed Implementation Strategy

## 8.1 Recommended strategy

The recommended approach is:

### Strategy A: Non-destructive Stage 2 submission slice

1. keep the current runnable application
2. create a separate static HTML/CSS-only prototype folder
3. update Stage 2 docs, UML, and wording to align with that prototype
4. optionally simplify the live app navigation in a later pass

This is the recommended strategy because it:

- directly satisfies the prototype requirement
- avoids breaking working core flows
- avoids high-risk deletion of existing features
- preserves the current app as an extended implementation
- creates a clean submission story

## 8.2 Higher-risk alternative

### Strategy B: Trim the current SPA into the only Stage 2 surface

This would mean:

- removing/hiding routes inside `frontend/src/main.js`
- reducing the live app to five visible pages
- stripping admin/maps/notifications/profile/document workflows from the main experience

This may be worthwhile later, but it should not be the first move unless we explicitly decide that the repository itself must be made fully Stage 2-minimal.

Risk:

- larger diff
- higher regression risk
- more hidden coupling in `main.js`
- more effort for less direct grading benefit

---

## 9. Concrete Modification Range by Project Area

## 9.1 Frontend

### Must include in range

- new static prototype folder
- five reduced-budget pages
- simplified trust summary block
- simplified status presentation
- no visible admin/chat/map/document workflow in official prototype

### Optional second-pass frontend cleanup

- simplify live SPA nav
- reduce live route visibility
- reduce tutorial/support-page emphasis
- reduce `my-trips` into simpler status language

## 9.2 Backend

### Must include in range

- no immediate backend rewrite required

### Optional second-pass backend cleanup

- classify non-core endpoints as extended
- reduce docs exposure of admin/location/route/document endpoints
- possibly hide or stop referencing non-core controllers in README/API summary

## 9.3 Documentation

### Must include in range

- new range document
- reduced-budget prototype plan
- UML alignment files if needed
- report wording aligned to `minimum viable coordination platform`

### Likely follow-up doc changes

- refine `README.md`
- split `docs/api-spec.md` into `core Stage 2` versus `extended implementation`
- align terminology across report, UML, and prototype

---

## 10. Target Functionality After the Next Change Phase

After the next implementation phase, the Stage 2-aligned submission should clearly demonstrate the following and nothing more is required for the official core:

1. a Rider can enter essential search criteria
2. the system can show open ride offers
3. the Rider can inspect ride details and basic trust cues
4. the Rider can submit a join request
5. the Driver can respond
6. the system can show a basic match outcome
7. a Rider can post a one-off ride request
8. a Driver can submit a simple response offer
9. the Rider can review and accept that offer
10. the system can show the basic status of that match

This should be presented through a reduced set of low-fidelity pages, not through a broad product surface.

---

## 11. Explicitly Out of Range for the Next Phase

The following should be considered out of range for the *next* code change phase unless we consciously reopen them:

- full backend redesign
- removal of all extended controllers
- deep database schema restructuring
- complete replacement of the current SPA
- new authentication model
- new admin model
- rich rating management
- live route logic enhancement
- document workflow improvement
- analytics/reporting additions
- animation or visual-polish-first redesign

These items do not improve Stage 2 compliance enough to justify first-pass cost.

---

## 12. Recommended Next Coding Scope

If we follow this range document, the next implementation step should cover only:

1. create the reduced-budget static prototype slice
2. reduce visible Stage 2 navigation to the five core pages
3. embed basic trust cues into detail/review pages
4. simplify status language
5. prepare lean scenario-focused mock content
6. align supporting documentation to distinguish core from extended features

This is the narrowest scope that gives us a strong Stage 2 submission alignment improvement with the lowest engineering risk.

---

## 13. Final Recommendation

The project does **not** need a large code rewrite to satisfy the new Stage 2 requirement.

What it needs is a **scope correction**:

- preserve the working core matching logic
- stop presenting extended features as Stage 2 core
- build a dedicated reduced-budget prototype slice
- treat admin, maps, documents, notifications, and other broad features as extended implementation rather than submission core

The best next step is therefore not "refactor everything".

The best next step is:

> implement a small, clean, reduced-budget submission surface on top of the existing core, then decide whether deeper cleanup is worth doing afterward.
