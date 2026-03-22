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
    private String originAddress;
    private String destinationAddress;
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
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
            String originAddress,
            String destinationAddress,
            Double originLatitude,
            Double originLongitude,
            Double destinationLatitude,
            Double destinationLongitude,
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
        this.originAddress = originAddress;
        this.destinationAddress = destinationAddress;
        this.originLatitude = originLatitude;
        this.originLongitude = originLongitude;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
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

    public String getOriginAddress() {
        return originAddress;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
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
