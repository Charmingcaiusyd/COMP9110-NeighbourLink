package com.neighbourlink.service;

import com.neighbourlink.dto.ProfileDto;
import com.neighbourlink.dto.ProfileUpdateRequestDto;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.User;
import com.neighbourlink.repository.ProfileRepository;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.UserRepository;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RatingRepository ratingRepository;

    public ProfileService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            RatingRepository ratingRepository
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.ratingRepository = ratingRepository;
    }

    public ProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(user));
        return toDto(user, profile);
    }

    @Transactional
    public ProfileDto updateProfile(Long userId, ProfileUpdateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(user));

        if (request.getFullName() != null) {
            String fullName = normalizeOptional(request.getFullName());
            if (fullName == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fullName cannot be blank");
            }
            user.setFullName(fullName);
        }
        if (request.getPhone() != null) {
            user.setPhone(normalizeOptional(request.getPhone()));
        }
        if (request.getSuburb() != null) {
            user.setSuburb(normalizeOptional(request.getSuburb()));
        }
        if (request.getBio() != null) {
            profile.setBio(normalizeOptional(request.getBio()));
        }
        if (request.getTravelPreferences() != null) {
            profile.setTravelPreferences(normalizeOptional(request.getTravelPreferences()));
        }
        if (request.getTrustNotes() != null) {
            profile.setTrustNotes(normalizeOptional(request.getTrustNotes()));
        }

        userRepository.save(user);
        profileRepository.save(profile);
        return toDto(user, profile);
    }

    private Profile createEmptyProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        return profileRepository.save(profile);
    }

    private ProfileDto toDto(User user, Profile profile) {
        Long ratingCount = profile.getId() == null ? 0L : ratingRepository.countByProfileId(profile.getId());
        return new ProfileDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getSuburb(),
                profile.getBio(),
                profile.getTravelPreferences(),
                profile.getTrustNotes(),
                profile.getAverageRating(),
                ratingCount
        );
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
