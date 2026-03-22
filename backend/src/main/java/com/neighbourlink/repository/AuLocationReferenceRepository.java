package com.neighbourlink.repository;

import com.neighbourlink.entity.AuLocationReference;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuLocationReferenceRepository extends JpaRepository<AuLocationReference, Long> {

    @Query("select l from AuLocationReference l "
            + "where lower(l.state) like concat('%', :query, '%') "
            + "or lower(l.suburb) like concat('%', :query, '%') "
            + "or lower(coalesce(l.address, '')) like concat('%', :query, '%') "
            + "or l.postcode like concat('%', :query, '%') "
            + "order by l.state asc, l.suburb asc, l.postcode asc, l.id asc")
    List<AuLocationReference> searchByQuery(@Param("query") String query, Pageable pageable);

    @Query("select l from AuLocationReference l order by l.state asc, l.suburb asc, l.postcode asc, l.id asc")
    List<AuLocationReference> findForBrowse(Pageable pageable);
}
