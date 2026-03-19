DELETE FROM ratings;
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

INSERT INTO ride_offers (id, driver_id, origin, destination, departure_date, departure_time, available_seats, status) VALUES
  (101, 1, 'Clayton', 'City Centre', '2026-03-18', '08:30', 2, 'OPEN'),
  (102, 1, 'Clayton', 'City Centre', '2026-03-18', '09:00', 1, 'OPEN'),
  (103, 2, 'Box Hill', 'Community Hall', '2026-03-20', '10:00', 2, 'OPEN');

INSERT INTO ride_requests (id, rider_id, origin, destination, trip_date, trip_time, passenger_count, notes, status) VALUES
  (201, 4, 'Box Hill', 'Community Hall', '2026-03-20', '10:00', 2, 'Weekend event travel', 'OPEN');
