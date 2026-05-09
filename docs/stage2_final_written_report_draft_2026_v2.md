# NeighbourLink Stage 2 Final Written Report (Draft, 2026 V2)

Course: ISYS2110 / COMP9110 Analysis and Design of Web Information Systems  
Project: NeighbourLink  
Report Type: Stage 2 Final Written Report (Draft)

---

## 1. Introduction and Stage 2 Context Change

NeighbourLink is a proposed web-based community ride-sharing information system for a local council pilot. In Stage 1, the system was framed as a bounded coordination platform for approximately 300 users within one metropolitan council area, supported by a development budget of AUD 60,000. The core idea was deliberately narrow: help Riders and Drivers share ride availability, review basic trust cues, manage spare seats, and form confirmed ride agreements without expanding into payment, transport optimisation, or social-platform functions.

The Stage 2 context change is now explicit and financial rather than behavioural. After initial planning, the council reduces the project budget from AUD 60,000 to AUD 30,000. This means the central design problem is no longer "how can the system do more?" but "which parts of the original design are essential enough to retain under a halved budget?" The correct response is therefore controlled simplification. The system should still support the core ride-sharing purpose, but it must do so through a leaner minimum viable design with tighter priorities and fewer non-essential commitments.

The report therefore focuses on five aligned outcomes. First, it clarifies the revised scope under the reduced-budget context. Second, it prioritises requirements by distinguishing essential functionality from simplified or deferred functionality. Third, it checks whether the UML models still represent a coherent minimum viable system. Fourth, it explains the design trade-offs created by the funding reduction. Fifth, it shows consistency across the report, UML, low-fidelity prototype plan, and GenAI reflection. The overall argument is that NeighbourLink remains feasible in Stage 2, but only as a lean coordination platform centred on matching, trust cues, seat limits, availability, and explicit confirmation.

---

## 2. Problem Understanding and Revised Scope

### 2.1 Baseline Problem in Stage 1

The original NeighbourLink problem is not transport optimisation; it is coordination reliability in a local community setting. Riders and Drivers often depend on informal communication channels that do not clearly show trip availability, spare seats, or confirmation status. This leads to four recurring failures:

1. seat commitments are unclear or stale  
2. trust checks happen too late or not at all  
3. request outcomes are not visible enough for both parties  
4. agreement state is ambiguous when multiple offers or requests coexist

These failures reduce confidence in both core scenarios: joining an existing ride offer and arranging a one-off ride request.

### 2.2 Stage 2 Context Pressure

Stage 2 does not change the underlying problem, but it changes what can realistically be delivered. With the budget reduced from AUD 60,000 to AUD 30,000, NeighbourLink can no longer be defended as a broad coordination platform with many supporting modules. The design must be re-examined in terms of feasibility, development effort, and direct contribution to the core ride-sharing purpose. Under this constraint, every retained function must justify its cost.

This means the strongest Stage 2 response is not feature growth. It is disciplined prioritisation. Core matching and trust support must remain, while richer but non-essential features should be simplified or deferred.

### 2.3 Revised Scope Decision

The report keeps the approved Stage 2 boundary centered on three use cases:

1. Search Available Ride Offers  
2. Request to Join a Ride Offer  
3. Post a One-Off Ride Request and Accept Driver Offer

The main design effort is simplification and prioritisation:

- retain the three core matching paths because they directly support the system purpose  
- simplify trust support to lightweight profile and rating cues  
- preserve seat and availability constraints because they are essential to reliable matching  
- reduce supporting features to basic status visibility rather than richer platform behaviour

### 2.4 Scope Table

| Scope Area | Stage 1 Baseline | Stage 2 Revision in This Draft | Out of Scope |
|---|---|---|---|
| Actors | Rider and Driver | Retain Rider and Driver only as core actors | Admin-heavy governance structures and external service actors |
| Core process | Matching and confirmation | Preserve ride matching, request review, and explicit confirmation | Dynamic dispatch, marketplace expansion, and complex workflow branching |
| Supporting process | Trust checking | Simplify trust support to profile and rating cues shown before acceptance | Document-heavy verification, moderation pipelines, and legal assurance workflows |
| Information handling | Basic offers, requests, and outcomes | Retain seat limits, availability, and confirmation records as essential business rules | Analytics dashboards, automated campaign notifications, and rich reporting |
| Interface scope | Demonstration of user flow | Focus on a small number of representative low-fidelity pages | Broad dashboard suites and feature-rich interface ecosystems |
| Project strategy | Pilot web system | Recast as a minimum viable coordination platform under reduced budget | Full-service transport platform ambitions |

### 2.5 Scope Justification

This scope is intentionally constrained. Stage 2 rewards design judgement under pressure, not platform breadth. A strong response to the budget cut is to preserve the smallest set of functions that still enables a trusted rider-driver agreement. Payment, live messaging, advanced verification, and route optimisation may all be interesting future enhancements, but they are not necessary for a minimum viable community ride-sharing pilot.

---

## 3. Updated User and Stakeholder Analysis

### 3.1 Rider Perspective

Riders still need the same core value in Stage 2: a dependable way to find or request a ride, judge whether another user seems trustworthy, and know whether a trip has actually been confirmed. The budget reduction does not remove these needs. Instead, it requires the system to meet them through fewer and simpler interactions.

Design consequences:

- search and request forms must stay focused on essential trip details  
- trust cues must appear at the point of decision, not as an optional extra  
- outcomes must be understandable through simple status feedback  
- one-off acceptance must clearly show that one chosen offer resolves the current request

### 3.2 Driver Perspective

Drivers need a lean workflow that still protects their capacity and control. Under the reduced budget, the system should not ask Drivers to manage complicated supporting processes. It should instead focus on the smallest set of actions needed to review requests, protect spare seats, and respond to one-off trip needs.

Design consequences:

- ride offers must show available seats clearly  
- join-request decisions must keep seat limits reliable  
- driver responses to one-off requests must remain simple and structured  
- basic status visibility should be sufficient without requiring rich back-office tooling

### 3.3 Council Sponsor and Assessment Context

The budget reduction also introduces a project-level stakeholder perspective. From the council sponsor's viewpoint, the system must remain worthwhile even after scope reduction. This means the design should continue to solve the original ride-sharing coordination problem while removing features that are expensive, secondary, or difficult to justify in a pilot environment. From the assessment viewpoint, this strengthens the need for clear prioritisation and traceability.

### 3.4 Stakeholder Impact Table

| Stakeholder | Existing Need | Stage 2 Impact | Design Implication |
|---|---|---|---|
| Rider | Find and confirm ride safely | Needs must still be met with fewer screens and less supporting complexity | Essential trip flow retained; trust cues kept lightweight but visible |
| Driver | Avoid over-commitment and review requests efficiently | Workflow should remain simple enough for a pilot implementation | Seat limits and basic decision actions retained; non-essential workflow reduced |
| Council sponsor | Fund a feasible pilot with clear environmental/community value | Halved budget demands a minimum viable design | Retain only functions that directly support successful matching |
| Teaching/assessment context | Evaluate design quality and adaptability | Report must show principled simplification rather than random feature removal | Strong traceability between scope decision, requirements, UML, and prototype |

### 3.5 Stakeholder Conclusion

The updated analysis confirms that the actor boundary should stay stable while the supporting scope becomes leaner. Stage 2 is therefore less about inventing new user roles and more about preserving the core rider-driver decision path at a lower development cost.

---

## 4. Updated Requirements Analysis

This section is central to the Stage 2 report because it shows how the system responds to reduced funding without losing its purpose. The requirement set below is intentionally prioritised. It distinguishes what must remain in order for NeighbourLink to function as a community ride-sharing system, what can be simplified, and what should be deferred under the AUD 30,000 constraint.

### 4.1 Requirement Change Summary

| Change Type | Meaning |
|---|---|
| Must Retain | Function is essential to the core ride-sharing purpose and cannot be removed |
| Simplify | Function remains important but should be implemented in a lighter form |
| Defer | Function is valuable but not necessary for the minimum viable Stage 2 scope |

### 4.2 Updated Functional Requirements

| ID | Functional Requirement | Status | Justification | System Realisation |
|---|---|---|---|---|
| FR1 | The system shall allow Riders to search open ride offers using essential trip criteria such as origin, destination, date, and passenger need. | Must Retain | Search is the entry point to the existing-offer scenario and directly supports the core service purpose. | Search flow collects basic trip details and presents matching offers. |
| FR2 | The system shall display ride offer details, including available seats and lightweight trust cues about the Driver, before a Rider submits a join request. | Must Retain | Riders need both trip fit and trust support before committing. | Offer detail view combines trip information with profile and rating summary. |
| FR3 | The system shall allow a Rider to submit a join request for an available ride offer. | Must Retain | This is the essential action that turns browsing into a possible match. | Join request action captures rider intent and seat request. |
| FR4 | The system shall allow the Driver who posted a ride offer to accept or reject join requests while enforcing seat availability. | Must Retain | Driver review is a core decision point in the official scenario and protects seat limits. | Driver decision flow checks request validity against current capacity. |
| FR5 | The system shall record a confirmed ride only after explicit acceptance and shall update the remaining seat availability accordingly. | Must Retain | Explicit confirmation is the core business outcome of the system. | Confirmation creates a final match outcome and reduces spare seats. |
| FR6 | The system shall allow Riders to post one-off ride requests using essential trip details such as location, time, and passenger count. | Must Retain | This is the second official scenario and must remain available in the reduced design. | One-off request flow records a temporary travel need. |
| FR7 | The system shall allow Drivers to view open one-off ride requests and submit simple ride offers in response. | Must Retain | One-off matching requires a driver response path, even in a lean design. | Drivers can propose a ride in response to a posted request. |
| FR8 | The system shall show lightweight trust cues about the responding Driver before the Rider accepts a one-off ride offer. | Simplify | Trust remains necessary, but should be supported through profile and rating cues rather than heavier verification workflows. | Offer review stage presents trust information before acceptance. |
| FR9 | The system shall allow only one accepted outcome for each one-off ride request and close alternative pending offers after acceptance. | Simplify | This keeps the design clear and avoids unresolved competing outcomes without requiring richer coordination features. | Acceptance finalises one offer and resolves remaining alternatives. |
| FR10 | The system shall provide basic status visibility for pending, accepted, rejected, and confirmed trip outcomes. | Simplify | Users need clear outcomes, but basic status views are more budget-appropriate than complex notification subsystems. | Status pages and histories show the current outcome of requests and matches. |

### 4.3 Updated Non-Functional Requirements

| ID | Non-Functional Requirement | Quality Dimension | Target / Check |
|---|---|---|---|
| NFR1 | The Stage 2 design must remain feasible within a substantially reduced project budget. | Feasibility | Only essential and simplified functions are included in scope. |
| NFR2 | The system must preserve clear and understandable core user flows for Riders and Drivers. | Usability | Each major use case can be followed through a small number of representative steps. |
| NFR3 | Seat limits, availability, and confirmation outcomes must remain consistent and trustworthy. | Reliability | A ride cannot be confirmed beyond available capacity, and confirmation must follow explicit acceptance. |
| NFR4 | Trust information must be visible before acceptance actions in both matching scenarios. | Trust/Usability | Profile and rating cues appear before join or acceptance decisions. |
| NFR5 | Terminology must remain consistent across report, UML, and prototype labels. | Coherence | Core terms are reused with stable meanings. |
| NFR6 | The Stage 2 prototype must remain design-focused and compliant with the HTML/CSS-only brief. | Process compliance | Prototype pages show navigation and layout only, without scripting or backend dependency. |
| NFR7 | The design should remain simple enough to support later extension if funding increases in future stages. | Maintainability | Core domain concepts are preserved without overcommitting to non-essential modules. |

### 4.4 Requirement Quality and Rationale

The requirement set is intentionally concise and prioritised. Quality is improved compared with generic feature lists in four ways:

1. **budget-aware prioritisation**: each requirement is classified as essential or simplified instead of being treated as equally important  
2. **clear user ownership**: each major action belongs to Rider or Driver without adding unnecessary roles  
3. **minimum viable coverage**: the three official use cases remain fully represented  
4. **controlled simplification**: trust support and status visibility are retained in lighter forms rather than being removed entirely

These properties reduce ambiguity, improve traceability, and align directly with the Stage 2 marking emphasis on justified design adaptation under changing constraints.

### 4.5 Deferred Requirement Set

The following items remain intentionally deferred:

- payment and fare settlement
- in-app chat and rich messaging
- live maps, live navigation, and route optimization
- document-heavy verification and moderation workflows
- analytics dashboards and advanced administrative reporting
- complex multi-role authorization architecture

Deferral is a deliberate quality choice, not a missing-feature weakness. These items do not directly determine whether a Rider and Driver can find each other, assess basic trust, manage seats, and record a match. Removing them from the Stage 2 core therefore improves feasibility without undermining purpose.

### 4.6 Requirement-to-Use-Case Traceability Matrix

To strengthen Stage 2 justification quality, the retained and simplified requirements are also mapped to interaction paths and visible design elements. This helps show that the reduced-budget design is still complete enough to support the official scenarios.

| Requirement ID | Use Case Path | Interaction Boundary (Representative) | Design/Logic Boundary |
|---|---|---|---|
| FR1 | UC1 Search Available Ride Offers | Search page and results page | essential trip criteria are sufficient to identify candidate offers |
| FR2 | UC1 to UC2 transition | Ride offer detail page | trip fit and trust cues are visible before commitment |
| FR3 | UC2 Request to Join Ride Offer | Join request action | rider can express interest in an available offer |
| FR4 | UC2 Driver review decision | Driver review state | driver controls acceptance while seat rules are respected |
| FR5 | UC2 Confirmation outcome | Match confirmation/status view | final agreement is recorded only after acceptance |
| FR6 | UC3 Post One-Off Ride Request | One-off request page | rider can express a temporary travel need with minimal fields |
| FR7 | UC3 Driver response | Driver offer action | driver can respond without requiring a large supporting workflow |
| FR8 | UC3 Rider acceptance review | One-off offer review page | trust cues are shown before final rider acceptance |
| FR9 | UC3 Finalised one-off match | Confirmation/status view | one accepted offer closes competing alternatives |
| FR10 | UC2 and UC3 outcome visibility | Shared status/history view | users can interpret pending, rejected, accepted, and confirmed outcomes |

This matrix reinforces the central Stage 2 argument: a smaller design can still be complete if its remaining requirements cover the whole matching path from discovery to confirmation.

---

## 5. Updated Modelling and Design Correctness

### 5.1 Use Case Correctness

The use case model remains anchored on the three approved use cases. This continuity is important because Stage 2 asks for adaptation, not replacement. Under the reduced budget, the strongest design choice is to keep the three use cases that directly represent the official ride-sharing scenarios and remove pressure to broaden the actor model or create many additional use-case branches.

- **UC1** remains ride offer discovery  
- **UC2** remains join-request submission plus driver decision  
- **UC3** remains one-off request posting plus rider acceptance of driver offer

Supporting use cases should remain lean and directly tied to these three paths. Viewing Driver profile and rating is retained because it supports trust before acceptance. Review and acceptance or rejection actions are retained because they create the decision points that produce a final match. This preserves behavioural correctness while staying within a minimum viable scope.

### 5.2 Activity Correctness

The activity logic should capture both successful and non-successful branches that matter to the reduced-budget system:

- no-result search branch
- invalid/unavailable request branch
- explicit rejection branch
- loop-back behavior for alternative selection
- one-off acceptance or non-acceptance branch

This addresses a common modelling weakness where only happy-path behaviour is shown. Even a lean system must still show what happens when no match is found, when a request is rejected, or when a seat is unavailable. These branches are essential to user understanding and therefore cannot be removed in the name of simplification.

### 5.3 Class/Domain Correctness

The domain model should also remain lean. Under the budget cut, the strongest class/domain diagram is one that preserves the essential ride-sharing concepts without drifting into implementation-heavy or non-core structures. The most important domain concepts remain:

- `User`, specialized into `Rider` and `Driver`  
- `Profile` and `Rating` as lightweight trust support  
- `RideOffer` and `JoinRequest` for the existing-offer scenario  
- `RideRequest` and `RideRequestOffer` for the one-off scenario  
- `RideMatch` as the explicit confirmed outcome

This model remains faithful to the project logic while avoiding unnecessary additions such as payment entities, chat structures, legal verification cases, or analytics components. That omission is a strength rather than a gap because those concepts are not essential to the Stage 2 minimum viable design.

### 5.4 Model-Behavior Consistency Check

| Model Claim | System Behaviour Evidence |
|---|---|
| Match created only after explicit acceptance | The confirmed ride outcome appears only after a Driver or Rider explicitly accepts the relevant request or offer. |
| Trust before acceptance | Profile and rating cues appear before a Rider decides whether to proceed. |
| One-off request leads to one final accepted outcome | A single request is resolved through one chosen response rather than several competing final matches. |
| Seat constraint safety in join flow | Available seats remain part of the decision logic before acceptance is allowed. |
| Core matching remains complete after simplification | The model still covers discovery, request, review, acceptance, and confirmation. |

### 5.5 Correctness Conclusion

Modelling quality in Stage 2 is improved not by making the diagrams larger, but by making them more disciplined. A high-scoring model set shows that the simplified system still covers the full matching lifecycle and still respects the most important business rules.

### 5.6 Consistency in a Lean Design

A recurring weakness in analysis reports is to simplify scope so aggressively that core system logic becomes ambiguous. In NeighbourLink, simplification must not weaken the rules that make a ride-sharing agreement trustworthy.

First, confirmation must remain explicit. A ride is not treated as agreed merely because a request exists. The model and activity logic should show that a match is created only after an acceptance decision. This preserves clarity for both Riders and Drivers.

Second, seat limits and availability must remain reliable. Even in a smaller system, the value of the platform collapses if users cannot trust whether a spare seat is actually available. Seat rules therefore remain a core part of the design rather than a technical afterthought.

Third, one-off requests should resolve cleanly. Once a Rider accepts one Driver offer, the design should not leave the request in an ambiguous state. The simplified system still needs a clear end point for that decision path.

Fourth, trust support should remain visible but lightweight. The system does not need to become a full verification platform, but it does need enough profile and rating visibility to support informed decision making.

These consistency rules are small in number, but they are central to the integrity of the reduced-budget design. They show that simplification has been applied to supporting complexity, not to the core meaning of a confirmed ride agreement.

---

## 6. Design Justification, Trade-offs, and Response to Context Change

### 6.1 What Changed and Why

Five design areas were revised directly because of the budget reduction:

1. the system boundary was tightened around the three core use cases  
2. trust support was simplified to profile and rating cues  
3. outcome visibility was reduced to basic status tracking rather than richer communication features  
4. prototype scope was reduced to a small set of representative pages  
5. non-essential platform ambitions were explicitly deferred

Each change responds to the same question: does this feature directly help a Rider and Driver reach a trusted, seat-aware, confirmed match within the reduced budget?

### 6.2 Retained Decisions

The following Stage 1 decisions remain valid:

- bounded local community system boundary
- Rider/Driver as core actors
- three core use cases as primary analysis frame
- explicit seat and availability constraints
- exclusion of payment and route optimization domains

Retaining these decisions is part of adaptation quality. The budget cut does not invalidate the core system concept; it simply forces the design to stay closer to its minimum viable purpose.

### 6.3 Trade-off Table

| Design Issue | Alternatives Considered | Decision | Benefit | Trade-off |
|---|---|---|---|---|
| Trust support | full verification workflow, no trust support, lightweight profile/rating cues | lightweight profile/rating cues | preserves informed decision making at lower cost | trust evidence is simpler and less formal |
| Communication and feedback | full chat/notification system, no outcome feedback, basic status visibility | basic status visibility | keeps users informed without creating a large interaction subsystem | less rich communication between users |
| Feature scope | broad platform with dashboards and extras, tightly bounded matching platform | tightly bounded matching platform | stronger feasibility under the reduced budget | fewer convenience features in the pilot |
| Prototype scope | many screens for every sub-state, small set of representative pages | small representative page set | aligns with the marking brief and reduces design overhead | less detailed visual coverage of edge cases |
| Supporting governance | admin-rich oversight tools, no supporting governance, simple confirmation records | simple confirmation records | core accountability remains without growing the actor model | governance support is intentionally limited |

### 6.4 Rejected Alternatives

The design explicitly rejects several tempting but out-of-scope alternatives:

- full ride-hailing marketplace features
- dynamic pricing and payment settlement
- real-time messaging and social feed mechanisms
- live map and navigation workflows
- complex organizational role and permission hierarchy
- analytics-heavy or document-heavy governance modules

These alternatives are not rejected because they lack value in general. They are rejected because they would draw effort away from the core pilot purpose and weaken the Stage 2 argument about principled simplification.

### 6.5 Response to Context Change

The final response strategy is therefore budget-aware simplification. The design remains recognisably NeighbourLink, but it is reframed as a minimum viable coordination platform. This is exactly the Stage 2 objective: adaptation with discipline, not reinvention with scope creep.

### 6.6 Stage 2 Risk Register and Mitigation Logic

Because Stage 2 evaluates adaptation quality, it is useful to document not only what was retained or deferred, but also the risks created by those choices.

| Risk ID | Stage 2 Risk Description | Impact if Uncontrolled | Mitigation Adopted in Design | Residual Risk |
|---|---|---|---|---|
| R1 | Scope remains too broad for the reduced budget | feasibility becomes unconvincing | classify functions as essential, simplified, or deferred | medium if final report reintroduces too many extras |
| R2 | Simplification removes too much trust support | users may not feel safe accepting matches | retain profile and rating cues at decision points | medium because trust cues remain lightweight |
| R3 | Simplification removes too much outcome visibility | users may not understand whether a ride is actually confirmed | retain basic pending/accepted/rejected/confirmed status views | low |
| R4 | Seat and availability rules are weakened in the lean design | system loses credibility as a matching platform | preserve seat limits and explicit acceptance as non-negotiable rules | low |
| R5 | Prototype and report drift apart | coherence marks are weakened | map each representative page directly to requirements and use cases | low |
| R6 | Report becomes too technical instead of design-focused | modelling and justification appear misaligned with the brief | keep argument centred on scope, feasibility, and domain behaviour | low |

This risk register demonstrates design reasoning maturity. The report does not claim zero risk; it documents where risk exists, how it is reduced, and what remains outside the assignment context.

---

## 7. Prototype Alignment (Design-Focused Deliverable)

Stage 2 prototype marking focuses on structure and navigation, not technical richness. The official requirement emphasizes:

- HTML/CSS only
- no backend dependency
- no data storage
- no scripting
- representative pages are sufficient

For Stage 2 reporting, the prototype should be treated as a low-fidelity page and navigation mapping rather than as an attempt to demonstrate a full interactive product. This keeps the submission aligned with the brief and with the reduced-budget design argument.
Under the reduced-budget context, the prototype should also communicate simplification. It should show that the essential user journey still works through a small, coherent set of pages rather than a large product surface.

### 7.1 Representative Prototype Pages

| Prototype Page (Low-Fidelity) | Purpose | Related Requirement IDs | Related Use Cases |
|---|---|---|---|
| P1. Home / Entry Page | orient the user and present the two core actions: find a ride or post a request | FR1, FR6, NFR6 | UC1, UC3 |
| P2. Search and Results Page | collect essential search criteria and display candidate ride offers | FR1, FR2 | UC1 |
| P3. Ride Offer Detail and Join Request Page | show trip details, trust cues, and the join request action | FR2, FR3, FR4, FR5 | UC2 |
| P4. Post One-Off Ride Request Page | allow a Rider to enter essential details for a one-off travel need | FR6 | UC3 |
| P5. One-Off Offer Review and Status Page | show driver responses, trust cues, acceptance choice, and simplified trip status | FR7, FR8, FR9, FR10 | UC3, UC2 |

### 7.2 Navigation Logic

Expected navigation chain for low-fidelity prototype:

- Home -> Search and Results -> Offer Detail -> Join Request / Status  
- Home -> Post One-Off Request -> Offer Review and Status

This navigation is sufficient for structural clarity and requirement alignment. It also demonstrates that the prototype has been intentionally kept lean under the Stage 2 budget constraint.

### 7.3 Prototype Consistency Rules

To keep coherence high, the prototype should maintain:

- consistent naming for status labels
- consistent placement of trust summary before acceptance actions
- explicit confirmation and rejection visibility
- simple page-to-page flow without optional detours

### 7.4 Low-Fidelity Delivery Plan for Stage 2 Submission

To align tightly with the Stage 2 prototype brief, the deliverable should be packaged as a small, static HTML/CSS artifact independent of backend runtime. The recommended preparation workflow is:

1. extract one representative HTML page per retained user-flow state  
2. preserve domain vocabulary exactly as used in report and UML  
3. use plain hyperlink navigation to demonstrate flow sequence  
4. avoid dynamic scripting and database-coupled behavior in the submission artifact  
5. include a simple navigation index to show how five pages cover the three core use cases

This approach keeps the prototype assessable for structural clarity and navigation logic, which are explicitly weighted in the rubric. It also protects report coherence, because the same use-case vocabulary appears in report text, model captions, and prototype labels.

---

## 8. Coherence and Consistency

Coherence and consistency are evaluated across artifact boundaries, not within isolated sections. This report applies a cross-artifact consistency framework:

### 8.1 Terminology Consistency

Core terms are reused without uncontrolled synonyms:

- `RideOffer`
- `RideRequest`
- `JoinRequest`
- `RideRequestOffer`
- `RideMatch`
- `Profile`
- `Rating`

This avoids one of the most common Stage 2 quality failures: semantic drift between requirements, UML, and interface narratives.

### 8.2 Traceability Consistency

| Source Artifact | Consistency Check |
|---|---|
| Requirements section | each retained or simplified requirement is tied to the budget-aware design argument |
| UML suite | the three core use cases and their supporting domain concepts remain aligned |
| Prototype section | representative pages map directly to retained requirements and core flows |
| GenAI reflection | critiques are tied to prioritisation and simplification decisions rather than generic AI use |

### 8.3 Narrative Coherence

The report keeps one stable argument from start to finish:

1. the original problem is reliable community ride coordination  
2. Stage 2 introduces a major budget reduction  
3. essential ride-matching functions are retained while secondary features are simplified or deferred  
4. UML and prototype artefacts express the same lean system boundary  
5. adaptation is achieved through prioritisation rather than redesign

This narrative consistency directly supports the Stage 2 coherence criterion.

### 8.4 Consistency Pitfalls Avoided in This Draft

The draft explicitly avoids four common inconsistency patterns seen in assignment reports:

1. **budget-blind expansion**: avoiding the addition of attractive but non-essential features after the Stage 2 funding cut  
2. **term drift across sections**: avoiding inconsistent naming for offers, requests, matches, and trust cues  
3. **scope contradiction**: avoiding statements that imply payment, navigation, or rich governance tools are part of the reduced Stage 2 core  
4. **artifact hierarchy confusion**: avoiding treatment of implementation richness as if it were the assessed low-fidelity prototype

By naming and avoiding these pitfalls, the report improves defensibility during marking and reduces the likelihood of contradiction under scrutiny.

---

## 9. GenAI Reflection and Critique (400-600 words)

GenAI was used in this project as a structured design assistant rather than a design authority. Its most useful contribution in Stage 2 was helping the group reason about prioritisation under the new budget constraint. Once the project context changed from a AUD 60,000 pilot to a AUD 30,000 pilot, the key challenge was no longer simply refining the original system. It became deciding which parts of the Stage 1 design were essential, which could be simplified, and which should be deferred without damaging the core ride-sharing purpose. GenAI was helpful in rapidly generating alternative requirement groupings, priority tables, simplification options, and candidate explanations for why some features should remain while others should be removed from the core scope.

One concrete positive example was feature prioritisation. Early drafts risked treating too many features as equally important, which would have weakened the budget-response argument. GenAI helped produce comparison tables that separated core matching functions from optional platform functions. This made it easier to retain the three approved use cases, keep trust cues at decision points, and defend the removal or simplification of richer features such as heavy governance workflows, broad communication features, and advanced platform extras. In this sense, GenAI reduced blank-page overhead and improved the speed of comparing design alternatives.

However, GenAI also produced misleading outputs. A recurring limitation was over-design. Some generated suggestions sounded polished but were poorly aligned with the Stage 2 change because they continued to introduce extra roles, richer verification workflows, broader dashboard functionality, or feature expansions that would be difficult to justify after the budget was halved. Other suggestions framed the solution in an overly technical way, focusing on implementation detail rather than design reasoning and system scope. If accepted uncritically, these suggestions would have weakened the report by making it sound like a larger and more expensive system at exactly the moment the assignment required disciplined simplification.

The group addressed these limitations through a verification-and-prioritisation process. Every significant GenAI suggestion was treated as a candidate rather than an answer. It was then checked against the official Stage 2 context, the three approved use cases, the existing UML direction, and the reduced-budget design objective. If a suggestion did not directly support core ride matching, trust checking, seat control, or clear confirmation, it was either simplified or rejected. The same filtering logic was applied to wording choices. Statements were kept only if they strengthened the report's argument about feasibility, traceability, and adaptability.

Human judgement remained the deciding factor in all final design choices. The group deliberately chose to preserve the Rider-Driver boundary, retain the three approved use cases, keep trust support lightweight, and defer features that were not necessary to the pilot's core value. The group also chose to frame the prototype as a small, low-fidelity navigation artifact rather than allowing the existence of a richer implementation to distort the submission strategy. This was an important design judgement because the assignment does not reward building the biggest system; it rewards showing that the system can be adapted intelligently when constraints change.

The main lesson is that GenAI is most useful as a generator of alternatives and arguments, not as a substitute for design judgement. In this project, AI accelerated the exploration of simplification options, but the final scope decisions remained human-owned, evidence-based, and aligned with the reduced-budget context of Stage 2.

---

## 10. Conclusion

This Stage 2 draft demonstrates adaptation through disciplined simplification. NeighbourLink remains within the approved scope and preserves the three core use cases, but it is now argued as a budget-aware minimum viable coordination platform rather than a broader community service platform.

From an assessment perspective, the strongest contribution of this draft is coherence: the problem definition, revised scope, prioritised requirements, UML interpretation, prototype plan, and GenAI reflection all support the same argument about essential functionality under constraint. The report therefore positions NeighbourLink as a bounded, defensible, and context-responsive Stage 2 design outcome.

---

## References (Draft)

1. University of Sydney. *ISYS2110 / COMP9110 Project Description (Stage 2), 2026 V1*.  
2. University of Sydney. *Stage 2 marking rubric and submission instructions*.
3. NeighbourLink Stage 1 analysis and design baseline.
4. NeighbourLink final UML model set.
5. NeighbourLink low-fidelity prototype pages and navigation map.

---

## Appendix A (Optional): Stage 2 Submission Checklist

This checklist is not part of marked core content, but helps submission readiness.

1. Final written report within page limit.  
2. Video pitch prepared for non-technical audience (<= 5 minutes).  
3. Low-fidelity prototype package prepared as design artifact (HTML/CSS representative pages).  
4. GenAI reflection included in final report (400-600 words).  
5. GenAI declaration form completed.  
6. Peer assessment form submitted individually.
