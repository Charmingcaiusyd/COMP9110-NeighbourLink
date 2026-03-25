package com.neighbourlink.controller;

import com.neighbourlink.dto.RatingCreateRequestDto;
import com.neighbourlink.dto.RatingResponseDto;
import com.neighbourlink.service.RatingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RatingResponseDto createRating(@RequestBody RatingCreateRequestDto request) {
        return ratingService.createRating(request);
    }
}
