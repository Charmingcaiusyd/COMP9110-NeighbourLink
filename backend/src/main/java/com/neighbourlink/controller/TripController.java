package com.neighbourlink.controller;

import com.neighbourlink.dto.TripItemDto;
import com.neighbourlink.service.TripQueryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TripController {

    private final TripQueryService tripQueryService;

    public TripController(TripQueryService tripQueryService) {
        this.tripQueryService = tripQueryService;
    }

    @GetMapping("/riders/{riderId}/trips")
    public List<TripItemDto> getRiderTrips(@PathVariable Long riderId) {
        return tripQueryService.getTripsForRider(riderId);
    }

    @GetMapping("/drivers/{driverId}/trips")
    public List<TripItemDto> getDriverTrips(@PathVariable Long driverId) {
        return tripQueryService.getTripsForDriver(driverId);
    }
}
