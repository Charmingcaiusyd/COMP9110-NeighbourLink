package com.neighbourlink.service;

import com.neighbourlink.dto.AccountPasswordResetRequestDto;
import com.neighbourlink.dto.AccountPasswordResetResponseDto;
import com.neighbourlink.entity.Credential;
import com.neighbourlink.repository.CredentialRepository;
import com.neighbourlink.repository.UserRepository;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            UserRepository userRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AccountPasswordResetResponseDto resetPassword(Long userId, AccountPasswordResetRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String currentPassword = normalizeRequired(request.getCurrentPassword(), "currentPassword is required");
        String newPassword = normalizeRequired(request.getNewPassword(), "newPassword is required");

        if (newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "newPassword must be at least 8 characters");
        }
        if (currentPassword.equals(newPassword)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "newPassword must be different from currentPassword"
            );
        }

        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Credential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credential not found"));

        if (!matchesPassword(currentPassword, credential.getPasswordPlain())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        credential.setPasswordPlain(passwordEncoder.encode(newPassword));
        credentialRepository.save(credential);

        return new AccountPasswordResetResponseDto(userId, "Password has been reset successfully.");
    }

    private boolean matchesPassword(String rawPassword, String storedSecret) {
        if (isEncodedPassword(storedSecret)) {
            return passwordEncoder.matches(rawPassword, storedSecret);
        }
        return rawPassword.equals(storedSecret);
    }

    private boolean isEncodedPassword(String passwordValue) {
        return passwordValue != null
                && (passwordValue.startsWith("$2a$")
                || passwordValue.startsWith("$2b$")
                || passwordValue.startsWith("$2y$"));
    }

    private String normalizeRequired(String value, String message) {
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return trimmed;
    }
}
