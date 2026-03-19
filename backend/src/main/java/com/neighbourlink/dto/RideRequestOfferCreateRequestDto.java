package com.neighbourlink.dto;

public class RideRequestOfferCreateRequestDto {
    private Long driverId;
    private Integer proposedSeats;
    private String meetingPoint;

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Integer getProposedSeats() {
        return proposedSeats;
    }

    public void setProposedSeats(Integer proposedSeats) {
        this.proposedSeats = proposedSeats;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public void setMeetingPoint(String meetingPoint) {
        this.meetingPoint = meetingPoint;
    }
}
