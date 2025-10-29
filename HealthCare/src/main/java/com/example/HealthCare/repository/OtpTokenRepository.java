package com.example.HealthCare.repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.OtpPurpose;
import com.example.HealthCare.model.OtpToken;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    
    /**
     * Find valid OTP token by user ID, code, and purpose
     * Valid means: not consumed, not expired, under max attempts
     */
    @Query("SELECT o FROM OtpToken o WHERE " +
           "o.userId = :userId AND " +
           "o.code = :code AND " +
           "o.purpose = :purpose AND " +
           "o.consumedAt IS NULL AND " +
           "o.expiresAt > :now AND " +
           "o.attemptCount < o.maxAttempts")
    Optional<OtpToken> findValidOtp(UUID userId, String code, OtpPurpose purpose, OffsetDateTime now);
    
    /**
     * Find latest OTP for user and purpose (regardless of validity)
     */
    Optional<OtpToken> findFirstByUserIdAndPurposeOrderByCreatedAtDesc(UUID userId, OtpPurpose purpose);
    
    /**
     * Delete all expired OTPs
     */
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now")
    void deleteExpiredTokens(OffsetDateTime now);
    
    /**
     * Delete all consumed OTPs older than specified date
     */
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.consumedAt IS NOT NULL AND o.consumedAt < :olderThan")
    void deleteConsumedTokensOlderThan(OffsetDateTime olderThan);
    
    /**
     * Count unconsumed OTPs for user
     */
    long countByUserIdAndConsumedAtIsNull(UUID userId);
}

