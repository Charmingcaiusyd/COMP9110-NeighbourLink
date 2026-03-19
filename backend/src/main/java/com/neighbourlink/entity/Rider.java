package com.neighbourlink.entity;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "riders")
public class Rider extends User {

    @Column(name = "preferred_travel_times", length = 200)
    private String preferredTravelTimes;

    @Column(name = "usual_destinations", length = 200)
    private String usualDestinations;

    @OneToMany(mappedBy = "rider")
    private List<RideRequest> rideRequests = new ArrayList<>();

    @OneToMany(mappedBy = "rider")
    private List<JoinRequest> joinRequests = new ArrayList<>();

    @OneToMany(mappedBy = "rider")
    private List<RideMatch> rideMatches = new ArrayList<>();

    public String getPreferredTravelTimes() {
        return preferredTravelTimes;
    }

    public void setPreferredTravelTimes(String preferredTravelTimes) {
        this.preferredTravelTimes = preferredTravelTimes;
    }

    public String getUsualDestinations() {
        return usualDestinations;
    }

    public void setUsualDestinations(String usualDestinations) {
        this.usualDestinations = usualDestinations;
    }

    public List<RideRequest> getRideRequests() {
        return rideRequests;
    }

    public void setRideRequests(List<RideRequest> rideRequests) {
        this.rideRequests = rideRequests;
    }

    public List<JoinRequest> getJoinRequests() {
        return joinRequests;
    }

    public void setJoinRequests(List<JoinRequest> joinRequests) {
        this.joinRequests = joinRequests;
    }

    public List<RideMatch> getRideMatches() {
        return rideMatches;
    }

    public void setRideMatches(List<RideMatch> rideMatches) {
        this.rideMatches = rideMatches;
    }
}
