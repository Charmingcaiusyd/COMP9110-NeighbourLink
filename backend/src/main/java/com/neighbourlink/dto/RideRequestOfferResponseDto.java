package com.neighbourlink.dto;

public class RideRequestOfferResponseDto {
    private Long offerId;
    private Long rideRequestId;
    private Long driverId;
    private Integer proposedSeats;
    private String meetingPoint;
    private String status;

    public RideRequestOfferResponseDto(
            Long offerId,
            Long rideRequestId,
            Long driverId,
            Integer proposedSeats,
            String meetingPoint,
            String status
    ) {
        this.offerId = offerId;
        this.rideRequestId = rideRequestId;
        this.driverId = driverId;
        this.proposedSeats = proposedSeats;
        this.meetingPoint = meetingPoint;
        this.status = status;
    }

    public Long getOfferId() {
        return offerId;
    }

    public Long getRideRequestId() {
        return rideRequestId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public Integer getProposedSeats() {
        return proposedSeats;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public String getStatus() {
        return status;
    }
}
