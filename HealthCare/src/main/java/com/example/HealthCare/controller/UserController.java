package com.example.HealthCare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
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

import com.example.HealthCare.dto.request.CreateUserRequest;
import com.example.HealthCare.dto.request.UpdateUserRequest;
import com.example.HealthCare.dto.request.UserCriteria;
import com.example.HealthCare.dto.response.PageViewResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.dto.response.UserResponse;
import com.example.HealthCare.service.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
@Slf4j
public class UserController {

	private final UserService userService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasAuthority('CREATE_USER')")
	public ResponseSuccess createUser(@Valid @RequestBody CreateUserRequest req) {
		userService.createUser(req);
		return new ResponseSuccess(HttpStatus.OK, "Create user successfully");
	}

	@PutMapping
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('MODIFY_USER')")
	public ResponseSuccess updateUser(@Valid @RequestBody UpdateUserRequest req) {
		userService.updateUser(req);
		return new ResponseSuccess(HttpStatus.OK, "Update user successfully");
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_USER')")
	public ResponseSuccess deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		return new ResponseSuccess(HttpStatus.OK, "Delete user successfully");
	}

	@DeleteMapping
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_USER')")
	public ResponseSuccess deleteUsers(@RequestBody List<Long> ids) {
		userService.deleteUsers(ids);
		return new ResponseSuccess(HttpStatus.OK, "Delete users successfully");
	}

	@PostMapping("/{id}/restore")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_USER')")
	public ResponseSuccess restoreUser(@PathVariable Long id) {
		userService.restoreUser(id);
		return new ResponseSuccess(HttpStatus.OK, "Restore user successfully");
	}

	@PostMapping("/restore")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasAuthority('DELETE_USER')")
	public ResponseSuccess restoreUsers(@RequestBody List<Long> ids) {
		userService.restoreUsers(ids);
		return new ResponseSuccess(HttpStatus.OK, "Restore users successfully");
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAuthority('VIEW_USER')")
	public ResponseSuccess getUserById(@PathVariable Long id) {
		log.info("get user by id: {}", id);
		UserResponse user = userService.getUserById(id);
		return new ResponseSuccess(HttpStatus.OK, "Get user successfully", user);
	}

	@GetMapping
	@PreAuthorize("hasAuthority('VIEW_USER')")
	public ResponseEntity<ResponseSuccess.Payload> getAllUsers(@Valid UserCriteria criteria,
			@RequestParam(defaultValue = "1") @Min(1) int page,
			@RequestParam(defaultValue = "10") @Min(1) int size) {

		int pageIndex = Math.max(page - 1, 0);
		Page<UserResponse> pageData = userService.getAllUsers(criteria, pageIndex, size);

		PageViewResponse<UserResponse> result = PageViewResponse.<UserResponse>builder()
				.content(pageData.getContent())
				.page(pageData.getNumber() + 1)
				.size(pageData.getSize())
				.totalElements(pageData.getTotalElements())
				.totalPages(pageData.getTotalPages())
				.build();

		ResponseSuccess.Payload payload = new ResponseSuccess.Payload(HttpStatus.OK.value(),
				"Get all users successfully", result);
		return ResponseEntity.ok(payload);
	}

	@GetMapping("/pending-doctors")
	public ResponseEntity<?> getPendingDoctorAccounts() {
		try {
			List<UserResponse> pendingDoctors = userService.getPendingDoctorAccounts();
			return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Pending doctor accounts retrieved successfully!", pendingDoctors));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
				"error", "failed_to_get_pending_doctors",
				"message", ex.getMessage()
			));
		}
	}
}
