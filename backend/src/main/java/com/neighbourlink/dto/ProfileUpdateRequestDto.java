package com.neighbourlink.dto;

public class ProfileUpdateRequestDto {
    private String fullName;
    private String phone;
    private String suburb;
    private String bio;
    private String travelPreferences;
    private String trustNotes;

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

    public String getSuburb() {
        return suburb;
    }

    public void setSuburb(String suburb) {
        this.suburb = suburb;
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
}
