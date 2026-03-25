package com.neighbourlink.dto;

public class AuthRegisterRequestDto {
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String suburb;
    private String driverVehicleInfo;
    private Integer driverSpareSeatCapacity;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getDriverVehicleInfo() {
        return driverVehicleInfo;
    }

    public void setDriverVehicleInfo(String driverVehicleInfo) {
        this.driverVehicleInfo = driverVehicleInfo;
    }

    public Integer getDriverSpareSeatCapacity() {
        return driverSpareSeatCapacity;
    }

    public void setDriverSpareSeatCapacity(Integer driverSpareSeatCapacity) {
        this.driverSpareSeatCapacity = driverSpareSeatCapacity;
    }
}
