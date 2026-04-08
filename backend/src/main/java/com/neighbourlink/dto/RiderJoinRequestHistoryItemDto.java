package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class RiderJoinRequestHistoryItemDto {
    private Long joinRequestId;
    private Long rideOfferId;
    private Long driverId;
    private String driverName;
    private String origin;
    private String originAddress;
    private String destination;
    private String destinationAddress;
    private String departureDate;
    private String departureTime;
    private Integer requestedSeats;
    private String status;
    private LocalDateTime requestDateTime;
    private Long rideMatchId;
    private String rideMatchStatus;
    private String meetingPoint;

    public RiderJoinRequestHistoryItemDto(
            Long joinRequestId,
            Long rideOfferId,
            Long driverId,
            String driverName,
            String origin,
            String originAddress,
            String destination,
            String destinationAddress,
            String departureDate,
            String departureTime,
            Integer requestedSeats,
            String status,
            LocalDateTime requestDateTime,
            Long rideMatchId,
            String rideMatchStatus,
            String meetingPoint
    ) {
        this.joinRequestId = joinRequestId;
        this.rideOfferId = rideOfferId;
        this.driverId = driverId;
        this.driverName = driverName;
        this.origin = origin;
        this.originAddress = originAddress;
        this.destination = destination;
        this.destinationAddress = destinationAddress;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.requestedSeats = requestedSeats;
        this.status = status;
        this.requestDateTime = requestDateTime;
        this.rideMatchId = rideMatchId;
        this.rideMatchStatus = rideMatchStatus;
        this.meetingPoint = meetingPoint;
    }

    public Long getJoinRequestId() {
        return joinRequestId;
    }

    public Long getRideOfferId() {
        return rideOfferId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public String getOrigin() {
        return origin;
    }

    public String getOriginAddress() {
        return originAddress;
    }

    public String getDestination() {
        return destination;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public String getDepartureDate() {
        return departureDate;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public Integer getRequestedSeats() {
        return requestedSeats;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getRequestDateTime() {
        return requestDateTime;
    }

    public Long getRideMatchId() {
        return rideMatchId;
    }

    public String getRideMatchStatus() {
        return rideMatchStatus;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }
}
