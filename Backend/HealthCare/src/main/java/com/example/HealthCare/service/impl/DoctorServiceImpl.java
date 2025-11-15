// src/main/java/com/example/HealthCare/service/impl/DoctorServiceImpl.java
package com.example.HealthCare.service.impl;
import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;
import com.example.HealthCare.dto.response.ProfessionalInfoResponse;
import com.example.HealthCare.model.DoctorExperience;
import com.example.HealthCare.model.DoctorProfile;
import com.example.HealthCare.repository.DoctorExperienceRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

        private final DoctorProfileRepository doctorProfileRepository;
        private final DoctorExperienceRepository doctorExperienceRepository;


        private String formatPrice(BigDecimal price) {
        if (price == null) return "0đ";
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        return formatter.format(price) + "đ / visit";
    }

        @Override
        public List getAllDoctors(String searchQuery) {
                List<DoctorProfile> doctors;

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
                                .availableTimes(List.of("10:00", "10:30", "14:00"))
                                .experience(doc.getGraduationYear() != null ?
                                        (java.time.Year.now().getValue() - doc.getGraduationYear()) + " years" : "N/A")
                                .consultations("30 visits")
                                .build();
                        })
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

}