package com.example.HealthCare.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "doctor_exam_package")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class DoctorExamPackage extends BaseEntity {

	@Column(name = "doctor_user_id", nullable = false)
	private UUID doctorUserId;

	@Column(name = "package_name", nullable = false, length = 255)
	private String packageName;

	@Column(name = "duration_days", nullable = false)
	private Integer durationDays;

	@Column(name = "price_vnd", nullable = false)
	private Long priceVnd;

	@Column(name = "applicable", nullable = false)
	@lombok.Builder.Default
	private Boolean applicable = false;

	@Column(name = "sort_order", nullable = false)
	@lombok.Builder.Default
	private Integer sortOrder = 0;
}
