package com.neighbourlink.dto;

public class AdminRideRequestOfferUpdateRequestDto {
    private Integer proposedSeats;
    private String meetingPoint;
    private String status;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
