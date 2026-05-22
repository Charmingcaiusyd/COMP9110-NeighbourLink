# Static-Site Feature Screenshot Walkthrough

This document turns the `Static-Site/Pic` screenshot set into a presentation-ready walkthrough.

It is designed for:
- feature demonstration
- assessor walkthroughs
- quick navigation of the static front-end prototype
- evidence that the static site covers the same user-visible journeys as the current runtime direction

The current screenshot pack was re-generated on 2026-05-22 after the image folder was rebuilt, so the guide once again matches the live Rider and Driver static demo states.

## How to use this guide

1. Read from top to bottom if you want a full demo sequence.
2. Jump to the Rider or Driver sections if you only need one part.
3. Use the screenshot title, route, and explanation together when presenting.
4. Pair this guide with `Static-Site/README.md` for overall feature scope and route coverage.

## Coverage summary

The screenshot set covers:
- public entry pages
- rider onboarding
- driver onboarding with document fields
- rider unified search and request flow
- live destination search state in the browser-only OpenStreetMap integration
- trust review before join request submission
- rider trip history and notification visibility
- rider confirmed-trip filtering and payment-entry visibility
- automatic fallback from search to one-off request
- driver offer review and acceptance flow
- driver rejection flow and filtered activity view
- payment demo
- account settings, password reset, and saved payment methods
- driver operational hub

## Public Entry And Onboarding

### 01. Login Page - Static Sign In
Route: `#/login`
Role focus: Public
Purpose: Shows the browser-only entry page with fixed demo credentials.

![01 Login Page](../Pic/01_Login_Page_Static_SignIn.png)

### 02. Register Page - Rider Onboarding
Route: `#/register`
Role focus: Public / Rider
Purpose: Shows the default registration state for a rider account in the static demo.

![02 Register Rider](../Pic/02_Register_Page_Rider_Onboarding.png)

### 03. Register Page - Driver Document Upload
Route: `#/register`
Role focus: Public / Driver
Purpose: Shows the driver onboarding path with licence, spare-seat proof, and rego upload inputs.

![03 Register Driver](../Pic/03_Register_Page_Driver_Document_Upload.png)

### 04. Tutorial Page - Rider Guided Mode
Route: `#/tutorial`
Role focus: Public / Rider
Purpose: Demonstrates the hidden tutorial route in rider guided mode.

![04 Tutorial Rider](../Pic/04_Tutorial_Page_Rider_Guided_Mode.png)

### 05. Tutorial Page - Driver Quiz Mode
Route: `#/tutorial`
Role focus: Public / Driver
Purpose: Demonstrates that the tutorial also contains driver-specific training content and quiz interaction.

![05 Tutorial Driver](../Pic/05_Tutorial_Page_Driver_Quiz_Mode.png)

## Rider Core Flow

### 06. Find a Ride - Origin Step
Route: `#/`
Role focus: Rider
Purpose: Shows the first step of the merged rider flow where pickup intent is set.

![06 Find Origin](../Pic/06_Find_A_Ride_Origin_Step.png)

### 07. Find a Ride - Destination Step
Route: `#/`
Role focus: Rider
Purpose: Shows the second step with destination input, suggestion chips, live map selection, and destination metadata.

![07 Find Destination](../Pic/07_Find_A_Ride_Destination_Step.png)

### 28. Find a Ride - Destination Live Search State
Route: `#/`
Role focus: Rider
Purpose: Shows the same destination step after the user triggers a live OpenStreetMap address search from the static site.

![28 Destination Live Search](../Pic/28_Find_A_Ride_Destination_Live_Search_State.png)

### 08. Find a Ride - Trip Date Step
Route: `#/`
Role focus: Rider
Purpose: Shows the timing, flexibility, passenger count, and note controls that determine whether the flow searches or auto-creates a request.

![08 Find Trip Date](../Pic/08_Find_A_Ride_Trip_Date_Step.png)

### 09. Search Results - Matching Ride Offers
Route: `#/search-results?...`
Role focus: Rider
Purpose: Shows the successful offer-search path for a same-day within-three-hours trip.

![09 Search Results](../Pic/09_Search_Results_Matching_Ride_Offers.png)

### 10. Ride Offer Details - Trust And Seats
Route: `#/ride-offer-details/:id`
Role focus: Rider
Purpose: Shows trust information, verification status, vehicle information, seat capacity, and the explicit join-request action.

![10 Ride Offer Details](../Pic/10_Ride_Offer_Details_Trust_And_Seats.png)

### 11. Ride Confirmed - Join Request Submitted
Route: `#/ride-confirmed`
Role focus: Rider
Purpose: Shows the transient confirmation state after a rider submits a join request but before any driver acceptance occurs.

![11 Join Request Submitted](../Pic/11_Join_Request_Submitted_Confirmation.png)

### 12. My Trips - Unified Orders Overview
Route: `#/my-trips`
Role focus: Rider
Purpose: Shows the unified rider order stream where join requests, one-off requests, and later outcomes are visible in one place.

![12 My Trips Overview](../Pic/12_My_Trips_Unified_Orders_Overview.png)

### 13. My Trips - Notifications Section
Route: `#/my-trips`
Role focus: Rider
Purpose: Highlights the separate notification surface inside My Trips.

![13 Notifications](../Pic/13_My_Trips_Notifications_Section.png)

### 14. My Trips - Filtered Join Request View
Route: `#/my-trips`
Role focus: Rider
Purpose: Shows that My Trips can be narrowed to the join-request path only.

![14 Join Filter](../Pic/14_My_Trips_Filtered_Join_Request_View.png)

### 29. My Trips - Confirmed Filter With Payment CTA
Route: `#/my-trips`
Role focus: Rider
Purpose: Shows the confirmed join-path slice where matched records keep their payment-entry action visible from the unified order stream.

![29 Confirmed Filter](../Pic/29_My_Trips_Confirmed_Filter_With_Payment_CTA.png)

### 15. Search Results - Auto Request Fallback
Route: `#/search-results?...`
Role focus: Rider
Purpose: Shows the automatic fallback message when the trip is outside the immediate ride-match window and is converted into a one-off request.

![15 Auto Request Fallback](../Pic/15_Search_Results_Auto_Request_Fallback_Message.png)

### 16. My Trips - Auto-Created One-Off Request
Route: `#/my-trips`
Role focus: Rider
Purpose: Shows the new one-off request record after the automatic fallback completes.

![16 Auto-Created Request](../Pic/16_My_Trips_Auto_Created_One_Off_Request.png)

### 17. Review Driver Offers - One-Off Request
Route: `#/ride-requests/:id/offers`
Role focus: Rider
Purpose: Shows the rider review surface for one-off ride request responses from drivers.

![17 Review Driver Offers](../Pic/17_Review_Driver_Offers_For_One_Off_Request.png)

### 18. Ride Confirmed - One-Off Ride Matched
Route: `#/ride-confirmed`
Role focus: Rider
Purpose: Shows the confirmation page after a rider accepts a driver offer for a one-off request and a ride match is created.

![18 One-Off Match](../Pic/18_One_Off_Ride_Matched_Confirmation.png)

### 19. Payment Demo - Checkout Page
Route: `#/payment?rideMatchId=:id`
Role focus: Rider
Purpose: Shows the payment template before the demo card submission is completed.

![19 Payment Checkout](../Pic/19_Payment_Demo_Checkout_Page.png)

### 20. Payment Demo - Success Message
Route: `#/payment?rideMatchId=:id`
Role focus: Rider
Purpose: Shows the success state after the local demo payment is submitted.

![20 Payment Success](../Pic/20_Payment_Demo_Success_Message.png)

### 21. Account Settings - Reset Password And Payments
Route: `#/account`
Role focus: Rider / Driver
Purpose: Shows the reduced account surface that only keeps reset password and payment method management.

![21 Account Settings](../Pic/21_Account_Settings_Reset_Password_And_Payments.png)

### 22. Account Settings - New Default Payment Method
Route: `#/account`
Role focus: Rider / Driver
Purpose: Shows the account state after saving a new default payment method.

![22 New Default Payment](../Pic/22_Account_Settings_New_Default_Payment_Method.png)

### 30. Account Settings - Password Reset Success
Route: `#/account`
Role focus: Rider / Driver
Purpose: Shows the same reduced account page after a successful password reset action.

![30 Password Reset Success](../Pic/30_Account_Settings_Password_Reset_Success.png)

## Driver Operational Flow

### 23. Driver Hub - Pending Join Requests
Route: `#/driver-hub`
Role focus: Driver
Purpose: Shows the operational starting point for driver decision-making on pending join requests.

![23 Driver Hub Pending](../Pic/23_Driver_Hub_Pending_Join_Requests.png)

### 24. Driver Hub - Open One-Off Request Response Form
Route: `#/driver-hub`
Role focus: Driver
Purpose: Shows the open rider-request response form where the driver proposes seats and meeting point.

![24 Driver One-Off Response](../Pic/24_Driver_Hub_Open_One_Off_Request_Response_Form.png)

### 25. Driver Hub - Join Request Accepted State
Route: `#/driver-hub`
Role focus: Driver
Purpose: Shows the driver hub after a join request has been accepted and the state has updated.

![25 Driver Join Accepted](../Pic/25_Driver_Hub_Join_Request_Accepted_State.png)

### 31. Driver Hub - Join Request Rejected State
Route: `#/driver-hub`
Role focus: Driver
Purpose: Shows the alternative explicit-decision path where a driver rejects a pending join request.

![31 Driver Join Rejected](../Pic/31_Driver_Hub_Join_Request_Rejected_State.png)

### 26. Driver Hub - One-Off Offer History
Route: `#/driver-hub`
Role focus: Driver
Purpose: Shows the one-off response history after the driver submits a response to a rider request.

![26 Driver Offer History](../Pic/26_Driver_Hub_One_Off_Offer_History.png)

### 27. My Trips - Driver Activity Stream
Route: `#/my-trips`
Role focus: Driver
Purpose: Shows the driver-side activity stream after decisions and one-off response actions have been recorded.

![27 Driver My Trips](../Pic/27_Driver_My_Trips_Activity_Stream.png)

### 32. My Trips - Driver One-Off Request Filter View
Route: `#/my-trips`
Role focus: Driver
Purpose: Shows the driver-side trip page narrowed to one-off request matches and related activity only.

![32 Driver One-Off Filter](../Pic/32_Driver_My_Trips_Filtered_One_Off_Request_View.png)

## Recommended presentation order

1. Start with 01 to 05 for public scope and tutorial support.
2. Use 06, 07, 28, 08 to 20, and 29 for the full rider story, including live map search and confirmed-payment entry states.
3. Use 21, 22, and 30 for account, password-reset, and payment-method coverage.
4. Use 23 to 27, then 31 and 32, for the driver-side operational proof and alternate states.

## Related files

- [Static-Site README](../README.md)
- [Screenshot Index](../Pic/README.md)
- [Screenshot Generator Script](../tools/capture-static-site-screenshots.js)
