# Screenshot Index

This folder contains the refreshed screenshot pack for the current `Static-Site` prototype.

## Coverage list

1. `01_Login_Page_Prototype_Entry.png` - login entry
2. `02_Register_Page_Prototype_Entry.png` - role-based registration entry
3. `03_Find_A_Ride_Origin_Section.png` - rider origin step
4. `04_Find_A_Ride_Destination_Section.png` - rider destination step
5. `05_Find_A_Ride_Trip_Date_Section.png` - rider trip-date step
6. `06_Search_Results_Matching_Ride_Offers.png` - matching offers result
7. `07_Search_Results_Matching_Failed.png` - direct no-match result
8. `08_Ride_Offer_Details_Review_Page.png` - rider offer details and request action
9. `09_Join_Request_Submitted_Confirmation.png` - join-request confirmation state
10. `10_My_Trips_All_Records.png` - My Trips unified record surface
11. `11_My_Trips_In_Progress_Filter.png` - My Trips in-progress filter state
12. `12_My_Trips_Completed_Filter.png` - My Trips completed filter state
13. `13_Rider_Record_501_Details.png` - Rider record #501 detail page
14. `14_Rider_Record_601_Details.png` - Rider record #601 detail page
15. `15_Rider_Settings_Password_And_Payment.png` - Rider settings (password + payment preference)
16. `16_Driver_Review_Overview.png` - Driver review overview
17. `17_Driver_Accepted_Details.png` - accepted detail page
18. `18_Driver_Rejected_Details.png` - rejected detail page
19. `19_Driver_Decision_Accepted_Outcome.png` - accept outcome page
20. `20_Driver_Decision_Rejected_Outcome.png` - reject outcome page
21. `21_Driver_Trip_Workflow_Ready.png` - workflow stage ready
22. `22_Driver_Trip_Workflow_Pickup_Departed.png` - workflow stage pickup_departed
23. `23_Driver_Trip_Workflow_Pickup_Arrived.png` - workflow stage pickup_arrived
24. `24_Driver_Trip_Workflow_Destination_Departed.png` - workflow stage destination_departed
25. `25_Driver_Trip_Workflow_Completed.png` - workflow completed state
26. `26_Driver_Settings_Password_And_Payment.png` - Driver settings (password + payment preference)
27. `Figure_4_Find_A_Ride_and_Search_Results.png` - report figure composite
28. `Figure_5_Ride_Offer_Details_and_Join_Request.png` - report figure composite
29. `Figure_6_My_Trips_and_Driver_Review_Outcomes.png` - report figure composite

## Regeneration

Run:

- `node Static-Site/tools/capture-static-site-screenshots.js`

The script waits 1 second before each screenshot, captures all PNGs, and rebuilds Figure 4/5/6 composites.
