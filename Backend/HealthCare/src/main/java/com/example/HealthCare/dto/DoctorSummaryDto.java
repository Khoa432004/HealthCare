package com.example.HealthCare.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DoctorSummaryDto {
    private String id;
    private String name;
    private String specialty;
    private String title;
    private Double rating ;
    private Integer reviews ;
    private String clinic;
    private String cost;
    private java.math.BigDecimal appointmentCost;
    private List<String> availableTimes;
    private List<String> availableDays;
    private String experience;
    private String consultations;
    
}
