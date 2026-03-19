package com.neighbourlink.repository;

import com.neighbourlink.entity.RideRequestOffer;
import com.neighbourlink.entity.RideRequestOfferStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RideRequestOfferRepository extends JpaRepository<RideRequestOffer, Long> {

    @Query("select ro from RideRequestOffer ro "
            + "join fetch ro.driver d "
            + "join fetch ro.rideRequest rr "
            + "join fetch rr.rider r "
            + "where ro.id = :offerId")
    Optional<RideRequestOffer> findByIdWithRequestAndDriver(@Param("offerId") Long offerId);

    @Query("select ro from RideRequestOffer ro "
            + "join fetch ro.driver d "
            + "where ro.rideRequest.id = :requestId "
            + "order by ro.createdAt desc")
    List<RideRequestOffer> findByRideRequestIdWithDriver(@Param("requestId") Long requestId);

    List<RideRequestOffer> findByRideRequestIdAndStatus(Long requestId, RideRequestOfferStatus status);

    @Query("select ro from RideRequestOffer ro "
            + "join fetch ro.rideRequest rr "
            + "join fetch rr.rider r "
            + "where ro.driver.id = :driverId "
            + "order by ro.createdAt desc")
    List<RideRequestOffer> findByDriverIdWithRequestAndRider(@Param("driverId") Long driverId);

    Optional<RideRequestOffer> findFirstByRideRequestIdAndDriverIdAndStatus(
            Long requestId,
            Long driverId,
            RideRequestOfferStatus status
    );

    long countByRideRequestId(Long requestId);

    long countByRideRequestIdAndStatus(Long requestId, RideRequestOfferStatus status);

    boolean existsByRideRequestIdAndDriverIdAndStatus(Long requestId, Long driverId, RideRequestOfferStatus status);
}
