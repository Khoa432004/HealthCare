package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.model.UserAccount;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    
    // Find by email
    Optional<UserAccount> findByEmail(String email);
    
    Optional<UserAccount> findByEmailAndIsDeletedFalse(String email);
    
    // Find by phone
    Optional<UserAccount> findByPhoneNumber(String phoneNumber);
    
    Optional<UserAccount> findByPhoneNumberAndIsDeletedFalse(String phoneNumber);
    
    // Find by ID
    Optional<UserAccount> findByIdAndIsDeletedFalse(UUID id);
    
    // Existence checks
    Boolean existsByEmail(String email);
    
    Boolean existsByPhoneNumber(String phoneNumber);
    
    Boolean existsByEmailAndIdNot(String email, UUID id);
    
    Boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);
    
    // Find by role
    Page<UserAccount> findByRole(UserRole role, Pageable pageable);
    
    Page<UserAccount> findByRoleAndIsDeletedFalse(UserRole role, Pageable pageable);
    
    // Find by status
    Page<UserAccount> findByStatus(AccountStatus status, Pageable pageable);
    
    Page<UserAccount> findByStatusAndIsDeletedFalse(AccountStatus status, Pageable pageable);
    
    // Find all not deleted
    Page<UserAccount> findByIsDeletedFalse(Pageable pageable);
    
    Page<UserAccount> findAllByIsDeletedFalse(Pageable pageable);
    
    // Find by role and status
    java.util.List<UserAccount> findAllByRoleAndStatusAndIsDeletedFalse(UserRole role, AccountStatus status);
    
    // Count by role
    long countByRole(UserRole role);
    
    long countByRoleAndIsDeletedFalse(UserRole role);
    
    Long countByIsDeletedFalse();
    
    // Custom queries
    @Query("SELECT u FROM UserAccount u WHERE u.isDeleted = false AND " +
           "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<UserAccount> searchUserAccounts(String searchTerm, Pageable pageable);
}

