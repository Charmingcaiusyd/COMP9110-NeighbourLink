package com.neighbourlink.service;

import com.neighbourlink.dto.JoinRequestCreateRequestDto;
import com.neighbourlink.dto.JoinRequestCreatedResponseDto;
import com.neighbourlink.dto.JoinRequestDecisionResponseDto;
import com.neighbourlink.dto.PendingJoinRequestItemDto;
import com.neighbourlink.entity.JoinRequest;
import com.neighbourlink.entity.JoinRequestStatus;
import com.neighbourlink.entity.RideMatch;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import com.neighbourlink.entity.Rider;
import com.neighbourlink.entity.TripStatus;
import com.neighbourlink.repository.JoinRequestRepository;
import com.neighbourlink.repository.RideMatchRepository;
import com.neighbourlink.repository.RideOfferRepository;
import com.neighbourlink.repository.RiderRepository;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final RideOfferRepository rideOfferRepository;
    private final RiderRepository riderRepository;
    private final RideMatchRepository rideMatchRepository;

    public JoinRequestService(
            JoinRequestRepository joinRequestRepository,
            RideOfferRepository rideOfferRepository,
            RiderRepository riderRepository,
            RideMatchRepository rideMatchRepository
    ) {
        this.joinRequestRepository = joinRequestRepository;
        this.rideOfferRepository = rideOfferRepository;
        this.riderRepository = riderRepository;
        this.rideMatchRepository = rideMatchRepository;
    }

    @Transactional
    public JoinRequestCreatedResponseDto submitJoinRequest(JoinRequestCreateRequestDto request) {
        validateCreateRequest(request);

        Rider rider = riderRepository.findById(request.getRiderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider not found"));
        RideOffer offer = rideOfferRepository.findById(request.getRideOfferId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride offer not found"));

        validateOfferOpen(offer);
        validateSeats(offer.getAvailableSeats(), request.getRequestedSeats());

        JoinRequest joinRequest = new JoinRequest();
        joinRequest.setRider(rider);
        joinRequest.setRideOffer(offer);
        joinRequest.setRequestedSeats(request.getRequestedSeats());
        joinRequest.setStatus(JoinRequestStatus.PENDING);

        JoinRequest saved = joinRequestRepository.save(joinRequest);
        return new JoinRequestCreatedResponseDto(
                saved.getId(),
                offer.getId(),
                rider.getId(),
                saved.getRequestedSeats(),
                saved.getStatus().name()
        );
    }

    public List<PendingJoinRequestItemDto> getPendingByDriver(Long driverId) {
        if (driverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }

        return joinRequestRepository.findPendingByDriverId(driverId, JoinRequestStatus.PENDING).stream()
                .map(joinRequest -> new PendingJoinRequestItemDto(
                        joinRequest.getId(),
                        joinRequest.getRideOffer().getId(),
                        joinRequest.getRider().getId(),
                        joinRequest.getRider().getFullName(),
                        joinRequest.getRequestedSeats(),
                        joinRequest.getRequestDateTime(),
                        joinRequest.getRideOffer().getOrigin(),
                        joinRequest.getRideOffer().getDestination(),
                        joinRequest.getRideOffer().getDepartureDate(),
                        joinRequest.getRideOffer().getDepartureTime(),
                        joinRequest.getRideOffer().getAvailableSeats()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public JoinRequestDecisionResponseDto decideJoinRequest(Long driverId, Long joinRequestId, String decision, String meetingPoint) {
        Decision parsedDecision = parseDecision(decision);
        String normalizedMeetingPoint = parsedDecision == Decision.ACCEPTED
                ? normalizeRequired(meetingPoint, "meetingPoint is required when decision is ACCEPTED")
                : null;
        JoinRequest joinRequest = joinRequestRepository.findByIdWithOfferDriverAndRider(joinRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join request not found"));

        validateDriverOwnership(driverId, joinRequest);
        validatePending(joinRequest);

        RideOffer offer = joinRequest.getRideOffer();
        if (parsedDecision == Decision.REJECTED) {
            joinRequest.setStatus(JoinRequestStatus.REJECTED);
            joinRequestRepository.save(joinRequest);
            return new JoinRequestDecisionResponseDto(
                    joinRequest.getId(),
                    joinRequest.getStatus().name(),
                    null,
                    offer.getAvailableSeats()
            );
        }

        validateOfferOpen(offer);
        validateSeats(offer.getAvailableSeats(), joinRequest.getRequestedSeats());

        int updatedSeats = offer.getAvailableSeats() - joinRequest.getRequestedSeats();
        offer.setAvailableSeats(updatedSeats);
        if (updatedSeats == 0) {
            offer.setStatus(RideOfferStatus.CLOSED);
        }

        joinRequest.setStatus(JoinRequestStatus.ACCEPTED);

        RideMatch rideMatch = new RideMatch();
        rideMatch.setDriver(offer.getDriver());
        rideMatch.setRider(joinRequest.getRider());
        rideMatch.setRideOffer(offer);
        rideMatch.setTripStatus(TripStatus.CONFIRMED);
        rideMatch.setMeetingPoint(normalizedMeetingPoint);
        RideMatch savedMatch = rideMatchRepository.save(rideMatch);

        rideOfferRepository.save(offer);
        joinRequestRepository.save(joinRequest);

        return new JoinRequestDecisionResponseDto(
                joinRequest.getId(),
                joinRequest.getStatus().name(),
                savedMatch.getId(),
                offer.getAvailableSeats()
        );
    }

    private void validateCreateRequest(JoinRequestCreateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getRiderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riderId is required");
        }
        if (request.getRideOfferId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rideOfferId is required");
        }
        if (request.getRequestedSeats() == null || request.getRequestedSeats() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "requestedSeats must be >= 1");
        }
    }

    private void validateOfferOpen(RideOffer offer) {
        if (offer.getStatus() != RideOfferStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride offer is not open");
        }
    }

    private void validateSeats(Integer availableSeats, Integer requestedSeats) {
        if (availableSeats == null || requestedSeats == null || requestedSeats > availableSeats) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Requested seats exceed available seats");
        }
    }

    private void validateDriverOwnership(Long driverId, JoinRequest joinRequest) {
        if (driverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        Long offerDriverId = joinRequest.getRideOffer().getDriver().getId();
        if (!driverId.equals(offerDriverId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Driver cannot decide this join request");
        }
    }

    private void validatePending(JoinRequest joinRequest) {
        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Join request already decided");
        }
    }

    private Decision parseDecision(String decision) {
        if (decision == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "decision is required");
        }

        String value = decision.trim().toUpperCase(Locale.ROOT);
        if ("ACCEPT".equals(value) || "ACCEPTED".equals(value)) {
            return Decision.ACCEPTED;
        }
        if ("REJECT".equals(value) || "REJECTED".equals(value)) {
            return Decision.REJECTED;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "decision must be ACCEPTED or REJECTED");
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

    private enum Decision {
        ACCEPTED,
        REJECTED
    }
}
