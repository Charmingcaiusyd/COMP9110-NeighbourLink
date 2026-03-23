package com.neighbourlink.controller;

import com.neighbourlink.dto.AdminJoinRequestItemDto;
import com.neighbourlink.dto.AdminOverviewDto;
import com.neighbourlink.dto.AdminRideMatchItemDto;
import com.neighbourlink.dto.AdminRideOfferItemDto;
import com.neighbourlink.dto.AdminRideRequestItemDto;
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

    @GetMapping("/ride-requests")
    public List<AdminRideRequestItemDto> getRideRequests(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideRequests(adminSessionHeader);
    }

    @GetMapping("/join-requests")
    public List<AdminJoinRequestItemDto> getJoinRequests(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getJoinRequests(adminSessionHeader);
    }

    @GetMapping("/ride-matches")
    public List<AdminRideMatchItemDto> getRideMatches(
            @RequestHeader(value = ADMIN_SESSION_HEADER, required = false) String adminSessionHeader
    ) {
        return adminService.getRideMatches(adminSessionHeader);
    }
}
