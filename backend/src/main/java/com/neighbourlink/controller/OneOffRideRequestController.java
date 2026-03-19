package com.neighbourlink.controller;

import com.neighbourlink.dto.OpenRideRequestItemDto;
import com.neighbourlink.dto.DriverRideRequestOfferHistoryItemDto;
import com.neighbourlink.dto.RiderRideRequestHistoryItemDto;
import com.neighbourlink.dto.RideRequestCreateRequestDto;
import com.neighbourlink.dto.RideRequestCreatedResponseDto;
import com.neighbourlink.dto.RideRequestOfferAcceptResponseDto;
import com.neighbourlink.dto.RideRequestOfferCreateRequestDto;
import com.neighbourlink.dto.RideRequestOfferForRiderItemDto;
import com.neighbourlink.dto.RideRequestOfferResponseDto;
import com.neighbourlink.service.OneOffRideRequestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OneOffRideRequestController {

    private final OneOffRideRequestService oneOffRideRequestService;

    public OneOffRideRequestController(OneOffRideRequestService oneOffRideRequestService) {
        this.oneOffRideRequestService = oneOffRideRequestService;
    }

    @PostMapping("/ride-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public RideRequestCreatedResponseDto createRideRequest(@RequestBody RideRequestCreateRequestDto request) {
        return oneOffRideRequestService.createRideRequest(request);
    }

    @GetMapping("/ride-requests/open")
    public List<OpenRideRequestItemDto> listOpenRideRequests() {
        return oneOffRideRequestService.listOpenRideRequests();
    }

    @GetMapping("/riders/{riderId}/ride-requests/{rideRequestId}/offers")
    public List<RideRequestOfferForRiderItemDto> listOffersForRider(
            @PathVariable Long riderId,
            @PathVariable Long rideRequestId
    ) {
        return oneOffRideRequestService.listOffersForRiderRequest(riderId, rideRequestId);
    }

    @GetMapping("/drivers/{driverId}/ride-request-offers")
    public List<DriverRideRequestOfferHistoryItemDto> listDriverOfferHistory(@PathVariable Long driverId) {
        return oneOffRideRequestService.listOfferHistoryForDriver(driverId);
    }

    @GetMapping("/riders/{riderId}/ride-requests")
    public List<RiderRideRequestHistoryItemDto> listRiderRequestHistory(@PathVariable Long riderId) {
        return oneOffRideRequestService.listRequestHistoryForRider(riderId);
    }

    @PostMapping("/ride-requests/{rideRequestId}/offers")
    @ResponseStatus(HttpStatus.CREATED)
    public RideRequestOfferResponseDto driverRespond(
            @PathVariable Long rideRequestId,
            @RequestBody RideRequestOfferCreateRequestDto request
    ) {
        return oneOffRideRequestService.driverRespondToRideRequest(rideRequestId, request);
    }

    @PatchMapping("/riders/{riderId}/ride-requests/{rideRequestId}/offers/{offerId}/accept")
    public RideRequestOfferAcceptResponseDto riderAcceptOffer(
            @PathVariable Long riderId,
            @PathVariable Long rideRequestId,
            @PathVariable Long offerId
    ) {
        return oneOffRideRequestService.riderAcceptDriverOffer(riderId, rideRequestId, offerId);
    }

    @PatchMapping("/riders/{riderId}/ride-requests/{rideRequestId}/cancel")
    public RideRequestCreatedResponseDto riderCancelRideRequest(
            @PathVariable Long riderId,
            @PathVariable Long rideRequestId
    ) {
        return oneOffRideRequestService.riderCancelRideRequest(riderId, rideRequestId);
    }
}
