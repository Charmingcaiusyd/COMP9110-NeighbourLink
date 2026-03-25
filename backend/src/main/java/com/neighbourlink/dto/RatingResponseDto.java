package com.neighbourlink.dto;

import java.time.LocalDateTime;

public class RatingResponseDto {
    private final Long ratingId;
    private final Long raterUserId;
    private final String raterName;
    private final Long targetUserId;
    private final String targetUserName;
    private final Integer score;
    private final String comment;
    private final LocalDateTime createdDate;

    public RatingResponseDto(
            Long ratingId,
            Long raterUserId,
            String raterName,
            Long targetUserId,
            String targetUserName,
            Integer score,
            String comment,
            LocalDateTime createdDate
    ) {
        this.ratingId = ratingId;
        this.raterUserId = raterUserId;
        this.raterName = raterName;
        this.targetUserId = targetUserId;
        this.targetUserName = targetUserName;
        this.score = score;
        this.comment = comment;
        this.createdDate = createdDate;
    }

    public Long getRatingId() {
        return ratingId;
    }

    public Long getRaterUserId() {
        return raterUserId;
    }

    public String getRaterName() {
        return raterName;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public String getTargetUserName() {
        return targetUserName;
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
