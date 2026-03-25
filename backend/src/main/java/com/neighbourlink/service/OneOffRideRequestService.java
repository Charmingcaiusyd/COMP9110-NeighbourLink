package com.neighbourlink.service;

import com.neighbourlink.dto.OpenRideRequestItemDto;
import com.neighbourlink.dto.DriverRideRequestOfferHistoryItemDto;
import com.neighbourlink.dto.DriverTrustSummaryDto;
import com.neighbourlink.dto.RiderRideRequestHistoryItemDto;
import com.neighbourlink.dto.RideRequestCreateRequestDto;
import com.neighbourlink.dto.RideRequestCreatedResponseDto;
import com.neighbourlink.dto.RideRequestOfferAcceptResponseDto;
import com.neighbourlink.dto.RideRequestOfferCreateRequestDto;
import com.neighbourlink.dto.RideRequestOfferForRiderItemDto;
import com.neighbourlink.dto.RideRequestOfferResponseDto;
import com.neighbourlink.entity.AccountStatus;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.RideMatch;
import com.neighbourlink.entity.RideRequest;
import com.neighbourlink.entity.RideRequestOffer;
import com.neighbourlink.entity.RideRequestOfferStatus;
import com.neighbourlink.entity.RideRequestStatus;
import com.neighbourlink.entity.Rider;
import com.neighbourlink.entity.TripStatus;
import com.neighbourlink.entity.VerificationStatus;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.RideMatchRepository;
import com.neighbourlink.repository.RideRequestOfferRepository;
import com.neighbourlink.repository.RideRequestRepository;
import com.neighbourlink.repository.RiderRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OneOffRideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final RiderRepository riderRepository;
    private final DriverRepository driverRepository;
    private final RideRequestOfferRepository rideRequestOfferRepository;
    private final RideMatchRepository rideMatchRepository;
    private final RatingRepository ratingRepository;

    public OneOffRideRequestService(
            RideRequestRepository rideRequestRepository,
            RiderRepository riderRepository,
            DriverRepository driverRepository,
            RideRequestOfferRepository rideRequestOfferRepository,
            RideMatchRepository rideMatchRepository,
            RatingRepository ratingRepository
    ) {
        this.rideRequestRepository = rideRequestRepository;
        this.riderRepository = riderRepository;
        this.driverRepository = driverRepository;
        this.rideRequestOfferRepository = rideRequestOfferRepository;
        this.rideMatchRepository = rideMatchRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional
    public RideRequestCreatedResponseDto createRideRequest(RideRequestCreateRequestDto request) {
        validateCreateRequest(request);

        Rider rider = riderRepository.findById(request.getRiderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider not found"));

        RideRequest rideRequest = new RideRequest();
        rideRequest.setRider(rider);
        rideRequest.setOrigin(request.getOrigin().trim());
        rideRequest.setOriginAddress(normalizeOptional(request.getOriginAddress()) != null
                ? normalizeOptional(request.getOriginAddress())
                : request.getOrigin().trim());
        rideRequest.setOriginState(normalizeOptional(request.getOriginState()));
        rideRequest.setOriginSuburb(normalizeOptional(request.getOriginSuburb()));
        rideRequest.setOriginPostcode(normalizeOptional(request.getOriginPostcode()));
        rideRequest.setOriginLatitude(request.getOriginLatitude());
        rideRequest.setOriginLongitude(request.getOriginLongitude());
        rideRequest.setDestination(request.getDestination().trim());
        rideRequest.setDestinationAddress(normalizeOptional(request.getDestinationAddress()) != null
                ? normalizeOptional(request.getDestinationAddress())
                : request.getDestination().trim());
        rideRequest.setDestinationState(normalizeOptional(request.getDestinationState()));
        rideRequest.setDestinationSuburb(normalizeOptional(request.getDestinationSuburb()));
        rideRequest.setDestinationPostcode(normalizeOptional(request.getDestinationPostcode()));
        rideRequest.setDestinationLatitude(request.getDestinationLatitude());
        rideRequest.setDestinationLongitude(request.getDestinationLongitude());
        rideRequest.setTripDate(LocalDate.parse(request.getTripDate()));
        rideRequest.setTripTime(request.getTripTime().trim());
        rideRequest.setPassengerCount(request.getPassengerCount());
        rideRequest.setNotes(normalizeOptional(request.getNotes()));
        rideRequest.setStatus(RideRequestStatus.OPEN);

        RideRequest saved = rideRequestRepository.save(rideRequest);
        return new RideRequestCreatedResponseDto(saved.getId(), saved.getStatus().name());
    }

    public List<OpenRideRequestItemDto> listOpenRideRequests() {
        return rideRequestRepository.findByStatusWithRider(RideRequestStatus.OPEN).stream()
                .map(rideRequest -> new OpenRideRequestItemDto(
                        rideRequest.getId(),
                        rideRequest.getRider().getId(),
                        rideRequest.getRider().getFullName(),
                        rideRequest.getOrigin(),
                        rideRequest.getOriginAddress(),
                        rideRequest.getOriginState(),
                        rideRequest.getOriginSuburb(),
                        rideRequest.getOriginPostcode(),
                        rideRequest.getOriginLatitude(),
                        rideRequest.getOriginLongitude(),
                        rideRequest.getDestination(),
                        rideRequest.getDestinationAddress(),
                        rideRequest.getDestinationState(),
                        rideRequest.getDestinationSuburb(),
                        rideRequest.getDestinationPostcode(),
                        rideRequest.getDestinationLatitude(),
                        rideRequest.getDestinationLongitude(),
                        rideRequest.getTripDate().toString(),
                        rideRequest.getTripTime(),
                        rideRequest.getPassengerCount(),
                        rideRequest.getNotes()
                ))
                .collect(Collectors.toList());
    }

    public List<RideRequestOfferForRiderItemDto> listOffersForRiderRequest(Long riderId, Long rideRequestId) {
        if (riderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (rideRequestId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rideRequestId is required");
        }

        RideRequest rideRequest = rideRequestRepository.findByIdWithRider(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request not found"));
        if (!riderId.equals(rideRequest.getRider().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rider cannot view offers for this request");
        }

        return rideRequestOfferRepository.findByRideRequestIdWithDriver(rideRequestId).stream()
                .map(offer -> new RideRequestOfferForRiderItemDto(
                        offer.getId(),
                        offer.getDriver().getId(),
                        offer.getDriver().getFullName(),
                        offer.getProposedSeats(),
                        offer.getMeetingPoint(),
                        offer.getStatus().name(),
                        offer.getCreatedAt(),
                        buildDriverTrustSummary(offer.getDriver())
                ))
                .collect(Collectors.toList());
    }

    public List<DriverRideRequestOfferHistoryItemDto> listOfferHistoryForDriver(Long driverId) {
        if (driverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        if (!driverRepository.existsById(driverId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found");
        }

        return rideRequestOfferRepository.findByDriverIdWithRequestAndRider(driverId).stream()
                .map(offer -> new DriverRideRequestOfferHistoryItemDto(
                        offer.getId(),
                        offer.getRideRequest().getId(),
                        offer.getRideRequest().getRider().getId(),
                        offer.getRideRequest().getRider().getFullName(),
                        offer.getRideRequest().getOrigin(),
                        offer.getRideRequest().getOriginAddress(),
                        offer.getRideRequest().getOriginState(),
                        offer.getRideRequest().getOriginSuburb(),
                        offer.getRideRequest().getOriginPostcode(),
                        offer.getRideRequest().getOriginLatitude(),
                        offer.getRideRequest().getOriginLongitude(),
                        offer.getRideRequest().getDestination(),
                        offer.getRideRequest().getDestinationAddress(),
                        offer.getRideRequest().getDestinationState(),
                        offer.getRideRequest().getDestinationSuburb(),
                        offer.getRideRequest().getDestinationPostcode(),
                        offer.getRideRequest().getDestinationLatitude(),
                        offer.getRideRequest().getDestinationLongitude(),
                        offer.getRideRequest().getTripDate().toString(),
                        offer.getRideRequest().getTripTime(),
                        offer.getRideRequest().getPassengerCount(),
                        offer.getProposedSeats(),
                        offer.getMeetingPoint(),
                        offer.getStatus().name(),
                        offer.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<RiderRideRequestHistoryItemDto> listRequestHistoryForRider(Long riderId) {
        if (riderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (!riderRepository.existsById(riderId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider not found");
        }

        return rideRequestRepository.findByRiderId(riderId).stream()
                .map(request -> new RiderRideRequestHistoryItemDto(
                        request.getId(),
                        request.getOrigin(),
                        request.getOriginAddress(),
                        request.getOriginState(),
                        request.getOriginSuburb(),
                        request.getOriginPostcode(),
                        request.getOriginLatitude(),
                        request.getOriginLongitude(),
                        request.getDestination(),
                        request.getDestinationAddress(),
                        request.getDestinationState(),
                        request.getDestinationSuburb(),
                        request.getDestinationPostcode(),
                        request.getDestinationLatitude(),
                        request.getDestinationLongitude(),
                        request.getTripDate() == null ? null : request.getTripDate().toString(),
                        request.getTripTime(),
                        request.getPassengerCount(),
                        request.getNotes(),
                        request.getStatus().name(),
                        rideRequestOfferRepository.countByRideRequestId(request.getId()),
                        rideRequestOfferRepository.countByRideRequestIdAndStatus(request.getId(), RideRequestOfferStatus.PENDING)
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public RideRequestOfferResponseDto driverRespondToRideRequest(Long rideRequestId, RideRequestOfferCreateRequestDto request) {
        validateOfferCreateRequest(request);

        RideRequest rideRequest = rideRequestRepository.findByIdWithRider(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request not found"));
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        validateRideRequestOpen(rideRequest);
        validateDriverEligibility(driver, request.getProposedSeats());
        if (request.getProposedSeats() < rideRequest.getPassengerCount()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Proposed seats must cover passenger count");
        }
        if (rideRequestOfferRepository.existsByRideRequestIdAndDriverIdAndStatus(
                rideRequestId,
                driver.getId(),
                RideRequestOfferStatus.PENDING
        )) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver already has a pending offer for this request");
        }

        RideRequestOffer offer = new RideRequestOffer();
        offer.setRideRequest(rideRequest);
        offer.setDriver(driver);
        offer.setProposedSeats(request.getProposedSeats());
        offer.setMeetingPoint(normalizeRequired(request.getMeetingPoint(), "meetingPoint is required"));
        offer.setStatus(RideRequestOfferStatus.PENDING);

        RideRequestOffer saved = rideRequestOfferRepository.save(offer);
        return new RideRequestOfferResponseDto(
                saved.getId(),
                rideRequest.getId(),
                driver.getId(),
                saved.getProposedSeats(),
                saved.getMeetingPoint(),
                saved.getStatus().name()
        );
    }

    @Transactional
    public RideRequestOfferAcceptResponseDto riderAcceptDriverOffer(Long riderId, Long rideRequestId, Long offerId) {
        if (riderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (rideRequestId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rideRequestId is required");
        }
        if (offerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "offerId is required");
        }

        RideRequest rideRequest = rideRequestRepository.findByIdWithRider(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request not found"));
        RideRequestOffer selectedOffer = rideRequestOfferRepository.findByIdWithRequestAndDriver(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver offer not found"));

        if (!rideRequestId.equals(selectedOffer.getRideRequest().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer does not belong to this ride request");
        }
        if (!riderId.equals(rideRequest.getRider().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rider cannot accept offers for this request");
        }
        validateRideRequestOpen(rideRequest);
        if (selectedOffer.getStatus() != RideRequestOfferStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected offer is not pending");
        }
        if (rideMatchRepository.existsByRideRequestId(rideRequestId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride request already has a final match");
        }

        RideMatch rideMatch = new RideMatch();
        rideMatch.setDriver(selectedOffer.getDriver());
        rideMatch.setRider(rideRequest.getRider());
        rideMatch.setRideRequest(rideRequest);
        rideMatch.setAcceptedRideRequestOffer(selectedOffer);
        rideMatch.setMeetingPoint(selectedOffer.getMeetingPoint());
        rideMatch.setTripStatus(TripStatus.CONFIRMED);
        RideMatch savedMatch = rideMatchRepository.save(rideMatch);

        selectedOffer.setStatus(RideRequestOfferStatus.ACCEPTED);
        rideRequestOfferRepository.save(selectedOffer);

        List<RideRequestOffer> pendingOffers = rideRequestOfferRepository.findByRideRequestIdAndStatus(
                rideRequestId,
                RideRequestOfferStatus.PENDING
        );
        for (RideRequestOffer offer : pendingOffers) {
            if (!offer.getId().equals(selectedOffer.getId())) {
                offer.setStatus(RideRequestOfferStatus.REJECTED);
                rideRequestOfferRepository.save(offer);
            }
        }

        rideRequest.setStatus(RideRequestStatus.MATCHED);
        rideRequestRepository.save(rideRequest);

        return new RideRequestOfferAcceptResponseDto(
                rideRequest.getId(),
                selectedOffer.getId(),
                savedMatch.getId(),
                rideRequest.getStatus().name()
        );
    }

    @Transactional
    public RideRequestCreatedResponseDto riderCancelRideRequest(Long riderId, Long rideRequestId) {
        if (riderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (rideRequestId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rideRequestId is required");
        }

        RideRequest rideRequest = rideRequestRepository.findByIdWithRider(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride request not found"));
        if (!riderId.equals(rideRequest.getRider().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rider cannot cancel this request");
        }
        if (rideRequest.getStatus() == RideRequestStatus.MATCHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Matched ride request cannot be cancelled");
        }
        if (rideRequest.getStatus() == RideRequestStatus.CLOSED) {
            return new RideRequestCreatedResponseDto(rideRequest.getId(), rideRequest.getStatus().name());
        }
        if (rideRequest.getStatus() != RideRequestStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride request is not open");
        }

        rideRequest.setStatus(RideRequestStatus.CLOSED);
        rideRequestRepository.save(rideRequest);

        List<RideRequestOffer> pendingOffers = rideRequestOfferRepository.findByRideRequestIdAndStatus(
                rideRequestId,
                RideRequestOfferStatus.PENDING
        );
        for (RideRequestOffer offer : pendingOffers) {
            offer.setStatus(RideRequestOfferStatus.REJECTED);
            rideRequestOfferRepository.save(offer);
        }

        return new RideRequestCreatedResponseDto(rideRequest.getId(), rideRequest.getStatus().name());
    }

    private void validateCreateRequest(RideRequestCreateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getRiderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (isBlank(request.getOrigin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "origin is required");
        }
        if (isBlank(request.getDestination())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "destination is required");
        }
        if (isBlank(request.getTripDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripDate is required");
        }
        if (isBlank(request.getTripTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripTime is required");
        }
        if (!request.getTripTime().matches("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripTime must be HH:mm");
        }
        if (request.getPassengerCount() == null || request.getPassengerCount() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "passengerCount must be >= 1");
        }
        validateCoordinatePair(
                request.getOriginLatitude(),
                request.getOriginLongitude(),
                "originLatitude and originLongitude must both be provided together"
        );
        validateCoordinatePair(
                request.getDestinationLatitude(),
                request.getDestinationLongitude(),
                "destinationLatitude and destinationLongitude must both be provided together"
        );
        try {
            LocalDate.parse(request.getTripDate().trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripDate must be yyyy-MM-dd");
        }
    }

    private void validateOfferCreateRequest(RideRequestOfferCreateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getDriverId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        if (request.getProposedSeats() == null || request.getProposedSeats() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "proposedSeats must be >= 1");
        }
        if (isBlank(request.getMeetingPoint())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "meetingPoint is required");
        }
    }

    private void validateRideRequestOpen(RideRequest rideRequest) {
        if (rideRequest.getStatus() != RideRequestStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride request is not open");
        }
    }

    private void validateDriverEligibility(Driver driver, Integer proposedSeats) {
        if (driver.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver account is not active");
        }
        if (driver.getLicenceVerifiedStatus() != VerificationStatus.VERIFIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver licence is not verified");
        }
        if (driver.getSpareSeatCapacity() == null || proposedSeats == null || driver.getSpareSeatCapacity() < proposedSeats) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Driver spare seat capacity cannot satisfy proposedSeats"
            );
        }
    }

    private DriverTrustSummaryDto buildDriverTrustSummary(Driver driver) {
        Profile profile = driver.getProfile();
        Double averageRating = null;
        Long ratingCount = 0L;
        String bio = null;
        String travelPreferences = null;
        String trustNotes = null;

        if (profile != null) {
            Long profileId = profile.getId();
            if (profileId != null) {
                ratingCount = ratingRepository.countByProfileId(profileId);
                Double dbAverage = ratingRepository.findAverageScoreByProfileId(profileId);
                averageRating = dbAverage != null ? dbAverage : profile.getAverageRating();
            } else {
                averageRating = profile.getAverageRating();
            }
            bio = profile.getBio();
            travelPreferences = profile.getTravelPreferences();
            trustNotes = profile.getTrustNotes();
        }

        return new DriverTrustSummaryDto(
                driver.getId(),
                driver.getFullName(),
                averageRating,
                ratingCount,
                bio,
                travelPreferences,
                trustNotes
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private void validateCoordinatePair(Double latitude, Double longitude, String message) {
        if ((latitude == null && longitude != null) || (latitude != null && longitude == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        if (latitude != null && (latitude < -90 || latitude > 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "latitude must be between -90 and 90");
        }
        if (longitude != null && (longitude < -180 || longitude > 180)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "longitude must be between -180 and 180");
        }
    }
}
