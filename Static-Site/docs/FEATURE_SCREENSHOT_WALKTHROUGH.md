# Feature Screenshot Walkthrough

This walkthrough explains the current screenshot pack for the final reduced-budget `Static-Site` prototype.

## 1. Login / Entry

![Login](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/01_Login_Page_Prototype_Entry.png)

The prototype opens at a lightweight login page that immediately separates rider and driver walkthroughs.
The page now uses a single sign-in form, so a Rider demo account goes to `Find a Ride` and a Driver demo account goes to `Driver Review` through the same entry surface.

## 2. Registration Layout

![Register](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/02_Register_Page_Prototype_Entry.png)

Registration now sits on its own entry page, which makes the login and onboarding paths easier to distinguish during the walkthrough.
The selected role on this one-form registration page controls whether the walkthrough continues as a Rider or Driver.

## 3. Rider Flow Steps

![Origin](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/03_Find_A_Ride_Origin_Section.png)

![Destination](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/04_Find_A_Ride_Destination_Section.png)

![Trip Date](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/05_Find_A_Ride_Trip_Date_Section.png)

The rider journey is now expressed through three simple step-switched panels inside one page: origin, destination, and trip date.
Each panel also shows a searchable OpenStreetMap preview so the rider can understand the pickup, destination, and overall route context more easily.

## 4. Search Results

![Search Results](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/06_Search_Results_Matching_Ride_Offers.png)

The results page foregrounds existing ride offers and keeps the rider on the main matching path.

## 5. Matching Failed State

![Matching Failed](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/09_Search_Results_Matching_Failed.png)

When no suitable existing offer is available, the static prototype now shows a direct matching-failed state instead of opening a second fallback workflow.

## 6. Ride Offer Review

![Offer Details](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/07_Ride_Offer_Details_Review_Page.png)

The rider reviews route fit, available seats, and pickup context before submitting a join request.

## 7. Join Request Outcome

![Join Request Submitted](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/08_Join_Request_Submitted_Confirmation.png)

This confirmation state makes the pending hand-off to the driver explicit and redirects attention to the rest of `My Trips`.

## 8. Rider Outcome Views

![My Trips All](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/10_My_Trips_All_Outcomes.png)

![Join Requests Filter](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/11_My_Trips_Join_Requests_Filter.png)

![Confirmed Filter](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/12_My_Trips_Confirmed_Trips_Filter.png)

These pages show how rider-facing information is now split more clearly between notifications and trip records without introducing unnecessary extra workflows.
The three screenshots are anchored views inside the same `My Trips` page, and the filter chips perform lightweight front-end switching so each trip-record group can be demonstrated more clearly.

## 9. Driver Review Overview

![Driver Review](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/13_Driver_Review_Overview.png)

The driver main page is now much lighter: it shows pending requests for action plus separate accepted and rejected record lists.
This keeps the prototype readable without turning the driver side into a full operational dashboard.

## 10. Driver Record Details

![Accepted Details](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/14_Driver_Accepted_Details.png)

![Rejected Details](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/15_Driver_Rejected_Details.png)

Accepted and rejected records each have their own detail page, which makes the driver side easier to explain and keeps the accepted/rejected history distinct.

## 11. Driver Decision Outcomes

![Decision Accepted](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/16_Driver_Decision_Accepted_Outcome.png)

![Decision Rejected](/C:/Users/gs658/OneDrive/文档/NeighbourLink/Static-Site/Pic/17_Driver_Decision_Rejected_Outcome.png)

When the driver clicks `Accept Request` or `Reject Request`, the prototype now opens a dedicated result page with the full request summary and a five-second automatic return to `Driver Review`.
