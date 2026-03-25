package com.neighbourlink.service;

import com.neighbourlink.dto.AdminJoinRequestItemDto;
import com.neighbourlink.dto.AdminJoinRequestUpdateRequestDto;
import com.neighbourlink.dto.AdminOverviewDto;
import com.neighbourlink.dto.AdminRatingItemDto;
import com.neighbourlink.dto.AdminRatingUpdateRequestDto;
import com.neighbourlink.dto.AdminRideMatchItemDto;
import com.neighbourlink.dto.AdminRideMatchUpdateRequestDto;
import com.neighbourlink.dto.AdminRideOfferItemDto;
import com.neighbourlink.dto.AdminRideOfferUpdateRequestDto;
import com.neighbourlink.dto.AdminRideRequestItemDto;
import com.neighbourlink.dto.AdminRideRequestOfferItemDto;
import com.neighbourlink.dto.AdminRideRequestOfferUpdateRequestDto;
import com.neighbourlink.dto.AdminRideRequestUpdateRequestDto;
import com.neighbourlink.dto.AdminUserItemDto;
import com.neighbourlink.dto.AdminUserUpdateRequestDto;
import com.neighbourlink.entity.AccountStatus;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.JoinRequest;
import com.neighbourlink.entity.JoinRequestStatus;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.Rating;
import com.neighbourlink.entity.RideMatch;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import com.neighbourlink.entity.RideRequest;
import com.neighbourlink.entity.RideRequestOffer;
import com.neighbourlink.entity.RideRequestOfferStatus;
import com.neighbourlink.entity.RideRequestStatus;
import com.neighbourlink.entity.Rider;
import com.neighbourlink.entity.TripStatus;
import com.neighbourlink.entity.User;
import com.neighbourlink.entity.VerificationStatus;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.JoinRequestRepository;
import com.neighbourlink.repository.ProfileRepository;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.RideMatchRepository;
import com.neighbourlink.repository.RideOfferRepository;
import com.neighbourlink.repository.RideRequestOfferRepository;
import com.neighbourlink.repository.RideRequestRepository;
import com.neighbourlink.repository.RiderRepository;
import com.neighbourlink.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final RiderRepository riderRepository;
    private final DriverRepository driverRepository;
    private final ProfileRepository profileRepository;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;
    private final RideRequestOfferRepository rideRequestOfferRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final RideMatchRepository rideMatchRepository;
    private final RatingRepository ratingRepository;
    private final String adminSessionKey;

    public AdminService(
            UserRepository userRepository,
            RiderRepository riderRepository,
            DriverRepository driverRepository,
            ProfileRepository profileRepository,
            RideOfferRepository rideOfferRepository,
            RideRequestRepository rideRequestRepository,
            RideRequestOfferRepository rideRequestOfferRepository,
            JoinRequestRepository joinRequestRepository,
            RideMatchRepository rideMatchRepository,
            RatingRepository ratingRepository,
            @Value("${neighbourlink.admin.session-key:NL-ADMIN-SESSION-KEY}") String adminSessionKey
    ) {
        this.userRepository = userRepository;
        this.riderRepository = riderRepository;
        this.driverRepository = driverRepository;
        this.profileRepository = profileRepository;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.rideRequestOfferRepository = rideRequestOfferRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.rideMatchRepository = rideMatchRepository;
        this.ratingRepository = ratingRepository;
        this.adminSessionKey = normalizeRequired(adminSessionKey, "Admin session key must not be blank");
    }

    public AdminOverviewDto getOverview(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);

        return new AdminOverviewDto(
                userRepository.count(),
                riderRepository.count(),
                driverRepository.count(),
                userRepository.countByAccountStatus(AccountStatus.ACTIVE),
                userRepository.countByAccountStatus(AccountStatus.SUSPENDED),
                rideOfferRepository.count(),
                rideOfferRepository.countByStatus(RideOfferStatus.OPEN),
                rideRequestRepository.count(),
                rideRequestRepository.countByStatus(RideRequestStatus.OPEN),
                joinRequestRepository.count(),
                joinRequestRepository.countByStatus(JoinRequestStatus.PENDING),
                rideMatchRepository.count(),
                ratingRepository.count()
        );
    }

    public List<AdminUserItemDto> getUsers(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return userRepository.findAll()
                .stream()
                .map(this::toAdminUserItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserItemDto updateUser(String adminSessionHeader, Long userId, AdminUserUpdateRequestDto request) {
        requireAdminSession(adminSessionHeader);

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getFullName() != null) {
            String fullName = normalizeOptional(request.getFullName());
            if (fullName == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fullName must not be blank");
            }
            user.setFullName(fullName);
        }
        if (request.getEmail() != null) {
            String email = normalizeRequired(request.getEmail(), "email must not be blank");
            if (!isValidEmail(email)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email format is invalid");
            }
            userRepository.findByEmailIgnoreCase(email)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "email is already in use");
                    });
            user.setEmail(email);
        }
        if (request.getPhone() != null) {
            user.setPhone(normalizeOptional(request.getPhone()));
        }
        if (request.getSuburb() != null) {
            user.setSuburb(normalizeOptional(request.getSuburb()));
        }
        if (request.getAccountStatus() != null) {
            user.setAccountStatus(parseAccountStatus(request.getAccountStatus()));
        }

        Profile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            Profile created = new Profile();
            created.setUser(user);
            return created;
        });

        if (request.getBio() != null) {
            profile.setBio(normalizeOptional(request.getBio()));
        }
        if (request.getTravelPreferences() != null) {
            profile.setTravelPreferences(normalizeOptional(request.getTravelPreferences()));
        }
        if (request.getTrustNotes() != null) {
            profile.setTrustNotes(normalizeOptional(request.getTrustNotes()));
        }

        if (user instanceof Driver) {
            Driver driver = (Driver) user;
            if (request.getDriverLicenceVerifiedStatus() != null) {
                driver.setLicenceVerifiedStatus(parseVerificationStatus(request.getDriverLicenceVerifiedStatus()));
            }
            if (request.getDriverVehicleInfo() != null) {
                driver.setVehicleInfo(normalizeOptional(request.getDriverVehicleInfo()));
            }
            if (request.getDriverSpareSeatCapacity() != null) {
                if (request.getDriverSpareSeatCapacity() < 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "driverSpareSeatCapacity must be 0 or greater"
                    );
                }
                driver.setSpareSeatCapacity(request.getDriverSpareSeatCapacity());
            }
            if (request.getDriverVerificationNotes() != null) {
                driver.setVerificationNotes(normalizeOptional(request.getDriverVerificationNotes()));
            }
        } else if (hasDriverFieldUpdate(request)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user is not a DRIVER");
        }

        if (user instanceof Rider) {
            Rider rider = (Rider) user;
            if (request.getRiderPreferredTravelTimes() != null) {
                rider.setPreferredTravelTimes(normalizeOptional(request.getRiderPreferredTravelTimes()));
            }
            if (request.getRiderUsualDestinations() != null) {
                rider.setUsualDestinations(normalizeOptional(request.getRiderUsualDestinations()));
            }
        } else if (hasRiderFieldUpdate(request)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user is not a RIDER");
        }

        profileRepository.save(profile);
        userRepository.save(user);
        return toAdminUserItemDto(user);
    }

    public List<AdminRideOfferItemDto> getRideOffers(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideOfferRepository.findAllWithDriverOrderByRecent()
                .stream()
                .map(this::toAdminRideOfferItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRideOfferItemDto updateRideOffer(
            String adminSessionHeader,
            Long offerId,
            AdminRideOfferUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        RideOffer offer = rideOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride offer not found"));

        if (request.getOrigin() != null) {
            offer.setOrigin(normalizeRequired(request.getOrigin(), "origin must not be blank"));
        }
        if (request.getDestination() != null) {
            offer.setDestination(normalizeRequired(request.getDestination(), "destination must not be blank"));
        }
        if (request.getDepartureDate() != null) {
            offer.setDepartureDate(parseDate(request.getDepartureDate(), "departureDate must be yyyy-MM-dd"));
        }
        if (request.getDepartureTime() != null) {
            offer.setDepartureTime(parseTime(request.getDepartureTime(), "departureTime must be HH:mm"));
        }
        if (request.getAvailableSeats() != null) {
            if (request.getAvailableSeats() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availableSeats must be >= 0");
            }
            offer.setAvailableSeats(request.getAvailableSeats());
        }
        if (request.getStatus() != null) {
            offer.setStatus(parseRideOfferStatus(request.getStatus()));
        }

        rideOfferRepository.save(offer);
        return toAdminRideOfferItemDto(offer);
    }

    public List<AdminRideRequestItemDto> getRideRequests(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideRequestRepository.findAllWithRiderOrderByRecent()
                .stream()
                .map(this::toAdminRideRequestItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRideRequestItemDto updateRideRequest(
            String adminSessionHeader,
            Long rideRequestId,
            AdminRideRequestUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        RideRequest rideRequest = rideRequestRepository.findByIdWithRider(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request not found"));

        if (request.getOrigin() != null) {
            rideRequest.setOrigin(normalizeRequired(request.getOrigin(), "origin must not be blank"));
        }
        if (request.getDestination() != null) {
            rideRequest.setDestination(normalizeRequired(request.getDestination(), "destination must not be blank"));
        }
        if (request.getTripDate() != null) {
            rideRequest.setTripDate(parseDate(request.getTripDate(), "tripDate must be yyyy-MM-dd"));
        }
        if (request.getTripTime() != null) {
            rideRequest.setTripTime(parseTime(request.getTripTime(), "tripTime must be HH:mm"));
        }
        if (request.getPassengerCount() != null) {
            if (request.getPassengerCount() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "passengerCount must be >= 1");
            }
            rideRequest.setPassengerCount(request.getPassengerCount());
        }
        if (request.getNotes() != null) {
            rideRequest.setNotes(normalizeOptional(request.getNotes()));
        }
        if (request.getStatus() != null) {
            rideRequest.setStatus(parseRideRequestStatus(request.getStatus()));
        }

        rideRequestRepository.save(rideRequest);
        return toAdminRideRequestItemDto(rideRequest);
    }

    public List<AdminRideRequestOfferItemDto> getRideRequestOffers(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideRequestOfferRepository.findAllWithRequestAndDriver()
                .stream()
                .map(this::toAdminRideRequestOfferItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRideRequestOfferItemDto updateRideRequestOffer(
            String adminSessionHeader,
            Long offerId,
            AdminRideRequestOfferUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        RideRequestOffer offer = rideRequestOfferRepository.findByIdWithRequestAndDriver(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request offer not found"));

        if (request.getProposedSeats() != null) {
            if (request.getProposedSeats() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "proposedSeats must be >= 1");
            }
            if (offer.getDriver().getSpareSeatCapacity() != null
                    && request.getProposedSeats() > offer.getDriver().getSpareSeatCapacity()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "proposedSeats cannot exceed driver spare seat capacity"
                );
            }
            if (offer.getRideRequest().getPassengerCount() != null
                    && request.getProposedSeats() < offer.getRideRequest().getPassengerCount()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "proposedSeats must cover rider passenger count"
                );
            }
            offer.setProposedSeats(request.getProposedSeats());
        }
        if (request.getMeetingPoint() != null) {
            offer.setMeetingPoint(normalizeRequired(request.getMeetingPoint(), "meetingPoint must not be blank"));
        }
        if (request.getStatus() != null) {
            offer.setStatus(parseRideRequestOfferStatus(request.getStatus()));
        }

        rideRequestOfferRepository.save(offer);
        return toAdminRideRequestOfferItemDto(offer);
    }

    public List<AdminJoinRequestItemDto> getJoinRequests(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return joinRequestRepository.findAllWithOfferAndRider()
                .stream()
                .map(this::toAdminJoinRequestItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminJoinRequestItemDto updateJoinRequest(
            String adminSessionHeader,
            Long joinRequestId,
            AdminJoinRequestUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        JoinRequest joinRequest = joinRequestRepository.findByIdWithOfferDriverAndRider(joinRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join request not found"));

        if (request.getRequestedSeats() != null) {
            if (request.getRequestedSeats() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "requestedSeats must be >= 1");
            }
            joinRequest.setRequestedSeats(request.getRequestedSeats());
        }
        if (request.getStatus() != null) {
            joinRequest.setStatus(parseJoinRequestStatus(request.getStatus()));
        }

        joinRequestRepository.save(joinRequest);
        return toAdminJoinRequestItemDto(joinRequest);
    }

    public List<AdminRideMatchItemDto> getRideMatches(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideMatchRepository.findAllWithDetails()
                .stream()
                .map(this::toAdminRideMatchItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRideMatchItemDto updateRideMatch(
            String adminSessionHeader,
            Long rideMatchId,
            AdminRideMatchUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        RideMatch rideMatch = rideMatchRepository.findById(rideMatchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride match not found"));

        if (request.getMeetingPoint() != null) {
            rideMatch.setMeetingPoint(normalizeOptional(request.getMeetingPoint()));
        }
        if (request.getTripStatus() != null) {
            rideMatch.setTripStatus(parseTripStatus(request.getTripStatus()));
        }

        rideMatchRepository.save(rideMatch);
        return toAdminRideMatchItemDto(rideMatch);
    }

    public List<AdminRatingItemDto> getRatings(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return ratingRepository.findAllWithDetails()
                .stream()
                .map(this::toAdminRatingItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRatingItemDto updateRating(
            String adminSessionHeader,
            Long ratingId,
            AdminRatingUpdateRequestDto request
    ) {
        requireAdminSession(adminSessionHeader);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        Rating rating = ratingRepository.findByIdWithDetails(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));
        Profile targetProfile = rating.getProfile();

        if (request.getRaterUserId() != null) {
            User rater = userRepository.findById(request.getRaterUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rater user not found"));
            if (targetProfile.getUser() != null && rater.getId().equals(targetProfile.getUser().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Rater user cannot rate themselves");
            }
            rating.setRaterUser(rater);
        }
        if (request.getScore() != null) {
            if (request.getScore() < 1 || request.getScore() > 5) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "score must be between 1 and 5");
            }
            rating.setScore(request.getScore());
        }
        if (request.getComment() != null) {
            rating.setComment(normalizeOptional(request.getComment()));
        }

        ratingRepository.save(rating);
        refreshProfileAverageRating(targetProfile);
        return toAdminRatingItemDto(rating);
    }

    private AdminUserItemDto toAdminUserItemDto(User user) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        String role = resolveRole(user);

        String driverLicenceVerifiedStatus = null;
        String driverVehicleInfo = null;
        Integer driverSpareSeatCapacity = null;
        String driverLicenceDocumentPath = null;
        String driverSpareSeatProofDocumentPath = null;
        String driverVehicleRegoDocumentPath = null;
        String driverVerificationNotes = null;
        String riderPreferredTravelTimes = null;
        String riderUsualDestinations = null;

        if (user instanceof Driver) {
            Driver driver = (Driver) user;
            driverLicenceVerifiedStatus = driver.getLicenceVerifiedStatus() != null
                    ? driver.getLicenceVerifiedStatus().name()
                    : null;
            driverVehicleInfo = driver.getVehicleInfo();
            driverSpareSeatCapacity = driver.getSpareSeatCapacity();
            driverLicenceDocumentPath = driver.getLicenceDocumentPath();
            driverSpareSeatProofDocumentPath = driver.getSpareSeatProofDocumentPath();
            driverVehicleRegoDocumentPath = driver.getVehicleRegoDocumentPath();
            driverVerificationNotes = driver.getVerificationNotes();
        }
        if (user instanceof Rider) {
            Rider rider = (Rider) user;
            riderPreferredTravelTimes = rider.getPreferredTravelTimes();
            riderUsualDestinations = rider.getUsualDestinations();
        }

        return new AdminUserItemDto(
                user.getId(),
                role,
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getSuburb(),
                user.getAccountStatus() != null ? user.getAccountStatus().name() : null,
                profile != null ? profile.getBio() : null,
                profile != null ? profile.getTravelPreferences() : null,
                profile != null ? profile.getTrustNotes() : null,
                profile != null ? profile.getAverageRating() : null,
                driverLicenceVerifiedStatus,
                driverVehicleInfo,
                driverSpareSeatCapacity,
                driverLicenceDocumentPath,
                driverSpareSeatProofDocumentPath,
                driverVehicleRegoDocumentPath,
                driverVerificationNotes,
                riderPreferredTravelTimes,
                riderUsualDestinations
        );
    }

    private AdminRideOfferItemDto toAdminRideOfferItemDto(RideOffer offer) {
        return new AdminRideOfferItemDto(
                offer.getId(),
                offer.getDriver().getId(),
                offer.getDriver().getFullName(),
                offer.getOrigin(),
                offer.getDestination(),
                offer.getDepartureDate(),
                offer.getDepartureTime(),
                offer.getAvailableSeats(),
                offer.getStatus() != null ? offer.getStatus().name() : null
        );
    }

    private AdminRideRequestItemDto toAdminRideRequestItemDto(RideRequest request) {
        return new AdminRideRequestItemDto(
                request.getId(),
                request.getRider().getId(),
                request.getRider().getFullName(),
                request.getOrigin(),
                request.getDestination(),
                request.getTripDate(),
                request.getTripTime(),
                request.getPassengerCount(),
                request.getNotes(),
                request.getStatus() != null ? request.getStatus().name() : null
        );
    }

    private AdminRideRequestOfferItemDto toAdminRideRequestOfferItemDto(RideRequestOffer offer) {
        return new AdminRideRequestOfferItemDto(
                offer.getId(),
                offer.getRideRequest().getId(),
                offer.getDriver().getId(),
                offer.getDriver().getFullName(),
                offer.getRideRequest().getRider().getId(),
                offer.getRideRequest().getRider().getFullName(),
                offer.getProposedSeats(),
                offer.getMeetingPoint(),
                offer.getStatus() != null ? offer.getStatus().name() : null,
                offer.getCreatedAt()
        );
    }

    private AdminJoinRequestItemDto toAdminJoinRequestItemDto(JoinRequest request) {
        return new AdminJoinRequestItemDto(
                request.getId(),
                request.getRideOffer().getId(),
                request.getRider().getId(),
                request.getRider().getFullName(),
                request.getRequestedSeats(),
                request.getStatus() != null ? request.getStatus().name() : null,
                request.getRequestDateTime()
        );
    }

    private AdminRideMatchItemDto toAdminRideMatchItemDto(RideMatch match) {
        return new AdminRideMatchItemDto(
                match.getId(),
                match.getDriver().getId(),
                match.getDriver().getFullName(),
                match.getRider().getId(),
                match.getRider().getFullName(),
                match.getRideOffer() != null ? match.getRideOffer().getId() : null,
                match.getRideRequest() != null ? match.getRideRequest().getId() : null,
                match.getAcceptedJoinRequest() != null ? match.getAcceptedJoinRequest().getId() : null,
                match.getAcceptedRideRequestOffer() != null ? match.getAcceptedRideRequestOffer().getId() : null,
                match.getMeetingPoint(),
                match.getTripStatus() != null ? match.getTripStatus().name() : null,
                match.getConfirmedDateTime()
        );
    }

    private AdminRatingItemDto toAdminRatingItemDto(Rating rating) {
        return new AdminRatingItemDto(
                rating.getId(),
                rating.getProfile().getUser().getId(),
                rating.getProfile().getUser().getFullName(),
                rating.getRaterUser().getId(),
                rating.getRaterUser().getFullName(),
                rating.getScore(),
                rating.getComment(),
                rating.getCreatedDate()
        );
    }

    private void requireAdminSession(String adminSessionHeader) {
        String normalized = normalizeOptional(adminSessionHeader);
        if (!Objects.equals(adminSessionKey, normalized)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin session is invalid");
        }
    }

    private String resolveRole(User user) {
        if (user instanceof Driver) {
            return "DRIVER";
        }
        if (user instanceof Rider) {
            return "RIDER";
        }
        return "USER";
    }

    private boolean hasDriverFieldUpdate(AdminUserUpdateRequestDto request) {
        return request.getDriverLicenceVerifiedStatus() != null
                || request.getDriverVehicleInfo() != null
                || request.getDriverSpareSeatCapacity() != null
                || request.getDriverVerificationNotes() != null;
    }

    private boolean hasRiderFieldUpdate(AdminUserUpdateRequestDto request) {
        return request.getRiderPreferredTravelTimes() != null
                || request.getRiderUsualDestinations() != null;
    }

    private AccountStatus parseAccountStatus(String value) {
        String normalized = normalizeRequired(value, "accountStatus is required").toUpperCase(Locale.ROOT);
        try {
            return AccountStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "accountStatus must be ACTIVE, INACTIVE, or SUSPENDED"
            );
        }
    }

    private VerificationStatus parseVerificationStatus(String value) {
        String normalized = normalizeRequired(value, "driverLicenceVerifiedStatus is required").toUpperCase(Locale.ROOT);
        try {
            return VerificationStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "driverLicenceVerifiedStatus must be PENDING, VERIFIED, or REJECTED"
            );
        }
    }

    private RideOfferStatus parseRideOfferStatus(String value) {
        String normalized = normalizeRequired(value, "status is required").toUpperCase(Locale.ROOT);
        try {
            return RideOfferStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be OPEN or CLOSED");
        }
    }

    private RideRequestStatus parseRideRequestStatus(String value) {
        String normalized = normalizeRequired(value, "status is required").toUpperCase(Locale.ROOT);
        try {
            return RideRequestStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be OPEN, CLOSED, or MATCHED");
        }
    }

    private RideRequestOfferStatus parseRideRequestOfferStatus(String value) {
        String normalized = normalizeRequired(value, "status is required").toUpperCase(Locale.ROOT);
        try {
            return RideRequestOfferStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be PENDING, ACCEPTED, or REJECTED");
        }
    }

    private JoinRequestStatus parseJoinRequestStatus(String value) {
        String normalized = normalizeRequired(value, "status is required").toUpperCase(Locale.ROOT);
        try {
            return JoinRequestStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be PENDING, ACCEPTED, or REJECTED");
        }
    }

    private TripStatus parseTripStatus(String value) {
        String normalized = normalizeRequired(value, "tripStatus is required").toUpperCase(Locale.ROOT);
        try {
            return TripStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripStatus must be CONFIRMED, COMPLETED, or CANCELLED");
        }
    }

    private LocalDate parseDate(String value, String errorMessage) {
        String normalized = normalizeRequired(value, errorMessage);
        try {
            return LocalDate.parse(normalized);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
    }

    private String parseTime(String value, String errorMessage) {
        String normalized = normalizeRequired(value, errorMessage);
        if (!normalized.matches("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return normalized;
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }

    private void refreshProfileAverageRating(Profile profile) {
        if (profile == null || profile.getId() == null) {
            return;
        }
        Double average = ratingRepository.findAverageScoreByProfileId(profile.getId());
        profile.setAverageRating(average);
        profileRepository.save(profile);
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
