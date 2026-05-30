package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.response.PatientDashboardOverviewResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.MealRelation;
import com.example.HealthCare.enums.ReportStatus;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementMetricType;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReport;
import com.example.HealthCare.model.MedicalReportMedication;
import com.example.HealthCare.model.PatientExamPackagePurchase;
import com.example.HealthCare.model.PatientVitalMeasurement;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.MedicalReportMedicationRepository;
import com.example.HealthCare.repository.MedicalReportRepository;
import com.example.HealthCare.repository.PatientExamPackagePurchaseRepository;
import com.example.HealthCare.repository.PatientVitalMeasurementRepository;
import com.example.HealthCare.service.PatientDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientDashboardServiceImpl implements PatientDashboardService {
    private static final ZoneId DISPLAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final List<MeasurementMetricType> CARD_METRICS = List.of(
        MeasurementMetricType.BLOOD_SUGAR,
        MeasurementMetricType.HEMATOCRIT,
        MeasurementMetricType.KETONE,
        MeasurementMetricType.HEART_RATE,
        MeasurementMetricType.CHOLESTEROL,
        MeasurementMetricType.URIC_ACID
    );

    private final PatientVitalMeasurementRepository measurementRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final MedicalReportMedicationRepository medicalReportMedicationRepository;
    private final PatientExamPackagePurchaseRepository packagePurchaseRepository;

    @Override
    public PatientDashboardOverviewResponse getOverview(UUID patientId) {
        List<PatientVitalMeasurement> measurements = measurementRepository.findAllByPatientOrderByTakenAtAsc(patientId);
        List<Appointment> appointments = getCurrentMonthAppointments(patientId);

        return PatientDashboardOverviewResponse.builder()
            .metricCards(buildMetricCards(measurements))
            .glucoseTrend(buildGlucoseTrend(measurements))
            .currentPlan(buildCurrentPlan(patientId))
            .todayMedicines(buildTodayMedicines(patientId))
            .pendingAppointment(buildPendingAppointment(appointments))
            .weeklyAppointments(buildWeeklyAppointments(appointments))
            .build();
    }

    private List<Appointment> getCurrentMonthAppointments(UUID patientId) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
            .withHour(23).withMinute(59).withSecond(59).withNano(999_000_000);
        return appointmentRepository.findByPatientIdAndDateRange(patientId, start, end);
    }

    private List<PatientDashboardOverviewResponse.MetricCardItem> buildMetricCards(List<PatientVitalMeasurement> measurements) {
        Map<MeasurementMetricType, List<PatientVitalMeasurement>> grouped = measurements.stream()
            .collect(Collectors.groupingBy(PatientVitalMeasurement::getMetricType));

        List<PatientDashboardOverviewResponse.MetricCardItem> cards = new ArrayList<>();
        for (MeasurementMetricType metricType : CARD_METRICS) {
            List<PatientVitalMeasurement> metricMeasurements = grouped.getOrDefault(metricType, List.of());
            PatientDashboardOverviewResponse.MetricCardItem card = buildMetricCard(metricType, metricMeasurements);
            if (card != null) {
                cards.add(card);
            }
        }
        return cards;
    }

    private PatientDashboardOverviewResponse.MetricCardItem buildMetricCard(
        MeasurementMetricType metricType,
        List<PatientVitalMeasurement> metricMeasurements
    ) {
        if (metricMeasurements.isEmpty()) {
            return null;
        }

        PatientVitalMeasurement latest = metricMeasurements.get(metricMeasurements.size() - 1);
        BigDecimal latestValue = resolveDisplayValue(latest);
        BigDecimal previous = metricMeasurements.size() > 1
            ? resolveDisplayValue(metricMeasurements.get(metricMeasurements.size() - 2))
            : latestValue;
        BigDecimal delta = latestValue.subtract(previous).setScale(1, RoundingMode.HALF_UP);

        return PatientDashboardOverviewResponse.MetricCardItem.builder()
            .name(formatMetricName(metricType))
            .value(latestValue)
            .unit(latest.getUnit() != null ? latest.getUnit() : defaultUnit(metricType))
            .status(formatBadge(latest.getBadge()))
            .deltaText((delta.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "") + delta + " " + (latest.getUnit() != null ? latest.getUnit() : ""))
            .build();
    }

    private List<PatientDashboardOverviewResponse.MetricTrendPoint> buildGlucoseTrend(List<PatientVitalMeasurement> measurements) {
        List<PatientVitalMeasurement> glucoseMeasurements = measurements.stream()
            .filter(m -> m.getMetricType() == MeasurementMetricType.BLOOD_SUGAR)
            .filter(m -> m.getTakenAt() != null && m.getNumericValue() != null)
            .sorted(Comparator.comparing(PatientVitalMeasurement::getTakenAt))
            .collect(Collectors.toList());

        if (glucoseMeasurements.isEmpty()) {
            return List.of();
        }

        int fromIndex = Math.max(0, glucoseMeasurements.size() - 8);
        return glucoseMeasurements.subList(fromIndex, glucoseMeasurements.size()).stream()
            .map(m -> trendPoint(
                m.getTakenAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                m.getNumericValue()))
            .collect(Collectors.toList());
    }

    private PatientDashboardOverviewResponse.MetricTrendPoint trendPoint(String day, BigDecimal value) {
        return PatientDashboardOverviewResponse.MetricTrendPoint.builder()
            .day(day)
            .value(value)
            .build();
    }

    private PatientDashboardOverviewResponse.CurrentPlan buildCurrentPlan(UUID patientId) {
        LocalDate today = LocalDate.now();
        PatientExamPackagePurchase activePackage = packagePurchaseRepository
            .findByPatientIdOrderByPurchaseDateDesc(patientId)
            .stream()
            .filter(pkg -> "active".equalsIgnoreCase(pkg.getStatus()))
            .filter(pkg -> pkg.getExpirationDate() == null
                || !pkg.getExpirationDate().toLocalDate().isBefore(today))
            .findFirst()
            .orElse(null);

        if (activePackage == null) {
            return PatientDashboardOverviewResponse.CurrentPlan.builder().build();
        }

        LocalDate startDate = activePackage.getPurchaseDate() != null
            ? activePackage.getPurchaseDate().toLocalDate()
            : today;
        LocalDate endDate = activePackage.getExpirationDate() != null
            ? activePackage.getExpirationDate().toLocalDate()
            : startDate.plusDays(activePackage.getDurationDays() != null ? activePackage.getDurationDays() : 0);

        int totalDays = Math.max(
            1,
            activePackage.getDurationDays() != null ? activePackage.getDurationDays() : (int) startDate.until(endDate).getDays()
        );
        int daysLeft = (int) Math.max(0, today.until(endDate).getDays());
        int elapsedDays = Math.max(0, totalDays - daysLeft);
        int progressPercent = Math.min(100, (elapsedDays * 100) / totalDays);

        return PatientDashboardOverviewResponse.CurrentPlan.builder()
            .title(activePackage.getPackageName())
            .status(formatPackageStatus(activePackage.getStatus()))
            .progressPercent(progressPercent)
            .daysLeft(daysLeft)
            .startDate(startDate)
            .endDate(endDate)
            .build();
    }

    private List<PatientDashboardOverviewResponse.MedicineScheduleItem> buildTodayMedicines(UUID patientId) {
        LocalDate today = LocalDate.now();
        List<Appointment> completedAppointments = appointmentRepository.findCompletedByPatientId(
            patientId,
            AppointmentStatus.COMPLETED,
            ReportStatus.COMPLETED
        );

        List<PatientDashboardOverviewResponse.MedicineScheduleItem> result = new ArrayList<>();
        Set<String> seenDrugNames = new HashSet<>();
        String[] defaultTimes = {"09:00", "11:00", "15:00", "21:00"};
        int timeIndex = 0;

        for (Appointment appointment : completedAppointments) {
            MedicalReport report = appointment.getMedicalReport();
            if (report == null) {
                continue;
            }

            List<MedicalReportMedication> medications = medicalReportMedicationRepository
                .findByMedicalReportId(report.getId());

            for (MedicalReportMedication medication : medications) {
                if (!isMedicationActiveToday(medication, today, appointment)) {
                    continue;
                }

                String drugName = medication.getMedicationName();
                if (drugName == null || drugName.isBlank()) {
                    continue;
                }
                String drugKey = drugName.toLowerCase(Locale.ENGLISH);
                if (seenDrugNames.contains(drugKey)) {
                    continue;
                }
                seenDrugNames.add(drugKey);

                String time = defaultTimes[Math.min(timeIndex, defaultTimes.length - 1)];
                timeIndex++;

                result.add(PatientDashboardOverviewResponse.MedicineScheduleItem.builder()
                    .time(time)
                    .drugName(drugName)
                    .dosage(formatDosage(medication))
                    .instruction(formatMealRelation(medication.getMealRelation()))
                    .status("Take")
                    .build());
            }

            if (result.size() >= 12) {
                break;
            }
        }

        return result;
    }

    private boolean isMedicationActiveToday(
        MedicalReportMedication medication,
        LocalDate today,
        Appointment appointment
    ) {
        LocalDate startDate = medication.getStartDate();
        if (startDate == null && appointment.getScheduledStart() != null) {
            startDate = appointment.getScheduledStart().atZoneSameInstant(DISPLAY_ZONE).toLocalDate();
        }
        if (startDate == null) {
            return true;
        }
        if (startDate.isAfter(today)) {
            return false;
        }
        if (medication.getDurationDays() == null || medication.getDurationDays() <= 0) {
            return true;
        }
        return !startDate.plusDays(medication.getDurationDays()).isBefore(today);
    }

    private String formatDosage(MedicalReportMedication medication) {
        String dosage = medication.getDosage() != null ? medication.getDosage().trim() : "";
        if (dosage.isEmpty()) {
            return "N/A";
        }
        String lowerDosage = dosage.toLowerCase(Locale.ENGLISH);
        if (lowerDosage.contains("mg")
            || lowerDosage.contains("ml")
            || lowerDosage.contains("pill")
            || lowerDosage.contains("viên")
            || lowerDosage.contains("tablet")
            || lowerDosage.contains("capsule")) {
            return dosage;
        }

        String unit = switch (medication.getMedicationType() != null
            ? medication.getMedicationType().toLowerCase(Locale.ENGLISH)
            : "") {
            case "capsule" -> "viên nang";
            case "liquid" -> "ml";
            case "powder" -> "gói";
            case "injection" -> "ống";
            default -> "viên";
        };
        return dosage + " " + unit;
    }

    private String formatMealRelation(MealRelation mealRelation) {
        if (mealRelation == null) {
            return "With meal";
        }
        return switch (mealRelation) {
            case before -> "Before meal";
            case after -> "After meal";
            case with -> "With meal";
        };
    }

    private String formatPackageStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Active";
        }
        String normalized = status.trim().toLowerCase(Locale.ENGLISH);
        return switch (normalized) {
            case "active" -> "Active";
            case "expired" -> "Expired";
            case "cancelled", "canceled" -> "Cancelled";
            case "pending" -> "Pending";
            default -> status.substring(0, 1).toUpperCase(Locale.ENGLISH) + status.substring(1);
        };
    }

    private BigDecimal resolveDisplayValue(PatientVitalMeasurement measurement) {
        if (measurement.getNumericValue() != null) {
            return measurement.getNumericValue();
        }
        if (measurement.getSystolicValue() != null) {
            return measurement.getSystolicValue();
        }
        return BigDecimal.ZERO;
    }

    private String formatMetricName(MeasurementMetricType metricType) {
        Map<MeasurementMetricType, String> names = Map.of(
            MeasurementMetricType.BLOOD_SUGAR, "Blood Glucose",
            MeasurementMetricType.HEMATOCRIT, "Hematocrit",
            MeasurementMetricType.KETONE, "Ketone",
            MeasurementMetricType.HEART_RATE, "Heart Rate",
            MeasurementMetricType.CHOLESTEROL, "Cholesterol",
            MeasurementMetricType.URIC_ACID, "Uric Acid"
        );
        return names.getOrDefault(metricType, metricType.name());
    }

    private String defaultUnit(MeasurementMetricType metricType) {
        Map<MeasurementMetricType, String> units = Map.of(
            MeasurementMetricType.BLOOD_SUGAR, "mg/dL",
            MeasurementMetricType.HEMATOCRIT, "%",
            MeasurementMetricType.KETONE, "mmol/L",
            MeasurementMetricType.HEART_RATE, "bpm",
            MeasurementMetricType.CHOLESTEROL, "mg/dL",
            MeasurementMetricType.URIC_ACID, "mg/dL"
        );
        return units.getOrDefault(metricType, "");
    }

    private String formatBadge(MeasurementBadge badge) {
        if (badge == null) {
            return "Normal";
        }
        return switch (badge) {
            case LOW -> "Low";
            case NORMAL -> "Normal";
            case HIGH -> "High";
        };
    }

    private PatientDashboardOverviewResponse.AppointmentItem buildPendingAppointment(List<Appointment> appointments) {
        return appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.IN_PROCESS)
            .filter(a -> a.getScheduledStart() != null)
            .sorted(Comparator.comparing(Appointment::getScheduledStart))
            .findFirst()
            .map(this::toAppointmentItem)
            .orElse(null);
    }

    private List<PatientDashboardOverviewResponse.AppointmentItem> buildWeeklyAppointments(List<Appointment> appointments) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime endOfWeek = now
            .plusDays(7 - now.getDayOfWeek().getValue())
            .withHour(23)
            .withMinute(59)
            .withSecond(59)
            .withNano(999_000_000);

        return appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
            .filter(a -> a.getScheduledStart() != null)
            .filter(a -> !a.getScheduledStart().isBefore(now) && !a.getScheduledStart().isAfter(endOfWeek))
            .sorted(Comparator.comparing(Appointment::getScheduledStart))
            .limit(6)
            .map(this::toAppointmentItem)
            .collect(Collectors.toList());
    }

    private PatientDashboardOverviewResponse.AppointmentItem toAppointmentItem(Appointment appointment) {
        OffsetDateTime start = appointment.getScheduledStart();
        OffsetDateTime end = appointment.getScheduledEnd() != null ? appointment.getScheduledEnd() : start.plusMinutes(60);
        var startLocal = start.atZoneSameInstant(DISPLAY_ZONE);
        var endLocal = end.atZoneSameInstant(DISPLAY_ZONE);
        String doctorName = appointment.getDoctor() != null && appointment.getDoctor().getFullName() != null
            ? appointment.getDoctor().getFullName()
            : "Unknown doctor";

        return PatientDashboardOverviewResponse.AppointmentItem.builder()
            .id(appointment.getId())
            .day(startLocal.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH))
            .date(startLocal.toLocalDate().format(DATE_FORMATTER))
            .doctor(doctorName)
            .time(startLocal.toLocalTime().format(TIME_FORMATTER) + " - " + endLocal.toLocalTime().format(TIME_FORMATTER))
            .build();
    }
}
