package com.neighbourlink.dto;

public class AdminUserItemDto {
    private final Long userId;
    private final String role;
    private final String fullName;
    private final String email;
    private final String phone;
    private final String suburb;
    private final String accountStatus;
    private final String bio;
    private final String travelPreferences;
    private final String trustNotes;
    private final Double averageRating;
    private final String driverLicenceVerifiedStatus;
    private final String driverVehicleInfo;
    private final Integer driverSpareSeatCapacity;
    private final String driverLicenceDocumentPath;
    private final String driverSpareSeatProofDocumentPath;
    private final String driverVehicleRegoDocumentPath;
    private final String driverVerificationNotes;
    private final String riderPreferredTravelTimes;
    private final String riderUsualDestinations;

    public AdminUserItemDto(
            Long userId,
            String role,
            String fullName,
            String email,
            String phone,
            String suburb,
            String accountStatus,
            String bio,
            String travelPreferences,
            String trustNotes,
            Double averageRating,
            String driverLicenceVerifiedStatus,
            String driverVehicleInfo,
            Integer driverSpareSeatCapacity,
            String driverLicenceDocumentPath,
            String driverSpareSeatProofDocumentPath,
            String driverVehicleRegoDocumentPath,
            String driverVerificationNotes,
            String riderPreferredTravelTimes,
            String riderUsualDestinations
    ) {
        this.userId = userId;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.suburb = suburb;
        this.accountStatus = accountStatus;
        this.bio = bio;
        this.travelPreferences = travelPreferences;
        this.trustNotes = trustNotes;
        this.averageRating = averageRating;
        this.driverLicenceVerifiedStatus = driverLicenceVerifiedStatus;
        this.driverVehicleInfo = driverVehicleInfo;
        this.driverSpareSeatCapacity = driverSpareSeatCapacity;
        this.driverLicenceDocumentPath = driverLicenceDocumentPath;
        this.driverSpareSeatProofDocumentPath = driverSpareSeatProofDocumentPath;
        this.driverVehicleRegoDocumentPath = driverVehicleRegoDocumentPath;
        this.driverVerificationNotes = driverVerificationNotes;
        this.riderPreferredTravelTimes = riderPreferredTravelTimes;
        this.riderUsualDestinations = riderUsualDestinations;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
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

    public String getAccountStatus() {
        return accountStatus;
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

    public String getDriverLicenceVerifiedStatus() {
        return driverLicenceVerifiedStatus;
    }

    public String getDriverVehicleInfo() {
        return driverVehicleInfo;
    }

    public Integer getDriverSpareSeatCapacity() {
        return driverSpareSeatCapacity;
    }

    public String getDriverLicenceDocumentPath() {
        return driverLicenceDocumentPath;
    }

    public String getDriverSpareSeatProofDocumentPath() {
        return driverSpareSeatProofDocumentPath;
    }

    public String getDriverVehicleRegoDocumentPath() {
        return driverVehicleRegoDocumentPath;
    }

    public String getDriverVerificationNotes() {
        return driverVerificationNotes;
    }

    public String getRiderPreferredTravelTimes() {
        return riderPreferredTravelTimes;
    }

    public String getRiderUsualDestinations() {
        return riderUsualDestinations;
    }
}
