package com.example.HealthCare.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReportMedication;
import com.example.HealthCare.model.UserAccount;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    Long countByCreatedAtBetween(OffsetDateTime fromDate, OffsetDateTime toDate);
    Long countByStatusAndCreatedAtBetween(AppointmentStatus status, OffsetDateTime fromDate, OffsetDateTime toDate);
    List<Appointment> findByStatus(AppointmentStatus status);
    
    // Find appointments by patient ID within date range
    @Query("SELECT a FROM Appointment a " +
           "JOIN FETCH a.patient " +
           "JOIN FETCH a.doctor " +
           "WHERE a.patientId = :userId " +
           "AND a.scheduledStart >= :startDate " +
           "AND a.scheduledStart <= :endDate " +
           "ORDER BY a.scheduledStart ASC")
    List<Appointment> findByPatientIdAndDateRange(
        @Param("userId") UUID userId,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    // Find appointments by doctor ID within date range
    @Query("SELECT a FROM Appointment a " +
           "JOIN FETCH a.patient " +
           "JOIN FETCH a.doctor " +
           "WHERE a.doctorId = :userId " +
           "AND a.scheduledStart >= :startDate " +
           "AND a.scheduledStart <= :endDate " +
           "ORDER BY a.scheduledStart ASC")
    List<Appointment> findByDoctorIdAndDateRange(
        @Param("userId") UUID userId,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );





    // For Medical Examination History
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.doctor d
        JOIN FETCH d.doctorProfile dp 
        JOIN FETCH a.medicalReport mr
        WHERE a.patientId = :patientId
        AND a.status = 'completed' 
        AND mr.status = 'completed' 
        ORDER BY a.scheduledStart DESC
        """)
    List<Appointment> findCompletedByPatientId(@Param("patientId") UUID patientId);


    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.doctor d
        JOIN FETCH d.doctorProfile dp 
        JOIN FETCH a.medicalReport mr
        WHERE a.id = :appointmentId
        ORDER BY a.scheduledStart DESC
        """)
     List<Appointment> detailAppointmentsHistory(@Param("appointmentId") UUID appointmentId);

    
     @Query("""
        SELECT a FROM MedicalReportMedication a
        JOIN FETCH a.medicalReport d
        WHERE a.medicalReport.id = :medicalReportId
        """)
     List<MedicalReportMedication> detailMedicationHistoryByAppointments(@Param("medicalReportId") UUID medicalReportId);
     

    @Query("""
        SELECT a.patient FROM Appointment a 
        WHERE a.id = :appointmentId
        """)
    UserAccount inforPatientByAppointmentId(@Param("appointmentId") UUID appointmentId);

}

