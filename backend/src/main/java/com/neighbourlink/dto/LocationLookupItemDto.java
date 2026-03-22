package com.neighbourlink.dto;

public class LocationLookupItemDto {
    private String source;
    private String displayName;
    private String address;
    private String state;
    private String suburb;
    private String postcode;
    private Double latitude;
    private Double longitude;

    public LocationLookupItemDto(
            String source,
            String displayName,
            String address,
            String state,
            String suburb,
            String postcode,
            Double latitude,
            Double longitude
    ) {
        this.source = source;
        this.displayName = displayName;
        this.address = address;
        this.state = state;
        this.suburb = suburb;
        this.postcode = postcode;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getSource() {
        return source;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAddress() {
        return address;
    }

    public String getState() {
        return state;
    }

    public String getSuburb() {
        return suburb;
    }

    public String getPostcode() {
        return postcode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}
