package com.neighbourlink.repository;

import com.neighbourlink.entity.Credential;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CredentialRepository extends JpaRepository<Credential, Long> {
    Optional<Credential> findByUserId(Long userId);

    @Query("select c from Credential c join fetch c.user u where lower(u.email) = lower(:email)")
    Optional<Credential> findByUserEmailIgnoreCase(@Param("email") String email);
}
