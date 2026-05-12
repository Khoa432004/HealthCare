package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.request.SubmitExamPackagesRequest;
import com.example.HealthCare.dto.response.ExamPackageWorkspaceResponse;

public interface DoctorExamPackageService {

	ExamPackageWorkspaceResponse getWorkspace(UUID doctorUserId);

	ExamPackageWorkspaceResponse submitChanges(UUID doctorUserId, SubmitExamPackagesRequest request);
}
