package com.neighbourlink.repository;

import com.neighbourlink.entity.Rating;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    @Query("select r from Rating r "
            + "join fetch r.profile p "
            + "join fetch p.user target "
            + "join fetch r.raterUser ru "
            + "order by r.createdDate desc, r.id desc")
    List<Rating> findAllWithDetails();

    @Query("select r from Rating r "
            + "join fetch r.profile p "
            + "join fetch p.user target "
            + "join fetch r.raterUser ru "
            + "where r.id = :ratingId")
    Optional<Rating> findByIdWithDetails(@Param("ratingId") Long ratingId);

    long countByProfileId(Long profileId);

    @Query("select avg(r.score) from Rating r where r.profile.id = :profileId")
    Double findAverageScoreByProfileId(@Param("profileId") Long profileId);
}
