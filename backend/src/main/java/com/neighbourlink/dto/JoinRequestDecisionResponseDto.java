package com.neighbourlink.dto;

public class JoinRequestDecisionResponseDto {
    private Long joinRequestId;
    private String status;
    private Long rideMatchId;
    private Integer updatedAvailableSeats;

    public JoinRequestDecisionResponseDto(
            Long joinRequestId,
            String status,
            Long rideMatchId,
            Integer updatedAvailableSeats
    ) {
        this.joinRequestId = joinRequestId;
        this.status = status;
        this.rideMatchId = rideMatchId;
        this.updatedAvailableSeats = updatedAvailableSeats;
    }

    public Long getJoinRequestId() {
        return joinRequestId;
    }

    public String getStatus() {
        return status;
    }

    public Long getRideMatchId() {
        return rideMatchId;
    }

    public Integer getUpdatedAvailableSeats() {
        return updatedAvailableSeats;
    }
}
