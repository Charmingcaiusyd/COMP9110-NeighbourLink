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
            Integer passengerCount
    ) {
        if (passengerCount != null && passengerCount < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "passengerCount must be >= 1");
        }

        return rideOfferRepository.searchOpenOffers(
                        RideOfferStatus.OPEN,
                        normalize(origin),
                        normalize(destination),
                        normalizeTime(departureTime),
                        passengerCount
                ).stream()
                .filter(offer -> departureDate == null || departureDate.equals(offer.getDepartureDate()))
                .map(offer -> new RideOfferSearchItemDto(
                        offer.getId(),
                        offer.getOrigin(),
                        offer.getDestination(),
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
                offer.getDestination(),
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

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return Objects.equals(trimmed, "") ? null : trimmed;
    }

    private String normalizeTime(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        if (!normalized.matches("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "departureTime must be HH:mm");
        }
        return normalized;
    }
}
