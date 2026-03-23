package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class AdminJoinRequestItemDto {
    private final Long joinRequestId;
    private final Long rideOfferId;
    private final Long riderId;
    private final String riderName;
    private final Integer requestedSeats;
    private final String status;
    private final LocalDateTime requestDateTime;

    public AdminJoinRequestItemDto(
            Long joinRequestId,
            Long rideOfferId,
            Long riderId,
            String riderName,
            Integer requestedSeats,
            String status,
            LocalDateTime requestDateTime
    ) {
        this.joinRequestId = joinRequestId;
        this.rideOfferId = rideOfferId;
        this.riderId = riderId;
        this.riderName = riderName;
        this.requestedSeats = requestedSeats;
        this.status = status;
        this.requestDateTime = requestDateTime;
    }

    public Long getJoinRequestId() {
        return joinRequestId;
    }

    public Long getRideOfferId() {
        return rideOfferId;
    }

    public Long getRiderId() {
        return riderId;
    }

    public String getRiderName() {
        return riderName;
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
}
