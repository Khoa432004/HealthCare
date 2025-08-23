package com.example.HealthCare.security;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.HealthCare.model.Account;

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

	public String generateToken(Account account) {
		List<String> roles = account.getRole() == null ? List.of() : List.of(account.getRole().getName().name());
		List<String> privileges = account.getRole() == null || account.getRole().getPrivileges() == null ? List.of() : account.getRole().getPrivileges().stream().map(Enum::name).collect(Collectors.toList());
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.setSubject(account.getUsername())
			.claim("roles", roles)
			.claim("privileges", privileges)
			.claim("type", "access")
			.setIssuedAt(now)
			.setExpiration(expiry)
			.signWith(getSigningKey())
			.compact();
	}

	public String generateRefreshToken(Account account) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + refreshExpirationMs);

		return Jwts.builder()
			.setSubject(account.getUsername())
			.claim("type", "refresh")
			.setIssuedAt(now)
			.setExpiration(expiry)
			.signWith(getSigningKey())
			.compact();
	}

	public String extractUsername(String token) {
		return getAllClaims(token).getSubject();
	}

	public Date getExpirationFromToken(String token) {
		return getAllClaims(token).getExpiration();
	}

	public boolean isTokenValid(String token, Account account) {
		final String username = extractUsername(token);
		return username.equals(account.getUsername()) && !isTokenExpired(token);
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
