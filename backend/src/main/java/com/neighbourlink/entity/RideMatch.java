package com.neighbourlink.entity;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import org.hibernate.annotations.Check;

@Entity
@Table(
        name = "ride_matches",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ride_matches_ride_request_id", columnNames = {"ride_request_id"}),
                @UniqueConstraint(name = "uk_ride_matches_join_request_id", columnNames = {"accepted_join_request_id"}),
                @UniqueConstraint(name = "uk_ride_matches_ride_request_offer_id", columnNames = {"accepted_ride_request_offer_id"})
        }
)
@Check(constraints = "("
        + "(accepted_join_request_id is not null and accepted_ride_request_offer_id is null and ride_offer_id is not null and ride_request_id is null)"
        + " or "
        + "(accepted_join_request_id is null and accepted_ride_request_offer_id is not null and ride_offer_id is null and ride_request_id is not null)"
        + ")")
public class RideMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private Rider rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_offer_id")
    private RideOffer rideOffer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_request_id")
    private RideRequest rideRequest;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_join_request_id")
    private JoinRequest acceptedJoinRequest;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_ride_request_offer_id")
    private RideRequestOffer acceptedRideRequestOffer;

    @Column(name = "confirmed_date_time", nullable = false)
    private LocalDateTime confirmedDateTime = LocalDateTime.now();

    @Column(name = "meeting_point", length = 150)
    private String meetingPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status", nullable = false, length = 20)
    private TripStatus tripStatus = TripStatus.CONFIRMED;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public Rider getRider() {
        return rider;
    }

    public void setRider(Rider rider) {
        this.rider = rider;
    }

    public RideOffer getRideOffer() {
        return rideOffer;
    }

    public void setRideOffer(RideOffer rideOffer) {
        this.rideOffer = rideOffer;
    }

    public RideRequest getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(RideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }

    public JoinRequest getAcceptedJoinRequest() {
        return acceptedJoinRequest;
    }

    public void setAcceptedJoinRequest(JoinRequest acceptedJoinRequest) {
        this.acceptedJoinRequest = acceptedJoinRequest;
    }

    public RideRequestOffer getAcceptedRideRequestOffer() {
        return acceptedRideRequestOffer;
    }

    public void setAcceptedRideRequestOffer(RideRequestOffer acceptedRideRequestOffer) {
        this.acceptedRideRequestOffer = acceptedRideRequestOffer;
    }

    public LocalDateTime getConfirmedDateTime() {
        return confirmedDateTime;
    }

    public void setConfirmedDateTime(LocalDateTime confirmedDateTime) {
        this.confirmedDateTime = confirmedDateTime;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public void setMeetingPoint(String meetingPoint) {
        this.meetingPoint = meetingPoint;
    }

    public TripStatus getTripStatus() {
        return tripStatus;
    }

    public void setTripStatus(TripStatus tripStatus) {
        this.tripStatus = tripStatus;
    }
}
