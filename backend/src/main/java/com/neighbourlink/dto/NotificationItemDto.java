package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class NotificationItemDto {
    private Long notificationId;
    private String type;
    private String title;
    private String message;
    private Long relatedRideMatchId;
    private Boolean read;
    private LocalDateTime createdAt;

    public NotificationItemDto(
            Long notificationId,
            String type,
            String title,
            String message,
            Long relatedRideMatchId,
            Boolean read,
            LocalDateTime createdAt
    ) {
        this.notificationId = notificationId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedRideMatchId = relatedRideMatchId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public Long getRelatedRideMatchId() {
        return relatedRideMatchId;
    }

    public Boolean getRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
