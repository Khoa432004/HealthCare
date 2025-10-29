package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreateRoleRequest;
import com.example.HealthCare.dto.request.UpdateRoleRequest;
import com.example.HealthCare.dto.response.PageViewResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.dto.response.RoleResponse;
import com.example.HealthCare.service.RoleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

	private final RoleService roleService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasAuthority('CREATE_ROLE')")
	public ResponseSuccess createRole(@Valid @RequestBody CreateRoleRequest createRoleRequest) {
		RoleResponse roleResponse = roleService.createRole(createRoleRequest);
		return new ResponseSuccess(HttpStatus.CREATED, "Create role successfully", roleResponse);
	}

	@PutMapping("/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('UPDATE_ROLE')")
	public ResponseSuccess updateRole(@PathVariable UUID id, @RequestBody UpdateRoleRequest request) {
		log.info("Received request to update role with ID: {}", id);
		log.info("Request body: {}", request);
		log.info("Current user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
		
		request.setId(id);
		roleService.updateRole(request);
		RoleResponse updatedRole = roleService.getRoleById(id);
		return new ResponseSuccess(HttpStatus.OK, "Role updated successfully", updatedRole);
	}

	@GetMapping("/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('VIEW_ROLE')")
	public ResponseSuccess getRoleById(@PathVariable UUID id) {
		log.info("Received request to get role with ID: {}", id);
		RoleResponse role = roleService.getRoleById(id);
		return new ResponseSuccess(HttpStatus.OK, "Role retrieved successfully", role);
	}

	@GetMapping
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('VIEW_ROLE')")
	public ResponseSuccess getAllRoles(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {

		log.info("Received request to get all roles - page: {}, size: {}", page, size);
		Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
		Page<RoleResponse> pageData = roleService.getAllRoles(pageable);

		PageViewResponse<RoleResponse> result = PageViewResponse.<RoleResponse>builder()
				.content(pageData.getContent())
				.page(pageData.getNumber() + 1)
				.size(pageData.getSize())
				.totalElements(pageData.getTotalElements())
				.totalPages(pageData.getTotalPages())
				.build();
		return new ResponseSuccess(HttpStatus.OK, "Roles retrieved successfully", result);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_ROLE')")
	public ResponseSuccess deleteRole(@PathVariable UUID id) {
		log.info("Received request to delete role with ID: {}", id);
		roleService.deleteRole(id);
		return new ResponseSuccess(HttpStatus.OK, "Role deleted successfully");
	}

	@DeleteMapping("")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_ROLE')")
	public ResponseSuccess deleteRoles(@RequestBody List<UUID> ids) {
		log.info("Received request to delete multiple roles: {}", ids);
		roleService.deleteRoles(ids);
		return new ResponseSuccess(HttpStatus.OK, "Roles deleted successfully");
	}

	@GetMapping("/privileges")
	public ResponseSuccess getPrivilegesByRole(@RequestParam String role) {
		List<String> privileges = roleService.getPrivilegesByRole(role);
		return new ResponseSuccess(HttpStatus.OK, "Get privileges successfully", privileges);
	}
}
