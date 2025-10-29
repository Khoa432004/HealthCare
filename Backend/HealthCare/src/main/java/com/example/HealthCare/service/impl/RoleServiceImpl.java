package com.example.HealthCare.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.request.CreateRoleRequest;
import com.example.HealthCare.dto.request.UpdateRoleRequest;
import com.example.HealthCare.dto.response.RoleResponse;
import com.example.HealthCare.service.RoleService;

import lombok.extern.slf4j.Slf4j;

/**
 * STUB Implementation of RoleService
 * 
 * NOTE: This is a temporary stub because the current database schema uses
 * UserAccount.role as an ENUM (admin/doctor/patient), not a separate roles table.
 * 
 * The Role entity and role_privileges table from create_roles_table.sql are
 * NOT part of the main schema (ehealthcare_db_1-0.sql).
 * 
 * If you need role management, you must:
 * 1. Run create_roles_table.sql on your database
 * 2. Restore the full RoleServiceImpl.java implementation
 * 3. Update UserAccount to use FK to roles table instead of enum
 */
@Service
@Slf4j
public class RoleServiceImpl implements RoleService {

	@Override
	public RoleResponse createRole(CreateRoleRequest createRoleRequest) {
		log.warn("RoleService.createRole() is not implemented - using stub");
		throw new UnsupportedOperationException(
			"Role management is not available. UserAccount uses role ENUM, not roles table."
		);
	}

	@Override
	public Page<RoleResponse> getAllRoles(Pageable pageable) {
		log.warn("RoleService.getAllRoles() is not implemented - using stub");
		// Return empty page
		return new PageImpl<>(List.of(), pageable, 0);
	}

	@Override
	public RoleResponse getRoleById(UUID id) {
		log.warn("RoleService.getRoleById() is not implemented - using stub");
		throw new UnsupportedOperationException(
			"Role management is not available. UserAccount uses role ENUM, not roles table."
		);
	}

	@Override
	public void updateRole(UpdateRoleRequest updateRoleRequest) {
		log.warn("RoleService.updateRole() is not implemented - using stub");
		throw new UnsupportedOperationException(
			"Role management is not available. UserAccount uses role ENUM, not roles table."
		);
	}

	@Override
	public void deleteRole(UUID id) {
		log.warn("RoleService.deleteRole() is not implemented - using stub");
		throw new UnsupportedOperationException(
			"Role management is not available. UserAccount uses role ENUM, not roles table."
		);
	}

	@Override
	public void deleteRoles(List<UUID> ids) {
		log.warn("RoleService.deleteRoles() is not implemented - using stub");
		throw new UnsupportedOperationException(
			"Role management is not available. UserAccount uses role ENUM, not roles table."
		);
	}

	@Override
	public List<String> getPrivilegesByRole(String roleName) {
		log.warn("RoleService.getPrivilegesByRole() is not implemented - using stub");
		// Return empty list
		return List.of();
	}
}

