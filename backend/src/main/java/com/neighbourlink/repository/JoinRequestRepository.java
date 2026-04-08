package com.neighbourlink.repository;

import com.neighbourlink.entity.JoinRequest;
import com.neighbourlink.entity.JoinRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    @Query("select jr from JoinRequest jr "
            + "join fetch jr.rideOffer ro "
            + "join fetch jr.rider r "
            + "where ro.driver.id = :driverId and jr.status = :status")
    List<JoinRequest> findPendingByDriverId(
            @Param("driverId") Long driverId,
            @Param("status") JoinRequestStatus status
    );

    @Query("select jr from JoinRequest jr "
            + "join fetch jr.rideOffer ro "
            + "join fetch ro.driver d "
            + "join fetch jr.rider r "
            + "where jr.id = :joinRequestId")
    Optional<JoinRequest> findByIdWithOfferDriverAndRider(@Param("joinRequestId") Long joinRequestId);

    @Query("select jr from JoinRequest jr "
            + "join fetch jr.rideOffer ro "
            + "join fetch ro.driver d "
            + "join fetch jr.rider r "
            + "order by jr.requestDateTime desc, jr.id desc")
    List<JoinRequest> findAllWithOfferAndRider();

    @Query("select jr from JoinRequest jr "
            + "join fetch jr.rideOffer ro "
            + "join fetch ro.driver d "
            + "join fetch jr.rider r "
            + "where r.id = :riderId "
            + "order by jr.requestDateTime desc, jr.id desc")
    List<JoinRequest> findByRiderIdWithOfferAndDriver(@Param("riderId") Long riderId);

    boolean existsByRiderIdAndRideOfferIdAndStatus(Long riderId, Long rideOfferId, JoinRequestStatus status);

    List<JoinRequest> findByRideOfferIdAndStatus(Long rideOfferId, JoinRequestStatus status);

    long countByStatus(JoinRequestStatus status);
}
