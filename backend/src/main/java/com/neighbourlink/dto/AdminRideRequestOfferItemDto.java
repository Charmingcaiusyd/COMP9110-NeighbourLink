package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class AdminRideRequestOfferItemDto {
    private final Long offerId;
    private final Long rideRequestId;
    private final Long driverId;
    private final String driverName;
    private final Long riderId;
    private final String riderName;
    private final Integer proposedSeats;
    private final String meetingPoint;
    private final String status;
    private final LocalDateTime createdAt;

    public AdminRideRequestOfferItemDto(
            Long offerId,
            Long rideRequestId,
            Long driverId,
            String driverName,
            Long riderId,
            String riderName,
            Integer proposedSeats,
            String meetingPoint,
            String status,
            LocalDateTime createdAt
    ) {
        this.offerId = offerId;
        this.rideRequestId = rideRequestId;
        this.driverId = driverId;
        this.driverName = driverName;
        this.riderId = riderId;
        this.riderName = riderName;
        this.proposedSeats = proposedSeats;
        this.meetingPoint = meetingPoint;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getDriverName() {
        return driverName;
    }

    public Long getRiderId() {
        return riderId;
    }

    public String getRiderName() {
        return riderName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
