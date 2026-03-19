package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class DriverRideRequestOfferHistoryItemDto {
    private Long offerId;
    private Long requestId;
    private Long riderId;
    private String riderName;
    private String origin;
    private String destination;
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
            String destination,
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
        this.destination = destination;
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
