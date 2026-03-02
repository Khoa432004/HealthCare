package com.example.HealthCare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Reference data: ICD-10 code + disease name + suggested medication.
 * One row per (icd_code, disease_name, medication). Imported from ICD10_Full_Drug_Data_AZ.csv.
 */
@Entity
@Table(name = "icd_disease_medication")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class IcdDiseaseMedication extends BaseEntity {

    @Column(name = "icd_code", nullable = false, length = 20)
    private String icdCode;

    @Column(name = "disease_name", nullable = false, length = 500)
    private String diseaseName;

    @Column(name = "medication_name", nullable = false, length = 255)
    private String medicationName;

    @Column(name = "medication_type", length = 100)
    private String medicationType;

    @Column(name = "dosage", length = 255)
    private String dosage;

    @Column(name = "medication_group", length = 100)
    private String medicationGroup;

    @Column(name = "role", length = 50)
    private String role;
}
