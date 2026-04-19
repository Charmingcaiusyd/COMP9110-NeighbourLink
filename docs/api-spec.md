# NeighbourLink API Specification (Draft)

## 1. Purpose
This document defines the minimal REST API for the assignment scope:
1. Search Available Ride Offers
2. Request to Join a Ride Offer
3. Post a One-Off Ride Request and Accept Driver Offer

Base URL (local): `/api`
Format: JSON

## 2. Conventions
- Time format: ISO 8601 (example: `2026-03-17T08:30:00`)
- IDs: numeric (`Long`)
- Common statuses:
  - `OPEN`, `CLOSED`, `MATCHED`
  - `PENDING`, `ACCEPTED`, `REJECTED`
  - `CONFIRMED`, `COMPLETED`, `CANCELLED`

## 3. Use Case Mapping
- UC1 Search Available Ride Offers:
  - `GET /ride-offers`
  - `GET /ride-offers/{id}`
  - `POST /ride-offers` (driver self-service publish)
  - `GET /drivers/{driverId}/ride-offers` (driver own posted offers)
- UC2 Request to Join a Ride Offer:
  - `POST /join-requests`
  - `GET /riders/{riderId}/join-requests`
  - `GET /drivers/{driverId}/join-requests/pending`
  - `PATCH /drivers/{driverId}/join-requests/{joinRequestId}/decision`
- UC3 Post One-Off Request and Accept Driver Offer:
  - `POST /ride-requests`
  - `GET /ride-requests/open`
  - `GET /riders/{riderId}/ride-requests/{rideRequestId}/offers`
  - `POST /ride-requests/{rideRequestId}/offers`
  - `PATCH /riders/{riderId}/ride-requests/{rideRequestId}/offers/{offerId}/accept`
  - `PATCH /riders/{riderId}/ride-requests/{rideRequestId}/cancel`
  - `GET /drivers/{driverId}/ride-request-offers` (driver one-off offer history)
  - `GET /riders/{riderId}/ride-requests` (rider one-off request history)
- Account/Profile/Trips:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/social-login`
  - `GET /profiles/{userId}`
  - `PATCH /profiles/{userId}`
  - `GET /riders/{riderId}/trips`
  - `GET /drivers/{driverId}/trips`
  - `GET /users/{userId}/notifications`
  - `PATCH /users/{userId}/notifications/{notificationId}/read`
  - `PATCH /users/{userId}/notifications/read-all`
- Internal Admin Console (fixed account, no registration):
  - `GET /admin/overview`
  - `GET /admin/users`
  - `PATCH /admin/users/{userId}`
  - `GET /admin/ride-offers`
  - `GET /admin/ride-requests`
  - `GET /admin/join-requests`
  - `GET /admin/ride-matches`

## 4. Endpoints

### 4.1 Search Ride Offers
#### GET `/ride-offers`
Query params:
- `origin` (required suburb name, exact match)
- `destination` (required suburb name, exact match)
- `departureDate` (required, `yyyy-MM-dd`)
- `departureTime` (optional, `HH:mm`)
- `timeFlexHours` (optional int, `0..6`, only used when `departureTime` is provided)
- `passengerCount` (optional, int, min 1)

Response `200`:
```json
[
  {
    "offerId": 101,
    "origin": "Clayton",
    "destination": "City Centre",
    "departureDate": "2026-03-18",
    "departureTime": "08:30",
    "availableSeats": 2,
    "driver": {
      "driverId": 12,
      "driverName": "Emma Lee",
      "averageRating": 4.7,
      "ratingCount": 18
    }
  }
]
```

Validation rules:
- return only `OPEN` offers
- if `passengers` provided, only offers with `availableSeats >= passengers`
- `origin` / `destination` are matched as exact suburb values (case-insensitive, normalized spacing)
- `departureDate` must be the same day as offer date
- when `departureTime` is provided, match allows `|offerTime - departureTime| <= timeFlexHours` where `timeFlexHours` max is 6

#### GET `/ride-offers/{id}`
Response `200`:
```json
{
  "offerId": 101,
  "origin": "Clayton",
  "destination": "City Centre",
  "departureDate": "2026-03-18",
  "departureTime": "08:30",
  "availableSeats": 2,
  "status": "OPEN",
  "driver": {
    "driverId": 12,
    "driverName": "Emma Lee",
    "averageRating": 4.7,
    "ratingCount": 18,
    "bio": "Daily commuter",
    "travelPreferences": "No smoking",
    "trustNotes": "Verified licence"
  }
}
```
Response `404`: offer not found

#### POST `/ride-offers`
Purpose: driver self-service publish a ride offer (not admin).

Request body:
```json
{
  "driverId": 12,
  "origin": "Clayton",
  "originAddress": "Clayton Station",
  "originSuburb": "Clayton",
  "originLatitude": -37.9241,
  "originLongitude": 145.1207,
  "destination": "Melbourne",
  "destinationAddress": "Melbourne CBD",
  "destinationSuburb": "Melbourne",
  "destinationLatitude": -37.8136,
  "destinationLongitude": 144.9631,
  "departureDate": "2026-04-12",
  "departureTime": "07:45",
  "availableSeats": 2
}
```

Response `201`:
```json
{
  "offerId": 1201,
  "status": "OPEN"
}
```

Rules:
- driver must be `ACTIVE`
- driver licence must be `VERIFIED`
- `availableSeats` must not exceed driver `spareSeatCapacity`

#### GET `/drivers/{driverId}/ride-offers`
Purpose: list a driver's own posted ride offers.

### 4.2 Join Request Flow
#### POST `/join-requests`
Request body:
```json
{
  "rideOfferId": 101,
  "riderId": 34,
  "requestedSeats": 1
}
```

Response `201`:
```json
{
  "joinRequestId": 9001,
  "rideOfferId": 101,
  "riderId": 34,
  "requestedSeats": 1,
  "status": "PENDING",
  "createdAt": "2026-03-17T19:45:00"
}
```

Validation rules:
- offer must exist and be `OPEN`
- `requestedSeats >= 1`
- `requestedSeats <= availableSeats` at creation time

Common errors:
- `400` invalid payload
- `409` seat availability conflict or offer closed
- `404` ride offer/rider not found

#### GET `/drivers/{driverId}/join-requests/pending`
Response `200`:
```json
[
  {
    "joinRequestId": 9001,
    "rideOfferId": 101,
    "riderId": 34,
    "riderName": "Daniel Chen",
    "requestedSeats": 1,
    "status": "PENDING",
    "createdAt": "2026-03-17T19:45:00"
  }
]
```

#### GET `/riders/{riderId}/join-requests`
Purpose: rider history for join requests (pending/rejected/accepted) in My Trips.

Response `200`:
```json
[
  {
    "joinRequestId": 9001,
    "rideOfferId": 101,
    "driverId": 12,
    "driverName": "Emma Lee",
    "origin": "Clayton",
    "destination": "City Centre",
    "departureDate": "2026-03-18",
    "departureTime": "08:30",
    "requestedSeats": 1,
    "status": "PENDING",
    "requestDateTime": "2026-03-17T19:45:00",
    "rideMatchId": null,
    "rideMatchStatus": null,
    "meetingPoint": null
  }
]
```

#### PATCH `/drivers/{driverId}/join-requests/{joinRequestId}/decision`
Request body:
```json
{
  "decision": "ACCEPTED",
  "meetingPoint": "Clayton Station Gate 2"
}
```

Response `200`:
```json
{
  "joinRequestId": 9001,
  "status": "ACCEPTED",
  "rideMatchId": 7001,
  "updatedAvailableSeats": 1
}
```

Decision options:
- `ACCEPTED`
- `REJECTED`

Business rules:
- only `PENDING` request can be decided
- on `ACCEPTED`:
  - `meetingPoint` is required
  - create `ride_matches` row (`CONFIRMED`)
  - decrement `ride_offers.available_seats`
  - close offer if seats become 0
- on `REJECTED`:
  - status becomes `REJECTED`

Common errors:
- `404` join request not found
- `409` already decided / stale seat availability

### 4.3 One-Off Ride Request Flow
#### POST `/ride-requests`
Request body:
```json
{
  "riderId": 34,
  "origin": "Box Hill",
  "destination": "Community Hall",
  "tripDate": "2026-03-20",
  "tripTime": "10:00",
  "passengerCount": 2,
  "notes": "Weekend event"
}
```
Response `201`:
```json
{
  "rideRequestId": 5001,
  "status": "OPEN"
}
```

#### GET `/ride-requests/open`
Purpose: list rider one-off requests for drivers

Response `200`:
```json
[
  {
    "rideRequestId": 5001,
    "riderId": 34,
    "riderName": "Maria Gomez",
    "origin": "Box Hill",
    "destination": "Community Hall",
    "tripDate": "2026-03-20",
    "tripTime": "10:00",
    "passengerCount": 2,
    "notes": "Weekend event"
  }
]
```
Note: legacy frontend builds may still read `requestId`; backend currently provides a compatibility alias.

#### POST `/ride-requests/{rideRequestId}/offers`
Purpose: driver responds to one-off request with an offer proposal

Request body:
```json
{
  "driverId": 12,
  "proposedSeats": 2,
  "meetingPoint": "Box Hill Library"
}
```

Response `201`:
```json
{
  "offerId": 8100,
  "rideRequestId": 5001,
  "driverId": 12,
  "proposedSeats": 2,
  "meetingPoint": "Box Hill Library",
  "status": "PENDING"
}
```

Validation rules:
- `meetingPoint` is required

#### GET `/riders/{riderId}/ride-requests/{rideRequestId}/offers`
Purpose: rider reviews all received offers for one specific one-off request

Response `200`:
```json
[
  {
    "offerId": 8100,
    "driverId": 12,
    "driverName": "Emma Lee",
    "proposedSeats": 2,
    "meetingPoint": "Box Hill Library",
    "status": "PENDING",
    "createdAt": "2026-03-18T08:40:00"
  }
]
```

#### PATCH `/riders/{riderId}/ride-requests/{rideRequestId}/offers/{offerId}/accept`

Response `200`:
```json
{
  "rideRequestId": 5001,
  "acceptedOfferId": 8100,
  "rideMatchId": 7100,
  "rideRequestStatus": "MATCHED"
}
```

Rules:
- one-off request should end with at most one active confirmed match
- when rider accepts one proposal:
  - selected match -> `CONFIRMED`
  - `ride_requests.status` -> `MATCHED`
  - other pending proposals for same request -> `REJECTED`

#### PATCH `/riders/{riderId}/ride-requests/{rideRequestId}/cancel`
Purpose: rider cancels an unmatched one-off request.

Response `200`:
```json
{
  "rideRequestId": 5001,
  "status": "CLOSED"
}
```

Rules:
- only request owner can cancel
- only `OPEN` request can be newly cancelled
- `MATCHED` request cancellation returns `409`
- when cancelled:
  - `ride_requests.status` -> `CLOSED`
  - related `PENDING` driver offers -> `REJECTED`

#### GET `/drivers/{driverId}/ride-request-offers`
Purpose: driver history for one-off request responses.

Response `200`:
```json
[
  {
    "offerId": 8100,
    "requestId": 5001,
    "riderId": 34,
    "riderName": "Maria Gomez",
    "origin": "Box Hill",
    "destination": "Community Hall",
    "tripDate": "2026-03-20",
    "tripTime": "10:00",
    "passengerCount": 2,
    "proposedSeats": 2,
    "meetingPoint": "Box Hill Library",
    "status": "PENDING",
    "createdAt": "2026-03-18T08:40:00"
  }
]
```

#### GET `/riders/{riderId}/ride-requests`
Purpose: rider one-off request history (open + matched).

Response `200`:
```json
[
  {
    "requestId": 5001,
    "origin": "Box Hill",
    "destination": "Community Hall",
    "tripDate": "2026-03-20",
    "tripTime": "10:00",
    "passengerCount": 2,
    "notes": "Weekend event",
    "status": "MATCHED",
    "totalOffers": 2,
    "pendingOffers": 0
  }
]
```

### 4.4 Account, Profile, and Trips
#### POST `/auth/login`
Request body:
```json
{
  "email": "maria.rider@example.com",
  "password": "demo1234"
}
```

Response `200`:
```json
{
  "userId": 4,
  "fullName": "Maria Gomez",
  "email": "maria.rider@example.com",
  "role": "RIDER",
  "adminSessionKey": null
}
```

Admin fixed-account login uses the same endpoint and returns:
```json
{
  "userId": -1,
  "fullName": "NeighbourLink Admin",
  "email": "admin@neighbourlink.local",
  "role": "ADMIN",
  "adminSessionKey": "NEIGHBOURLINK-ADMIN-SESSION-2026"
}
```

Notes:
- Admin account is fixed in backend config.
- Registration endpoint does not support creating admin users.
- Admin APIs require header `X-Admin-Session`.

#### POST `/auth/register`
Request body:
```json
{
  "fullName": "Alex Green",
  "email": "alex@example.com",
  "password": "demo1234",
  "role": "RIDER",
  "phone": "0400000010",
  "suburb": "Clayton"
}
```

Response `201`: same shape as login response.

#### POST `/auth/social-login`
Purpose: demo placeholder for Google/Apple login.

Request body:
```json
{
  "provider": "GOOGLE",
  "role": "RIDER"
}
```

Response `200`: same shape as login response.

#### GET `/profiles/{userId}`
Response `200`:
```json
{
  "userId": 4,
  "fullName": "Maria Gomez",
  "email": "maria.rider@example.com",
  "phone": "0400000004",
  "suburb": "Box Hill",
  "bio": "Event volunteer",
  "travelPreferences": "Needs occasional one-off rides",
  "trustNotes": "Looks for profile and rating before acceptance",
  "averageRating": null,
  "ratingCount": 0
}
```

#### PATCH `/profiles/{userId}`
Request body:
```json
{
  "fullName": "Maria Gomez",
  "phone": "0400000011",
  "suburb": "Clayton",
  "bio": "Updated bio",
  "travelPreferences": "Quiet trips preferred",
  "trustNotes": "Community volunteer"
}
```

Response `200`: same shape as GET profile response.

#### GET `/riders/{riderId}/trips` and GET `/drivers/{driverId}/trips`
Response `200`:
```json
[
  {
    "rideMatchId": 401,
    "tripType": "JOIN_REQUEST",
    "driverId": 1,
    "driverName": "Emma Lee",
    "riderId": 3,
    "riderName": "Daniel Chen",
    "origin": "Clayton",
    "destination": "City Centre",
    "tripDate": "2026-03-18",
    "tripTime": "08:30",
    "meetingPoint": "Clayton Station Gate 2",
    "tripStatus": "CONFIRMED",
    "confirmedDateTime": "2026-03-16T08:30:00"
  }
]
```

#### GET `/users/{userId}/notifications`
Query params:
- `unreadOnly` (`true|false`, default `false`)

Response `200`:
```json
[
  {
    "notificationId": 9001,
    "type": "RIDE_MATCH_CONFIRMED",
    "title": "Ride match confirmed",
    "message": "Your join request was accepted.",
    "relatedRideMatchId": 7100,
    "read": false,
    "createdAt": "2026-04-19T20:10:00"
  }
]
```

#### PATCH `/users/{userId}/notifications/{notificationId}/read`
Purpose: mark one notification as read.

#### PATCH `/users/{userId}/notifications/read-all`
Purpose: mark all notifications for the user as read.

Response `200`:
```json
{
  "updatedCount": 4
}
```

### 4.6 Internal Admin APIs (Fixed Account)
All endpoints below require request header:
- `X-Admin-Session: <adminSessionKey>`

#### GET `/admin/overview`
Response `200`:
```json
{
  "totalUsers": 6,
  "totalRiders": 3,
  "totalDrivers": 3,
  "activeUsers": 6,
  "suspendedUsers": 0,
  "totalRideOffers": 4,
  "openRideOffers": 3,
  "totalRideRequests": 3,
  "openRideRequests": 2,
  "totalJoinRequests": 2,
  "pendingJoinRequests": 1,
  "totalRideMatches": 2,
  "totalRatings": 3
}
```

#### GET `/admin/users`
Purpose: list all rider/driver profiles and account metadata for admin control panel.

#### PATCH `/admin/users/{userId}`
Purpose: update account/profile fields for any user role.

Request body example:
```json
{
  "fullName": "Emma Lee",
  "phone": "0400000001",
  "suburb": "Clayton",
  "accountStatus": "ACTIVE",
  "bio": "Daily commuter",
  "travelPreferences": "No smoking",
  "trustNotes": "Verified licence",
  "driverLicenceVerifiedStatus": "VERIFIED",
  "driverVehicleInfo": "Toyota Corolla",
  "driverSpareSeatCapacity": 3
}
```

Validation:
- `accountStatus`: `ACTIVE | INACTIVE | SUSPENDED`
- `driverLicenceVerifiedStatus`: `PENDING | VERIFIED | REJECTED` (driver only)

#### GET `/admin/ride-offers`
Purpose: list all ride offers across all drivers.

#### GET `/admin/ride-requests`
Purpose: list all one-off ride requests across all riders.

#### GET `/admin/join-requests`
Purpose: list all join requests with rider + offer references.

#### GET `/admin/ride-matches`
Purpose: list all confirmed matches from both join-request and one-off flows.

### 4.5 Location and Map APIs (V2)
These endpoints support Australia address lookup, map pin reverse lookup, and route overview.

#### GET `/locations/au/search`
Query params:
- `q` (optional, suburb/postcode/address text)
- `limit` (optional, default 8, max 20)

Response `200`:
```json
[
  {
    "source": "LOCAL_AU_TABLE",
    "displayName": "Box Hill Library, VIC, Box Hill, VIC, 3128",
    "address": "Box Hill Library, VIC",
    "state": "VIC",
    "suburb": "Box Hill",
    "postcode": "3128",
    "latitude": -37.8183,
    "longitude": 145.1256
  }
]
```

#### GET `/locations/au/reverse`
Query params:
- `lat` (required)
- `lng` (required)

Response `200`:
```json
{
  "source": "OPENSTREETMAP_NOMINATIM",
  "displayName": "999 Whitehorse Road, Box Hill, Victoria, 3128",
  "address": "999 Whitehorse Road",
  "state": "Victoria",
  "suburb": "Box Hill",
  "postcode": "3128",
  "latitude": -37.8179646,
  "longitude": 145.1256642
}
```

#### GET `/routes/overview`
Query params:
- `fromLat` (required)
- `fromLng` (required)
- `toLat` (required)
- `toLng` (required)

Response `200`:
```json
{
  "distanceMeters": 20233.2,
  "durationSeconds": 1332.8,
  "path": [
    { "latitude": -37.818152, "longitude": 145.12563 },
    { "latitude": -37.813638, "longitude": 144.96297 }
  ]
}
```

## 5. Generic Error Response
Example:
```json
{
  "timestamp": "2026-03-17T19:46:00",
  "status": 409,
  "error": "Conflict",
  "message": "Requested seats exceed available seats",
  "path": "/api/join-requests"
}
```

## 6. Data Integrity Notes
- `join_requests.requested_seats` must be positive.
- Seat update and match creation must be transactional.
- `ride_matches` must reference either:
  - a join-request flow (`ride_offer_id`), or
  - a one-off flow (`ride_request_id`).

## 7. Non-Goals Reminder
This API intentionally excludes:
- authentication/authorization complexity
- payments
- chat/messaging
- maps/navigation
- route optimization
