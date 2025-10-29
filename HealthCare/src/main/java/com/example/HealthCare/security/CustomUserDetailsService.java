package com.example.HealthCare.security;

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
		
		// Create role authority from UserRole enum
		String roleName = "ROLE_" + userAccount.getRole().name();
		return Collections.singletonList(new SimpleGrantedAuthority(roleName));
	}
}
