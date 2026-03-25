package com.neighbourlink.service;

import com.neighbourlink.dto.RatingCreateRequestDto;
import com.neighbourlink.dto.RatingResponseDto;
import com.neighbourlink.entity.Profile;
import com.neighbourlink.entity.Rating;
import com.neighbourlink.entity.User;
import com.neighbourlink.repository.ProfileRepository;
import com.neighbourlink.repository.RatingRepository;
import com.neighbourlink.repository.UserRepository;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public RatingService(
            RatingRepository ratingRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository
    ) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public RatingResponseDto createRating(RatingCreateRequestDto request) {
        validateRequest(request);

        User rater = userRepository.findById(request.getRaterUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rater user not found"));
        User target = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (rater.getId().equals(target.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rater user cannot rate themselves");
        }

        Profile profile = profileRepository.findByUserId(target.getId()).orElseGet(() -> {
            Profile created = new Profile();
            created.setUser(target);
            return profileRepository.save(created);
        });

        Rating rating = new Rating();
        rating.setProfile(profile);
        rating.setRaterUser(rater);
        rating.setScore(request.getScore());
        rating.setComment(normalizeOptional(request.getComment()));

        Rating saved = ratingRepository.save(rating);

        Double average = ratingRepository.findAverageScoreByProfileId(profile.getId());
        profile.setAverageRating(average);
        profileRepository.save(profile);

        return new RatingResponseDto(
                saved.getId(),
                rater.getId(),
                rater.getFullName(),
                target.getId(),
                target.getFullName(),
                saved.getScore(),
                saved.getComment(),
                saved.getCreatedDate()
        );
    }

    private void validateRequest(RatingCreateRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getRaterUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "raterUserId is required");
        }
        if (request.getTargetUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "targetUserId is required");
        }
        if (request.getScore() == null || request.getScore() < 1 || request.getScore() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "score must be between 1 and 5");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
