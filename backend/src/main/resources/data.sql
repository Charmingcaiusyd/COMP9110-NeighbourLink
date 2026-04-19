DELETE FROM ratings;
DELETE FROM notifications;
DELETE FROM au_location_reference;
DELETE FROM ride_matches;
DELETE FROM ride_request_offers;
DELETE FROM join_requests;
DELETE FROM ride_requests;
DELETE FROM ride_offers;
DELETE FROM profiles;
DELETE FROM credentials;
DELETE FROM drivers;
DELETE FROM riders;
DELETE FROM users;

CREATE UNIQUE INDEX IF NOT EXISTS uk_join_requests_pending
ON join_requests (rider_id, ride_offer_id)
WHERE status = 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS uk_ride_matches_join_request_unique
ON ride_matches (accepted_join_request_id)
WHERE accepted_join_request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_ride_matches_offer_unique
ON ride_matches (accepted_ride_request_offer_id)
WHERE accepted_ride_request_offer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_ride_matches_request_unique
ON ride_matches (ride_request_id)
WHERE ride_request_id IS NOT NULL;

INSERT INTO users (id, full_name, email, phone, suburb, account_status) VALUES
  (1, 'Emma Lee', 'emma.driver@example.com', '0400000001', 'Clayton', 'ACTIVE'),
  (2, 'Liam Patel', 'liam.driver@example.com', '0400000002', 'Box Hill', 'ACTIVE'),
  (3, 'Daniel Chen', 'daniel.rider@example.com', '0400000003', 'Clayton', 'ACTIVE'),
  (4, 'Maria Gomez', 'maria.rider@example.com', '0400000004', 'Box Hill', 'ACTIVE'),
  (5, 'Olivia Nguyen', 'olivia.driver@example.com', '0400000005', 'Glen Waverley', 'ACTIVE'),
  (6, 'Noah Johnson', 'noah.driver@example.com', '0400000006', 'Richmond', 'ACTIVE'),
  (7, 'Sophie Martin', 'sophie.rider@example.com', '0400000007', 'Glen Waverley', 'ACTIVE'),
  (8, 'Ethan Walker', 'ethan.rider@example.com', '0400000008', 'Southbank', 'ACTIVE');

INSERT INTO drivers (id, licence_verified_status, vehicle_info, spare_seat_capacity) VALUES
  (1, 'VERIFIED', 'Toyota Corolla - White', 3),
  (2, 'VERIFIED', 'Honda Civic - Blue', 2),
  (5, 'VERIFIED', 'Mazda CX-5 - Silver', 4),
  (6, 'VERIFIED', 'Kia Cerato - Black', 3);

INSERT INTO riders (id, preferred_travel_times, usual_destinations) VALUES
  (3, 'Morning commute', 'City Centre'),
  (4, 'Weekend daytime', 'Community Hall'),
  (7, 'Early morning', 'Monash University'),
  (8, 'Evening return', 'CBD and inner suburbs');

INSERT INTO profiles (id, user_id, bio, travel_preferences, trust_notes, average_rating) VALUES
  (1, 1, 'Daily commuter to city', 'No smoking, punctual pickup', 'Verified licence and frequent community trips', 4.7),
  (2, 2, 'Weekend local driver', 'Quiet ride preferred', 'Known in local sports club', 4.3),
  (3, 3, 'Student rider', 'Flexible pickup points', 'Prefers trusted drivers', 4.6),
  (4, 4, 'Event volunteer', 'Needs occasional one-off rides', 'Looks for profile and rating before acceptance', 4.5),
  (5, 5, 'Family-friendly driver', 'Clean car, child seat available', 'Verified docs and high completion rate', 4.7),
  (6, 6, 'City weekday driver', 'Fast but safe route planning', 'Responsive in-app communication', 4.3),
  (7, 7, 'Campus rider', 'Prefers short walking distance pickups', 'Always confirms trip details early', 4.6),
  (8, 8, 'After-work rider', 'Needs reliable evening transport', 'Consistent and polite trip history', 4.4);

INSERT INTO credentials (id, user_id, password_plain) VALUES
  (1, 1, 'demo1234'),
  (2, 2, 'demo1234'),
  (3, 3, 'demo1234'),
  (4, 4, 'demo1234'),
  (5, 5, 'demo1234'),
  (6, 6, 'demo1234'),
  (7, 7, 'demo1234'),
  (8, 8, 'demo1234');

INSERT INTO ratings (id, profile_id, rater_user_id, score, comment, created_date) VALUES
  (1, 1, 3, 5, 'Very reliable and friendly', '2026-03-10 09:00:00'),
  (2, 1, 4, 4, 'On time and safe driving', '2026-03-12 18:30:00'),
  (3, 1, 7, 5, 'Excellent trip planning', '2026-03-14 07:40:00'),
  (4, 2, 3, 5, 'Great communication', '2026-03-11 08:10:00'),
  (5, 2, 4, 4, 'Smooth trip and punctual', '2026-03-13 19:20:00'),
  (6, 2, 8, 4, 'Good driving and clear updates', '2026-03-16 17:05:00'),
  (7, 5, 4, 5, 'Helpful and kind driver', '2026-03-15 11:25:00'),
  (8, 5, 7, 4, 'Comfortable ride', '2026-03-17 08:35:00'),
  (9, 5, 8, 5, 'Excellent punctuality', '2026-03-18 18:10:00'),
  (10, 6, 3, 4, 'Safe route and quick response', '2026-03-19 09:45:00'),
  (11, 6, 4, 5, 'Professional and reliable', '2026-03-20 07:55:00'),
  (12, 6, 7, 4, 'Good experience overall', '2026-03-21 19:30:00'),
  (13, 3, 1, 5, 'Daniel communicates clearly and arrives on time.', '2026-03-22 08:10:00'),
  (14, 3, 2, 4, 'Polite rider and easy pickup coordination.', '2026-03-22 18:45:00'),
  (15, 3, 5, 5, 'Very respectful and confirms details early.', '2026-03-23 09:20:00'),
  (16, 4, 1, 5, 'Maria is organised and pleasant to travel with.', '2026-03-23 10:05:00'),
  (17, 4, 2, 4, 'Clear communication and flexible meeting point.', '2026-03-24 11:15:00'),
  (18, 4, 6, 5, 'Great rider, smooth coordination.', '2026-03-24 17:40:00'),
  (19, 7, 1, 4, 'Sophie is punctual and friendly.', '2026-03-25 07:25:00'),
  (20, 7, 5, 5, 'Easy to coordinate with for campus trips.', '2026-03-25 14:30:00'),
  (21, 7, 6, 4, 'Reliable rider and clear communication.', '2026-03-25 19:05:00'),
  (22, 8, 2, 5, 'Ethan confirms quickly and is always ready on time.', '2026-03-26 08:35:00'),
  (23, 8, 5, 4, 'Good communication throughout the trip.', '2026-03-26 18:20:00'),
  (24, 8, 6, 5, 'Very cooperative rider with clear destination details.', '2026-03-27 09:55:00');

INSERT INTO au_location_reference (id, state, suburb, postcode, address, latitude, longitude) VALUES
  (1, 'VIC', 'Clayton', '3168', 'Clayton Railway Station, VIC', -37.924100, 145.120700),
  (2, 'VIC', 'Melbourne', '3000', 'Melbourne CBD, VIC', -37.813600, 144.963100),
  (3, 'VIC', 'Box Hill', '3128', 'Box Hill Library, VIC', -37.818300, 145.125600),
  (4, 'VIC', 'Box Hill', '3128', 'Box Hill Community Hall, VIC', -37.817900, 145.124900),
  (5, 'VIC', 'Docklands', '3008', 'Docklands Community Hub, VIC', -37.813900, 144.946000),
  (6, 'VIC', 'Clayton', '3800', 'Monash University Clayton Campus, VIC', -37.910500, 145.136300),
  (7, 'VIC', 'Richmond', '3121', 'Richmond Station, VIC', -37.824000, 144.998500),
  (8, 'VIC', 'Carlton', '3053', 'Carlton Gardens, VIC', -37.806000, 144.967000),
  (9, 'VIC', 'Southbank', '3006', 'Southbank Arts Centre, VIC', -37.821000, 144.965000),
  (10, 'VIC', 'Glen Waverley', '3150', 'Glen Waverley Station, VIC', -37.878800, 145.164700),
  (11, 'VIC', 'Chadstone', '3148', 'Chadstone Shopping Centre, VIC', -37.887200, 145.082700),
  (12, 'VIC', 'Caulfield', '3162', 'Caulfield Station, VIC', -37.877400, 145.024600);

INSERT INTO ride_offers (
  id, driver_id, origin, origin_address, origin_state, origin_suburb, origin_postcode, origin_latitude, origin_longitude,
  destination, destination_address, destination_state, destination_suburb, destination_postcode, destination_latitude, destination_longitude,
  departure_date, departure_time, available_seats, status, version
) VALUES
  (101, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-20 00:00:00.000', '08:15', 1, 'OPEN', 0),
  (102, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-20 00:00:00.000', '08:45', 1, 'OPEN', 0),
  (103, 2, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-20 00:00:00.000', '09:00', 2, 'OPEN', 0),
  (104, 2, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-18 00:00:00.000', '08:30', 0, 'CLOSED', 0),
  (105, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-09 00:00:00.000', '08:45', 1, 'OPEN', 0),
  (106, 5, 'Glen Waverley', 'Glen Waverley Station', 'VIC', 'Glen Waverley', '3150', -37.878800, 145.164700, 'Monash University', 'Monash University Clayton Campus', 'VIC', 'Clayton', '3800', -37.910500, 145.136300, '2026-04-21 00:00:00.000', '07:35', 2, 'OPEN', 0),
  (107, 6, 'Chadstone', 'Chadstone Shopping Centre', 'VIC', 'Chadstone', '3148', -37.887200, 145.082700, 'Richmond', 'Richmond Station', 'VIC', 'Richmond', '3121', -37.824000, 144.998500, '2026-04-21 00:00:00.000', '08:10', 1, 'OPEN', 0),
  (108, 1, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Carlton', 'Carlton Gardens', 'VIC', 'Carlton', '3053', -37.806000, 144.967000, '2026-04-22 00:00:00.000', '09:20', 1, 'OPEN', 0),
  (109, 2, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, '2026-04-22 00:00:00.000', '18:00', 2, 'OPEN', 0),
  (110, 5, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Southbank', 'Southbank Arts Centre', 'VIC', 'Southbank', '3006', -37.821000, 144.965000, '2026-04-23 00:00:00.000', '07:50', 2, 'OPEN', 0),
  (111, 6, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-23 00:00:00.000', '08:30', 2, 'OPEN', 0),
  (112, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-17 00:00:00.000', '08:30', 0, 'CLOSED', 0),
  (113, 5, 'Glen Waverley', 'Glen Waverley Station', 'VIC', 'Glen Waverley', '3150', -37.878800, 145.164700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-24 00:00:00.000', '08:05', 3, 'OPEN', 0),
  (114, 6, 'Richmond', 'Richmond Station', 'VIC', 'Richmond', '3121', -37.824000, 144.998500, 'Melbourne', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-24 00:00:00.000', '08:25', 3, 'OPEN', 0);

INSERT INTO ride_requests (
  id, rider_id, origin, origin_address, origin_state, origin_suburb, origin_postcode, origin_latitude, origin_longitude,
  destination, destination_address, destination_state, destination_suburb, destination_postcode, destination_latitude, destination_longitude,
  trip_date, trip_time, passenger_count, notes, status
) VALUES
  (201, 4, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Community Hall', 'Box Hill Community Hall', 'VIC', 'Box Hill', '3128', -37.817900, 145.124900, '2026-04-20 00:00:00.000', '10:00', 2, 'Weekend event travel', 'OPEN'),
  (202, 4, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-18 00:00:00.000', '09:30', 1, 'Demo matched request', 'MATCHED'),
  (203, 4, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Melbourne', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-22 00:00:00.000', '08:50', 1, 'Morning meeting transfer', 'OPEN'),
  (204, 3, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Melbourne', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-04-21 00:00:00.000', '08:20', 1, 'Work commute backup', 'MATCHED'),
  (205, 3, 'Chadstone', 'Chadstone Shopping Centre', 'VIC', 'Chadstone', '3148', -37.887200, 145.082700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-24 00:00:00.000', '09:10', 2, 'Shopping trip with friend', 'OPEN'),
  (206, 7, 'Glen Waverley', 'Glen Waverley Station', 'VIC', 'Glen Waverley', '3150', -37.878800, 145.164700, 'Monash University', 'Monash University Clayton Campus', 'VIC', 'Clayton', '3800', -37.910500, 145.136300, '2026-04-20 00:00:00.000', '07:40', 1, 'Closed sample for history tab', 'CLOSED'),
  (207, 7, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Richmond', 'Richmond Station', 'VIC', 'Richmond', '3121', -37.824000, 144.998500, '2026-04-23 00:00:00.000', '18:10', 1, 'Evening class ride', 'OPEN'),
  (208, 8, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Carlton', 'Carlton Gardens', 'VIC', 'Carlton', '3053', -37.806000, 144.967000, '2026-04-21 00:00:00.000', '09:05', 1, 'Museum visit', 'MATCHED'),
  (209, 8, 'Southbank', 'Southbank Arts Centre', 'VIC', 'Southbank', '3006', -37.821000, 144.965000, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, '2026-04-25 00:00:00.000', '17:30', 1, 'Return home', 'OPEN'),
  (210, 3, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Southbank', 'Southbank Arts Centre', 'VIC', 'Southbank', '3006', -37.821000, 144.965000, '2026-04-26 00:00:00.000', '07:55', 1, 'Closed request demo', 'CLOSED'),
  (211, 7, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-24 00:00:00.000', '08:40', 1, 'Harbor event', 'OPEN'),
  (212, 8, 'Richmond', 'Richmond Station', 'VIC', 'Richmond', '3121', -37.824000, 144.998500, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, '2026-04-24 00:00:00.000', '18:20', 1, 'Back to suburb', 'OPEN');

INSERT INTO join_requests (id, rider_id, ride_offer_id, request_date_time, requested_seats, status) VALUES
  (301, 3, 101, '2026-04-18 08:20:00', 1, 'ACCEPTED'),
  (302, 4, 102, '2026-04-19 09:05:00', 1, 'PENDING'),
  (303, 7, 103, '2026-04-19 09:20:00', 1, 'REJECTED'),
  (304, 4, 108, '2026-04-20 07:40:00', 1, 'ACCEPTED'),
  (305, 8, 109, '2026-04-20 18:10:00', 1, 'PENDING'),
  (306, 3, 110, '2026-04-21 06:50:00', 1, 'REJECTED'),
  (307, 7, 106, '2026-04-21 06:55:00', 1, 'PENDING'),
  (308, 8, 107, '2026-04-21 07:10:00', 1, 'ACCEPTED'),
  (309, 4, 111, '2026-04-21 11:05:00', 1, 'REJECTED'),
  (310, 3, 102, '2026-04-21 12:15:00', 1, 'REJECTED'),
  (311, 7, 105, '2026-04-21 13:00:00', 1, 'PENDING'),
  (312, 8, 101, '2026-04-21 14:20:00', 1, 'REJECTED'),
  (313, 4, 105, '2026-04-21 15:45:00', 1, 'ACCEPTED'),
  (314, 7, 109, '2026-04-21 16:05:00', 1, 'ACCEPTED'),
  (315, 7, 110, '2026-04-21 16:10:00', 1, 'ACCEPTED'),
  (316, 7, 111, '2026-04-21 16:15:00', 1, 'ACCEPTED'),
  (317, 3, 109, '2026-04-21 16:20:00', 1, 'ACCEPTED'),
  (318, 8, 110, '2026-04-21 16:25:00', 1, 'ACCEPTED'),
  (319, 4, 111, '2026-04-21 16:30:00', 1, 'ACCEPTED');

INSERT INTO ride_request_offers (id, ride_request_id, driver_id, proposed_seats, meeting_point, status, created_at) VALUES
  (501, 202, 1, 1, 'Clayton Station Gate 1', 'ACCEPTED', '2026-04-18 08:55:00'),
  (502, 202, 2, 1, 'Clayton Library Front', 'REJECTED', '2026-04-18 09:00:00'),
  (503, 202, 5, 1, 'Clayton Plaza Taxi Bay', 'REJECTED', '2026-04-18 09:02:00'),
  (504, 204, 2, 1, 'Melbourne Central Clock', 'ACCEPTED', '2026-04-20 07:55:00'),
  (505, 204, 1, 1, 'Clayton Station Gate 2', 'REJECTED', '2026-04-20 08:00:00'),
  (506, 204, 6, 1, 'City Loop Exit 4', 'REJECTED', '2026-04-20 08:01:00'),
  (507, 208, 5, 1, 'Carlton Gardens Main Gate', 'ACCEPTED', '2026-04-20 08:10:00'),
  (508, 208, 1, 1, 'Lygon Street Stop 3', 'REJECTED', '2026-04-20 08:12:00'),
  (509, 208, 6, 1, 'Queensberry Street Corner', 'REJECTED', '2026-04-20 08:15:00'),
  (510, 201, 2, 2, 'Box Hill Library Main Entrance', 'PENDING', '2026-04-20 09:10:00'),
  (511, 203, 6, 1, 'Box Hill Station Bus Bay', 'PENDING', '2026-04-21 07:30:00'),
  (512, 205, 5, 2, 'Chadstone South Entrance', 'PENDING', '2026-04-21 09:20:00'),
  (513, 207, 2, 1, 'Richmond Station North Exit', 'PENDING', '2026-04-21 10:05:00'),
  (514, 209, 6, 1, 'Southbank Promenade Stop', 'PENDING', '2026-04-21 10:10:00'),
  (515, 211, 1, 1, 'Docklands Library Entry', 'PENDING', '2026-04-21 10:12:00'),
  (516, 212, 5, 1, 'Richmond Concourse', 'PENDING', '2026-04-21 10:15:00'),
  (517, 210, 2, 1, 'Southbank Pier Pickup', 'REJECTED', '2026-04-21 10:18:00'),
  (518, 206, 5, 1, 'Monash Main Gate', 'REJECTED', '2026-04-21 10:20:00');

INSERT INTO ride_matches (
  id, driver_id, rider_id, ride_offer_id, ride_request_id,
  accepted_join_request_id, accepted_ride_request_offer_id,
  confirmed_date_time, meeting_point, trip_status
) VALUES
  (401, 1, 3, 101, NULL, 301, NULL, '2026-04-18 08:30:00', 'Clayton Station Gate 2', 'CONFIRMED'),
  (402, 1, 4, 108, NULL, 304, NULL, '2026-04-20 07:55:00', 'Box Hill Library Entrance', 'CONFIRMED'),
  (403, 6, 8, 107, NULL, 308, NULL, '2026-04-21 07:25:00', 'Chadstone Bus Bay', 'CONFIRMED'),
  (404, 1, 4, NULL, 202, NULL, 501, '2026-04-18 09:10:00', 'Clayton Station Gate 1', 'CONFIRMED'),
  (405, 2, 3, NULL, 204, NULL, 504, '2026-04-20 08:05:00', 'Melbourne Central Clock', 'CONFIRMED'),
  (406, 5, 8, NULL, 208, NULL, 507, '2026-04-20 08:25:00', 'Carlton Gardens Main Gate', 'CONFIRMED'),
  (407, 1, 4, 105, NULL, 313, NULL, '2026-04-21 16:00:00', 'Docklands Community Hub Front', 'CONFIRMED'),
  (408, 2, 7, 109, NULL, 314, NULL, '2026-04-21 16:35:00', 'Docklands Community Hub Gate A', 'CONFIRMED'),
  (409, 5, 7, 110, NULL, 315, NULL, '2026-04-21 16:40:00', 'Clayton Station Gate 3', 'CONFIRMED'),
  (410, 6, 7, 111, NULL, 316, NULL, '2026-04-21 16:45:00', 'Box Hill Library Pickup Bay', 'CONFIRMED'),
  (411, 2, 3, 109, NULL, 317, NULL, '2026-04-21 16:50:00', 'Docklands Community Hub Gate B', 'CONFIRMED'),
  (412, 5, 8, 110, NULL, 318, NULL, '2026-04-21 16:55:00', 'Southbank Arts Centre Forecourt', 'CONFIRMED'),
  (413, 6, 4, 111, NULL, 319, NULL, '2026-04-21 17:00:00', 'Box Hill Library Main Entry', 'CONFIRMED');

INSERT INTO notifications (
  id, recipient_user_id, type, title, message, related_ride_match_id, is_read, created_at
) VALUES
  (701, 3, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #301 was accepted by Emma Lee.', 401, 0, '2026-04-18 08:31:00'),
  (702, 1, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #301 from Daniel Chen.', 401, 1, '2026-04-18 08:31:30'),
  (703, 4, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #304 was accepted by Emma Lee.', 402, 0, '2026-04-20 07:56:00'),
  (704, 1, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #304 from Maria Gomez.', 402, 0, '2026-04-20 07:56:30'),
  (705, 8, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #308 was accepted by Noah Johnson.', 403, 0, '2026-04-21 07:26:00'),
  (706, 6, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #308 from Ethan Walker.', 403, 0, '2026-04-21 07:26:30'),
  (707, 4, 'RIDE_MATCH_CONFIRMED', 'One-off ride matched', 'You accepted offer #501 from Emma Lee.', 404, 1, '2026-04-18 09:11:00'),
  (708, 1, 'RIDE_MATCH_CONFIRMED', 'Your one-off offer was accepted', 'Maria Gomez accepted your offer #501 for request #202.', 404, 0, '2026-04-18 09:11:30'),
  (709, 2, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #202. Offer #502 was rejected.', NULL, 0, '2026-04-18 09:12:00'),
  (710, 5, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #202. Offer #503 was rejected.', NULL, 0, '2026-04-18 09:12:30'),
  (711, 3, 'RIDE_MATCH_CONFIRMED', 'One-off ride matched', 'You accepted offer #504 from Liam Patel.', 405, 0, '2026-04-20 08:06:00'),
  (712, 2, 'RIDE_MATCH_CONFIRMED', 'Your one-off offer was accepted', 'Daniel Chen accepted your offer #504 for request #204.', 405, 0, '2026-04-20 08:06:30'),
  (713, 1, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #204. Offer #505 was rejected.', NULL, 0, '2026-04-20 08:07:00'),
  (714, 6, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #204. Offer #506 was rejected.', NULL, 0, '2026-04-20 08:07:30'),
  (715, 8, 'RIDE_MATCH_CONFIRMED', 'One-off ride matched', 'You accepted offer #507 from Olivia Nguyen.', 406, 0, '2026-04-20 08:26:00'),
  (716, 5, 'RIDE_MATCH_CONFIRMED', 'Your one-off offer was accepted', 'Ethan Walker accepted your offer #507 for request #208.', 406, 0, '2026-04-20 08:26:30'),
  (717, 1, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #208. Offer #508 was rejected.', NULL, 0, '2026-04-20 08:27:00'),
  (718, 6, 'RIDE_REQUEST_OFFER_REJECTED', 'One-off offer not selected', 'Rider selected another offer for request #208. Offer #509 was rejected.', NULL, 0, '2026-04-20 08:27:30'),
  (719, 4, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #313 was accepted by Emma Lee.', 407, 0, '2026-04-21 16:01:00'),
  (720, 1, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #313 from Maria Gomez.', 407, 0, '2026-04-21 16:01:30'),
  (721, 7, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #314 was accepted by Liam Patel.', 408, 0, '2026-04-21 16:36:00'),
  (722, 2, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #314 from Sophie Martin.', 408, 0, '2026-04-21 16:36:30'),
  (723, 7, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #315 was accepted by Olivia Nguyen.', 409, 0, '2026-04-21 16:41:00'),
  (724, 5, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #315 from Sophie Martin.', 409, 0, '2026-04-21 16:41:30'),
  (725, 7, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #316 was accepted by Noah Johnson.', 410, 0, '2026-04-21 16:46:00'),
  (726, 6, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #316 from Sophie Martin.', 410, 0, '2026-04-21 16:46:30'),
  (727, 3, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #317 was accepted by Liam Patel.', 411, 0, '2026-04-21 16:51:00'),
  (728, 2, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #317 from Daniel Chen.', 411, 0, '2026-04-21 16:51:30'),
  (729, 8, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #318 was accepted by Olivia Nguyen.', 412, 0, '2026-04-21 16:56:00'),
  (730, 5, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #318 from Ethan Walker.', 412, 0, '2026-04-21 16:56:30'),
  (731, 4, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'Your join request #319 was accepted by Noah Johnson.', 413, 0, '2026-04-21 17:01:00'),
  (732, 6, 'RIDE_MATCH_CONFIRMED', 'Ride match confirmed', 'You accepted join request #319 from Maria Gomez.', 413, 0, '2026-04-21 17:01:30');
