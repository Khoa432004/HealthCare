// src/main/java/com/example/HealthCare/service/impl/DoctorServiceImpl.java
package com.example.HealthCare.service.impl;
import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;
import com.example.HealthCare.dto.request.UpdateProfessionalInfoRequest;
import com.example.HealthCare.dto.response.ProfessionalInfoResponse;
import com.example.HealthCare.model.DoctorExperience;
import com.example.HealthCare.model.DoctorProfile;
import com.example.HealthCare.model.DoctorScheduleRule;
import com.example.HealthCare.repository.DoctorExperienceRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;
import com.example.HealthCare.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

        private final DoctorProfileRepository doctorProfileRepository;
        private final DoctorExperienceRepository doctorExperienceRepository;
        private final DoctorScheduleRuleRepository doctorScheduleRuleRepository;


        private String formatPrice(BigDecimal price) {
        if (price == null) return "0đ";
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        return formatter.format(price) + "đ / visit";
        }
        private List<String> generateAvailableTimes(UUID doctorId, LocalDate date) {
            if (date == null) {
                return List.of();
            }

            List<DoctorScheduleRule> rules = doctorScheduleRuleRepository
                .findByDoctorIdOrderByWeekdayAscStartTimeAsc(doctorId);

            List<DoctorScheduleRule> matchingRules = DoctorScheduleRule.getAvailableRulesForDate(rules, date);
            if (matchingRules.isEmpty()) {
                return List.of();
            }
            return matchingRules.stream()
                .map(rule -> rule.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .sorted()
                .toList(); 
        }
        
        @Override
        public List getAllDoctors(String searchQuery, LocalDate datetime) {
                List<DoctorProfile> doctors;
                // LocalDate testDate = LocalDate.of(2025, 12, 2); // 15-2-2025

                if (searchQuery == null || searchQuery.trim().isEmpty()) {
                doctors = doctorProfileRepository.findAll();
                } else {
                doctors = doctorProfileRepository.searchByNameOrSpecialty(searchQuery.trim());
                }

                return doctors.stream()
                        .map(doc -> {
                        String fullName = doc.getUserAccount() != null ? doc.getUserAccount().getFullName() : "Unknown Doctor";

                        return DoctorSummaryDto.builder()
                                .id(doc.getUserId().toString())
                                .name(doc.getTitle() + " " + fullName)
                                .specialty(doc.getSpecialties())
                                .rating(4.5)
                                .reviews(100)
                                .title(doc.getTitle())
                                .clinic(doc.getWorkplaceName())
                                .cost(formatPrice(doc.getConsultationFee()))
                                .availableTimes(generateAvailableTimes(doc.getUserId(), datetime))
                                .experience(doc.getGraduationYear() != null ?
                                        (java.time.Year.now().getValue() - doc.getGraduationYear()) + " years" : "N/A")
                                .consultations("30 visits")
                                .build();
                        })
                        .filter(dto -> dto.getAvailableTimes() != null && !dto.getAvailableTimes().isEmpty())
                        .collect(Collectors.toList());
        }

        @Override
        public DoctorDetailDto getDoctorDetail(UUID doctorId) {
        return doctorProfileRepository.findByUserId(doctorId)
                .map(doc -> {
                String fullName = doc.getUserAccount() != null ? doc.getUserAccount().getFullName() : "Unknown";

                List<String> conditions = doc.getDiseasesTreated() != null
                        ? Arrays.stream(doc.getDiseasesTreated().split(","))
                        .map(String::trim)
                        .collect(Collectors.toList())
                        : List.of();

                // LẤY KINH NGHIỆM TỪ BẢNG DoctorExperience
                List<DoctorDetailDto.CertificateDTO> experienceCerts = doctorExperienceRepository
                        .findByDoctorId(doctorId)
                        .stream()
                        .map(exp -> DoctorDetailDto.CertificateDTO.builder()
                        .year(exp.getFromDate().getYear() + " - " + 
                                (exp.getToDate() != null ? exp.getToDate().getYear() : "Now"))
                        .title(exp.getSpecialty() + " - " + exp.getOrganization())
                        .build())
                        .collect(Collectors.toList());

                // CHỨNG CHỈ HIỆN TẠI (Now + Tốt nghiệp)
                List<DoctorDetailDto.CertificateDTO> baseCerts = List.of(
                        DoctorDetailDto.CertificateDTO.builder()
                        .year("Now")
                        .title(doc.getFacilityName() + " - " + doc.getWorkplaceName())
                        .build(),
                        DoctorDetailDto.CertificateDTO.builder()
                        .year(doc.getGraduationYear() != null ? doc.getGraduationYear().toString() : "N/A")
                        .title(doc.getTrainingInstitution())
                        .build()
                );

                
                List<DoctorDetailDto.CertificateDTO> allCertificates = new ArrayList<>();
                allCertificates.addAll(baseCerts);
                allCertificates.addAll(experienceCerts);

                //Sắp xếp chứng chỉ theo năm giảm dần
                allCertificates.sort((a, b) -> {
                try {
                        int yearA = a.getYear().contains("-") 
                        ? Integer.parseInt(a.getYear().split(" - ")[0]) 
                        : Integer.parseInt(a.getYear().replace("Now", String.valueOf(Year.now().getValue())));
                        int yearB = b.getYear().contains("-") 
                        ? Integer.parseInt(b.getYear().split(" - ")[0]) 
                        : Integer.parseInt(b.getYear().replace("Now", String.valueOf(Year.now().getValue())));
                        return Integer.compare(yearB, yearA); 
                } catch (Exception e) {
                        return 0;
                }
                });
                //Thông tin tổng hợp bác sĩ
                return DoctorDetailDto.builder()
                        .id(doc.getUserId().toString())
                        .name(doc.getTitle() + " " + fullName)
                        .specialty(doc.getSpecialties())
                        .rating(4.5)
                        .reviews(100)
                        .clinic(doc.getFacilityName())
                        .workplace_name(doc.getWorkplaceName())
                        .province(doc.getProvince())
                        .clinic_address(doc.getClinicAddress())
                        .cost(formatPrice(doc.getConsultationFee()))
                        .experience(doc.getGraduationYear() != null
                        ? (java.time.Year.now().getValue() - doc.getGraduationYear()) + " years"
                        : "N/A")
                        .consultations("30 visits")
                        .conditions(conditions)
                        .certificates(allCertificates)
                        .build();
                })
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        }

        @Override
        public ProfessionalInfoResponse getProfessionalInfo(UUID doctorId) {
            DoctorProfile profile = doctorProfileRepository.findByUserId(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            // Parse care_target (can be JSON array or comma-separated)
            List<String> careTarget = parseArrayField(profile.getCareTarget());
            
            // Parse specialties (comma-separated)
            List<String> specialties = parseArrayField(profile.getSpecialties());
            
            // Parse diseases_treated (comma-separated)
            List<String> diseasesTreated = parseArrayField(profile.getDiseasesTreated());
            
            // Languages - not in DB yet, return empty list
            List<String> languages = new ArrayList<>();
            
            // Get work experiences
            List<ProfessionalInfoResponse.WorkExperienceDto> workExperiences = doctorExperienceRepository
                    .findByDoctorId(doctorId)
                    .stream()
                    .map(exp -> {
                        boolean isCurrentJob = exp.getToDate() == null || 
                                exp.getToDate().isAfter(LocalDate.now()) || 
                                exp.getToDate().equals(LocalDate.now());
                        
                        List<String> expSpecialties = parseArrayField(exp.getSpecialty());
                        
                        return ProfessionalInfoResponse.WorkExperienceDto.builder()
                                .id(exp.getId())
                                .position(exp.getSpecialty()) // Using specialty as position
                                .specialties(expSpecialties)
                                .clinicHospital(exp.getOrganization())
                                .location(exp.getLocation())
                                .fromDate(exp.getFromDate())
                                .toDate(exp.getToDate())
                                .isCurrentJob(isCurrentJob)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // Get education (currently single from doctor_profile)
            List<ProfessionalInfoResponse.EducationDto> educations = new ArrayList<>();
            if (profile.getGraduationYear() != null && profile.getTrainingInstitution() != null) {
                ProfessionalInfoResponse.EducationDto education = ProfessionalInfoResponse.EducationDto.builder()
                        .specialty(profile.getMajor())
                        .qualification(profile.getEducationSummary())
                        .school(profile.getTrainingInstitution())
                        .fromYear(profile.getGraduationYear() - 4) // Assume 4-year program
                        .toYear(profile.getGraduationYear())
                        .build();
                educations.add(education);
            }
            
            // Get certifications (using practice_license_no as main certification)
            List<ProfessionalInfoResponse.CertificationDto> certifications = new ArrayList<>();
            if (profile.getPracticeLicenseNo() != null) {
                ProfessionalInfoResponse.CertificationDto cert = ProfessionalInfoResponse.CertificationDto.builder()
                        .name("Practicing License")
                        .issuingOrganization("Ministry of Health") // Default, can be updated later
                        .issueDate(null) // Not stored in DB yet
                        .attachmentUrl(null)
                        .build();
                certifications.add(cert);
            }
            
            return ProfessionalInfoResponse.builder()
                    .title(profile.getTitle())
                    .province(profile.getProvince())
                    .facilityName(profile.getFacilityName())
                    .careTarget(careTarget)
                    .specialties(specialties)
                    .diseasesTreated(diseasesTreated)
                    .languages(languages)
                    .practicingCertificationId(profile.getPracticeLicenseNo())
                    .workExperiences(workExperiences)
                    .educations(educations)
                    .certifications(certifications)
                    .build();
        }
        
        /**
         * Parse array field from database (can be JSON array format or comma-separated)
         */
        private List<String> parseArrayField(String field) {
            if (field == null || field.trim().isEmpty()) {
                return new ArrayList<>();
            }
            
            // Try to parse as JSON array first (format: {"value1","value2"})
            if (field.trim().startsWith("{") && field.trim().endsWith("}")) {
                String content = field.trim().substring(1, field.trim().length() - 1);
                if (content.isEmpty()) {
                    return new ArrayList<>();
                }
                return Arrays.stream(content.split(","))
                        .map(s -> s.trim().replaceAll("^\"|\"$", "")) // Remove quotes
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }
            
            // Otherwise, treat as comma-separated
            return Arrays.stream(field.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        /**
         * Format array to PostgreSQL array string format
         */
        private String formatArrayString(List<String> list) {
            if (list == null || list.isEmpty()) {
                return "{}";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) {
                    sb.append(",");
                }
                sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
            }
            sb.append("}");
            return sb.toString();
        }

        @Override
        @Transactional
        public ProfessionalInfoResponse updateProfessionalInfo(UUID doctorId, UpdateProfessionalInfoRequest request) {
            // Find existing profile
            DoctorProfile profile = doctorProfileRepository.findByUserId(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            // Build care target from checkboxes
            List<String> careTargetList = new ArrayList<>();
            if (request.isCareForAdults()) {
                careTargetList.add("Người lớn");
            }
            if (request.isCareForChildren()) {
                careTargetList.add("Trẻ em");
            }
            String careTarget = careTargetList.isEmpty() ? "{\"Người lớn\"}" : formatArrayString(careTargetList);

            // Update basic fields
            profile.setTitle(request.getTitle());
            profile.setProvince(request.getProvince());
            profile.setFacilityName(request.getFacilityName());
            profile.setCareTarget(careTarget);
            profile.setSpecialties(formatArrayString(request.getSpecialties()));
            profile.setDiseasesTreated(formatArrayString(request.getDiseasesTreated()));
            
            // Update practice license number (if changed)
            if (request.getPracticingCertificationId() != null && 
                !request.getPracticingCertificationId().equals(profile.getPracticeLicenseNo())) {
                // Check if new license number already exists for another doctor
                if (doctorProfileRepository.existsByPracticeLicenseNoAndUserIdNot(
                        request.getPracticingCertificationId(), doctorId)) {
                    throw new RuntimeException("Practice license number already exists");
                }
                profile.setPracticeLicenseNo(request.getPracticingCertificationId());
            }

            // Save updated profile
            profile = doctorProfileRepository.save(profile);

            // Update work experiences if provided
            if (request.getWorkExperiences() != null) {
                updateWorkExperiences(doctorId, request.getWorkExperiences());
            }

            // Return updated professional info
            return getProfessionalInfo(doctorId);
        }

        /**
         * Update work experiences for a doctor
         */
        private void updateWorkExperiences(UUID doctorId, List<UpdateProfessionalInfoRequest.WorkExperienceRequest> workExperiences) {
            if (workExperiences == null || workExperiences.isEmpty()) {
                return; // Don't update if not provided
            }
            
            // For simplicity, we'll delete all existing and create new ones
            // In a production system, you might want to do a more sophisticated merge
            doctorExperienceRepository.deleteByDoctorId(doctorId);

            for (UpdateProfessionalInfoRequest.WorkExperienceRequest expRequest : workExperiences) {
                if (expRequest.getFromDate() == null || expRequest.getFromDate().isEmpty()) {
                    continue; // Skip invalid entries
                }
                
                LocalDate fromDate;
                try {
                    fromDate = LocalDate.parse(expRequest.getFromDate());
                } catch (Exception e) {
                    // Skip if date parsing fails
                    continue;
                }
                
                LocalDate toDate = null;
                if (expRequest.getToDate() != null && !expRequest.getToDate().isEmpty()) {
                    try {
                        toDate = LocalDate.parse(expRequest.getToDate());
                    } catch (Exception e) {
                        // If parsing fails, will use fallback below
                    }
                }

                // If isCurrentJob is true, set toDate to current date (since DB requires NOT NULL)
                // We'll check isCurrentJob when reading back
                if (expRequest.getIsCurrentJob() != null && expRequest.getIsCurrentJob()) {
                    toDate = LocalDate.now();
                } else if (toDate == null) {
                    // If not current job but toDate is null, use current date as fallback
                    toDate = LocalDate.now();
                }

                String specialtyString = formatArrayString(expRequest.getSpecialties() != null ? expRequest.getSpecialties() : new ArrayList<>());
                
                DoctorExperience experience = DoctorExperience.builder()
                        .doctorId(doctorId)
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .organization(expRequest.getClinicHospital() != null ? expRequest.getClinicHospital() : "")
                        .location(expRequest.getLocation() != null ? expRequest.getLocation() : "")
                        .specialty(specialtyString)
                        .build();

                doctorExperienceRepository.save(experience);
            }
        }

}