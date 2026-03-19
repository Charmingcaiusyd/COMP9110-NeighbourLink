package com.neighbourlink.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PendingJoinRequestItemDto {
    private Long joinRequestId;
    private Long rideOfferId;
    private Long riderId;
    private String riderName;
    private Integer requestedSeats;
    private LocalDateTime requestDateTime;
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private String departureTime;
    private Integer availableSeats;

    public PendingJoinRequestItemDto(
            Long joinRequestId,
            Long rideOfferId,
            Long riderId,
            String riderName,
            Integer requestedSeats,
            LocalDateTime requestDateTime,
            String origin,
            String destination,
            LocalDate departureDate,
            String departureTime,
            Integer availableSeats
    ) {
        this.joinRequestId = joinRequestId;
        this.rideOfferId = rideOfferId;
        this.riderId = riderId;
        this.riderName = riderName;
        this.requestedSeats = requestedSeats;
        this.requestDateTime = requestDateTime;
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
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

    public LocalDateTime getRequestDateTime() {
        return requestDateTime;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public LocalDate getDepartureDate() {
        return departureDate;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }
}
