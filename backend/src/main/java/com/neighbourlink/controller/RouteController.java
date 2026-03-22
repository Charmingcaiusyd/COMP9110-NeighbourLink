package com.neighbourlink.controller;

import com.neighbourlink.dto.RouteOverviewDto;
import com.neighbourlink.service.GeoLocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final GeoLocationService geoLocationService;

    public RouteController(GeoLocationService geoLocationService) {
        this.geoLocationService = geoLocationService;
    }

    @GetMapping("/overview")
    public RouteOverviewDto getOverview(
            @RequestParam Double fromLat,
            @RequestParam Double fromLng,
            @RequestParam Double toLat,
            @RequestParam Double toLng
    ) {
        return geoLocationService.getRouteOverview(fromLat, fromLng, toLat, toLng);
    }
}
