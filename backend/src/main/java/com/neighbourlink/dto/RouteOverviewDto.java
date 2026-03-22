package com.neighbourlink.dto;

import java.util.List;

public class RouteOverviewDto {
    private Double distanceMeters;
    private Double durationSeconds;
    private List<RoutePointDto> path;

    public RouteOverviewDto(Double distanceMeters, Double durationSeconds, List<RoutePointDto> path) {
        this.distanceMeters = distanceMeters;
        this.durationSeconds = durationSeconds;
        this.path = path;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public Double getDurationSeconds() {
        return durationSeconds;
    }

    public List<RoutePointDto> getPath() {
        return path;
    }
}
