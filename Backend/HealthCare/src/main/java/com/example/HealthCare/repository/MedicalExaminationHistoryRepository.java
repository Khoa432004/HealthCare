package com.example.HealthCare.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.HealthCare.model.Appointment;


public interface MedicalExaminationHistoryRepository extends JpaRepository<Appointment, UUID> {


    
}