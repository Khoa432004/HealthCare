package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.HealthCare.dto.request.CreateRoleRequest;
import com.example.HealthCare.dto.request.UpdateRoleRequest;
import com.example.HealthCare.dto.response.RoleResponse;

public interface RoleService {
	RoleResponse createRole(CreateRoleRequest req);
	void updateRole(UpdateRoleRequest req);
	RoleResponse getRoleById(UUID id);
	Page<RoleResponse> getAllRoles(Pageable pageable);
	void deleteRole(UUID id);
	void deleteRoles(List<UUID> ids);
	List<String> getPrivilegesByRole(String roleName);
}
