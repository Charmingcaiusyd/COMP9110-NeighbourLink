# NeighbourLink

NeighbourLink is a local-only university assignment project for community ride matching.

Current implementation status:
- Backend: Spring Boot REST API (Java 17 + SQLite)
- Frontend: Native HTML/CSS/JavaScript single-page app (Vite)
- Map/location UX: Leaflet + OpenStreetMap tile map, AU location search/reverse lookup
- Core business flow: ride matching and confirmation with trust-first review

## Implemented Use Cases
1. Search available ride offers (`UC1`)
2. Request to join a ride offer and driver decision (`UC2`)
3. Post one-off ride request, receive driver offers, accept one offer (`UC3`)

Additional implemented system features:
- Fixed admin login and admin control panel (`/admin`)
- Rider/driver trip history and notifications (`/my-trips`)
- Profile management (`/profile`)
- Driver document upload + admin review

## Tech Stack
- Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA, Bean Validation
- Frontend: Vite + native JS/CSS/HTML (no React runtime)
- Database: SQLite
- Map: Leaflet + OpenStreetMap + AU geocoding/reverse geocoding endpoints

## Repository Structure
```text
.
|-- AGENTS.md
|-- README.md
|-- start-neighbourlink.cmd
|-- start-neighbourlink.ps1
|-- docs/
|   `-- api-spec.md
|-- backend/
|   |-- pom.xml
|   |-- data/
|   |   |-- neighbourlink.db
|   |   `-- driver-documents/
|   `-- src/
|       |-- main/java/com/neighbourlink/
|       |   |-- config/
|       |   |-- controller/
|       |   |-- dto/
|       |   |-- entity/
|       |   |-- exception/
|       |   |-- repository/
|       |   `-- service/
|       |-- main/resources/
|       |   |-- application.yml
|       |   |-- schema.sql
|       |   `-- data.sql
|       `-- test/
`-- frontend/
    |-- package.json
    |-- index.html
    `-- src/
        |-- main.js
        |-- App.css
        |-- index.css
        `-- api/rideOffersApi.js
```

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+

## Quick Start (Recommended)
From project root:
```powershell
.\start-neighbourlink.cmd
```

This script will:
- verify `java`, `mvn`, `node`, `npm`
- install frontend dependencies if needed
- start backend and frontend
- wait until both services are ready

Runtime artifacts:
- logs: `.run/logs/`
- PID files: `.run/backend.pid`, `.run/frontend.pid`

## Manual Start
### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Health: `http://localhost:8080/api/health`

## Demo Accounts
- Rider: `maria.rider@example.com` / `demo1234`
- Driver: `emma.driver@example.com` / `demo1234`
- Admin (fixed only): `admin@neighbourlink.local` / `admin12345`

Admin account is configured in `backend/src/main/resources/application.yml` and is not registerable.

## Frontend Routes
Public/auth:
- `/intro`
- `/tutorial`
- `/login`
- `/register`
- `/admin/login`

Main app:
- `/`
- `/search-results`
- `/ride-offer-details/:offerId`
- `/post-ride-request`
- `/ride-requests/:rideRequestId/offers`
- `/ride-confirmed`
- `/my-trips`
- `/profile`
- `/driver-hub`
- `/admin`

## Key Backend API Areas
Controllers currently include:
- `AuthController`
- `RideOfferQueryController`
- `RideOfferManagementController`
- `JoinRequestController`
- `OneOffRideRequestController`
- `TripController`
- `ProfileController`
- `RatingController`
- `NotificationController`
- `LocationController`
- `RouteController`
- `DriverDocumentController`
- `AdminController`
- `HealthController`

Full endpoint details: `docs/api-spec.md`

## Database and Storage
Primary config (`backend/src/main/resources/application.yml`):
- SQLite URL: `jdbc:sqlite:./data/neighbourlink.db`
- JPA schema mode: `ddl-auto: update`
- SQL init mode: `always`
- Driver document directory: `./data/driver-documents`

Reset local DB:
1. Stop backend
2. Delete `backend/data/neighbourlink.db`
3. Start backend again

## Map and Location Features
Implemented and used by Find/Post flows:
- AU location search: `GET /api/locations/au/search?q=...&limit=...`
- AU reverse geocode: `GET /api/locations/au/reverse?lat=...&lng=...`
- Route overview: `GET /api/routes/overview?fromLat=...&fromLng=...&toLat=...&toLng=...`

## Build and Test
Backend tests:
```bash
cd backend
mvn test
```

Frontend build:
```bash
cd frontend
npm run build
```
