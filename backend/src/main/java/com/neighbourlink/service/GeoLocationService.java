package com.neighbourlink.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neighbourlink.dto.LocationLookupItemDto;
import com.neighbourlink.dto.RouteOverviewDto;
import com.neighbourlink.dto.RoutePointDto;
import com.neighbourlink.entity.AuLocationReference;
import com.neighbourlink.repository.AuLocationReferenceRepository;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GeoLocationService {

    private static final String NOMINATIM_SEARCH_URL =
            "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=au&limit=%d&q=%s";
    private static final String NOMINATIM_REVERSE_URL =
            "https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=%s&lon=%s";
    private static final String OSRM_ROUTE_URL =
            "https://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson";
    private static final String USER_AGENT = "NeighbourLink/2.0 (Geo Integration)";

    private final AuLocationReferenceRepository auLocationReferenceRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeoLocationService(
            AuLocationReferenceRepository auLocationReferenceRepository,
            ObjectMapper objectMapper
    ) {
        this.auLocationReferenceRepository = auLocationReferenceRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public List<LocationLookupItemDto> searchAustralianLocations(String query, Integer limit) {
        int resolvedLimit = normalizeLimit(limit);
        String normalizedQuery = normalizeText(query);

        List<LocationLookupItemDto> result = new ArrayList<>();
        Set<String> dedupe = new LinkedHashSet<>();

        if (normalizedQuery == null) {
            List<AuLocationReference> localBrowse =
                    auLocationReferenceRepository.findForBrowse(PageRequest.of(0, resolvedLimit));
            for (AuLocationReference item : localBrowse) {
                LocationLookupItemDto mapped = toLocalDto(item);
                addIfUnique(result, dedupe, mapped, resolvedLimit);
            }
            return result;
        }

        List<AuLocationReference> localMatches = auLocationReferenceRepository.searchByQuery(
                normalizedQuery.toLowerCase(Locale.ROOT),
                PageRequest.of(0, resolvedLimit)
        );
        for (AuLocationReference item : localMatches) {
            LocationLookupItemDto mapped = toLocalDto(item);
            addIfUnique(result, dedupe, mapped, resolvedLimit);
        }
        if (result.size() >= resolvedLimit) {
            return result;
        }

        List<LocationLookupItemDto> remoteMatches = fetchFromNominatimSearch(normalizedQuery, resolvedLimit * 2);
        for (LocationLookupItemDto item : remoteMatches) {
            addIfUnique(result, dedupe, item, resolvedLimit);
        }

        return result;
    }

    public LocationLookupItemDto reverseLookupAustralia(Double latitude, Double longitude) {
        validateLatitudeLongitude(latitude, longitude);

        String latText = String.format(Locale.ROOT, "%.7f", latitude);
        String lngText = String.format(Locale.ROOT, "%.7f", longitude);
        String url = String.format(Locale.ROOT, NOMINATIM_REVERSE_URL, latText, lngText);

        JsonNode payload = fetchJson(url);
        return toRemoteDto(payload);
    }

    public RouteOverviewDto getRouteOverview(Double fromLatitude, Double fromLongitude, Double toLatitude, Double toLongitude) {
        validateLatitudeLongitude(fromLatitude, fromLongitude);
        validateLatitudeLongitude(toLatitude, toLongitude);

        String fromLngText = String.format(Locale.ROOT, "%.7f", fromLongitude);
        String fromLatText = String.format(Locale.ROOT, "%.7f", fromLatitude);
        String toLngText = String.format(Locale.ROOT, "%.7f", toLongitude);
        String toLatText = String.format(Locale.ROOT, "%.7f", toLatitude);

        String url = String.format(Locale.ROOT, OSRM_ROUTE_URL, fromLngText, fromLatText, toLngText, toLatText);
        JsonNode payload = fetchJson(url);

        JsonNode routes = payload.path("routes");
        if (!routes.isArray() || routes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found for the selected points");
        }

        JsonNode route = routes.get(0);
        JsonNode coordinates = route.path("geometry").path("coordinates");
        List<RoutePointDto> path = new ArrayList<>();
        if (coordinates.isArray()) {
            for (JsonNode pair : coordinates) {
                if (pair.isArray() && pair.size() >= 2) {
                    double lng = pair.get(0).asDouble();
                    double lat = pair.get(1).asDouble();
                    path.add(new RoutePointDto(lat, lng));
                }
            }
        }

        return new RouteOverviewDto(
                route.path("distance").asDouble(0),
                route.path("duration").asDouble(0),
                path
        );
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return 8;
        }
        if (limit < 1) {
            return 1;
        }
        return Math.min(limit, 20);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void addIfUnique(List<LocationLookupItemDto> result, Set<String> dedupe, LocationLookupItemDto candidate, int limit) {
        if (candidate == null || result.size() >= limit) {
            return;
        }
        String key = candidate.getDisplayName() + "|" + candidate.getLatitude() + "|" + candidate.getLongitude();
        if (dedupe.add(key)) {
            result.add(candidate);
        }
    }

    private LocationLookupItemDto toLocalDto(AuLocationReference item) {
        String displayName = buildDisplayName(item.getAddress(), item.getSuburb(), item.getState(), item.getPostcode());
        return new LocationLookupItemDto(
                "LOCAL_AU_TABLE",
                displayName,
                item.getAddress(),
                item.getState(),
                item.getSuburb(),
                item.getPostcode(),
                item.getLatitude(),
                item.getLongitude()
        );
    }

    private List<LocationLookupItemDto> fetchFromNominatimSearch(String query, int limit) {
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(Locale.ROOT, NOMINATIM_SEARCH_URL, limit, encodedQuery);
            JsonNode payload = fetchJson(url);
            List<LocationLookupItemDto> result = new ArrayList<>();
            if (payload.isArray()) {
                for (JsonNode item : payload) {
                    result.add(toRemoteDto(item));
                }
            }
            return result;
        } catch (ResponseStatusException ex) {
            return new ArrayList<>();
        }
    }

    private LocationLookupItemDto toRemoteDto(JsonNode item) {
        JsonNode address = item.path("address");
        String state = firstNonBlank(
                address.path("state").asText(null),
                address.path("state_district").asText(null)
        );
        String suburb = firstNonBlank(
                address.path("suburb").asText(null),
                address.path("city").asText(null),
                address.path("town").asText(null),
                address.path("village").asText(null),
                address.path("hamlet").asText(null)
        );
        String postcode = address.path("postcode").asText(null);
        String road = address.path("road").asText(null);
        String houseNumber = address.path("house_number").asText(null);
        String addressLine = firstNonBlank(
                combineAddressLine(houseNumber, road),
                item.path("name").asText(null),
                item.path("display_name").asText(null)
        );
        String displayName = buildDisplayName(addressLine, suburb, state, postcode);

        return new LocationLookupItemDto(
                "OPENSTREETMAP_NOMINATIM",
                displayName,
                addressLine,
                state,
                suburb,
                postcode,
                parseDouble(item.path("lat").asText(null)),
                parseDouble(item.path("lon").asText(null))
        );
    }

    private String combineAddressLine(String houseNumber, String road) {
        String normalizedRoad = normalizeText(road);
        if (normalizedRoad == null) {
            return null;
        }
        String normalizedHouse = normalizeText(houseNumber);
        if (normalizedHouse == null) {
            return normalizedRoad;
        }
        return normalizedHouse + " " + normalizedRoad;
    }

    private String buildDisplayName(String address, String suburb, String state, String postcode) {
        List<String> parts = new ArrayList<>();
        if (normalizeText(address) != null) {
            parts.add(normalizeText(address));
        }
        if (normalizeText(suburb) != null) {
            parts.add(normalizeText(suburb));
        }
        if (normalizeText(state) != null) {
            parts.add(normalizeText(state));
        }
        if (normalizeText(postcode) != null) {
            parts.add(normalizeText(postcode));
        }
        return String.join(", ", parts);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String normalized = normalizeText(value);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
    }

    private Double parseDouble(String value) {
        if (value == null) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void validateLatitudeLongitude(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "latitude and longitude are required");
        }
        if (latitude < -90 || latitude > 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "longitude must be between -180 and 180");
        }
    }

    private JsonNode fetchJson(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("User-Agent", USER_AGENT)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int statusCode = response.statusCode();
            if (statusCode == 429) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Map service is rate-limited. Please retry shortly.");
            }
            if (statusCode < 200 || statusCode >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to fetch map service data");
            }
            return objectMapper.readTree(response.body());
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map service request was interrupted");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to fetch map service data");
        }
    }
}
