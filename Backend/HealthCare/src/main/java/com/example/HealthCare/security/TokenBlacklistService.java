package com.example.HealthCare.security;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TokenBlacklistService {

	@Autowired(required = false)
	private RedisTemplate<String, Object> redisTemplate;
	
	@Autowired
	private JwtUtil jwtUtil;

	@Value("${security.jwt.expiration-ms:86400000}")
	private long jwtExpirationMs;

	private static final String BLACKLIST_PREFIX = "blacklist:";

	public void blacklist(String token) {
		if (token != null && !token.isBlank()) {
			if (redisTemplate == null) {
				return;
			}
			
			try {
				long ttlSeconds = calculateTokenTtl(token);
				String key = BLACKLIST_PREFIX + token;
				redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofSeconds(ttlSeconds));
			} catch (Exception e) {
				try {
					String key = BLACKLIST_PREFIX + token;
					redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofMillis(jwtExpirationMs));
				} catch (Exception ex) {
					log.error("Failed to blacklist token: {}", ex.getMessage());
				}
			}
		}
	}

	@Cacheable(value = "jwtBlacklist", key = "#token")
	public boolean isBlacklisted(String token) {
		if (token == null || token.isBlank()) {
			return false;
		}
		
		if (redisTemplate == null) {
			return false;
		}
		
		try {
			String key = BLACKLIST_PREFIX + token;
			Boolean exists = redisTemplate.hasKey(key);
			return Boolean.TRUE.equals(exists);
		} catch (Exception e) {
			log.error("Failed to check blacklist status: {}", e.getMessage());
			return false;
		}
	}

	private long calculateTokenTtl(String token) {
		try {
			long expirationTimeMs = jwtUtil.getExpirationFromToken(token).getTime();
			long currentTimeMs = System.currentTimeMillis();
			long ttlMs = expirationTimeMs - currentTimeMs;
			return Math.max(ttlMs / 1000 + 60, 60);
		} catch (Exception e) {
			return jwtExpirationMs / 1000;
		}
	}
}


