package com.example.HealthCare.model;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "doctor_schedule_rule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class DoctorScheduleRule extends BaseEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "weekday", nullable = false)
    private Short weekday;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "session_minutes", nullable = false)
    @lombok.Builder.Default
    private Integer sessionMinutes = 15;

    @Column(name = "appointment_cost", nullable = false)
    @lombok.Builder.Default
    private BigDecimal appointmentCost = new BigDecimal("150000");

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private UserAccount doctor;
}


