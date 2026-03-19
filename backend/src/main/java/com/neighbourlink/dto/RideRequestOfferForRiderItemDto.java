package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class RideRequestOfferForRiderItemDto {
    private Long offerId;
    private Long driverId;
    private String driverName;
    private Integer proposedSeats;
    private String meetingPoint;
    private String status;
    private LocalDateTime createdAt;

    public RideRequestOfferForRiderItemDto(
            Long offerId,
            Long driverId,
            String driverName,
            Integer proposedSeats,
            String meetingPoint,
            String status,
            LocalDateTime createdAt
    ) {
        this.offerId = offerId;
        this.driverId = driverId;
        this.driverName = driverName;
        this.proposedSeats = proposedSeats;
        this.meetingPoint = meetingPoint;
        this.status = status;
        this.createdAt = createdAt;
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
