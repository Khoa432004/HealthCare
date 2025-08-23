package com.example.HealthCare.security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenBlacklistService {

	private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

	public void blacklist(String token) {
		if (token != null && !token.isBlank()) {
			blacklistedTokens.add(token);
		}
	}

	public boolean isBlacklisted(String token) {
		return token != null && blacklistedTokens.contains(token);
	}
}


