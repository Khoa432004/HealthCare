package com.example.HealthCare.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserAccountRepository userAccountRepository;
	private final JwtUtil jwtUtil;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
		
		// Check if account is active
		boolean enabled = userAccount.getStatus() == AccountStatus.ACTIVE;
		boolean accountNonLocked = !userAccount.getIsDeleted();
		
		Collection<GrantedAuthority> authorities = buildAuthorities(userAccount);
		
		return new org.springframework.security.core.userdetails.User(
				userAccount.getEmail(),
				userAccount.getPasswordHash() != null ? userAccount.getPasswordHash() : "",
				enabled,
				true, // accountNonExpired
				true, // credentialsNonExpired
				accountNonLocked,
				authorities);
	}

	private Collection<GrantedAuthority> buildAuthorities(UserAccount userAccount) {
		if (userAccount.getRole() == null) {
			return Collections.emptyList();
		}
		
		List<GrantedAuthority> authorities = new ArrayList<>();
		
		// Role authority (ROLE_DOCTOR, ROLE_PATIENT, etc.)
		String roleName = "ROLE_" + userAccount.getRole().name();
		authorities.add(new SimpleGrantedAuthority(roleName));
		
		// Privileges for @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')") etc.
		List<String> privileges = jwtUtil.getPrivilegesByRolePublic(userAccount.getRole());
		if (privileges != null) {
			for (String privilege : privileges) {
				authorities.add(new SimpleGrantedAuthority(privilege));
			}
		}
		
		return authorities;
	}
}
