package com.example.HealthCare.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.model.PatientVitalMeasurement;

public interface PatientVitalMeasurementRepository
    extends JpaRepository<PatientVitalMeasurement, UUID> {

    @Query("select m from PatientVitalMeasurement m "
        + "where m.patientId = :patientId "
        + "order by m.takenAt asc")
    List<PatientVitalMeasurement> findAllByPatientOrderByTakenAtAsc(
        @Param("patientId") UUID patientId);

    @Query("select m from PatientVitalMeasurement m "
        + "where m.patientId = :patientId "
        + "and m.takenAt between :from and :to "
        + "order by m.takenAt asc")
    List<PatientVitalMeasurement> findAllByPatientInRange(
        @Param("patientId") UUID patientId,
        @Param("from") OffsetDateTime from,
        @Param("to") OffsetDateTime to);

    @Query("select m from PatientVitalMeasurement m "
        + "left join fetch m.patient p "
        + "where m.patientId in :patientIds "
        + "and ((m.badge in :abnormalBadges) or (m.pulseBadge in :abnormalBadges)) "
        + "order by m.takenAt desc")
    List<PatientVitalMeasurement> findRecentAbnormalByPatientIds(
        @Param("patientIds") List<UUID> patientIds,
        @Param("abnormalBadges") List<MeasurementBadge> abnormalBadges,
        Pageable pageable);
}
