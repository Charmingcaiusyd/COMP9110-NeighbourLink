# Runtime UI Sync (2026-05-19)

This note records the current implemented UI behavior so docs stay aligned with the runnable app.

## 1) Rider Entry Flow
- Primary rider entry remains `/` (`Find a Ride`).
- Dedicated rider `Post a Ride Request` entry is removed from primary navigation.
- Legacy `/post-ride-request` route is redirected to `/`.

Auto routing after rider confirms filters:
- `departureTime` missing -> auto-create one-off request
- trip time more than 3 hours away -> auto-create one-off request
- trip time within 3 hours -> search open ride offers first
- within-3-hour search with no results -> auto-create one-off request

All auto-created requests redirect to `/my-trips` and are visible in rider history.

## 2) My Trips Presentation
- `/my-trips` keeps notifications in a dedicated notification section.
- Non-notification rider records are unified into `My Unified Orders`.
- `My Unified Orders` is rendered as a card timeline (newest first), not a table.
- Filters retained:
  - Stage: `IN_PROGRESS | CONFIRMED | CLOSED | ALL`
  - Path: `ALL | JOIN | ONE_OFF`
- Card actions retained:
  - `Review Offers` (one-off request)
  - `Cancel` (open one-off request)
  - `Payment` (for matched records)

## 3) Payment Page (Demo Only)
- Frontend route: `/payment`
- Purpose: display a simple credit-card template for demo interaction.
- No backend payment processing is used.

## 4) Account Settings
- Top navigation includes `Account` between `My Trips` and `Log Out`.
- `Account` page only keeps:
  - reset-password panel (calls backend password reset API)
  - payment method management (add/remove/default)
- Payment method preferences are stored in browser `localStorage` per user.

## 5) Scope Clarification
- These changes are UI/runtime orchestration and demo-surface enhancements.
- Core backend use case APIs remain:
  - ride offer search/detail
  - join request submit/decision/history
  - one-off request create/offer/accept/cancel/history
