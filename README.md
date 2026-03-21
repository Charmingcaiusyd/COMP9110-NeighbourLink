# NeighbourLink (Assignment Demo)

This repository contains an assignment-sized ride sharing demo with:
- Spring Boot backend APIs
- React + Vite frontend flows
- API documentation in `docs/api-spec.md`

Implemented scope:
1. Search available ride offers (UC1)
2. Rider requests to join a ride offer + driver decision (UC2)
3. Rider posts one-off request + driver responds + rider accepts one offer (UC3)
4. Account login/register (including demo social login placeholders)
5. Profile read/update
6. My Trips for rider/driver via `ride_matches` (with upcoming/history filter)
7. Rider can cancel unmatched one-off ride requests

## Structure
```text
.
|-- AGENTS.md
|-- README.md
|-- start-neighbourlink.ps1
|-- start-neighbourlink.cmd
|-- docs/
|   `-- api-spec.md
|-- backend/
|   |-- pom.xml
|   |-- data/
|   `-- src/main/
|       |-- java/com/neighbourlink/
|       |   |-- controller/
|       |   |-- service/
|       |   |-- repository/
|       |   |-- entity/
|       |   |-- dto/
|       |   |-- config/
|       |   `-- exception/
|       `-- resources/application.yml
`-- frontend/
    |-- package.json
    `-- src/
        |-- components/
        |-- pages/
        `-- router/
```

## One-Command Startup (Recommended)
This project includes a one-command startup script that:
- auto-locates the project root (works no matter your current terminal directory)
- checks required tools (`java`, `mvn`, `npm`)
- installs frontend dependencies on first run
- starts backend + frontend
- waits for both services to become ready

From project root:
```powershell
.\start-neighbourlink.cmd
```

From any directory:
```powershell
& "C:\Users\gs658\OneDrive\文档\NeighbourLink\start-neighbourlink.cmd"
```

Alternative (direct PowerShell script):
```powershell
& "C:\Users\gs658\OneDrive\文档\NeighbourLink\start-neighbourlink.ps1"
```

Logs and process IDs are stored in:
- `.run/logs/`
- `.run/backend.pid`
- `.run/frontend.pid`

## Run Backend
Requirements:
- Java 17
- Maven

Commands:
```bash
cd backend
mvn spring-boot:run
```

Health endpoint:
- `GET http://localhost:8080/api/health`

## Run Frontend
Requirements:
- Node.js + npm

Commands:
```bash
cd frontend
npm install
npm run dev
```

Dev URL (default):
- `http://localhost:5173`

## Database (SQLite) Configuration
Yes, the database is part of this project and runs locally with SQLite.

Main config file:
- `backend/src/main/resources/application.yml`

Current datasource configuration:
- URL: `jdbc:sqlite:./data/neighbourlink.db`
- Driver: `org.sqlite.JDBC`
- JPA schema mode: `ddl-auto: update`
- SQL init mode: `always`

Important notes:
- The SQLite DB file is stored in `backend/data/neighbourlink.db`.
- The schema is created/updated automatically by JPA on startup.
- Demo seed data is loaded from `backend/src/main/resources/data.sql`.
- Test runs use separate test resources under `backend/src/test/resources/`.

Reset local database quickly:
1. Stop backend service.
2. Delete `backend/data/neighbourlink.db`.
3. Start backend again (`mvn spring-boot:run` or one-command script).

## Current Frontend Routes
- `/login` -> Login
- `/register` -> Register
- `/` -> Find a Ride
- `/search-results` -> Search Results
- `/ride-offer-details/:offerId` -> Ride Offer Details
- `/post-ride-request` -> Post Ride Request
- `/ride-requests/:rideRequestId/offers` -> Rider reviews one-off offers
- `/ride-confirmed` -> Ride Confirmed
- `/driver-hub` -> Driver dashboard (join requests + one-off responses)
- `/my-trips` -> My Trips
- `/profile` -> Profile

## Demo Accounts
- Rider: `maria.rider@example.com` / `demo1234`
- Driver: `emma.driver@example.com` / `demo1234`

Notes:
- Passwords are stored with bcrypt for new registrations.
- Existing demo plaintext credentials are auto-upgraded to bcrypt on successful login.

## Backend Tests
Run minimal UC2/UC3 integration tests:
```bash
cd backend
mvn test
```

