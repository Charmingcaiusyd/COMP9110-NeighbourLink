package com.neighbourlink.dto;

import java.time.LocalDate;

public class RideOfferSearchItemDto {
    private Long offerId;
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private String departureTime;
    private Integer availableSeats;
    private DriverTrustSummaryDto driver;

    public RideOfferSearchItemDto(
            Long offerId,
            String origin,
            String destination,
            LocalDate departureDate,
            String departureTime,
            Integer availableSeats,
            DriverTrustSummaryDto driver
    ) {
        this.offerId = offerId;
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.driver = driver;
    }

    public Long getOfferId() {
        return offerId;
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

    public DriverTrustSummaryDto getDriver() {
        return driver;
    }
}
