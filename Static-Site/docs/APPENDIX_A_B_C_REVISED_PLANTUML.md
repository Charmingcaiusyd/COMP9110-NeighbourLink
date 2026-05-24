# Revised Appendix A / B / C PlantUML for the Current Static-Site

This appendix matches the final reduced-budget `Static-Site` prototype.

The current prototype keeps one clear confirmed-match path:

- rider finds existing ride offers
- rider reviews ride-offer details
- rider submits a join request
- driver accepts or rejects the join request
- the system shows visible trip outcomes

The fallback request path is still present, but only as a reduced rider-visible record when direct matching is unsuitable.

---

## Appendix A. Reduced-Budget Use Case Diagram and PlantUML Source

```plantuml
@startuml
title Figure 1. Stage 2 Use Case Diagram for Reduced-Budget NeighbourLink

left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome
skinparam linetype polyline

skinparam usecase {
  BackgroundColor White
  BorderColor #333333
  ArrowColor #333333
}

actor "Rider" as Rider
actor "Driver" as Driver

rectangle "NeighbourLink System\nReduced-Budget Core" {

  usecase "Sign In / Register" as UC_Auth
  usecase "Find a Ride" as UC_Find
  usecase "Review Ride Offer\nDetails" as UC_Review
  usecase "Submit Join\nRequest" as UC_Join
  usecase "Record Fallback\nRide Request" as UC_Fallback
  usecase "Respond to\nJoin Request" as UC_Decide
  usecase "View Trip Updates\nand Outcomes" as UC_Outcomes

  UC_Auth -[hidden]down- UC_Find
  UC_Find -[hidden]down- UC_Review
  UC_Review -[hidden]down- UC_Join
  UC_Join -[hidden]down- UC_Fallback
  UC_Review -[hidden]right- UC_Decide
  UC_Outcomes -[hidden]right- UC_Decide
}

Rider --> UC_Auth
Rider --> UC_Find
Rider --> UC_Outcomes

Driver --> UC_Auth
Driver --> UC_Decide
Driver --> UC_Outcomes

UC_Review ..> UC_Find : <<extend>>
UC_Join ..> UC_Review : <<extend>>
UC_Fallback ..> UC_Find : <<extend>>
UC_Join ..> UC_Outcomes : <<include>>
UC_Decide ..> UC_Outcomes : <<include>>
UC_Fallback ..> UC_Outcomes : <<include>>

@enduml
```

---

## Appendix B. Reduced-Budget Activity Diagram and PlantUML Source

```plantuml
@startuml
title Figure 2. Activity Diagram for Stage 2 Find-a-Ride Flow

skinparam shadowing false
skinparam activityStyle rounded

|Rider|
start
:Sign in;
:Enter essential trip criteria;

|NeighbourLink System|
:Evaluate trip timing and search mode;

if (Direct matching suitable?) then (Yes)
  :Search matching ride offers;

  if (Suitable offers found?) then (Yes)
    :Display ride offer cards with\ntrip details and seats;

    |Rider|
    :Select ride offer;

    |NeighbourLink System|
    :Display ride details and\navailable seats;

    |Rider|
    if (Submit join request?) then (Yes)
      :Submit join request;

      |NeighbourLink System|
      :Validate offer status and\navailable seats;

      if (Offer still available?) then (Yes)
        :Forward join request to driver;

        |Driver|
        :Respond to join request;

        if (Accept request?) then (Yes)
          |NeighbourLink System|
          :Create RideMatch;
          :Update available seats;
          :Show confirmed outcome;
        else (No)
          |NeighbourLink System|
          :Show rejected outcome;
        endif
      else (No)
        :Show unavailable outcome;
      endif
    else (No)
      :Return to available offers;
    endif
  else (No)
    :Record fallback ride request;
    :Show fallback outcome;
  endif
else (No)
  :Record fallback ride request;
  :Show fallback outcome;
endif

|Rider|
:Review trip updates and outcomes;
stop

@enduml
```

---

## Appendix C. Lean Domain Model and PlantUML Source

```plantuml
@startuml
title Figure 3. Lean Domain Model for NeighbourLink

skinparam classAttributeIconSize 0
skinparam shadowing false
hide empty methods

abstract class User {
  +userID
  +fullName
  +email
  +phone
  +suburb
  +accountStatus
}

class Rider
class Driver

class RideOffer {
  +offerID
  +origin
  +destination
  +departureDateTime
  +availableSeats
  +status
}

class RideRequest {
  +requestID
  +origin
  +destination
  +tripDateTime
  +passengerCount
  +status
  +createdAt
}

class JoinRequest {
  +joinRequestID
  +submittedAt
  +requestedSeats
  +status
}

class RideMatch {
  +matchID
  +confirmedAt
  +meetingPoint
  +status
}

class Notification {
  +notificationID
  +kind
  +title
  +message
  +createdAt
  +read
}

Rider --|> User
Driver --|> User

Driver "1" *-- "0..*" RideOffer : owns >
Rider "1" *-- "0..*" RideRequest : records >
Rider "1" *-- "0..*" JoinRequest : submits >
User  "1" *-- "0..*" Notification : receives >

RideOffer "1" o-- "0..*" JoinRequest : receives >
RideOffer "1" -- "0..*" RideMatch : fulfilled in >
JoinRequest "1" --> "0..1" RideMatch : accepted as >

RideRequest "1" -- "0..*" Notification : triggers >
JoinRequest "1" -- "0..*" Notification : updates >
RideMatch "1" -- "0..*" Notification : confirms >

RideMatch "*" --> "1" Rider : rider >
RideMatch "*" --> "1" Driver : driver >

@enduml
```
