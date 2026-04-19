package com.neighbourlink.controller;

import com.neighbourlink.dto.DriverRideOfferItemDto;
import com.neighbourlink.dto.RideOfferCreateRequestDto;
import com.neighbourlink.dto.RideOfferCreatedResponseDto;
import com.neighbourlink.service.RideOfferManagementService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RideOfferManagementController {

    private final RideOfferManagementService rideOfferManagementService;

    public RideOfferManagementController(RideOfferManagementService rideOfferManagementService) {
        this.rideOfferManagementService = rideOfferManagementService;
    }

    @PostMapping("/ride-offers")
    @ResponseStatus(HttpStatus.CREATED)
    public RideOfferCreatedResponseDto createRideOffer(@RequestBody RideOfferCreateRequestDto request) {
        return rideOfferManagementService.createRideOffer(request);
    }

    @GetMapping("/drivers/{driverId}/ride-offers")
    public List<DriverRideOfferItemDto> getRideOffersByDriver(@PathVariable Long driverId) {
        return rideOfferManagementService.getRideOffersByDriver(driverId);
    }
}
