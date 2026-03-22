package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class DriverRideRequestOfferHistoryItemDto {
    private Long offerId;
    private Long requestId;
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
    private Integer proposedSeats;
    private String meetingPoint;
    private String status;
    private LocalDateTime createdAt;

    public DriverRideRequestOfferHistoryItemDto(
            Long offerId,
            Long requestId,
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
            Integer proposedSeats,
            String meetingPoint,
            String status,
            LocalDateTime createdAt
    ) {
        this.offerId = offerId;
        this.requestId = requestId;
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
        this.proposedSeats = proposedSeats;
        this.meetingPoint = meetingPoint;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getOfferId() {
        return offerId;
    }

    public Long getRequestId() {
        return requestId;
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
