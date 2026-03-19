package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class TripItemDto {
    private Long rideMatchId;
    private String tripType;
    private Long driverId;
    private String driverName;
    private Long riderId;
    private String riderName;
    private String origin;
    private String destination;
    private String tripDate;
    private String tripTime;
    private String meetingPoint;
    private String tripStatus;
    private LocalDateTime confirmedDateTime;

    public TripItemDto(
            Long rideMatchId,
            String tripType,
            Long driverId,
            String driverName,
            Long riderId,
            String riderName,
            String origin,
            String destination,
            String tripDate,
            String tripTime,
            String meetingPoint,
            String tripStatus,
            LocalDateTime confirmedDateTime
    ) {
        this.rideMatchId = rideMatchId;
        this.tripType = tripType;
        this.driverId = driverId;
        this.driverName = driverName;
        this.riderId = riderId;
        this.riderName = riderName;
        this.origin = origin;
        this.destination = destination;
        this.tripDate = tripDate;
        this.tripTime = tripTime;
        this.meetingPoint = meetingPoint;
        this.tripStatus = tripStatus;
        this.confirmedDateTime = confirmedDateTime;
    }

    public Long getRideMatchId() {
        return rideMatchId;
    }

    public String getTripType() {
        return tripType;
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

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public String getTripDate() {
        return tripDate;
    }

    public String getTripTime() {
        return tripTime;
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
