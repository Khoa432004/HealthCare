package com.example.HealthCare.dto.request;

import java.time.LocalDate;

import com.example.HealthCare.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // Optional username field (not used for authentication, email is used instead)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phone;
    
    // Optional role field (defaults to PATIENT if not provided)
    private String role;

    // Optional fields for patients
    private String identityCard;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String address;

    private String department;
    
    // Alias method for backward compatibility
    public String getPhoneNumber() {
        return this.phone;
    }
}
