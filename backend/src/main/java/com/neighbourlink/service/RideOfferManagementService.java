package com.neighbourlink.service;

import com.neighbourlink.dto.DriverRideOfferItemDto;
import com.neighbourlink.dto.RideOfferCreateRequestDto;
import com.neighbourlink.dto.RideOfferCreatedResponseDto;
import com.neighbourlink.entity.AccountStatus;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import com.neighbourlink.entity.VerificationStatus;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.RideOfferRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RideOfferManagementService {

    private final RideOfferRepository rideOfferRepository;
    private final DriverRepository driverRepository;

    public RideOfferManagementService(
            RideOfferRepository rideOfferRepository,
            DriverRepository driverRepository
    ) {
        this.rideOfferRepository = rideOfferRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional
    public RideOfferCreatedResponseDto createRideOffer(RideOfferCreateRequestDto request) {
        validateCreateRequest(request);

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        validateDriverEligibility(driver, request.getAvailableSeats());

        RideOffer offer = new RideOffer();
        offer.setDriver(driver);

        String origin = normalizeRequired(request.getOrigin(), "origin is required");
        String destination = normalizeRequired(request.getDestination(), "destination is required");
        String departureTime = normalizeRequired(request.getDepartureTime(), "departureTime is required");
        if (!departureTime.matches("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departureTime must be HH:mm");
        }

        LocalDate departureDate;
        try {
            departureDate = LocalDate.parse(normalizeRequired(request.getDepartureDate(), "departureDate is required"));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departureDate must be yyyy-MM-dd");
        }

        offer.setOrigin(origin);
        offer.setOriginAddress(normalizeOptional(request.getOriginAddress()) != null
                ? normalizeOptional(request.getOriginAddress())
                : origin);
        offer.setOriginState(normalizeOptional(request.getOriginState()));
        offer.setOriginSuburb(normalizeOptional(request.getOriginSuburb()) != null
                ? normalizeOptional(request.getOriginSuburb())
                : origin);
        offer.setOriginPostcode(normalizeOptional(request.getOriginPostcode()));
        offer.setOriginLatitude(request.getOriginLatitude());
        offer.setOriginLongitude(request.getOriginLongitude());

        offer.setDestination(destination);
        offer.setDestinationAddress(normalizeOptional(request.getDestinationAddress()) != null
                ? normalizeOptional(request.getDestinationAddress())
                : destination);
        offer.setDestinationState(normalizeOptional(request.getDestinationState()));
        offer.setDestinationSuburb(normalizeOptional(request.getDestinationSuburb()) != null
                ? normalizeOptional(request.getDestinationSuburb())
                : destination);
        offer.setDestinationPostcode(normalizeOptional(request.getDestinationPostcode()));
        offer.setDestinationLatitude(request.getDestinationLatitude());
        offer.setDestinationLongitude(request.getDestinationLongitude());

        offer.setDepartureDate(departureDate);
        offer.setDepartureTime(departureTime);
        offer.setAvailableSeats(request.getAvailableSeats());
        offer.setStatus(RideOfferStatus.OPEN);

        RideOffer saved = rideOfferRepository.save(offer);
        return new RideOfferCreatedResponseDto(saved.getId(), saved.getStatus().name());
    }

    public List<DriverRideOfferItemDto> getRideOffersByDriver(Long driverId) {
        if (driverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        if (!driverRepository.existsById(driverId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found");
        }

        return rideOfferRepository.findByDriverIdWithDriverOrderByRecent(driverId).stream()
                .map(offer -> new DriverRideOfferItemDto(
                        offer.getId(),
                        offer.getOrigin(),
                        offer.getOriginAddress(),
                        offer.getDestination(),
                        offer.getDestinationAddress(),
                        offer.getDepartureDate(),
                        offer.getDepartureTime(),
                        offer.getAvailableSeats(),
                        offer.getStatus().name()
                ))
                .collect(Collectors.toList());
    }

    private void validateCreateRequest(RideOfferCreateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getDriverId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        if (request.getAvailableSeats() == null || request.getAvailableSeats() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availableSeats must be >= 1");
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
    }

    private void validateDriverEligibility(Driver driver, Integer availableSeats) {
        if (driver.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver account is not active");
        }
        if (driver.getLicenceVerifiedStatus() != VerificationStatus.VERIFIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver licence is not verified");
        }
        if (driver.getSpareSeatCapacity() == null || availableSeats == null || availableSeats > driver.getSpareSeatCapacity()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "availableSeats cannot exceed driver spare seat capacity"
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
