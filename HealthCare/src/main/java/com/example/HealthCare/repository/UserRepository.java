package com.example.HealthCare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.model.User;

@Repository

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByIdAndIsDeletedFalse(Long id);
	Optional<User> findByPhone(String phone);
	Optional<User> findByIdentityCard(String identityCard);
	boolean existsByPhoneAndIsDeletedFalse(String phone);
	boolean existsByIdentityCardAndIsDeletedFalse(String identityCard);
	
	@Query("SELECT u FROM User u WHERE u.isLocked = true AND u.isDeleted = false AND u.account IS NOT NULL AND u.account.role.name = :roleType")
	List<User> findPendingDoctorAccounts(RoleType roleType);
}
