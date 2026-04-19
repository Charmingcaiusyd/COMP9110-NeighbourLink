package com.neighbourlink.dto;

import java.time.LocalDate;

public class DriverRideOfferItemDto {
    private Long offerId;
    private String origin;
    private String originAddress;
    private String destination;
    private String destinationAddress;
    private LocalDate departureDate;
    private String departureTime;
    private Integer availableSeats;
    private String status;

    public DriverRideOfferItemDto(
            Long offerId,
            String origin,
            String originAddress,
            String destination,
            String destinationAddress,
            LocalDate departureDate,
            String departureTime,
            Integer availableSeats,
            String status
    ) {
        this.offerId = offerId;
        this.origin = origin;
        this.originAddress = originAddress;
        this.destination = destination;
        this.destinationAddress = destinationAddress;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.status = status;
    }

    public Long getOfferId() {
        return offerId;
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
