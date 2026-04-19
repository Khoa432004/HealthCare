package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateVitalMeasurementRequest;
import com.example.HealthCare.dto.response.VitalMeasurementResponse;
import com.example.HealthCare.dto.response.VitalMetricPointResponse;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementMetricType;
import com.example.HealthCare.enums.MeasurementSource;
import com.example.HealthCare.model.PatientVitalMeasurement;
import com.example.HealthCare.repository.PatientVitalMeasurementRepository;
import com.example.HealthCare.service.MeasurementClassifier;
import com.example.HealthCare.service.MeasurementClassifier.ClassificationResult;
import com.example.HealthCare.service.PatientVitalMeasurementService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientVitalMeasurementServiceImpl
    implements PatientVitalMeasurementService {

    private final PatientVitalMeasurementRepository measurementRepository;
    private final MeasurementClassifier classifier;

    // -------------------------------------------------------------------
    // create
    // -------------------------------------------------------------------

    @Override
    @Transactional
    public VitalMeasurementResponse create(
        UUID patientId, CreateVitalMeasurementRequest request
    ) {
        if (patientId == null) {
            throw new IllegalArgumentException("patientId is required");
        }
        if (request.getMetricType() == null) {
            throw new IllegalArgumentException("metricType is required");
        }

        validatePayload(request);
        ClassificationResult classification = classify(request);
        MeasurementBadge pulseBadge = request.getMetricType() == MeasurementMetricType.BLOOD_PRESSURE
            ? classifier.classifyPulse(request.getPulseValue())
            : null;

        PatientVitalMeasurement entity = PatientVitalMeasurement.builder()
            .patientId(patientId)
            .metricType(request.getMetricType())
            .metricSubType(request.getMetricSubType())
            .source(request.getSource() == null ? MeasurementSource.MANUAL : request.getSource())
            .systolicValue(request.getSystolicValue())
            .diastolicValue(request.getDiastolicValue())
            .pulseValue(request.getPulseValue())
            .numericValue(request.getNumericValue())
            .unit(request.getUnit())
            .meal(request.getMeal())
            .notes(request.getNotes())
            .badge(classification.badge())
            .pulseBadge(pulseBadge)
            .referenceRangeLabel(classification.rangeLabel())
            .takenAt(request.getTakenAt() == null ? OffsetDateTime.now() : request.getTakenAt())
            .build();

        PatientVitalMeasurement saved = measurementRepository.save(entity);
        log.info("Saved vital measurement {} ({}) for patient {}",
            saved.getId(), saved.getMetricType(), patientId);
        return toResponse(saved);
    }

    private void validatePayload(CreateVitalMeasurementRequest request) {
        switch (request.getMetricType()) {
            case BLOOD_PRESSURE -> {
                if (request.getSystolicValue() == null || request.getDiastolicValue() == null) {
                    throw new IllegalArgumentException(
                        "BLOOD_PRESSURE requires systolicValue and diastolicValue");
                }
            }
            case CHOLESTEROL -> {
                if (request.getNumericValue() == null) {
                    throw new IllegalArgumentException("numericValue is required");
                }
                if (request.getMetricSubType() == null) {
                    throw new IllegalArgumentException(
                        "CHOLESTEROL requires metricSubType");
                }
            }
            case BLOOD_SUGAR, HEART_RATE, HEMATOCRIT,
                 HEMOGLOBIN, KETONE, URIC_ACID -> {
                if (request.getNumericValue() == null) {
                    throw new IllegalArgumentException("numericValue is required");
                }
            }
        }
    }

    private ClassificationResult classify(CreateVitalMeasurementRequest request) {
        return switch (request.getMetricType()) {
            case BLOOD_PRESSURE -> classifier.classifyBloodPressure(
                request.getSystolicValue(),
                request.getDiastolicValue(),
                request.getPulseValue());
            case BLOOD_SUGAR -> classifier.classifyBloodGlucose(
                request.getNumericValue(),
                request.getUnit(),
                request.getMeal());
            case HEART_RATE -> classifier.classifyHeartRate(request.getNumericValue());
            case URIC_ACID -> classifier.classifyUricAcid(
                request.getNumericValue(), request.getUnit());
            case CHOLESTEROL -> classifier.classifyCholesterol(
                request.getMetricSubType(),
                request.getNumericValue(),
                request.getUnit());
            // Ysalus does not classify these — store badge=null, rangeLabel=null.
            case HEMATOCRIT, HEMOGLOBIN, KETONE -> ClassificationResult.empty();
        };
    }

    // -------------------------------------------------------------------
    // reads
    // -------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<VitalMeasurementResponse> listForPatient(UUID patientId) {
        return measurementRepository.findAllByPatientOrderByTakenAtAsc(patientId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VitalMetricPointResponse> listVitalMetricPoints(UUID patientId) {
        return buildPointsFromSelfMeasurements(
            measurementRepository.findAllByPatientOrderByTakenAtAsc(patientId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VitalMetricPointResponse> listVitalMetricPointsInRange(
        UUID patientId, OffsetDateTime from, OffsetDateTime to
    ) {
        return buildPointsFromSelfMeasurements(
            measurementRepository.findAllByPatientInRange(patientId, from, to));
    }

    // -------------------------------------------------------------------
    // helpers
    // -------------------------------------------------------------------

    /**
     * Flatten each self-reported measurement row into one or two
     * {@link VitalMetricPointResponse}s. A BP submission with a pulse reading
     * expands into two points — "Blood pressure" + "Heart rate" — so the
     * frontend chart picks up both metrics seamlessly.
     */
    private List<VitalMetricPointResponse> buildPointsFromSelfMeasurements(
        List<PatientVitalMeasurement> measurements
    ) {
        List<VitalMetricPointResponse> out = new ArrayList<>(measurements.size());
        for (PatientVitalMeasurement m : measurements) {
            String measuredAt = m.getTakenAt() == null ? null : m.getTakenAt().toString();
            String groupingId = m.getId().toString();

            switch (m.getMetricType()) {
                case BLOOD_PRESSURE -> {
                    out.add(VitalMetricPointResponse.builder()
                        .measuredAt(measuredAt)
                        .appointmentId(groupingId)
                        .signType("Blood pressure")
                        .value(formatBpValue(m.getSystolicValue(), m.getDiastolicValue()))
                        .unit(m.getUnit() == null ? "mmHg" : m.getUnit())
                        .source(m.getSource())
                        .badge(m.getBadge())
                        .rangeLabel(m.getReferenceRangeLabel())
                        .build());
                    if (m.getPulseValue() != null) {
                        out.add(VitalMetricPointResponse.builder()
                            .measuredAt(measuredAt)
                            .appointmentId(groupingId)
                            .signType("Heart rate")
                            .value(stripTrailingZero(m.getPulseValue()))
                            .unit("bpm")
                            .source(m.getSource())
                            .badge(m.getPulseBadge())
                            .rangeLabel("60-100 bpm")
                            .build());
                    }
                }
                case BLOOD_SUGAR -> out.add(simplePoint(
                    m, groupingId, "Blood glucose", measuredAt));
                case CHOLESTEROL -> out.add(simplePoint(
                    m, groupingId, "Cholesterol", measuredAt));
                case HEART_RATE -> out.add(simplePoint(
                    m, groupingId, "Heart rate", measuredAt));
                case URIC_ACID -> out.add(simplePoint(
                    m, groupingId, "Uric acid", measuredAt));
                case HEMATOCRIT -> out.add(simplePoint(
                    m, groupingId, "Hematocrit", measuredAt));
                case HEMOGLOBIN -> out.add(simplePoint(
                    m, groupingId, "Hemoglobin", measuredAt));
                case KETONE -> out.add(simplePoint(
                    m, groupingId, "Ketone", measuredAt));
            }
        }
        return out;
    }

    private VitalMetricPointResponse simplePoint(
        PatientVitalMeasurement m, String groupingId, String signType, String measuredAt
    ) {
        return VitalMetricPointResponse.builder()
            .measuredAt(measuredAt)
            .appointmentId(groupingId)
            .signType(signType)
            .value(stripTrailingZero(m.getNumericValue()))
            .unit(m.getUnit())
            .source(m.getSource())
            .subType(m.getMetricSubType() == null ? null : m.getMetricSubType().name())
            .badge(m.getBadge())
            .rangeLabel(m.getReferenceRangeLabel())
            .meal(m.getMeal() == null ? null : m.getMeal().name())
            .build();
    }

    private String formatBpValue(BigDecimal systolic, BigDecimal diastolic) {
        return stripTrailingZero(systolic) + "/" + stripTrailingZero(diastolic);
    }

    private String stripTrailingZero(BigDecimal value) {
        if (value == null) return null;
        BigDecimal stripped = value.stripTrailingZeros();
        if (stripped.scale() < 0) {
            stripped = stripped.setScale(0);
        }
        return stripped.toPlainString();
    }

    private VitalMeasurementResponse toResponse(PatientVitalMeasurement m) {
        return VitalMeasurementResponse.builder()
            .id(m.getId())
            .patientId(m.getPatientId())
            .metricType(m.getMetricType())
            .metricSubType(m.getMetricSubType())
            .source(m.getSource())
            .systolicValue(m.getSystolicValue())
            .diastolicValue(m.getDiastolicValue())
            .pulseValue(m.getPulseValue())
            .numericValue(m.getNumericValue())
            .unit(m.getUnit())
            .meal(m.getMeal())
            .notes(m.getNotes())
            .badge(m.getBadge())
            .pulseBadge(m.getPulseBadge())
            .referenceRangeLabel(m.getReferenceRangeLabel())
            .takenAt(m.getTakenAt())
            .createdAt(m.getCreatedAt())
            .updatedAt(m.getUpdatedAt())
            .build();
    }
}
