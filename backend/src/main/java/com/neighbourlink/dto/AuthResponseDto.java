package com.neighbourlink.dto;

public class AuthResponseDto {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String adminSessionKey;

    public AuthResponseDto(Long userId, String fullName, String email, String role) {
        this(userId, fullName, email, role, null);
    }

    public AuthResponseDto(Long userId, String fullName, String email, String role, String adminSessionKey) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.adminSessionKey = adminSessionKey;
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

    public String getAdminSessionKey() {
        return adminSessionKey;
    }
}
