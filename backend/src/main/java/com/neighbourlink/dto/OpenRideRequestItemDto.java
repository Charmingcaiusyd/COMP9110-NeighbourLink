package com.neighbourlink.dto;

public class OpenRideRequestItemDto {
    private Long rideRequestId;
    private Long riderId;
    private String riderName;
    private String origin;
    private String destination;
    private String tripDate;
    private String tripTime;
    private Integer passengerCount;
    private String notes;

    public OpenRideRequestItemDto(
            Long rideRequestId,
            Long riderId,
            String riderName,
            String origin,
            String destination,
            String tripDate,
            String tripTime,
            Integer passengerCount,
            String notes
    ) {
        this.rideRequestId = rideRequestId;
        this.riderId = riderId;
        this.riderName = riderName;
        this.origin = origin;
        this.destination = destination;
        this.tripDate = tripDate;
        this.tripTime = tripTime;
        this.passengerCount = passengerCount;
        this.notes = notes;
    }

    public Long getRideRequestId() {
        return rideRequestId;
    }

    // Backward-compatible alias for older frontend builds.
    public Long getRequestId() {
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

    public String getTripDate() {
        return tripDate;
    }

    public String getTripTime() {
        return tripTime;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public String getNotes() {
        return notes;
    }
}
