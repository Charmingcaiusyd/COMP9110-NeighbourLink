package com.neighbourlink.dto;

public class AccountPasswordResetResponseDto {
    private Long userId;
    private String message;

    public AccountPasswordResetResponseDto(Long userId, String message) {
        this.userId = userId;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }
}
