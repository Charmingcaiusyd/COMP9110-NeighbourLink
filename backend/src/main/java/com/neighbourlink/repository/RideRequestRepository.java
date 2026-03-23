package com.neighbourlink.repository;

import com.neighbourlink.entity.RideRequest;
import com.neighbourlink.entity.RideRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    @Query("select rr from RideRequest rr join fetch rr.rider r "
            + "where rr.status = :status "
            + "order by rr.tripDate asc, rr.tripTime asc, rr.id asc")
    List<RideRequest> findByStatusWithRider(@Param("status") RideRequestStatus status);

    @Query("select rr from RideRequest rr join fetch rr.rider r where rr.id = :requestId")
    Optional<RideRequest> findByIdWithRider(@Param("requestId") Long requestId);

    @Query("select rr from RideRequest rr where rr.rider.id = :riderId order by rr.tripDate desc, rr.id desc")
    List<RideRequest> findByRiderId(@Param("riderId") Long riderId);

    @Query("select rr from RideRequest rr "
            + "join fetch rr.rider r "
            + "order by rr.tripDate desc, rr.id desc")
    List<RideRequest> findAllWithRiderOrderByRecent();

    long countByStatus(RideRequestStatus status);
}
