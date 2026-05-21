package com.neighbourlink.dto;

public class AuthResponseDto {
    private Long userId;
    private String fullName;
    private String email;
    private String role;

    public AuthResponseDto(Long userId, String fullName, String email, String role) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
