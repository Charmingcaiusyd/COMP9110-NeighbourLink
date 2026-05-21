package com.neighbourlink.dto;

public class DriverTrustSummaryDto {
    private Long driverId;
    private String driverName;
    private Double averageRating;
    private Long ratingCount;

    public DriverTrustSummaryDto(
            Long driverId,
            String driverName,
            Double averageRating,
            Long ratingCount
    ) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
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
}
