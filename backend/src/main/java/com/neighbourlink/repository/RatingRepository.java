package com.neighbourlink.repository;

import com.neighbourlink.entity.Rating;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    long countByProfileId(Long profileId);

    @Query("select avg(r.score) from Rating r where r.profile.id = :profileId")
    Double findAverageScoreByProfileId(@Param("profileId") Long profileId);
}
