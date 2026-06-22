package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class DoctorProfileDto {
    private String practiceLicenseNo;
    private String cccdNumber;
    private String title;
    private String workplaceName;
    private String facilityName;
    private String clinicAddress;
    private String careTarget;
    private String specialties;
    private String diseasesTreated;
    private String educationSummary;
    private String trainingInstitution;
    private Integer graduationYear;
    private String major;
    private String address;
    private String province;
    private BigDecimal consultationFee;
}
