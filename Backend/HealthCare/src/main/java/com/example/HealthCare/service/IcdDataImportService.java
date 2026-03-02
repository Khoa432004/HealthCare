package com.example.HealthCare.service;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.model.IcdDiseaseMedication;
import com.example.HealthCare.repository.IcdDiseaseMedicationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class IcdDataImportService {

    private static final String CSV_PATH = "data/ICD10_Full_Drug_Data_AZ.csv";
    private static final int BATCH_SIZE = 500;

    private final IcdDiseaseMedicationRepository repository;

    @Transactional
    public int importFromCsvIfEmpty() {
        if (repository.count() > 0) {
            log.info("ICD disease-medication data already loaded (count={}), skipping import.", repository.count());
            return 0;
        }
        return importFromCsv();
    }

    /** Force re-import: delete all existing data then import from CSV. */
    @Transactional
    public int forceImportFromCsv() {
        long count = repository.count();
        if (count > 0) {
            log.info("Deleting existing ICD data: {} rows", count);
            repository.deleteAll();
        }
        return importFromCsv();
    }

    @Transactional
    public int importFromCsv() {
        log.info("Starting ICD CSV import from {}", CSV_PATH);
        try (Reader reader = new InputStreamReader(
                new ClassPathResource(CSV_PATH).getInputStream(), StandardCharsets.UTF_8)) {

            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .build()
                    .parse(reader);

            List<IcdDiseaseMedication> batch = new ArrayList<>(BATCH_SIZE);
            int total = 0;

                for (CSVRecord record : records) {
                String icdCode = get(record, "ICD-10");
                if (icdCode == null && record.size() > 0) {
                    icdCode = record.get(0).strip().replace("\uFEFF", "");
                }
                String diseaseName = get(record, "Tên bệnh");
                if (diseaseName == null && record.size() > 1) diseaseName = record.get(1).strip();
                String medicationName = get(record, "Tên thuốc");
                if (medicationName == null && record.size() > 2) medicationName = record.get(2).strip();
                String medicationType = get(record, "Loại thuốc");
                if (medicationType == null && record.size() > 3) medicationType = record.get(3).strip();
                String dosage = get(record, "Liều lượng");
                if (dosage == null && record.size() > 4) dosage = record.get(4).strip();
                String medicationGroup = get(record, "Nhóm thuốc");
                if (medicationGroup == null && record.size() > 5) medicationGroup = record.get(5).strip();
                String role = get(record, "Vai trò");
                if (role == null && record.size() > 6) role = record.get(6).strip();

                if (icdCode == null || icdCode.isBlank() || medicationName == null || medicationName.isBlank()) {
                    continue;
                }

                IcdDiseaseMedication entity = IcdDiseaseMedication.builder()
                        .icdCode(icdCode.trim())
                        .diseaseName(diseaseName != null ? diseaseName.trim() : "")
                        .medicationName(medicationName.trim())
                        .medicationType(medicationType != null ? medicationType.trim() : null)
                        .dosage(dosage != null ? dosage.trim() : null)
                        .medicationGroup(medicationGroup != null ? medicationGroup.trim() : null)
                        .role(role != null ? role.trim() : null)
                        .build();

                batch.add(entity);

                if (batch.size() >= BATCH_SIZE) {
                    repository.saveAll(batch);
                    total += batch.size();
                    log.debug("Saved batch, total so far: {}", total);
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                repository.saveAll(batch);
                total += batch.size();
            }

            log.info("ICD CSV import completed. Total rows imported: {}", total);
            return total;
        } catch (Exception e) {
            log.error("ICD CSV import failed", e);
            throw new RuntimeException("ICD CSV import failed: " + e.getMessage(), e);
        }
    }

    private static String get(CSVRecord record, String header) {
        try {
            return record.get(header);
        } catch (Exception e) {
            return null;
        }
    }
}
