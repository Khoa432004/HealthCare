package com.example.HealthCare.model;

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
@Table(name = "medical_report_vital_sign")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class MedicalReportVitalSign extends BaseEntity {

    @Column(name = "medical_report_id", nullable = false)
    private UUID medicalReportId;

    @Column(name = "sign_type", nullable = false)
    private String signType;

    @Column(name = "value", nullable = false)
    private String value;

    @Column(name = "unit")
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_report_id", insertable = false, updatable = false)
    private MedicalReport medicalReport;
}
