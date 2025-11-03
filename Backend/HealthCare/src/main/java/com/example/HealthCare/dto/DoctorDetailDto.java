package com.example.HealthCare.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class DoctorDetailDto {
    
    private String id;
    private String name;
    private String specialty;
    private Double rating;
    private Integer reviews;
    private String clinic;
    private String cost;
    private String experience;
    private String clinic_address;
    private String province;
    private String consultations;
    private List<String> conditions;
    private List<CertificateDTO> certificates;
    private String workplace_name;

    @Data
    @Builder
    public static class CertificateDTO {
        private String year;
        private String title;
    }
}
