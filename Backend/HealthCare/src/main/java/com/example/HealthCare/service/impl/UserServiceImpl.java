package com.example.HealthCare.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateUserRequest;
import com.example.HealthCare.dto.request.UpdateUserRequest;
import com.example.HealthCare.dto.request.UserCriteria;
import com.example.HealthCare.dto.response.PrivilegeResponse;
import com.example.HealthCare.dto.response.UserResponse;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.Gender;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.ApprovalRequestRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

	private final UserAccountRepository userAccountRepository;
	private final ApprovalRequestRepository approvalRequestRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	@CacheEvict(value = {"users", "pendingDoctors"}, allEntries = true)
	public void createUser(CreateUserRequest req) {
		// Validate email uniqueness
		if (userAccountRepository.existsByEmail(req.getEmail())) {
			throw new BadRequestException("Email already exists");
		}
		
		// Validate phone uniqueness
		if (userAccountRepository.existsByPhoneNumber(req.getPhone())) {
			throw new BadRequestException("Phone already exists");
		}

		// Parse role
		UserRole role = UserRole.PATIENT; // default
		if (req.getRole() != null && !req.getRole().isBlank()) {
			try {
				role = UserRole.valueOf(req.getRole().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new BadRequestException("Invalid role: " + req.getRole());
			}
		}
		
		// Parse gender
		Gender gender = null;
		if (req.getGender() != null && !req.getGender().isBlank()) {
			try {
				gender = Gender.valueOf(req.getGender().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new BadRequestException("Invalid gender: " + req.getGender());
			}
		}

		// Create UserAccount
		UserAccount userAccount = UserAccount.builder()
				.email(req.getEmail())
				.phoneNumber(req.getPhone())
				.passwordHash(passwordEncoder.encode(req.getPassword()))
				.fullName(req.getFullName())
				.gender(gender)
				.dateOfBirth(req.getDateOfBirth())
				.role(role)
				.status(AccountStatus.ACTIVE)
				.build();

		userAccountRepository.save(userAccount);
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#req.id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void updateUser(UpdateUserRequest req) {
		UserAccount userAccount = userAccountRepository.findByIdAndIsDeletedFalse(req.getId())
				.orElseThrow(() -> new NotFoundException("User not found with id: " + req.getId()));

		// Validate email uniqueness (if changed)
		if (req.getEmail() != null && !req.getEmail().equals(userAccount.getEmail())) {
			if (userAccountRepository.existsByEmail(req.getEmail())) {
				throw new BadRequestException("Email is already taken by another user");
			}
			userAccount.setEmail(req.getEmail());
		}

		// Update fields
		if (req.getFullName() != null) {
			userAccount.setFullName(req.getFullName());
		}
		if (req.getDateOfBirth() != null) {
			userAccount.setDateOfBirth(req.getDateOfBirth());
		}
		if (req.getGender() != null && !req.getGender().isBlank()) {
			try {
				userAccount.setGender(Gender.valueOf(req.getGender().toUpperCase()));
			} catch (IllegalArgumentException e) {
				throw new BadRequestException("Invalid gender: " + req.getGender());
			}
		}
		if (req.getRole() != null && !req.getRole().isBlank()) {
			try {
				userAccount.setRole(UserRole.valueOf(req.getRole().toUpperCase()));
			} catch (IllegalArgumentException e) {
				throw new BadRequestException("Invalid role: " + req.getRole());
			}
		}

		userAccountRepository.save(userAccount);
	}

	@Override
	public Page<UserResponse> getAllUsers(UserCriteria criteria, int page, int size) {
		Page<UserAccount> users = userAccountRepository.findAllByIsDeletedFalse(
				PageRequest.of(page, size, Sort.by("createdAt").descending()));
		return users.map(this::mapToUserResponse);
	}

	@Override
	@Transactional
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void deleteUser(UUID id) {
		UserAccount userAccount = userAccountRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));
		
		userAccount.setIsDeleted(true);
		userAccount.setDeletedAt(java.time.OffsetDateTime.now());
		userAccountRepository.save(userAccount);
	}

	@Override
	public List<PrivilegeResponse> getPrivilegesByUsername(String username) {
		userAccountRepository.findByEmailAndIsDeletedFalse(username)
				.orElseThrow(() -> new NotFoundException("User not found"));
		return List.of();
	}

	@Override
	@Cacheable(value = "userDetails", key = "#id")
	public UserResponse getUserById(UUID id) {
		UserAccount userAccount = userAccountRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));
		return mapToUserResponse(userAccount);
	}

	@Override
	@Transactional
	@CacheEvict(value = {"users", "pendingDoctors"}, allEntries = true)
	public void deleteUsers(List<UUID> ids) {
		ids.forEach(this::deleteUser);
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#id"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void restoreUser(UUID id) {
		UserAccount userAccount = userAccountRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + id));
		
		if (!userAccount.getIsDeleted()) {
			throw new BadRequestException("User is not deleted");
		}
		
		userAccount.setIsDeleted(false);
		userAccount.setDeletedAt(null);
		userAccountRepository.save(userAccount);
	}

	@Override
	@CacheEvict(value = {"users", "pendingDoctors"}, allEntries = true)
	public void restoreUsers(List<UUID> ids) {
		ids.forEach(this::restoreUser);
	}

	@Override
	@Cacheable(value = "pendingDoctors")
	public List<UserResponse> getPendingDoctorAccounts() {
		List<UserAccount> pendingDoctors = userAccountRepository
				.findAllByRoleAndStatusAndIsDeletedFalse(UserRole.DOCTOR, AccountStatus.PENDING);
		
		return pendingDoctors.stream()
				.map(this::mapToUserResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#userId"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public void toggleAccountStatus(UUID userId, boolean activate) {
		UserAccount userAccount = userAccountRepository.findByIdAndIsDeletedFalse(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
		
		if (!activate && userAccount.getRole() == UserRole.ADMIN) {
			throw new BadRequestException("Cannot deactivate admin accounts");
		}
		
		UserAccount currentUser = getCurrentUser();
		
		if (activate) {
			userAccount.setStatus(AccountStatus.ACTIVE);
		} else {
			userAccount.setStatus(AccountStatus.INACTIVE);
		}
		
		if (currentUser != null) {
			userAccount.setUpdatedBy(currentUser);
		}
		
		userAccountRepository.save(userAccount);
	}

	// Helper methods
	private UserAccount getCurrentUser() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication == null) {
				return null;
			}
			
			Object principal = authentication.getPrincipal();
			String email = null;
			
			if (principal instanceof UserDetails) {
				email = ((UserDetails) principal).getUsername();
			} else if (principal instanceof org.springframework.security.oauth2.jwt.Jwt) {
				org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) principal;
				email = jwt.getClaimAsString("sub");
			} else {
				return null;
			}
			
			if (email == null || email.isEmpty()) {
				return null;
			}
			
			return userAccountRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
		} catch (Exception e) {
			log.error("Error getting current user: {}", e.getMessage(), e);
			return null;
		}
	}

	private UserResponse mapToUserResponse(UserAccount userAccount) {
		UserResponse response = new UserResponse();
		response.setId(userAccount.getId());
		response.setEmail(userAccount.getEmail());
		response.setFullName(userAccount.getFullName());
		response.setPhoneNumber(userAccount.getPhoneNumber());
		response.setGender(userAccount.getGender() != null ? userAccount.getGender().name() : null);
		response.setDateOfBirth(userAccount.getDateOfBirth());
		response.setRole(userAccount.getRole().name());
		response.setStatus(userAccount.getStatus().name());
		response.setCreatedAt(userAccount.getCreatedAt());
		response.setUpdatedAt(userAccount.getUpdatedAt());
		
		// Set approval request status if exists
		if (userAccount.getRole() == UserRole.DOCTOR) {
			approvalRequestRepository.findByUserId(userAccount.getId()).ifPresent(approvalRequest -> {
				response.setApprovalRequestStatus(approvalRequest.getStatus().name());
			});
		}
		
		return response;
	}
}

