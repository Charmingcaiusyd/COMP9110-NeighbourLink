package com.neighbourlink.service;

import com.neighbourlink.dto.AdminJoinRequestItemDto;
import com.neighbourlink.dto.AdminOverviewDto;
import com.neighbourlink.dto.AdminRideMatchItemDto;
import com.neighbourlink.dto.AdminRideOfferItemDto;
import com.neighbourlink.dto.AdminRideRequestItemDto;
import com.neighbourlink.dto.AdminUserItemDto;
import com.neighbourlink.dto.AdminUserUpdateRequestDto;
import com.neighbourlink.entity.AccountStatus;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.JoinRequest;
import com.neighbourlink.entity.JoinRequestStatus;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.RideMatch;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import com.neighbourlink.entity.RideRequest;
import com.neighbourlink.entity.RideRequestStatus;
import com.neighbourlink.entity.Rider;
import com.neighbourlink.entity.User;
import com.neighbourlink.entity.VerificationStatus;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.JoinRequestRepository;
import com.neighbourlink.repository.ProfileRepository;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.RideMatchRepository;
import com.neighbourlink.repository.RideOfferRepository;
import com.neighbourlink.repository.RideRequestRepository;
import com.neighbourlink.repository.RiderRepository;
import com.neighbourlink.repository.UserRepository;
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

    public List<AdminRideRequestItemDto> getRideRequests(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideRequestRepository.findAllWithRiderOrderByRecent()
                .stream()
                .map(this::toAdminRideRequestItemDto)
                .collect(Collectors.toList());
    }

    public List<AdminJoinRequestItemDto> getJoinRequests(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return joinRequestRepository.findAllWithOfferAndRider()
                .stream()
                .map(this::toAdminJoinRequestItemDto)
                .collect(Collectors.toList());
    }

    public List<AdminRideMatchItemDto> getRideMatches(String adminSessionHeader) {
        requireAdminSession(adminSessionHeader);
        return rideMatchRepository.findAllWithDetails()
                .stream()
                .map(this::toAdminRideMatchItemDto)
                .collect(Collectors.toList());
    }

    private AdminUserItemDto toAdminUserItemDto(User user) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        String role = resolveRole(user);

        String driverLicenceVerifiedStatus = null;
        String driverVehicleInfo = null;
        Integer driverSpareSeatCapacity = null;
        String riderPreferredTravelTimes = null;
        String riderUsualDestinations = null;

        if (user instanceof Driver) {
            Driver driver = (Driver) user;
            driverLicenceVerifiedStatus = driver.getLicenceVerifiedStatus() != null
                    ? driver.getLicenceVerifiedStatus().name()
                    : null;
            driverVehicleInfo = driver.getVehicleInfo();
            driverSpareSeatCapacity = driver.getSpareSeatCapacity();
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
                request.getStatus() != null ? request.getStatus().name() : null
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
                match.getMeetingPoint(),
                match.getTripStatus() != null ? match.getTripStatus().name() : null,
                match.getConfirmedDateTime()
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
                || request.getDriverSpareSeatCapacity() != null;
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
