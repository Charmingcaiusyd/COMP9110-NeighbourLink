package com.neighbourlink.dto;

public class RideRequestCreateRequestDto {
    private Long riderId;
    private String origin;
    private String originAddress;
    private String originState;
    private String originSuburb;
    private String originPostcode;
    private Double originLatitude;
    private Double originLongitude;
    private String destination;
    private String destinationAddress;
    private String destinationState;
    private String destinationSuburb;
    private String destinationPostcode;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String tripDate;
    private String tripTime;
    private Integer passengerCount;
    private String notes;

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getOriginAddress() {
        return originAddress;
    }

    public void setOriginAddress(String originAddress) {
        this.originAddress = originAddress;
    }

    public String getOriginState() {
        return originState;
    }

    public void setOriginState(String originState) {
        this.originState = originState;
    }

    public String getOriginSuburb() {
        return originSuburb;
    }

    public void setOriginSuburb(String originSuburb) {
        this.originSuburb = originSuburb;
    }

    public String getOriginPostcode() {
        return originPostcode;
    }

    public void setOriginPostcode(String originPostcode) {
        this.originPostcode = originPostcode;
    }

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public void setOriginLatitude(Double originLatitude) {
        this.originLatitude = originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public void setOriginLongitude(Double originLongitude) {
        this.originLongitude = originLongitude;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public String getDestinationState() {
        return destinationState;
    }

    public void setDestinationState(String destinationState) {
        this.destinationState = destinationState;
    }

    public String getDestinationSuburb() {
        return destinationSuburb;
    }

    public void setDestinationSuburb(String destinationSuburb) {
        this.destinationSuburb = destinationSuburb;
    }

    public String getDestinationPostcode() {
        return destinationPostcode;
    }

    public void setDestinationPostcode(String destinationPostcode) {
        this.destinationPostcode = destinationPostcode;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public String getTripDate() {
        return tripDate;
    }

    public void setTripDate(String tripDate) {
        this.tripDate = tripDate;
    }

    public String getTripTime() {
        return tripTime;
    }

    public void setTripTime(String tripTime) {
        this.tripTime = tripTime;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public void setPassengerCount(Integer passengerCount) {
        this.passengerCount = passengerCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
