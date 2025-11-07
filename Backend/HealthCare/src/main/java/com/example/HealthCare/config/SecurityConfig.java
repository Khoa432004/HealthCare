package com.example.HealthCare.config;

import java.util.Base64;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.example.HealthCare.security.CustomJwtGrantedAuthoritiesConverter;
import com.example.HealthCare.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final UserDetailsService userDetailsService;
	private final CorsConfigurationSource corsConfigurationSource;

	@Value("${security.jwt.secret}")
	private String jwtSecret;

	public SecurityConfig(
		JwtAuthenticationFilter jwtAuthenticationFilter, 
		UserDetailsService userDetailsService,
		CorsConfigurationSource corsConfigurationSource
	) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.userDetailsService = userDetailsService;
		this.corsConfigurationSource = corsConfigurationSource;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource)) // Enable CORS with configuration
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
						.accessDeniedHandler(new AccessDeniedHandlerImpl()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(
								"/api/auth/login",
								"/api/auth/refresh",
								"/api/auth/forget-password",
								"/api/auth/reset-password",
								"/api/auth/change-password-first-login",
								"/api/auth/test-forget-password",
								"/api/auth/register",
								"/api/auth/register/personal-info",
								"/api/auth/register/personal-info/**",
								"/api/auth/register/professional-info",
								"/swagger-ui/**",
								"/v3/api-docs/**",
								"/actuator/**",
								"/api/auth/test",
								"/ws/**",
								"/app/**",
								"/topic/**"
								).permitAll()
						.anyRequest().authenticated())
				.oauth2ResourceServer(rs -> rs
						.jwt(jwt -> jwt
								.decoder(jwtDecoder())
								.jwtAuthenticationConverter(jwtAuthenticationConverter()))
						.bearerTokenResolver(bearerTokenResolver())
						.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
				.authenticationProvider(authenticationProvider())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}

	@Bean
	@SuppressWarnings("deprecation")
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setUserDetailsService(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder());
		return provider;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Bean
	public JwtDecoder jwtDecoder() {
		byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
		SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
		return NimbusJwtDecoder.withSecretKey(secretKey).build();
	}

	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(new CustomJwtGrantedAuthoritiesConverter());
		return converter;
	}

	@Bean
	public BearerTokenResolver bearerTokenResolver() {
		DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
		return request -> {
			String path = request.getServletPath();
			if (path != null && (path.equals("/api/auth/login")
					|| path.equals("/api/auth/refresh")
					|| path.equals("/api/auth/forget-password")
					|| path.equals("/api/auth/reset-password")
					|| path.equals("/api/auth/change-password-first-login")
					|| path.equals("/api/auth/test-forget-password")
					|| path.equals("/api/auth/register")
					|| path.startsWith("/api/auth/register/personal-info")
					|| path.equals("/api/auth/register/professional-info"))) {
				return null;
			}
			return delegate.resolve(request);
		};
	}
}
