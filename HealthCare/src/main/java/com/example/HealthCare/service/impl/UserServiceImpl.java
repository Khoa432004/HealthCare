package com.example.HealthCare.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateUserRequest;
import com.example.HealthCare.dto.request.UpdateUserRequest;
import com.example.HealthCare.dto.request.UserCriteria;
import com.example.HealthCare.dto.response.PrivilegeResponse;
import com.example.HealthCare.dto.response.UserResponse;
import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Account;
import com.example.HealthCare.model.Role;
import com.example.HealthCare.model.User;
import com.example.HealthCare.repository.AccountRepository;
import com.example.HealthCare.repository.RoleRepository;
import com.example.HealthCare.repository.UserRepository;
import com.example.HealthCare.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final AccountRepository accountRepository;

	@Override
	@CacheEvict(value = {"users", "pendingDoctors"}, allEntries = true)
	public void createUser(CreateUserRequest req) {
		if (accountRepository.existsByUsername(req.getUsername())) {
			throw new BadRequestException("Username already exists");
		}
		if (accountRepository.existsByEmail(req.getEmail())) {
			throw new BadRequestException("Email already exists");
		}
		if (userRepository.existsByPhoneAndIsDeletedFalse(req.getPhone())) {
			throw new BadRequestException("Phone already exists");
		}
		if (userRepository.existsByIdentityCardAndIsDeletedFalse(req.getIdentityCard())) {
			throw new BadRequestException("Identity card already exists");
		}

		Role role = roleRepository.findByName(parseRoleType(req.getRole()))
				.orElseThrow(() -> new NotFoundException("Role not found"));

		Account account = new Account(req.getEmail(), req.getUsername(), passwordEncoder.encode(req.getPassword()));
		account.setRole(role);
		account = accountRepository.save(account);

		User user = User.builder()
				.fullName(req.getFullName())
				.phone(req.getPhone())
				.identityCard(req.getIdentityCard())
				.dateOfBirth(parseDate(req.getDateOfBirth()))
				.gender(req.getGender())
				.address(req.getAddress())
				.department(req.getDepartment())
				.account(account)
				.build();

		userRepository.save(user);
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#req.id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void updateUser(UpdateUserRequest req) {
		if (req.getRole() != null && !req.getRole().isBlank()) {
			String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
			Account currentAccount = accountRepository.findByUsername(currentUsername)
					.orElseThrow(() -> new BadRequestException("Current account not found"));
			User currentUser = currentAccount.getUser();
			if (req.getId().equals(currentUser.getId())) {
				throw new BadRequestException("You cannot update your role by yourself");
			}
		}

		User user = userRepository.findByIdAndIsDeletedFalse(req.getId())
				.orElseThrow(() -> new NotFoundException("User not found with id: " + req.getId()));

		String newEmail = req.getEmail() != null ? req.getEmail() : (user.getAccount() != null ? user.getAccount().getEmail() : null);
		if (newEmail != null && accountRepository.existsByEmail(newEmail)
				&& (user.getAccount() == null || !newEmail.equals(user.getAccount().getEmail()))) {
			throw new BadRequestException("Email is already taken by another user");
		}

		if (req.getFullName() != null) {
			user.setFullName(req.getFullName());
		}
		if (req.getDateOfBirth() != null) {
			user.setDateOfBirth(parseDate(req.getDateOfBirth()));
		}
		if (req.getGender() != null) {
			user.setGender(req.getGender());
		}
		if (req.getAddress() != null) {
			user.setAddress(req.getAddress());
		}
		if (req.getEmail() != null && user.getAccount() != null) {
			user.getAccount().setEmail(req.getEmail());
		}

		if (req.getRole() != null && user.getAccount() != null) {
			Role role = roleRepository.findByName(RoleType.valueOf(req.getRole()))
					.orElseThrow(() -> new NotFoundException("Role not found with name: " + req.getRole()));
			user.getAccount().setRole(role);
		}

		userRepository.save(user);
	}

	@Override
	@Cacheable(value = "users", key = "#criteria.toString() + '_' + #page + '_' + #size")
	public Page<UserResponse> getAllUsers(UserCriteria criteria, int page, int size) {
		Page<User> users = userRepository.findAll(
				PageRequest.of(page, size, Sort.by("id").ascending()));
		return users.map(this::mapToUserResponse);
	}

	@Override
	@Transactional
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void deleteUser(Long id) {
		String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
		Account currentAccount = accountRepository.findByUsername(currentUsername)
				.orElseThrow(() -> new BadRequestException("Current account not found"));
		User currentUser = currentAccount.getUser();
		if (currentUser.getId().equals(id)) {
			throw new BadRequestException("Cannot delete yourself");
		}

		User user = userRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));

		if (user.isDeleted()) {
			throw new BadRequestException("User with id: " + id + " has already been deleted");
		}

		if (user.getAccount() != null && user.getAccount().getRole() != null
				&& user.getAccount().getRole().getName() == RoleType.ADMIN) {
			throw new BadRequestException("Cannot delete administrator user");
		}

		user.setDeleted(true);
		userRepository.save(user);
	}

	@Override
	@Cacheable(value = "privileges", key = "#username")
	public List<PrivilegeResponse> getPrivilegesByUsername(String username) {
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("Account not found"));
		if (account.getRole() == null) {
			return List.of();
		}
		return account.getRole().getPrivileges().stream()
				.map(privilege -> new PrivilegeResponse(privilege.name(), privilege.getDescription()))
				.collect(Collectors.toList());
	}

	@Override
	@Cacheable(value = "userDetails", key = "#id")
	public UserResponse getUserById(Long id) {
		User user = userRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));
		return mapToUserResponse(user);
	}

	@Override
	@Transactional
	@CacheEvict(value = {"users", "userDetails", "pendingDoctors"}, allEntries = true)
	public void deleteUsers(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			throw new BadRequestException("No user IDs provided");
		}

		String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
		Account currentAccount = accountRepository.findByUsername(currentUsername)
				.orElseThrow(() -> new BadRequestException("Current account not found"));
		User currentUser = currentAccount.getUser();

		if (ids.contains(currentUser.getId())) {
			throw new BadRequestException("Cannot delete yourself");
		}

		List<User> users = userRepository.findAllById(ids);
		if (users.size() != ids.size()) {
			throw new NotFoundException("Some users not found");
		}

		for (User user : users) {
			if (user.isDeleted()) {
				throw new BadRequestException("User with ID: " + user.getId() + " is already deleted");
			}
			user.setDeleted(true);
		}
		userRepository.saveAll(users);
	}

	@Override
	@Transactional
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void restoreUser(Long id) {
		String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
		Account currentAccount = accountRepository.findByUsername(currentUsername)
				.orElseThrow(() -> new BadRequestException("Current account not found"));
		User currentUser = currentAccount.getUser();

		if (currentUser.getId().equals(id)) {
			throw new BadRequestException("Cannot restore yourself (ID: " + id + ")");
		}

		User user = userRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));

		if (!user.isDeleted()) {
			throw new BadRequestException("User is not deleted");
		}

		user.setDeleted(false);
		userRepository.save(user);
	}

	@Override
	@Transactional
	@CacheEvict(value = {"users", "userDetails", "pendingDoctors"}, allEntries = true)
	public void restoreUsers(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			throw new BadRequestException("No user IDs provided");
		}

		String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
		Account currentAccount = accountRepository.findByUsername(currentUsername)
				.orElseThrow(() -> new BadRequestException("Current account not found"));
		User currentUser = currentAccount.getUser();

		List<User> users = userRepository.findAllById(ids);
		if (users.size() != ids.size()) {
			throw new NotFoundException("Some users not found");
		}

		for (User user : users) {
			if (user.getId().equals(currentUser.getId())) {
				throw new BadRequestException("Cannot restore yourself (ID: " + user.getId() + ")");
			}
			if (!user.isDeleted()) {
				throw new BadRequestException("User with ID: " + user.getId() + " is not deleted");
			}
			user.setDeleted(false);
		}
		userRepository.saveAll(users);
	}

	private RoleType parseRoleType(String role) {
		try {
			return RoleType.valueOf(role);
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException("Invalid role type: " + role);
		}
	}

	private LocalDate parseDate(String date) {
		try {
			return LocalDate.parse(date, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
		} catch (Exception e) {
			throw new BadRequestException("Invalid date format. Use MM/DD/YYYY");
		}
	}

	private UserResponse mapToUserResponse(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.username(user.getAccount() != null ? user.getAccount().getUsername() : null)
				.fullName(user.getFullName())
				.email(user.getAccount() != null ? user.getAccount().getEmail() : null)
				.phone(user.getPhone())
				.identityCard(user.getIdentityCard())
				.dateOfBirth(user.getDateOfBirth())
				.gender(user.getGender())
				.address(user.getAddress())
				.department(user.getDepartment())
				.roleName(user.getAccount() != null && user.getAccount().getRole() != null ? user.getAccount().getRole().getName().name() : null)
				.isDeleted(user.isDeleted())
				.isLocked(user.isLocked())
				.createdAt(user.getCreatedAt())
				.updatedAt(user.getUpdatedAt())
				.build();
	}

	@Override
	@Cacheable(value = "pendingDoctors")
	public List<UserResponse> getPendingDoctorAccounts() {
		List<User> pendingDoctors = userRepository.findPendingDoctorAccounts(RoleType.DOCTOR);
		return pendingDoctors.stream()
				.map(this::mapToUserResponse)
				.collect(Collectors.toList());
	}
}
