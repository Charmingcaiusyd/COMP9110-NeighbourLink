package com.neighbourlink.dto;

public class JoinRequestCreatedResponseDto {
    private Long joinRequestId;
    private Long rideOfferId;
    private Long riderId;
    private Integer requestedSeats;
    private String status;

    public JoinRequestCreatedResponseDto(
            Long joinRequestId,
            Long rideOfferId,
            Long riderId,
            Integer requestedSeats,
            String status
    ) {
        this.joinRequestId = joinRequestId;
        this.rideOfferId = rideOfferId;
        this.riderId = riderId;
        this.requestedSeats = requestedSeats;
        this.status = status;
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

    public Integer getRequestedSeats() {
        return requestedSeats;
    }

    public String getStatus() {
        return status;
    }
}
