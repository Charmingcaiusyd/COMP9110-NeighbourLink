package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class AdminRideMatchItemDto {
    private final Long rideMatchId;
    private final Long driverId;
    private final String driverName;
    private final Long riderId;
    private final String riderName;
    private final Long rideOfferId;
    private final Long rideRequestId;
    private final Long acceptedJoinRequestId;
    private final Long acceptedRideRequestOfferId;
    private final String meetingPoint;
    private final String tripStatus;
    private final LocalDateTime confirmedDateTime;

    public AdminRideMatchItemDto(
            Long rideMatchId,
            Long driverId,
            String driverName,
            Long riderId,
            String riderName,
            Long rideOfferId,
            Long rideRequestId,
            Long acceptedJoinRequestId,
            Long acceptedRideRequestOfferId,
            String meetingPoint,
            String tripStatus,
            LocalDateTime confirmedDateTime
    ) {
        this.rideMatchId = rideMatchId;
        this.driverId = driverId;
        this.driverName = driverName;
        this.riderId = riderId;
        this.riderName = riderName;
        this.rideOfferId = rideOfferId;
        this.rideRequestId = rideRequestId;
        this.acceptedJoinRequestId = acceptedJoinRequestId;
        this.acceptedRideRequestOfferId = acceptedRideRequestOfferId;
        this.meetingPoint = meetingPoint;
        this.tripStatus = tripStatus;
        this.confirmedDateTime = confirmedDateTime;
    }

    public Long getRideMatchId() {
        return rideMatchId;
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

    public Long getRideOfferId() {
        return rideOfferId;
    }

    public Long getRideRequestId() {
        return rideRequestId;
    }

    public Long getAcceptedJoinRequestId() {
        return acceptedJoinRequestId;
    }

    public Long getAcceptedRideRequestOfferId() {
        return acceptedRideRequestOfferId;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public String getTripStatus() {
        return tripStatus;
    }

    public LocalDateTime getConfirmedDateTime() {
        return confirmedDateTime;
    }
}
