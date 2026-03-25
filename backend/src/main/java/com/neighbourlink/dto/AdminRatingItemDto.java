package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class AdminRatingItemDto {
    private final Long ratingId;
    private final Long targetUserId;
    private final String targetUserName;
    private final Long raterUserId;
    private final String raterUserName;
    private final Integer score;
    private final String comment;
    private final LocalDateTime createdDate;

    public AdminRatingItemDto(
            Long ratingId,
            Long targetUserId,
            String targetUserName,
            Long raterUserId,
            String raterUserName,
            Integer score,
            String comment,
            LocalDateTime createdDate
    ) {
        this.ratingId = ratingId;
        this.targetUserId = targetUserId;
        this.targetUserName = targetUserName;
        this.raterUserId = raterUserId;
        this.raterUserName = raterUserName;
        this.score = score;
        this.comment = comment;
        this.createdDate = createdDate;
    }

    public Long getRatingId() {
        return ratingId;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public String getTargetUserName() {
        return targetUserName;
    }

    public Long getRaterUserId() {
        return raterUserId;
    }

    public String getRaterUserName() {
        return raterUserName;
    }

    public Integer getScore() {
        return score;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}
