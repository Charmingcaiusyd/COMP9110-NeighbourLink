# Screenshot Index

This folder contains the current screenshot pack for the final `Static-Site` prototype, including the simple JS-switched rider step flow.

## Coverage list

1. `01_Login_Page_Prototype_Entry.png` - role-aware login entry with Rider and Driver demo accounts
2. `02_Register_Page_Prototype_Entry.png` - dedicated registration page with role-based routing
3. `03_Find_A_Ride_Origin_Section.png` - rider origin section
4. `04_Find_A_Ride_Destination_Section.png` - rider destination section
5. `05_Find_A_Ride_Trip_Date_Section.png` - rider trip-date section
6. `06_Search_Results_Matching_Ride_Offers.png` - existing-offer search results
7. `07_Ride_Offer_Details_Review_Page.png` - rider offer review page
8. `08_Join_Request_Submitted_Confirmation.png` - pending join-request confirmation inside My Trips
9. `09_Search_Results_Matching_Failed.png` - direct no-match state when no suitable offer is available
10. `10_My_Trips_All_Outcomes.png` - rider all-outcomes view
11. `11_My_Trips_Join_Requests_Filter.png` - active join-request filter state within My Trips
12. `12_My_Trips_Confirmed_Trips_Filter.png` - active confirmed-trip filter state within My Trips
13. `13_Driver_Review_Overview.png` - driver review main page with join requests plus accepted and rejected records
14. `14_Driver_Accepted_Details.png` - accepted record detail page
15. `15_Driver_Rejected_Details.png` - rejected record detail page
16. `16_Driver_Decision_Accepted_Outcome.png` - accept-result page with countdown back to Driver Review
17. `17_Driver_Decision_Rejected_Outcome.png` - reject-result page with countdown back to Driver Review
18. `Figure_4_Find_A_Ride_and_Search_Results.png` - report-ready composite for rider trip entry and matching offers
19. `Figure_5_Ride_Offer_Details_and_Join_Request.png` - report-ready composite for offer review and join-request submission
20. `Figure_6_My_Trips_and_Driver_Review_Outcomes.png` - report-ready two-image composite for My Trips outcomes and Driver Review outcomes

## Regeneration

The pack is regenerated with:

- `node Static-Site/tools/capture-static-site-screenshots.js`

For anchored states, the script creates temporary focused capture pages so each screenshot lands on the intended section instead of reusing the same top-of-page viewport.

Each screenshot now waits 1 second before capture so the page layout settles consistently.
