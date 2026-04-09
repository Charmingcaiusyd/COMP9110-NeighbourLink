package com.neighbourlink.controller;

import com.neighbourlink.dto.RideOfferDetailDto;
import com.neighbourlink.dto.RideOfferSearchItemDto;
import com.neighbourlink.service.RideOfferQueryService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ride-offers")
public class RideOfferQueryController {

    private final RideOfferQueryService rideOfferQueryService;

    public RideOfferQueryController(RideOfferQueryService rideOfferQueryService) {
        this.rideOfferQueryService = rideOfferQueryService;
    }

    @GetMapping
    public List<RideOfferSearchItemDto> searchRideOffers(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) String departureTime,
            @RequestParam(required = false) Integer timeFlexHours,
            @RequestParam(required = false) Integer passengerCount
    ) {
        return rideOfferQueryService.searchOffers(origin, destination, departureDate, departureTime, timeFlexHours, passengerCount);
    }

    @GetMapping("/{offerId}")
    public RideOfferDetailDto getRideOfferDetail(@PathVariable Long offerId) {
        return rideOfferQueryService.getOfferDetail(offerId);
    }
}
