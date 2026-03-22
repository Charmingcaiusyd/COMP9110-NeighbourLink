package com.neighbourlink.controller;

import com.neighbourlink.dto.LocationLookupItemDto;
import com.neighbourlink.service.GeoLocationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/locations/au")
public class LocationController {

    private final GeoLocationService geoLocationService;

    public LocationController(GeoLocationService geoLocationService) {
        this.geoLocationService = geoLocationService;
    }

    @GetMapping("/search")
    public List<LocationLookupItemDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer limit
    ) {
        return geoLocationService.searchAustralianLocations(q, limit);
    }

    @GetMapping("/reverse")
    public LocationLookupItemDto reverseLookup(
            @RequestParam Double lat,
            @RequestParam(name = "lng") Double longitude
    ) {
        return geoLocationService.reverseLookupAustralia(lat, longitude);
    }
}
