package com.neighbourlink.repository;

import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {

    @Query("select distinct ro from RideOffer ro "
            + "join fetch ro.driver d "
            + "left join fetch d.profile p "
            + "where ro.status = :status "
            + "and (:origin is null or lower(ro.origin) = lower(:origin)) "
            + "and (:destination is null or lower(ro.destination) = lower(:destination)) "
            + "and (:departureTime is null or ro.departureTime = :departureTime) "
            + "and (:passengerCount is null or ro.availableSeats >= :passengerCount)")
    List<RideOffer> searchOpenOffers(
            @Param("status") RideOfferStatus status,
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("departureTime") String departureTime,
            @Param("passengerCount") Integer passengerCount
    );

    @Query("select ro from RideOffer ro "
            + "join fetch ro.driver d "
            + "left join fetch d.profile p "
            + "where ro.id = :id")
    Optional<RideOffer> findDetailById(@Param("id") Long id);

    @Query("select ro from RideOffer ro "
            + "join fetch ro.driver d "
            + "order by ro.departureDate desc, ro.id desc")
    List<RideOffer> findAllWithDriverOrderByRecent();

    long countByStatus(RideOfferStatus status);
}
