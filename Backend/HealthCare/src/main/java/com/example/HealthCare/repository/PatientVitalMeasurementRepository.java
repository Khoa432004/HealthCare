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

    /**
     * Range-restricted lookup. Both bounds are nullable so callers can request
     * "since X" or "up to Y" without splitting the query. When both are null
     * the query degenerates to "all measurements for the patient", matching
     * {@link #findAllByPatientOrderByTakenAtAsc(UUID)}.
     */
    @Query("select m from PatientVitalMeasurement m "
        + "where m.patientId = :patientId "
        + "and (:from is null or m.takenAt >= :from) "
        + "and (:to is null or m.takenAt <= :to) "
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
