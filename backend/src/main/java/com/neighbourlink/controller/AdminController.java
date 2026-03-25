package com.neighbourlink.controller;

import com.neighbourlink.dto.AdminJoinRequestItemDto;
import com.neighbourlink.dto.AdminJoinRequestUpdateRequestDto;
import com.neighbourlink.dto.AdminOverviewDto;
import com.neighbourlink.dto.AdminRatingItemDto;
import com.neighbourlink.dto.AdminRatingUpdateRequestDto;
import com.neighbourlink.dto.AdminRideMatchItemDto;
import com.neighbourlink.dto.AdminRideMatchUpdateRequestDto;
import com.neighbourlink.dto.AdminRideOfferItemDto;
import com.neighbourlink.dto.AdminRideOfferUpdateRequestDto;
import com.neighbourlink.dto.AdminRideRequestItemDto;
import com.neighbourlink.dto.AdminRideRequestOfferItemDto;
import com.neighbourlink.dto.AdminRideRequestOfferUpdateRequestDto;
import com.neighbourlink.dto.AdminRideRequestUpdateRequestDto;
import com.neighbourlink.dto.AdminUserItemDto;
import com.neighbourlink.dto.AdminUserUpdateRequestDto;
import com.neighbourlink.service.AdminService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final String ADMIN_SESSION_HEADER = "X-Admin-Session";

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public AdminOverviewDto getOverview(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getOverview(adminSessionHeader);
    }

    @GetMapping("/users")
    public List<AdminUserItemDto> getUsers(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getUsers(adminSessionHeader);
    }

    @PatchMapping("/users/{userId}")
    public AdminUserItemDto updateUser(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long userId,
            @RequestBody AdminUserUpdateRequestDto request
    ) {
        return adminService.updateUser(adminSessionHeader, userId, request);
    }

    @GetMapping("/ride-offers")
    public List<AdminRideOfferItemDto> getRideOffers(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideOffers(adminSessionHeader);
    }

    @PatchMapping("/ride-offers/{offerId}")
    public AdminRideOfferItemDto updateRideOffer(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long offerId,
            @RequestBody AdminRideOfferUpdateRequestDto request
    ) {
        return adminService.updateRideOffer(adminSessionHeader, offerId, request);
    }

    @GetMapping("/ride-requests")
    public List<AdminRideRequestItemDto> getRideRequests(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideRequests(adminSessionHeader);
    }

    @PatchMapping("/ride-requests/{rideRequestId}")
    public AdminRideRequestItemDto updateRideRequest(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long rideRequestId,
            @RequestBody AdminRideRequestUpdateRequestDto request
    ) {
        return adminService.updateRideRequest(adminSessionHeader, rideRequestId, request);
    }

    @GetMapping("/ride-request-offers")
    public List<AdminRideRequestOfferItemDto> getRideRequestOffers(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideRequestOffers(adminSessionHeader);
    }

    @PatchMapping("/ride-request-offers/{offerId}")
    public AdminRideRequestOfferItemDto updateRideRequestOffer(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long offerId,
            @RequestBody AdminRideRequestOfferUpdateRequestDto request
    ) {
        return adminService.updateRideRequestOffer(adminSessionHeader, offerId, request);
    }

    @GetMapping("/join-requests")
    public List<AdminJoinRequestItemDto> getJoinRequests(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getJoinRequests(adminSessionHeader);
    }

    @PatchMapping("/join-requests/{joinRequestId}")
    public AdminJoinRequestItemDto updateJoinRequest(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long joinRequestId,
            @RequestBody AdminJoinRequestUpdateRequestDto request
    ) {
        return adminService.updateJoinRequest(adminSessionHeader, joinRequestId, request);
    }

    @GetMapping("/ride-matches")
    public List<AdminRideMatchItemDto> getRideMatches(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideMatches(adminSessionHeader);
    }

    @PatchMapping("/ride-matches/{rideMatchId}")
    public AdminRideMatchItemDto updateRideMatch(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long rideMatchId,
            @RequestBody AdminRideMatchUpdateRequestDto request
    ) {
        return adminService.updateRideMatch(adminSessionHeader, rideMatchId, request);
    }

    @GetMapping("/ratings")
    public List<AdminRatingItemDto> getRatings(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRatings(adminSessionHeader);
    }

    @PatchMapping("/ratings/{ratingId}")
    public AdminRatingItemDto updateRating(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader,
            @PathVariable Long ratingId,
            @RequestBody AdminRatingUpdateRequestDto request
    ) {
        return adminService.updateRating(adminSessionHeader, ratingId, request);
    }
}
