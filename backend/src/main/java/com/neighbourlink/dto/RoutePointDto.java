package com.neighbourlink.dto;

public class RoutePointDto {
    private Double latitude;
    private Double longitude;

    public RoutePointDto(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}
