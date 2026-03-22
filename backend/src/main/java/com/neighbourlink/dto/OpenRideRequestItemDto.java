package com.neighbourlink.dto;

public class OpenRideRequestItemDto {
    private Long rideRequestId;
    private Long riderId;
    private String riderName;
    private String origin;
    private String originAddress;
    private String originState;
    private String originSuburb;
    private String originPostcode;
    private Double originLatitude;
    private Double originLongitude;
    private String destination;
    private String destinationAddress;
    private String destinationState;
    private String destinationSuburb;
    private String destinationPostcode;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String tripDate;
    private String tripTime;
    private Integer passengerCount;
    private String notes;

    public OpenRideRequestItemDto(
            Long rideRequestId,
            Long riderId,
            String riderName,
            String origin,
            String originAddress,
            String originState,
            String originSuburb,
            String originPostcode,
            Double originLatitude,
            Double originLongitude,
            String destination,
            String destinationAddress,
            String destinationState,
            String destinationSuburb,
            String destinationPostcode,
            Double destinationLatitude,
            Double destinationLongitude,
            String tripDate,
            String tripTime,
            Integer passengerCount,
            String notes
    ) {
        this.rideRequestId = rideRequestId;
        this.riderId = riderId;
        this.riderName = riderName;
        this.origin = origin;
        this.originAddress = originAddress;
        this.originState = originState;
        this.originSuburb = originSuburb;
        this.originPostcode = originPostcode;
        this.originLatitude = originLatitude;
        this.originLongitude = originLongitude;
        this.destination = destination;
        this.destinationAddress = destinationAddress;
        this.destinationState = destinationState;
        this.destinationSuburb = destinationSuburb;
        this.destinationPostcode = destinationPostcode;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
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

    public String getOriginAddress() {
        return originAddress;
    }

    public String getOriginState() {
        return originState;
    }

    public String getOriginSuburb() {
        return originSuburb;
    }

    public String getOriginPostcode() {
        return originPostcode;
    }

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public String getDestination() {
        return destination;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public String getDestinationState() {
        return destinationState;
    }

    public String getDestinationSuburb() {
        return destinationSuburb;
    }

    public String getDestinationPostcode() {
        return destinationPostcode;
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

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public String getNotes() {
        return notes;
    }
}
