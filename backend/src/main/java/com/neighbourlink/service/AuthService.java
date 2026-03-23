package com.neighbourlink.service;

import com.neighbourlink.dto.AuthLoginRequestDto;
import com.neighbourlink.dto.AuthRegisterRequestDto;
import com.neighbourlink.dto.AuthResponseDto;
import com.neighbourlink.dto.AuthSocialLoginRequestDto;
import com.neighbourlink.entity.AccountStatus;
import com.neighbourlink.entity.Credential;
import com.neighbourlink.entity.Driver;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.Rider;
import com.neighbourlink.entity.User;
import com.neighbourlink.entity.VerificationStatus;
import com.neighbourlink.repository.CredentialRepository;
import com.neighbourlink.repository.DriverRepository;
import com.neighbourlink.repository.ProfileRepository;
import com.neighbourlink.repository.RiderRepository;
import com.neighbourlink.repository.UserRepository;
import java.util.Locale;
import java.util.UUID;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final Long ADMIN_USER_ID = -1L;

    private final UserRepository userRepository;
    private final RiderRepository riderRepository;
    private final DriverRepository driverRepository;
    private final ProfileRepository profileRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminFullName;
    private final String adminSessionKey;

    public AuthService(
            UserRepository userRepository,
            RiderRepository riderRepository,
            DriverRepository driverRepository,
            ProfileRepository profileRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            @Value("${neighbourlink.admin.email:admin@neighbourlink.local}") String adminEmail,
            @Value("${neighbourlink.admin.password:admin12345}") String adminPassword,
            @Value("${neighbourlink.admin.full-name:NeighbourLink Admin}") String adminFullName,
            @Value("${neighbourlink.admin.session-key:NL-ADMIN-SESSION-KEY}") String adminSessionKey
    ) {
        this.userRepository = userRepository;
        this.riderRepository = riderRepository;
        this.driverRepository = driverRepository;
        this.profileRepository = profileRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = normalizeRequired(adminEmail, "Admin email must not be blank").toLowerCase(Locale.ROOT);
        this.adminPassword = normalizeRequired(adminPassword, "Admin password must not be blank");
        this.adminFullName = normalizeRequired(adminFullName, "Admin full name must not be blank");
        this.adminSessionKey = normalizeRequired(adminSessionKey, "Admin session key must not be blank");
    }

    public AuthResponseDto login(AuthLoginRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        String email = normalizeRequired(request.getEmail(), "email is required").toLowerCase(Locale.ROOT);
        String password = normalizeRequired(request.getPassword(), "password is required");

        if (isAdminCredentials(email, password)) {
            return buildAdminAuthResponse();
        }

        Credential credential = credentialRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!matchesPassword(password, credential.getPasswordPlain())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!isEncodedPassword(credential.getPasswordPlain())) {
            credential.setPasswordPlain(passwordEncoder.encode(password));
            credentialRepository.save(credential);
        }

        return buildAuthResponse(credential.getUser());
    }

    @Transactional
    public AuthResponseDto register(AuthRegisterRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        String fullName = normalizeRequired(request.getFullName(), "fullName is required");
        String email = normalizeRequired(request.getEmail(), "email is required").toLowerCase(Locale.ROOT);
        String password = normalizeRequired(request.getPassword(), "password is required");

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password must be at least 6 characters");
        }

        String role = parseRole(request.getRole());
        User savedUser;
        if ("DRIVER".equals(role)) {
            Driver driver = new Driver();
            driver.setFullName(fullName);
            driver.setEmail(email);
            driver.setPhone(normalizeOptional(request.getPhone()));
            driver.setSuburb(normalizeOptional(request.getSuburb()));
            driver.setAccountStatus(AccountStatus.ACTIVE);
            driver.setLicenceVerifiedStatus(VerificationStatus.PENDING);
            driver.setSpareSeatCapacity(1);
            savedUser = driverRepository.save(driver);
        } else {
            Rider rider = new Rider();
            rider.setFullName(fullName);
            rider.setEmail(email);
            rider.setPhone(normalizeOptional(request.getPhone()));
            rider.setSuburb(normalizeOptional(request.getSuburb()));
            rider.setAccountStatus(AccountStatus.ACTIVE);
            savedUser = riderRepository.save(rider);
        }

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profileRepository.save(profile);

        Credential credential = new Credential();
        credential.setUser(savedUser);
        credential.setPasswordPlain(passwordEncoder.encode(password));
        credentialRepository.save(credential);

        return buildAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponseDto socialLogin(AuthSocialLoginRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        String provider = normalizeRequired(request.getProvider(), "provider is required").toUpperCase(Locale.ROOT);
        if (!"GOOGLE".equals(provider) && !"APPLE".equals(provider)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "provider must be GOOGLE or APPLE");
        }

        String role = parseRole(request.getRole());
        String email = normalizeOptional(request.getEmail());
        if (email != null) {
            return userRepository.findByEmailIgnoreCase(email)
                    .map(this::buildAuthResponse)
                    .orElseGet(() -> registerSocialUser(request, provider, role, email));
        }

        return registerSocialUser(request, provider, role, provider.toLowerCase(Locale.ROOT) + ".user@demo.local");
    }

    private AuthResponseDto registerSocialUser(AuthSocialLoginRequestDto request, String provider, String role, String email) {
        String fullName = normalizeOptional(request.getFullName());
        if (fullName == null) {
            fullName = provider.substring(0, 1) + provider.substring(1).toLowerCase(Locale.ROOT) + " User";
        }

        String uniqueEmail = email.toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(uniqueEmail)) {
            uniqueEmail = System.currentTimeMillis() + "." + uniqueEmail;
        }

        AuthRegisterRequestDto registerRequest = new AuthRegisterRequestDto();
        registerRequest.setFullName(fullName);
        registerRequest.setEmail(uniqueEmail);
        registerRequest.setPassword("social-" + UUID.randomUUID());
        registerRequest.setRole(role);
        return register(registerRequest);
    }

    private boolean matchesPassword(String rawPassword, String storedSecret) {
        if (storedSecret == null || storedSecret.trim().isEmpty()) {
            return false;
        }
        if (isEncodedPassword(storedSecret)) {
            return passwordEncoder.matches(rawPassword, storedSecret);
        }
        return rawPassword.equals(storedSecret);
    }

    private boolean isEncodedPassword(String passwordValue) {
        return passwordValue.startsWith("$2a$")
                || passwordValue.startsWith("$2b$")
                || passwordValue.startsWith("$2y$");
    }

    private AuthResponseDto buildAuthResponse(User user) {
        String role = resolveRole(user.getId());
        return new AuthResponseDto(user.getId(), user.getFullName(), user.getEmail(), role);
    }

    private boolean isAdminCredentials(String email, String password) {
        return adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password);
    }

    private AuthResponseDto buildAdminAuthResponse() {
        return new AuthResponseDto(
                ADMIN_USER_ID,
                adminFullName,
                adminEmail,
                "ADMIN",
                adminSessionKey
        );
    }

    private String resolveRole(Long userId) {
        if (driverRepository.existsById(userId)) {
            return "DRIVER";
        }
        if (riderRepository.existsById(userId)) {
            return "RIDER";
        }
        return "USER";
    }

    private String parseRole(String role) {
        String value = normalizeOptional(role);
        if (value == null) {
            return "RIDER";
        }
        String normalized = value.toUpperCase(Locale.ROOT);
        if (!"RIDER".equals(normalized) && !"DRIVER".equals(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role must be RIDER or DRIVER");
        }
        return normalized;
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
