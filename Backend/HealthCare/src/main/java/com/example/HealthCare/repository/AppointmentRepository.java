package com.example.HealthCare.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.model.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    Long countByCreatedAtBetween(OffsetDateTime fromDate, OffsetDateTime toDate);
    Long countByStatusAndCreatedAtBetween(AppointmentStatus status, OffsetDateTime fromDate, OffsetDateTime toDate);
    List<Appointment> findByStatus(AppointmentStatus status);
}

