package com.example.HealthCare.security;

import java.security.Key;
import java.util.Date;
import java.util.List;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.HealthCare.model.UserAccount;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;

@Component
public class JwtUtil {

	@Value("${security.jwt.secret}")
	private String secret;

	@Value("${security.jwt.expiration-ms:86400000}")
	private long expirationMs;

	@Value("${security.jwt.refresh-expiration-ms:604800000}")
	private long refreshExpirationMs;

	private Key getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secret);
		return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
	}

	public String generateToken(UserAccount userAccount) {
		List<String> roles = userAccount.getRole() == null ? 
			List.of() : 
			List.of(userAccount.getRole().name());
		
		// Generate privileges based on role
		List<String> privileges = getPrivilegesByRole(userAccount.getRole());
		
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.setSubject(userAccount.getEmail())
			.claim("userId", userAccount.getId().toString())
			.claim("fullName", userAccount.getFullName())
			.claim("roles", roles)
			.claim("privileges", privileges)
			.claim("type", "access")
			.setIssuedAt(now)
			.setExpiration(expiry)
			.signWith(getSigningKey())
			.compact();
	}

	/**
	 * Map user roles to privileges
	 */
	private List<String> getPrivilegesByRole(com.example.HealthCare.enums.UserRole role) {
		if (role == null) {
			return List.of();
		}
		
		switch (role) {
			case ADMIN:
				return List.of(
					"VIEW_USER", "CREATE_USER", "MODIFY_USER", "DELETE_USER",
					"APPROVE_DOCTOR", "REJECT_DOCTOR"
				);
			case DOCTOR:
				return List.of(
					"VIEW_USER"
				);
			case PATIENT:
				return List.of();
			default:
				return List.of();
		}
	}

	public String generateRefreshToken(UserAccount userAccount) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + refreshExpirationMs);

		return Jwts.builder()
			.setSubject(userAccount.getEmail())
			.claim("userId", userAccount.getId().toString())
			.claim("type", "refresh")
			.setIssuedAt(now)
			.setExpiration(expiry)
			.signWith(getSigningKey())
			.compact();
	}

	public String extractEmail(String token) {
		return getAllClaims(token).getSubject();
	}
	
	// Backward compatibility - alias for extractEmail
	public String extractUsername(String token) {
		return extractEmail(token);
	}

	public Date getExpirationFromToken(String token) {
		return getAllClaims(token).getExpiration();
	}

	public boolean isTokenValid(String token, UserAccount userAccount) {
		final String email = extractEmail(token);
		return email.equals(userAccount.getEmail()) && !isTokenExpired(token);
	}

	public boolean isRefreshToken(String token) {
		return "refresh".equals(getAllClaims(token).get("type", String.class));
	}

	private boolean isTokenExpired(String token) {
		return getAllClaims(token).getExpiration().before(new Date());
	}

	private Claims getAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
	}
}
