package com.neighbourlink.dto;

public class NotificationMarkAllReadResponseDto {
    private Integer updatedCount;

    public NotificationMarkAllReadResponseDto(Integer updatedCount) {
        this.updatedCount = updatedCount;
    }

    public Integer getUpdatedCount() {
        return updatedCount;
    }
}
