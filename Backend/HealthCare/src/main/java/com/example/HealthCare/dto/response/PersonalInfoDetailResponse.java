package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.util.UUID;

import com.example.HealthCare.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoDetailResponse {
    
    private UUID userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String cccdNumber; // From doctor_profile
    private LocalDate dateOfBirth;
    private Gender gender;
    
    // Address fields
    private String country;
    private String stateProvince;
    private String districtWard;
    private String addressLine1;
    
    // Optional fields
    private String maritalStatus;
    private String ethnicity;
}

