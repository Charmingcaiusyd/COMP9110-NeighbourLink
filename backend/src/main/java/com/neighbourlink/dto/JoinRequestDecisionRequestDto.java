package com.neighbourlink.dto;

public class JoinRequestDecisionRequestDto {
    private String decision;
    private String meetingPoint;

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public void setMeetingPoint(String meetingPoint) {
        this.meetingPoint = meetingPoint;
    }
}
