package com.example.HealthCare.security;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

	private final RedisTemplate<String, Object> redisTemplate;
	private final JwtUtil jwtUtil;

	@Value("${security.jwt.expiration-ms:86400000}")
	private long jwtExpirationMs;

	private static final String BLACKLIST_PREFIX = "blacklist:";

	public void blacklist(String token) {
		if (token != null && !token.isBlank()) {
			try {
				// Calculate TTL based on token expiration
				long ttlSeconds = calculateTokenTtl(token);
				
				String key = BLACKLIST_PREFIX + token;
				redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofSeconds(ttlSeconds));
				
				log.debug("Token blacklisted with TTL {} seconds", ttlSeconds);
			} catch (Exception e) {
				log.error("Failed to blacklist token: {}", e.getMessage());
				// Fallback: set with default expiration
				String key = BLACKLIST_PREFIX + token;
				redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofMillis(jwtExpirationMs));
			}
		}
	}

	@Cacheable(value = "jwtBlacklist", key = "#token")
	public boolean isBlacklisted(String token) {
		if (token == null || token.isBlank()) {
			return false;
		}
		
		try {
			String key = BLACKLIST_PREFIX + token;
			Boolean exists = redisTemplate.hasKey(key);
			return Boolean.TRUE.equals(exists);
		} catch (Exception e) {
			log.error("Failed to check blacklist status: {}", e.getMessage());
			return false; // Default to not blacklisted on error
		}
	}

	private long calculateTokenTtl(String token) {
		try {
			// Get token expiration time from JWT
			long expirationTimeMs = jwtUtil.getExpirationFromToken(token).getTime();
			long currentTimeMs = System.currentTimeMillis();
			long ttlMs = expirationTimeMs - currentTimeMs;
			
			// Convert to seconds and add a small buffer
			return Math.max(ttlMs / 1000 + 60, 60); // At least 1 minute
		} catch (Exception e) {
			log.warn("Could not extract expiration from token, using default TTL: {}", e.getMessage());
			return jwtExpirationMs / 1000; // Default to configured expiration
		}
	}
}


