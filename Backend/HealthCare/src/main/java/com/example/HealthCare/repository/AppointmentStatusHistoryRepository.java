package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.AppointmentStatusHistory;

@Repository
public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, UUID> {
    List<AppointmentStatusHistory> findByAppointmentIdOrderByChangedAtDesc(UUID appointmentId);
}

