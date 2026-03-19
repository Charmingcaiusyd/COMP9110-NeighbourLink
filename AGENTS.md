# AGENTS.md

## Project
- Name: NeighbourLink
- Type: University Web Information System Assignment
- Deployment: Local run only

## Stack
- Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA, Bean Validation
- Frontend: React + Vite
- Database: SQLite
- API style: REST

## Scope (Fixed)
- Primary user group: Rider
- Secondary user group: Driver
- Core process: Ride matching and confirmation
- Supporting process: Trust checking before accepting a match

## Approved Use Cases (Only 3)
1. Search Available Ride Offers
2. Request to Join a Ride Offer
3. Post a One-Off Ride Request and Accept Driver Offer

## Out of Scope (Do Not Add)
- Payment
- Live map / navigation
- Chat / messaging
- Route optimization algorithm
- Microservices
- Complex auth/permission systems

## Repository Layout
```text
/
  AGENTS.md
  README.md
  docs/
    requirements.md
    domain-model.md
    api-spec.md
  backend/
    pom.xml
    src/main/java/com/neighbourlink/
      controller/
      service/
      repository/
      entity/
      dto/
      mapper/
      config/
      exception/
    src/main/resources/
      application.yml
  frontend/
    package.json
    src/
      api/
      components/
      pages/
      router/
      styles/
      types/
```

## Domain Alignment
Keep implementation aligned with these core domain objects:
- User
- Rider
- Driver
- Profile
- RideOffer
- RideRequest
- JoinRequest
- RideMatch
- Rating

## Business Rules (Must Enforce)
- A join request can be accepted only if `requestedSeats <= availableSeats`.
- A ride match is created only after explicit acceptance.
- Seat count must be updated immediately after acceptance.
- Trust information (profile + rating summary) must be visible before rider acceptance actions.

## Backend Responsibilities
- Controller: Request/response and validation boundary
- Service: Business logic and state transitions
- Repository: Persistence
- DTO/Mapper: API model isolation
- Exception handler: Consistent error format

## Frontend Responsibilities
- Keep to at most 5 prototype-aligned pages:
1. Find a Ride
2. Ride Offer Results
3. Ride Offer Details (Trust info + request action)
4. Post One-Off Ride Request
5. Ride Confirmed
- Prioritize clear navigation and layout over advanced interactions.

## Run Commands (Target)
When project is scaffolded, keep commands simple and documented in README.

- Backend (Spring Boot):
  - Run: `mvn spring-boot:run`
  - Test: `mvn test`
  - Build: `mvn clean package`

- Frontend (React + Vite):
  - Install: `npm install`
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Preview: `npm run preview`

## Coding Conventions
- Keep code readable, small, and incremental.
- Prefer explicit names over clever abstractions.
- Keep API contracts stable and documented in `docs/api-spec.md`.
- Avoid premature optimization.
- Add minimal comments only for non-obvious business rules.

## Change Workflow
- Make small, reviewable changes.
- Explain what files changed and why.
- Keep each change mapped to one of the approved use cases or a shared foundation.

## Done-When Checklist
A task is done only when all are true:
- It supports one of the 3 approved use cases.
- It does not introduce out-of-scope features.
- Domain terms stay consistent with UML/requirements docs.
- API inputs/outputs and status transitions are documented.
- Basic local run instructions remain valid.

## Guardrail for All Future Work
If a requested feature conflicts with assignment scope, stop and propose a minimal in-scope alternative first.
