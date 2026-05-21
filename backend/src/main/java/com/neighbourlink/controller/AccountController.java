package com.neighbourlink.controller;

import com.neighbourlink.dto.AccountPasswordResetRequestDto;
import com.neighbourlink.dto.AccountPasswordResetResponseDto;
import com.neighbourlink.service.AccountService;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PatchMapping("/users/{userId}/password")
    public AccountPasswordResetResponseDto resetPassword(
            @PathVariable Long userId,
            @RequestBody AccountPasswordResetRequestDto request
    ) {
        return accountService.resetPassword(userId, request);
    }
}
