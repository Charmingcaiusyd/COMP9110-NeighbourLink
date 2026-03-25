package com.neighbourlink.dto;

public class AdminUserUpdateRequestDto {
    private String fullName;
    private String email;
    private String phone;
    private String suburb;
    private String accountStatus;
    private String bio;
    private String travelPreferences;
    private String trustNotes;
    private String driverLicenceVerifiedStatus;
    private String driverVehicleInfo;
    private Integer driverSpareSeatCapacity;
    private String driverVerificationNotes;
    private String riderPreferredTravelTimes;
    private String riderUsualDestinations;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSuburb() {
        return suburb;
    }

    public void setSuburb(String suburb) {
        this.suburb = suburb;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getTravelPreferences() {
        return travelPreferences;
    }

    public void setTravelPreferences(String travelPreferences) {
        this.travelPreferences = travelPreferences;
    }

    public String getTrustNotes() {
        return trustNotes;
    }

    public void setTrustNotes(String trustNotes) {
        this.trustNotes = trustNotes;
    }

    public String getDriverLicenceVerifiedStatus() {
        return driverLicenceVerifiedStatus;
    }

    public void setDriverLicenceVerifiedStatus(String driverLicenceVerifiedStatus) {
        this.driverLicenceVerifiedStatus = driverLicenceVerifiedStatus;
    }

    public String getDriverVehicleInfo() {
        return driverVehicleInfo;
    }

    public void setDriverVehicleInfo(String driverVehicleInfo) {
        this.driverVehicleInfo = driverVehicleInfo;
    }

    public Integer getDriverSpareSeatCapacity() {
        return driverSpareSeatCapacity;
    }

    public void setDriverSpareSeatCapacity(Integer driverSpareSeatCapacity) {
        this.driverSpareSeatCapacity = driverSpareSeatCapacity;
    }

    public String getDriverVerificationNotes() {
        return driverVerificationNotes;
    }

    public void setDriverVerificationNotes(String driverVerificationNotes) {
        this.driverVerificationNotes = driverVerificationNotes;
    }

    public String getRiderPreferredTravelTimes() {
        return riderPreferredTravelTimes;
    }

    public void setRiderPreferredTravelTimes(String riderPreferredTravelTimes) {
        this.riderPreferredTravelTimes = riderPreferredTravelTimes;
    }

    public String getRiderUsualDestinations() {
        return riderUsualDestinations;
    }

    public void setRiderUsualDestinations(String riderUsualDestinations) {
        this.riderUsualDestinations = riderUsualDestinations;
    }
}
