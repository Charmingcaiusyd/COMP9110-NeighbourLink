package com.neighbourlink.dto;

public class DriverTrustSummaryDto {
    private Long driverId;
    private String driverName;
    private Double averageRating;
    private Long ratingCount;
    private String bio;
    private String travelPreferences;
    private String trustNotes;

    public DriverTrustSummaryDto(
            Long driverId,
            String driverName,
            Double averageRating,
            Long ratingCount,
            String bio,
            String travelPreferences,
            String trustNotes
    ) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
        this.bio = bio;
        this.travelPreferences = travelPreferences;
        this.trustNotes = trustNotes;
    }

    public Long getDriverId() {
        return driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Long getRatingCount() {
        return ratingCount;
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
}
