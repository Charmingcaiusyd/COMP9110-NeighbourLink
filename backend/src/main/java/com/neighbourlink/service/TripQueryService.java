package com.neighbourlink.service;

import com.neighbourlink.dto.TripItemDto;
import com.neighbourlink.entity.RideMatch;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideRequest;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.RideMatchRepository;
import com.neighbourlink.repository.RiderRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TripQueryService {

    private final RideMatchRepository rideMatchRepository;
    private final RiderRepository riderRepository;
    private final DriverRepository driverRepository;

    public TripQueryService(
            RideMatchRepository rideMatchRepository,
            RiderRepository riderRepository,
            DriverRepository driverRepository
    ) {
        this.rideMatchRepository = rideMatchRepository;
        this.riderRepository = riderRepository;
        this.driverRepository = driverRepository;
    }

    public List<TripItemDto> getTripsForRider(Long riderId) {
        if (riderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (!riderRepository.existsById(riderId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider not found");
        }
        return rideMatchRepository.findByRiderIdWithDetails(riderId).stream()
                .map(this::toTripDto)
                .collect(Collectors.toList());
    }

    public List<TripItemDto> getTripsForDriver(Long driverId) {
        if (driverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        if (!driverRepository.existsById(driverId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found");
        }
        return rideMatchRepository.findByDriverIdWithDetails(driverId).stream()
                .map(this::toTripDto)
                .collect(Collectors.toList());
    }

    private TripItemDto toTripDto(RideMatch rideMatch) {
        String tripType;
        String origin;
        String destination;
        String tripDate;
        String tripTime;

        RideOffer rideOffer = rideMatch.getRideOffer();
        RideRequest rideRequest = rideMatch.getRideRequest();
        if (rideOffer != null) {
            tripType = "JOIN_REQUEST";
            origin = rideOffer.getOrigin();
            destination = rideOffer.getDestination();
            tripDate = rideOffer.getDepartureDate() == null ? null : rideOffer.getDepartureDate().toString();
            tripTime = rideOffer.getDepartureTime();
        } else if (rideRequest != null) {
            tripType = "ONE_OFF_REQUEST";
            origin = rideRequest.getOrigin();
            destination = rideRequest.getDestination();
            tripDate = rideRequest.getTripDate() == null ? null : rideRequest.getTripDate().toString();
            tripTime = rideRequest.getTripTime();
        } else {
            tripType = "UNKNOWN";
            origin = null;
            destination = null;
            tripDate = null;
            tripTime = null;
        }

        return new TripItemDto(
                rideMatch.getId(),
                tripType,
                rideMatch.getDriver().getId(),
                rideMatch.getDriver().getFullName(),
                rideMatch.getRider().getId(),
                rideMatch.getRider().getFullName(),
                origin,
                destination,
                tripDate,
                tripTime,
                rideMatch.getMeetingPoint(),
                rideMatch.getTripStatus().name(),
                rideMatch.getConfirmedDateTime()
        );
    }
}
