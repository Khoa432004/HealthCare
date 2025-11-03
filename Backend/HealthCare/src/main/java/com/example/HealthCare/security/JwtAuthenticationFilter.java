package com.example.HealthCare.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
	private final UserAccountRepository userAccountRepository;
	private final UserDetailsService userDetailsService;
	private final TokenBlacklistService tokenBlacklistService;

	public JwtAuthenticationFilter(JwtUtil jwtUtil, UserAccountRepository userAccountRepository, 
								  UserDetailsService userDetailsService, TokenBlacklistService tokenBlacklistService) {
		this.jwtUtil = jwtUtil;
		this.userAccountRepository = userAccountRepository;
		this.userDetailsService = userDetailsService;
		this.tokenBlacklistService = tokenBlacklistService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header == null || !header.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		final String token = header.substring(7);
		if (tokenBlacklistService.isBlacklisted(token)) {
			filterChain.doFilter(request, response);
			return;
		}
		try {
			String email = jwtUtil.extractEmail(token);
			if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
				if (userAccount != null && jwtUtil.isTokenValid(token, userAccount)) {
					UserDetails userDetails = userDetailsService.loadUserByUsername(email);
					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							userDetails, null, userDetails.getAuthorities());
					authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
		} catch (Exception ex) {
		}
		filterChain.doFilter(request, response);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getServletPath();
		if (path == null) {
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
		return shouldNotFilter;
	}
}
