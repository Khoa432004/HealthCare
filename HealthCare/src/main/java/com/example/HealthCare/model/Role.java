package com.example.HealthCare.model;

import java.util.List;

import com.example.HealthCare.enums.Privilege;
import com.example.HealthCare.enums.RoleType;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Role extends BaseEntity {
	@Enumerated(EnumType.STRING)
	@Column(name = "name", nullable = false, unique = true, length = 50)
	private RoleType name;

	@Column(name = "description", length = 255)
	private String description;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "role_privileges", joinColumns = @JoinColumn(name = "role_id"))
	@Enumerated(EnumType.STRING)
	@Column(name = "privilege")
	private List<Privilege> privileges;
}
