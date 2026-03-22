package com.neighbourlink.dto;

import java.time.LocalDate;

public class RideOfferDetailDto {
    private Long offerId;
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
    private LocalDate departureDate;
    private String departureTime;
    private Integer availableSeats;
    private String status;
    private DriverTrustSummaryDto driver;

    public RideOfferDetailDto(
            Long offerId,
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
            LocalDate departureDate,
            String departureTime,
            Integer availableSeats,
            String status,
            DriverTrustSummaryDto driver
    ) {
        this.offerId = offerId;
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
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.status = status;
        this.driver = driver;
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

    public DriverTrustSummaryDto getDriver() {
        return driver;
    }
}
