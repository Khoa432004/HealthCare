package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.HealthCare.model.IcdDiseaseMedication;

public interface IcdDiseaseMedicationRepository extends JpaRepository<IcdDiseaseMedication, UUID> {

    List<IcdDiseaseMedication> findByIcdCodeOrderByMedicationName(String icdCode);

    @Query("SELECT DISTINCT i.icdCode, i.diseaseName FROM IcdDiseaseMedication i " +
           "WHERE LOWER(i.icdCode) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(i.diseaseName) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Object[]> findDistinctIcdAndDiseaseByQuery(@Param("q") String q, Pageable pageable);

    @Query("SELECT DISTINCT i.icdCode, i.diseaseName FROM IcdDiseaseMedication i " +
           "WHERE i.icdCode >= :codeFrom AND i.icdCode <= :codeTo")
    List<Object[]> findDistinctByIcdCodeRange(@Param("codeFrom") String codeFrom, @Param("codeTo") String codeTo, Pageable pageable);
}
