package com.example.HealthCare.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExamPackagesRequest {

	@NotEmpty
	@Size(max = 50)
	@Valid
	private List<ExamPackageLineRequest> packages;
}
