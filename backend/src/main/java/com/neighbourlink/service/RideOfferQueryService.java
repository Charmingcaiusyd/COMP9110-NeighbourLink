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
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RideOfferQueryService {

    private static final Map<String, Set<String>> LOCATION_SYNONYM_INDEX = buildLocationSynonymIndex();

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

        String normalizedOrigin = normalize(origin);
        String normalizedDestination = normalize(destination);

        return rideOfferRepository.searchOpenOffers(
                        RideOfferStatus.OPEN,
                        normalizeTime(departureTime),
                        passengerCount
                ).stream()
                .filter(offer -> departureDate == null || departureDate.equals(offer.getDepartureDate()))
                .filter(offer -> matchesLocation(
                        normalizedOrigin,
                        offer.getOrigin(),
                        offer.getOriginSuburb(),
                        offer.getOriginAddress(),
                        offer.getOriginState(),
                        offer.getOriginPostcode()
                ))
                .filter(offer -> matchesLocation(
                        normalizedDestination,
                        offer.getDestination(),
                        offer.getDestinationSuburb(),
                        offer.getDestinationAddress(),
                        offer.getDestinationState(),
                        offer.getDestinationPostcode()
                ))
                .sorted(Comparator.comparing(RideOffer::getDepartureDate)
                        .thenComparing(RideOffer::getDepartureTime)
                        .thenComparing(RideOffer::getId))
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

    private boolean matchesLocation(String query, String... locationFields) {
        if (query == null) {
            return true;
        }

        String locationBlob = Stream.of(locationFields)
                .filter(Objects::nonNull)
                .map(RideOfferQueryService::normalizeForMatch)
                .filter(value -> !value.isBlank())
                .collect(Collectors.joining(" "));

        if (locationBlob.isBlank()) {
            return false;
        }

        Set<String> queryAliases = expandLocationAliases(query);
        return queryAliases.stream().anyMatch(locationBlob::contains);
    }

    private Set<String> expandLocationAliases(String value) {
        String normalized = normalizeForMatch(value);
        if (normalized.isBlank()) {
            return Collections.emptySet();
        }

        Set<String> aliases = new HashSet<>();
        aliases.add(normalized);

        Set<String> direct = LOCATION_SYNONYM_INDEX.get(normalized);
        if (direct != null) {
            aliases.addAll(direct);
        }

        LOCATION_SYNONYM_INDEX.forEach((key, group) -> {
            if (normalized.contains(key)) {
                aliases.addAll(group);
            }
        });

        return aliases;
    }

    private static Map<String, Set<String>> buildLocationSynonymIndex() {
        Map<String, Set<String>> index = new HashMap<>();
        registerSynonymGroup(index, "melbourne", "melbourne cbd", "city", "city centre", "city center", "cbd", "docklands");
        registerSynonymGroup(index, "monash", "monash university", "monash uni", "clayton");
        return Collections.unmodifiableMap(index);
    }

    private static void registerSynonymGroup(Map<String, Set<String>> index, String... aliases) {
        Set<String> normalizedAliases = Arrays.stream(aliases)
                .map(RideOfferQueryService::normalizeForMatch)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toCollection(HashSet::new));

        for (String alias : normalizedAliases) {
            index.put(alias, normalizedAliases);
        }
    }

    private static String normalizeForMatch(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();

        return normalized.replaceAll("\\s+", " ");
    }
}
