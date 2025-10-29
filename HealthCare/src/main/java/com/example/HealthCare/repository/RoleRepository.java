package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
	Optional<Role> findByName(RoleType name);
}
