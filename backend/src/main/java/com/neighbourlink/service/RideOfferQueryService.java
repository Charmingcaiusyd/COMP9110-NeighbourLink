package com.neighbourlink.service;

import com.neighbourlink.dto.DriverTrustSummaryDto;
import com.neighbourlink.dto.RideOfferDetailDto;
import com.neighbourlink.dto.RideOfferSearchItemDto;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.RideOfferRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RideOfferQueryService {

    private final RideOfferRepository rideOfferRepository;
    private final RatingRepository ratingRepository;

    public RideOfferQueryService(RideOfferRepository rideOfferRepository, RatingRepository ratingRepository) {
        this.rideOfferRepository = rideOfferRepository;
        this.ratingRepository = ratingRepository;
    }

    public List<RideOfferSearchItemDto> searchOffers(
            String origin,
            String destination,
            LocalDate departureDate,
            String departureTime,
            Integer timeFlexHours,
            Integer passengerCount
    ) {
        String normalizedOriginSuburb = normalizeSuburb(origin);
        String normalizedDestinationSuburb = normalizeSuburb(destination);
        String normalizedDepartureTime = normalizeTime(departureTime);
        Integer normalizedTimeFlexHours = validateTimeFlexHours(timeFlexHours, normalizedDepartureTime);

        if (normalizedOriginSuburb == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "origin suburb is required");
        }
        if (normalizedDestinationSuburb == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "destination suburb is required");
        }
        if (departureDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departureDate is required");
        }
        if (passengerCount != null && passengerCount < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "passengerCount must be >= 1");
        }

        return rideOfferRepository.searchOpenOffers(
                        RideOfferStatus.OPEN,
                        passengerCount
                ).stream()
                .filter(offer -> departureDate.equals(offer.getDepartureDate()))
                .filter(offer -> matchesSuburb(
                        normalizedOriginSuburb,
                        offer.getOriginSuburb(),
                        offer.getOrigin()
                ))
                .filter(offer -> matchesSuburb(
                        normalizedDestinationSuburb,
                        offer.getDestinationSuburb(),
                        offer.getDestination()
                ))
                .filter(offer -> matchesDepartureTime(
                        normalizedDepartureTime,
                        normalizedTimeFlexHours,
                        offer.getDepartureTime()
                ))
                .map(offer -> new RideOfferSearchItemDto(
                        offer.getId(),
                        offer.getOrigin(),
                        offer.getOriginAddress(),
                        offer.getOriginState(),
                        offer.getOriginSuburb(),
                        offer.getOriginPostcode(),
                        offer.getOriginLatitude(),
                        offer.getOriginLongitude(),
                        offer.getDestination(),
                        offer.getDestinationAddress(),
                        offer.getDestinationState(),
                        offer.getDestinationSuburb(),
                        offer.getDestinationPostcode(),
                        offer.getDestinationLatitude(),
                        offer.getDestinationLongitude(),
                        offer.getDepartureDate(),
                        offer.getDepartureTime(),
                        offer.getAvailableSeats(),
                        buildDriverTrustSummary(offer.getDriver())
                ))
                .collect(Collectors.toList());
    }

    public RideOfferDetailDto getOfferDetail(Long offerId) {
        RideOffer offer = rideOfferRepository.findDetailById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride offer not found"));

        return new RideOfferDetailDto(
                offer.getId(),
                offer.getOrigin(),
                offer.getOriginAddress(),
                offer.getOriginState(),
                offer.getOriginSuburb(),
                offer.getOriginPostcode(),
                offer.getOriginLatitude(),
                offer.getOriginLongitude(),
                offer.getDestination(),
                offer.getDestinationAddress(),
                offer.getDestinationState(),
                offer.getDestinationSuburb(),
                offer.getDestinationPostcode(),
                offer.getDestinationLatitude(),
                offer.getDestinationLongitude(),
                offer.getDepartureDate(),
                offer.getDepartureTime(),
                offer.getAvailableSeats(),
                offer.getStatus().name(),
                buildDriverTrustSummary(offer.getDriver())
        );
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

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return Objects.equals(trimmed, "") ? null : trimmed;
    }

    private String normalizeSuburb(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        return normalized.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private String normalizeTime(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        if (!normalized.matches("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departureTime must be HH:mm");
        }
        return normalized;
    }

    private Integer validateTimeFlexHours(Integer timeFlexHours, String normalizedDepartureTime) {
        if (timeFlexHours == null) {
            return 0;
        }
        if (normalizedDepartureTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timeFlexHours requires departureTime");
        }
        if (timeFlexHours < 0 || timeFlexHours > 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timeFlexHours must be between 0 and 6");
        }
        return timeFlexHours;
    }

    private boolean matchesSuburb(String requestedSuburb, String offerSuburb, String fallbackName) {
        if (requestedSuburb == null) {
            return false;
        }
        String normalizedOfferSuburb = normalizeSuburb(offerSuburb);
        if (normalizedOfferSuburb == null) {
            normalizedOfferSuburb = normalizeSuburb(fallbackName);
        }
        return requestedSuburb.equals(normalizedOfferSuburb);
    }

    private boolean matchesDepartureTime(String requestedTime, Integer timeFlexHours, String offerTime) {
        if (requestedTime == null) {
            return true;
        }
        String normalizedOfferTime = normalizeTime(offerTime);
        if (normalizedOfferTime == null) {
            return false;
        }
        int diffMinutes = Math.abs(toMinutes(requestedTime) - toMinutes(normalizedOfferTime));
        return diffMinutes <= (timeFlexHours * 60);
    }

    private int toMinutes(String hhmm) {
        int hour = Integer.parseInt(hhmm.substring(0, 2));
        int minute = Integer.parseInt(hhmm.substring(3, 5));
        return (hour * 60) + minute;
    }
}
