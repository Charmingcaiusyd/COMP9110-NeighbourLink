package com.neighbourlink.dto;

public class ProfileDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String suburb;
    private String bio;
    private String travelPreferences;
    private String trustNotes;
    private Double averageRating;
    private Long ratingCount;

    public ProfileDto(
            Long userId,
            String fullName,
            String email,
            String phone,
            String suburb,
            String bio,
            String travelPreferences,
            String trustNotes,
            Double averageRating,
            Long ratingCount
    ) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.suburb = suburb;
        this.bio = bio;
        this.travelPreferences = travelPreferences;
        this.trustNotes = trustNotes;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
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

    public String getPhone() {
        return phone;
    }

    public String getSuburb() {
        return suburb;
    }

    public String getBio() {
        return bio;
    }

    public String getTravelPreferences() {
        return travelPreferences;
    }

    public String getTrustNotes() {
        return trustNotes;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Long getRatingCount() {
        return ratingCount;
    }
}
