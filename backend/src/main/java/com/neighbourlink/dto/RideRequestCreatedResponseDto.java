package com.neighbourlink.dto;

public class RideRequestCreatedResponseDto {
    private Long rideRequestId;
    private String status;

    public RideRequestCreatedResponseDto(Long rideRequestId, String status) {
        this.rideRequestId = rideRequestId;
        this.status = status;
    }

    public Long getRideRequestId() {
        return rideRequestId;
    }

    public String getStatus() {
        return status;
    }
}
