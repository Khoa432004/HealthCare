package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.example.HealthCare.dto.request.CreateUserRequest;
import com.example.HealthCare.dto.request.UpdateUserRequest;
import com.example.HealthCare.dto.request.UserCriteria;
import com.example.HealthCare.dto.response.PrivilegeResponse;
import com.example.HealthCare.dto.response.UserResponse;

public interface UserService {
	void createUser(CreateUserRequest req);
	void updateUser(UpdateUserRequest req);
	Page<UserResponse> getAllUsers(UserCriteria criteria, int page, int size);
	void deleteUser(UUID id);
	List<PrivilegeResponse> getPrivilegesByUsername(String username);
	UserResponse getUserById(UUID id);
	void deleteUsers(List<UUID> ids);
	void restoreUser(UUID id);
	void restoreUsers(List<UUID> ids);
	List<UserResponse> getPendingDoctorAccounts();
	void toggleAccountStatus(UUID userId, boolean activate);
}
