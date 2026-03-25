package com.neighbourlink.dto;

public class AdminJoinRequestUpdateRequestDto {
    private Integer requestedSeats;
    private String status;

    public Integer getRequestedSeats() {
        return requestedSeats;
    }

    public void setRequestedSeats(Integer requestedSeats) {
        this.requestedSeats = requestedSeats;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
