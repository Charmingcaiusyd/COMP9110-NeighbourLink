package com.neighbourlink.dto;

public class RiderRideRequestHistoryItemDto {
    private Long requestId;
    private String origin;
    private String destination;
    private String tripDate;
    private String tripTime;
    private Integer passengerCount;
    private String notes;
    private String status;
    private Long totalOffers;
    private Long pendingOffers;

    public RiderRideRequestHistoryItemDto(
            Long requestId,
            String origin,
            String destination,
            String tripDate,
            String tripTime,
            Integer passengerCount,
            String notes,
            String status,
            Long totalOffers,
            Long pendingOffers
    ) {
        this.requestId = requestId;
        this.origin = origin;
        this.destination = destination;
        this.tripDate = tripDate;
        this.tripTime = tripTime;
        this.passengerCount = passengerCount;
        this.notes = notes;
        this.status = status;
        this.totalOffers = totalOffers;
        this.pendingOffers = pendingOffers;
    }

    public Long getRequestId() {
        return requestId;
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

    public String getStatus() {
        return status;
    }

    public Long getTotalOffers() {
        return totalOffers;
    }

    public Long getPendingOffers() {
        return pendingOffers;
    }
}
