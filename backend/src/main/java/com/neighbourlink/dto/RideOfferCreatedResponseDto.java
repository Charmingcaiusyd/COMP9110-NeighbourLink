package com.neighbourlink.dto;

public class RideOfferCreatedResponseDto {
    private Long offerId;
    private String status;

    public RideOfferCreatedResponseDto(Long offerId, String status) {
        this.offerId = offerId;
        this.status = status;
    }

    public Long getOfferId() {
        return offerId;
    }

    public String getStatus() {
        return status;
    }
}
