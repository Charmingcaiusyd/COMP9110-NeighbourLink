package com.neighbourlink.entity;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "drivers")
public class Driver extends User {

    @Enumerated(EnumType.STRING)
    @Column(name = "licence_verified_status", nullable = false, length = 20)
    private VerificationStatus licenceVerifiedStatus = VerificationStatus.PENDING;

    @Column(name = "vehicle_info", length = 200)
    private String vehicleInfo;

    @Column(name = "spare_seat_capacity")
    private Integer spareSeatCapacity;

    @OneToMany(mappedBy = "driver")
    private List<RideOffer> rideOffers = new ArrayList<>();

    @OneToMany(mappedBy = "driver")
    private List<RideMatch> rideMatches = new ArrayList<>();

    @OneToMany(mappedBy = "driver")
    private List<RideRequestOffer> rideRequestOffers = new ArrayList<>();

    public VerificationStatus getLicenceVerifiedStatus() {
        return licenceVerifiedStatus;
    }

    public void setLicenceVerifiedStatus(VerificationStatus licenceVerifiedStatus) {
        this.licenceVerifiedStatus = licenceVerifiedStatus;
    }

    public String getVehicleInfo() {
        return vehicleInfo;
    }

    public void setVehicleInfo(String vehicleInfo) {
        this.vehicleInfo = vehicleInfo;
    }

    public Integer getSpareSeatCapacity() {
        return spareSeatCapacity;
    }

    public void setSpareSeatCapacity(Integer spareSeatCapacity) {
        this.spareSeatCapacity = spareSeatCapacity;
    }

    public List<RideOffer> getRideOffers() {
        return rideOffers;
    }

    public void setRideOffers(List<RideOffer> rideOffers) {
        this.rideOffers = rideOffers;
    }

    public List<RideMatch> getRideMatches() {
        return rideMatches;
    }

    public void setRideMatches(List<RideMatch> rideMatches) {
        this.rideMatches = rideMatches;
    }

    public List<RideRequestOffer> getRideRequestOffers() {
        return rideRequestOffers;
    }

    public void setRideRequestOffers(List<RideRequestOffer> rideRequestOffers) {
        this.rideRequestOffers = rideRequestOffers;
    }
}
