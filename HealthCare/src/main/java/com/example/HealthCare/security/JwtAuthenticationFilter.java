package com.example.HealthCare.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.HealthCare.model.Account;
import com.example.HealthCare.repository.AccountRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

	private final JwtUtil jwtUtil;
	private final AccountRepository accountRepository;
	private final UserDetailsService userDetailsService;
	private final TokenBlacklistService tokenBlacklistService;

	public JwtAuthenticationFilter(JwtUtil jwtUtil, AccountRepository accountRepository, 
								  UserDetailsService userDetailsService, TokenBlacklistService tokenBlacklistService) {
		this.jwtUtil = jwtUtil;
		this.accountRepository = accountRepository;
		this.userDetailsService = userDetailsService;
		this.tokenBlacklistService = tokenBlacklistService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String path = request.getServletPath();
		log.debug("JWT Filter processing request for path: {}", path);
		
		final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header == null || !header.startsWith("Bearer ")) {
			log.debug("No Bearer token found, proceeding with filter chain");
			filterChain.doFilter(request, response);
			return;
		}
		final String token = header.substring(7);
		if (tokenBlacklistService.isBlacklisted(token)) {
			log.debug("Token is blacklisted, proceeding with filter chain");
			filterChain.doFilter(request, response);
			return;
		}
		try {
			String username = jwtUtil.extractUsername(token);
			if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				Account account = accountRepository.findByUsername(username).orElse(null);
				if (account != null && jwtUtil.isTokenValid(token, account)) {
					UserDetails userDetails = userDetailsService.loadUserByUsername(username);
					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							userDetails, null, userDetails.getAuthorities());
					authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authentication);
					log.debug("Authentication set for user: {}", username);
				}
			}
		} catch (Exception ex) {
			log.debug("Exception during JWT processing: {}", ex.getMessage());
			// Ignore token errors to avoid blocking public endpoints inadvertently
		}
		filterChain.doFilter(request, response);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getServletPath();
		if (path == null) {
			log.debug("Path is null, will filter");
			return false;
		}
		boolean shouldNotFilter = path.equals("/api/auth/login")
				|| path.equals("/api/auth/refresh")
				|| path.equals("/api/auth/forget-password")
				|| path.equals("/api/auth/reset-password")
				|| path.equals("/api/auth/test-forget-password")
				|| path.equals("/api/auth/register")
				|| path.startsWith("/api/auth/register/personal-info")
				|| path.equals("/api/auth/register/professional-info");
		log.debug("Path: {}, shouldNotFilter: {}", path, shouldNotFilter);
		return shouldNotFilter;
	}
}
