package com.neighbourlink.dto;

import java.time.LocalDate;

public class AdminRideRequestItemDto {
    private final Long rideRequestId;
    private final Long riderId;
    private final String riderName;
    private final String origin;
    private final String destination;
    private final LocalDate tripDate;
    private final String tripTime;
    private final Integer passengerCount;
    private final String status;

    public AdminRideRequestItemDto(
            Long rideRequestId,
            Long riderId,
            String riderName,
            String origin,
            String destination,
            LocalDate tripDate,
            String tripTime,
            Integer passengerCount,
            String status
    ) {
        this.rideRequestId = rideRequestId;
        this.riderId = riderId;
        this.riderName = riderName;
        this.origin = origin;
        this.destination = destination;
        this.tripDate = tripDate;
        this.tripTime = tripTime;
        this.passengerCount = passengerCount;
        this.status = status;
    }

    public Long getRideRequestId() {
        return rideRequestId;
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

    public LocalDate getTripDate() {
        return tripDate;
    }

    public String getTripTime() {
        return tripTime;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public String getStatus() {
        return status;
    }
}
