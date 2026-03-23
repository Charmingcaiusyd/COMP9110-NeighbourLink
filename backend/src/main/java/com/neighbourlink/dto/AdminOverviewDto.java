package com.neighbourlink.dto;

public class AdminOverviewDto {
    private final long totalUsers;
    private final long totalRiders;
    private final long totalDrivers;
    private final long activeUsers;
    private final long suspendedUsers;
    private final long totalRideOffers;
    private final long openRideOffers;
    private final long totalRideRequests;
    private final long openRideRequests;
    private final long totalJoinRequests;
    private final long pendingJoinRequests;
    private final long totalRideMatches;
    private final long totalRatings;

    public AdminOverviewDto(
            long totalUsers,
            long totalRiders,
            long totalDrivers,
            long activeUsers,
            long suspendedUsers,
            long totalRideOffers,
            long openRideOffers,
            long totalRideRequests,
            long openRideRequests,
            long totalJoinRequests,
            long pendingJoinRequests,
            long totalRideMatches,
            long totalRatings
    ) {
        this.totalUsers = totalUsers;
        this.totalRiders = totalRiders;
        this.totalDrivers = totalDrivers;
        this.activeUsers = activeUsers;
        this.suspendedUsers = suspendedUsers;
        this.totalRideOffers = totalRideOffers;
        this.openRideOffers = openRideOffers;
        this.totalRideRequests = totalRideRequests;
        this.openRideRequests = openRideRequests;
        this.totalJoinRequests = totalJoinRequests;
        this.pendingJoinRequests = pendingJoinRequests;
        this.totalRideMatches = totalRideMatches;
        this.totalRatings = totalRatings;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalRiders() {
        return totalRiders;
    }

    public long getTotalDrivers() {
        return totalDrivers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public long getSuspendedUsers() {
        return suspendedUsers;
    }

    public long getTotalRideOffers() {
        return totalRideOffers;
    }

    public long getOpenRideOffers() {
        return openRideOffers;
    }

    public long getTotalRideRequests() {
        return totalRideRequests;
    }

    public long getOpenRideRequests() {
        return openRideRequests;
    }

    public long getTotalJoinRequests() {
        return totalJoinRequests;
    }

    public long getPendingJoinRequests() {
        return pendingJoinRequests;
    }

    public long getTotalRideMatches() {
        return totalRideMatches;
    }

    public long getTotalRatings() {
        return totalRatings;
    }
}
