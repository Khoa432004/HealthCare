package com.example.HealthCare.service;

import java.util.List;

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
	void deleteUser(Long id);
	List<PrivilegeResponse> getPrivilegesByUsername(String username);
	UserResponse getUserById(Long id);
	void deleteUsers(List<Long> ids);
	void restoreUser(Long id);
	void restoreUsers(List<Long> ids);
	List<UserResponse> getPendingDoctorAccounts();
}
