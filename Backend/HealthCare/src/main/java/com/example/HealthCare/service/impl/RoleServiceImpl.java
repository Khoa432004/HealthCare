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
		throw new UnsupportedOperationException("Role management is not available. UserAccount uses role ENUM, not roles table.");
	}

	@Override
	public Page<RoleResponse> getAllRoles(Pageable pageable) {
		return new PageImpl<>(List.of(), pageable, 0);
	}

	@Override
	public RoleResponse getRoleById(UUID id) {
		throw new UnsupportedOperationException("Role management is not available. UserAccount uses role ENUM, not roles table.");
	}

	@Override
	public void updateRole(UpdateRoleRequest updateRoleRequest) {
		throw new UnsupportedOperationException("Role management is not available. UserAccount uses role ENUM, not roles table.");
	}

	@Override
	public void deleteRole(UUID id) {
		throw new UnsupportedOperationException("Role management is not available. UserAccount uses role ENUM, not roles table.");
	}

	@Override
	public void deleteRoles(List<UUID> ids) {
		throw new UnsupportedOperationException("Role management is not available. UserAccount uses role ENUM, not roles table.");
	}

	@Override
	public List<String> getPrivilegesByRole(String roleName) {
		return List.of();
	}
}

