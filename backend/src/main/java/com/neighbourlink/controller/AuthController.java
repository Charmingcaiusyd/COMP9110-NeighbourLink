package com.neighbourlink.controller;

import com.neighbourlink.dto.AuthLoginRequestDto;
import com.neighbourlink.dto.AuthRegisterRequestDto;
import com.neighbourlink.dto.AuthResponseDto;
import com.neighbourlink.dto.AuthSocialLoginRequestDto;
import com.neighbourlink.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponseDto login(@RequestBody AuthLoginRequestDto request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDto register(@RequestBody AuthRegisterRequestDto request) {
        return authService.register(request);
    }

    @PostMapping("/social-login")
    public AuthResponseDto socialLogin(@RequestBody AuthSocialLoginRequestDto request) {
        return authService.socialLogin(request);
    }
}
