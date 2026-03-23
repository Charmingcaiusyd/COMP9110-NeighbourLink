package com.neighbourlink.dto;

import java.time.LocalDate;

public class AdminRideOfferItemDto {
    private final Long offerId;
    private final Long driverId;
    private final String driverName;
    private final String origin;
    private final String destination;
    private final LocalDate departureDate;
    private final String departureTime;
    private final Integer availableSeats;
    private final String status;

    public AdminRideOfferItemDto(
            Long offerId,
            Long driverId,
            String driverName,
            String origin,
            String destination,
            LocalDate departureDate,
            String departureTime,
            Integer availableSeats,
            String status
    ) {
        this.offerId = offerId;
        this.driverId = driverId;
        this.driverName = driverName;
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.status = status;
    }

    public Long getOfferId() {
        return offerId;
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

    public String getStatus() {
        return status;
    }
}
