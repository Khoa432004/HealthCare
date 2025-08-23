package com.example.HealthCare.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateRoleRequest;
import com.example.HealthCare.dto.request.UpdateRoleRequest;
import com.example.HealthCare.dto.response.RoleResponse;
import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Role;
import com.example.HealthCare.repository.AccountRepository;
import com.example.HealthCare.repository.RoleRepository;
import com.example.HealthCare.service.RoleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {

	private final RoleRepository roleRepository;
	private final AccountRepository accountRepository;

	@Override
	public RoleResponse createRole(CreateRoleRequest createRoleRequest) {
		String roleName = createRoleRequest.getName();
		if (roleName == null || roleName.isBlank()) {
			throw new BadRequestException("Role name must not be empty");
		}
		roleName = roleName.trim();

		RoleType roleType;
		try {
			roleType = RoleType.valueOf(roleName);
		} catch (IllegalArgumentException e) {
			throw new BadRequestException("Invalid role name: " + roleName);
		}

		if (roleRepository.findByName(roleType).isPresent()) {
			throw new BadRequestException("Role name already exists");
		}

		Role newRole = Role.builder()
				.name(roleType)
				.description(createRoleRequest.getDescription())
				.privileges(createRoleRequest.getPrivileges())
				.build();

		roleRepository.save(newRole);
		return mapToRoleResponse(newRole);
	}

	@Override
	@Transactional
	public void updateRole(UpdateRoleRequest req) {
		log.info("Starting role update process for role ID: {}", req.getId());

		String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

		// Get current user's account and role
		var currentUserAccount = accountRepository.findByUsername(currentUser)
				.orElseThrow(() -> new BadRequestException("Current user account not found"));
		Role currentUserRole = currentUserAccount.getRole();
		
		if (currentUserRole == null) {
			throw new BadRequestException("Current user has no role assigned");
		}

		Role existingRole = roleRepository.findById(req.getId())
				.orElseThrow(() -> new NotFoundException("Role not found with ID: " + req.getId()));

		// Check 1: Cannot update your own role
		if (existingRole.getId().equals(currentUserRole.getId())) {
			throw new BadRequestException("Cannot update your own role");
		}

		// Check 2: Cannot update ADMIN role (highest privilege)
		if (existingRole.getName() == RoleType.ADMIN) {
			throw new BadRequestException("Cannot update the ADMIN role");
		}

		// Check 3: Cannot update roles with higher or equal privileges
		if (hasHigherOrEqualPrivileges(existingRole.getName(), currentUserRole.getName())) {
			throw new BadRequestException("Cannot update role with higher or equal privileges");
		}

		RoleType newRoleType;
		try {
			newRoleType = RoleType.valueOf(req.getName());
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException("Invalid role type: " + req.getName());
		}

		// Check 4: Cannot change to ADMIN role
		if (newRoleType == RoleType.ADMIN) {
			throw new BadRequestException("Cannot change role to ADMIN");
		}

		// Check 5: Cannot change to role with higher privileges than current user
		if (hasHigherOrEqualPrivileges(newRoleType, currentUserRole.getName())) {
			throw new BadRequestException("Cannot assign role with higher or equal privileges");
		}

		if (!existingRole.getName().equals(newRoleType)) {
			roleRepository.findByName(newRoleType).ifPresent(role -> {
				if (!role.getId().equals(req.getId())) {
					throw new BadRequestException("Role name '" + req.getName() + "' already exists");
				}
			});
		}

		existingRole.setName(newRoleType);
		existingRole.setDescription(req.getDescription());
		existingRole.setPrivileges(req.getPrivileges());

		roleRepository.save(existingRole);

		log.info("Role updated successfully. ID: {}, Name: {}, Modified by: {}",
				existingRole.getId(), existingRole.getName(), currentUser);
	}

	@Override
	public RoleResponse getRoleById(Long id) {
		Role role = roleRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Role not found with ID: " + id));

		return mapToRoleResponse(role);
	}

	@Override
	public Page<RoleResponse> getAllRoles(Pageable pageable) {
		return roleRepository.findAll(pageable)
				.map(this::mapToRoleResponse);
	}

	@Override
	@Transactional
	public void deleteRole(Long id) {
		log.info("Starting role deletion process for role ID: {}", id);

		String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

		// Get current user's account and role
		var currentUserAccount = accountRepository.findByUsername(currentUser)
				.orElseThrow(() -> new BadRequestException("Current user account not found"));
		Role currentUserRole = currentUserAccount.getRole();
		
		if (currentUserRole == null) {
			throw new BadRequestException("Current user has no role assigned");
		}

		Role role = roleRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Role not found with ID: " + id));

		// Check 1: Cannot delete your own role
		if (role.getId().equals(currentUserRole.getId())) {
			throw new BadRequestException("Cannot delete your own role");
		}

		// Check 2: Cannot delete ADMIN role (highest privilege)
		if (role.getName() == RoleType.ADMIN) {
			throw new BadRequestException("Cannot delete the ADMIN role");
		}

		// Check 3: Cannot delete roles with higher or equal privileges
		if (hasHigherOrEqualPrivileges(role.getName(), currentUserRole.getName())) {
			throw new BadRequestException("Cannot delete role with higher or equal privileges");
		}

		// Check 4: Check if role is assigned to any accounts
		long userCount = accountRepository.countByRoleId(id);
		if (userCount > 0) {
			throw new BadRequestException(
					"Cannot delete role that is assigned to " + userCount + " user(s)");
		}

		roleRepository.delete(role);

		log.info("Role deleted successfully. ID: {}, Name: {}, Deleted by: {}",
				id, role.getName(), currentUser);
	}

	@Override
	@Transactional
	public void deleteRoles(List<Long> ids) {
		log.info("Starting bulk role deletion process for role IDs: {}", ids);

		if (ids == null || ids.isEmpty()) {
			throw new BadRequestException("No role IDs provided");
		}

		String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

		// Get current user's account and role
		var currentUserAccount = accountRepository.findByUsername(currentUser)
				.orElseThrow(() -> new BadRequestException("Current user account not found"));
		Role currentUserRole = currentUserAccount.getRole();
		
		if (currentUserRole == null) {
			throw new BadRequestException("Current user has no role assigned");
		}

		List<Role> roles = roleRepository.findAllById(ids);
		if (roles.size() != ids.size()) {
			throw new NotFoundException("Some roles not found");
		}

		for (Role role : roles) {
			// Check 1: Cannot delete your own role
			if (role.getId().equals(currentUserRole.getId())) {
				throw new BadRequestException("Cannot delete your own role with ID: " + role.getId());
			}

			// Check 2: Cannot delete ADMIN role (highest privilege)
			if (role.getName() == RoleType.ADMIN) {
				throw new BadRequestException(
						"Cannot delete the ADMIN role with ID: " + role.getId());
			}

			// Check 3: Cannot delete roles with higher or equal privileges
			if (hasHigherOrEqualPrivileges(role.getName(), currentUserRole.getName())) {
				throw new BadRequestException(
						"Cannot delete role with ID " + role.getId() + " that has higher or equal privileges");
			}

			// Check 4: Check if role is assigned to any accounts
			long userCount = accountRepository.countByRoleId(role.getId());
			if (userCount > 0) {
				throw new BadRequestException(
						"Cannot delete role with ID " + role.getId() + " that is assigned to " + userCount
								+ " user(s)");
			}
		}

		roleRepository.deleteAll(roles);

		log.info("Bulk role deletion successful. IDs: {}, Deleted by: {}", ids, currentUser);
	}

	@Override
	public List<String> getPrivilegesByRole(String roleName) {
		try {
			RoleType roleType = RoleType.valueOf(roleName.toUpperCase());
			return roleRepository.findByName(roleType)
					.map(role -> role.getPrivileges().stream()
							.map(Enum::name)
							.collect(Collectors.toList()))
					.orElse(List.of());
		} catch (IllegalArgumentException e) {
			return List.of();
		}
	}

	private RoleResponse mapToRoleResponse(Role role) {
		return RoleResponse.builder()
				.id(role.getId())
				.name(role.getName().toString())
				.description(role.getDescription())
				.privileges(role.getPrivileges())
				.createdAt(role.getCreatedAt())
				.updatedAt(role.getUpdatedAt())
				.build();
	}

	/**
	 * Check if role1 has higher or equal privileges compared to role2
	 * Privilege hierarchy: ADMIN > DOCTOR > PATIENT > OTHER > TEST
	 */
	private boolean hasHigherOrEqualPrivileges(RoleType role1, RoleType role2) {
		if (role1 == role2) {
			return true; // Equal privileges
		}

		// Define privilege hierarchy (higher index = higher privilege)
		int role1Level = getRoleLevel(role1);
		int role2Level = getRoleLevel(role2);

		return role1Level >= role2Level;
	}

	private int getRoleLevel(RoleType roleType) {
		return switch (roleType) {
			case ADMIN -> 5;
			case DOCTOR -> 4;
			case PATIENT -> 3;
			case OTHER -> 2;
		};
	}
}
