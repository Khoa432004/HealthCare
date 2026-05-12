package com.example.HealthCare.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamPackageLineRequest {

	private UUID packageId;

	@NotBlank
	@Size(max = 255)
	private String packageName;

	@NotNull
	@Min(1)
	@Max(24 * 60)
	private Integer durationMinutes;

	@NotNull
	@Min(0)
	private Long priceVnd;

	@NotNull
	private Boolean applicable;
}
