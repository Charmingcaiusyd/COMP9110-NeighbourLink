package com.neighbourlink.dto;

public class JoinRequestCreateRequestDto {
    private Long riderId;
    private Long rideOfferId;
    private Integer requestedSeats;

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public Long getRideOfferId() {
        return rideOfferId;
    }

    public void setRideOfferId(Long rideOfferId) {
        this.rideOfferId = rideOfferId;
    }

    public Integer getRequestedSeats() {
        return requestedSeats;
    }

    public void setRequestedSeats(Integer requestedSeats) {
        this.requestedSeats = requestedSeats;
    }
}
