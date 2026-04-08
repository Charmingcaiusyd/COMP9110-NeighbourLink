DELETE FROM ratings;
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
  (4, 'Maria Gomez', 'maria.rider@example.com', '0400000004', 'Box Hill', 'ACTIVE');

INSERT INTO drivers (id, licence_verified_status, vehicle_info, spare_seat_capacity) VALUES
  (1, 'VERIFIED', 'Toyota Corolla - White', 3),
  (2, 'VERIFIED', 'Honda Civic - Blue', 2);

INSERT INTO riders (id, preferred_travel_times, usual_destinations) VALUES
  (3, 'Morning commute', 'City Centre'),
  (4, 'Weekend daytime', 'Community Hall');

INSERT INTO profiles (id, user_id, bio, travel_preferences, trust_notes, average_rating) VALUES
  (1, 1, 'Daily commuter to city', 'No smoking, punctual pickup', 'Verified licence and frequent community trips', 4.5),
  (2, 2, 'Weekend local driver', 'Quiet ride preferred', 'Known in local sports club', 4.5),
  (3, 3, 'Student rider', 'Flexible pickup points', 'Prefers trusted drivers', NULL),
  (4, 4, 'Event volunteer', 'Needs occasional one-off rides', 'Looks for profile and rating before acceptance', NULL);

INSERT INTO credentials (id, user_id, password_plain) VALUES
  (1, 1, 'demo1234'),
  (2, 2, 'demo1234'),
  (3, 3, 'demo1234'),
  (4, 4, 'demo1234');

INSERT INTO ratings (id, profile_id, rater_user_id, score, comment, created_date) VALUES
  (1, 1, 3, 5, 'Very reliable and friendly', '2026-03-10 09:00:00'),
  (2, 1, 4, 4, 'On time and safe driving', '2026-03-12 18:30:00'),
  (3, 2, 3, 5, 'Great communication', '2026-03-11 08:10:00'),
  (4, 2, 4, 4, 'Smooth trip and punctual', '2026-03-13 19:20:00');

INSERT INTO au_location_reference (id, state, suburb, postcode, address, latitude, longitude) VALUES
  (1, 'VIC', 'Clayton', '3168', 'Clayton Railway Station, VIC', -37.924100, 145.120700),
  (2, 'VIC', 'Melbourne', '3000', 'Melbourne CBD, VIC', -37.813600, 144.963100),
  (3, 'VIC', 'Box Hill', '3128', 'Box Hill Library, VIC', -37.818300, 145.125600),
  (4, 'VIC', 'Box Hill', '3128', 'Box Hill Community Hall, VIC', -37.817900, 145.124900),
  (5, 'VIC', 'Docklands', '3008', 'Docklands Community Hub, VIC', -37.813900, 144.946000);

INSERT INTO ride_offers (
  id, driver_id, origin, origin_address, origin_state, origin_suburb, origin_postcode, origin_latitude, origin_longitude,
  destination, destination_address, destination_state, destination_suburb, destination_postcode, destination_latitude, destination_longitude,
  departure_date, departure_time, available_seats, status, version
) VALUES
  (101, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-03-18 00:00:00.000', '08:30', 2, 'OPEN', 0),
  (102, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-03-18 00:00:00.000', '09:00', 1, 'OPEN', 0),
  (103, 2, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Community Hall', 'Box Hill Community Hall', 'VIC', 'Box Hill', '3128', -37.817900, 145.124900, '2026-03-20 00:00:00.000', '10:00', 2, 'OPEN', 0),
  (104, 2, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'City Centre', 'Melbourne CBD', 'VIC', 'Melbourne', '3000', -37.813600, 144.963100, '2026-03-18 00:00:00.000', '08:30', 0, 'CLOSED', 0),
  (105, 1, 'Clayton', 'Clayton Railway Station', 'VIC', 'Clayton', '3168', -37.924100, 145.120700, 'Docklands', 'Docklands Community Hub', 'VIC', 'Docklands', '3008', -37.813900, 144.946000, '2026-04-09 00:00:00.000', '08:45', 2, 'OPEN', 0);

INSERT INTO ride_requests (
  id, rider_id, origin, origin_address, origin_state, origin_suburb, origin_postcode, origin_latitude, origin_longitude,
  destination, destination_address, destination_state, destination_suburb, destination_postcode, destination_latitude, destination_longitude,
  trip_date, trip_time, passenger_count, notes, status
) VALUES
  (201, 4, 'Box Hill', 'Box Hill Library', 'VIC', 'Box Hill', '3128', -37.818300, 145.125600, 'Community Hall', 'Box Hill Community Hall', 'VIC', 'Box Hill', '3128', -37.817900, 145.124900, '2026-03-20 00:00:00.000', '10:00', 2, 'Weekend event travel', 'OPEN');

INSERT INTO join_requests (id, rider_id, ride_offer_id, request_date_time, requested_seats, status) VALUES
  (301, 3, 101, '2026-03-16 08:20:00', 1, 'ACCEPTED');

INSERT INTO ride_matches (
  id, driver_id, rider_id, ride_offer_id, ride_request_id,
  accepted_join_request_id, accepted_ride_request_offer_id,
  confirmed_date_time, meeting_point, trip_status
) VALUES
  (401, 1, 3, 101, NULL, 301, NULL, '2026-03-16 08:30:00', 'Clayton Station Gate 2', 'CONFIRMED');
