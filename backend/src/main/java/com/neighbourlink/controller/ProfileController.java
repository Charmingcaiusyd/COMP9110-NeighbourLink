package com.neighbourlink.controller;

import com.neighbourlink.dto.ProfileDto;
import com.neighbourlink.dto.ProfileUpdateRequestDto;
import com.neighbourlink.service.ProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ProfileDto getProfile(@PathVariable Long userId) {
        return profileService.getProfile(userId);
    }

    @PatchMapping("/{userId}")
    public ProfileDto updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateRequestDto request) {
        return profileService.updateProfile(userId, request);
    }
}
