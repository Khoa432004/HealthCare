package com.example.HealthCare.security;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.HealthCare.enums.Privilege;
import com.example.HealthCare.model.Account;
import com.example.HealthCare.model.User;
import com.example.HealthCare.repository.AccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final AccountRepository accountRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("Account not found: " + username));
		Collection<GrantedAuthority> authorities = buildAuthorities(account);
		User domainUser = account.getUser();
		boolean accountNonLocked = domainUser == null || !domainUser.isLocked();
		boolean enabled = domainUser == null || !domainUser.isDeleted();
		return new org.springframework.security.core.userdetails.User(
				account.getUsername(),
				account.getPassword(),
				enabled,
				true,
				true,
				accountNonLocked,
				authorities);
	}

	private Collection<GrantedAuthority> buildAuthorities(Account account) {
		if (account.getRole() == null) {
			return List.of();
		}
		List<SimpleGrantedAuthority> roleAuthority = List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().getName().name()));
		List<SimpleGrantedAuthority> privilegeAuthorities = account.getRole().getPrivileges() == null ? List.of() : account.getRole().getPrivileges().stream()
				.map(Privilege::name)
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());
		return List.copyOf(new java.util.ArrayList<>(java.util.stream.Stream.concat(roleAuthority.stream(), privilegeAuthorities.stream()).toList()));
	}
}
