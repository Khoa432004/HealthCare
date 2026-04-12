package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.ChatThread;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, UUID> {

	@Query("SELECT c FROM ChatThread c WHERE (c.firstUserId = :a AND c.secondUserId = :b) OR (c.firstUserId = :b AND c.secondUserId = :a)")
	Optional<ChatThread> findBetweenUsers(@Param("a") UUID a, @Param("b") UUID b);
}
