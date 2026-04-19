package com.neighbourlink.repository;

import com.neighbourlink.entity.RideOffer;
import com.neighbourlink.entity.RideOfferStatus;
import java.util.List;
import java.util.Optional;
import javax.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {

    @Query("select distinct ro from RideOffer ro "
            + "join fetch ro.driver d "
            + "left join fetch d.profile p "
            + "where ro.status = :status "
            + "and (:passengerCount is null or ro.availableSeats >= :passengerCount) "
            + "order by ro.departureDate asc, ro.departureTime asc, ro.id asc")
    List<RideOffer> searchOpenOffers(
            @Param("status") RideOfferStatus status,
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

    @Query("select ro from RideOffer ro "
            + "join fetch ro.driver d "
            + "where d.id = :driverId "
            + "order by ro.departureDate desc, ro.departureTime desc, ro.id desc")
    List<RideOffer> findByDriverIdWithDriverOrderByRecent(@Param("driverId") Long driverId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ro from RideOffer ro where ro.id = :id")
    Optional<RideOffer> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(RideOfferStatus status);
}
