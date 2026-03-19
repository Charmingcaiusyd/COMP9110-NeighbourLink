package com.neighbourlink.dto;

public class RideRequestOfferAcceptResponseDto {
    private Long rideRequestId;
    private Long acceptedOfferId;
    private Long rideMatchId;
    private String rideRequestStatus;

    public RideRequestOfferAcceptResponseDto(
            Long rideRequestId,
            Long acceptedOfferId,
            Long rideMatchId,
            String rideRequestStatus
    ) {
        this.rideRequestId = rideRequestId;
        this.acceptedOfferId = acceptedOfferId;
        this.rideMatchId = rideMatchId;
        this.rideRequestStatus = rideRequestStatus;
    }

    public Long getRideRequestId() {
        return rideRequestId;
    }

    public Long getAcceptedOfferId() {
        return acceptedOfferId;
    }

    public Long getRideMatchId() {
        return rideMatchId;
    }

    public String getRideRequestStatus() {
        return rideRequestStatus;
    }
}
