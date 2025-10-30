package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.util.UUID;

import com.example.HealthCare.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoResponse {
    
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String identityCard;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String country;
    private String state;
    private String city;
    private String zipCode;
    private String addressLine1;
    private String addressLine2;
    private boolean hasExistingAccount;
}
