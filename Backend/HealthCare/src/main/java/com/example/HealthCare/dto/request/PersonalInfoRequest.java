package com.example.HealthCare.dto.request;

import java.time.LocalDate;

import com.example.HealthCare.enums.Gender;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @jakarta.validation.constraints.Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Identity card is required")
    @Size(max = 20, message = "Identity card must not exceed 20 characters")
    private String identityCard;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Address is required")
    private String address;

    // Address details
    private String country;
    private String state;
    private String city;
    private String zipCode;
    private String addressLine1;
    private String addressLine2;
}
