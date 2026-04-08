package com.neighbourlink.repository;

import com.neighbourlink.entity.RideMatch;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RideMatchRepository extends JpaRepository<RideMatch, Long> {
    boolean existsByRideRequestId(Long rideRequestId);

    List<RideMatch> findByRideRequestId(Long rideRequestId);

    Optional<RideMatch> findByAcceptedJoinRequestId(Long acceptedJoinRequestId);

    @Query("select rm from RideMatch rm "
            + "join fetch rm.driver d "
            + "join fetch rm.rider r "
            + "left join fetch rm.rideOffer ro "
            + "left join fetch rm.rideRequest rr "
            + "where r.id = :riderId "
            + "order by rm.confirmedDateTime desc")
    List<RideMatch> findByRiderIdWithDetails(@Param("riderId") Long riderId);

    @Query("select rm from RideMatch rm "
            + "join fetch rm.driver d "
            + "join fetch rm.rider r "
            + "left join fetch rm.rideOffer ro "
            + "left join fetch rm.rideRequest rr "
            + "where d.id = :driverId "
            + "order by rm.confirmedDateTime desc")
    List<RideMatch> findByDriverIdWithDetails(@Param("driverId") Long driverId);

    @Query("select rm from RideMatch rm "
            + "join fetch rm.driver d "
            + "join fetch rm.rider r "
            + "left join fetch rm.rideOffer ro "
            + "left join fetch rm.rideRequest rr "
            + "order by rm.confirmedDateTime desc, rm.id desc")
    List<RideMatch> findAllWithDetails();
}
