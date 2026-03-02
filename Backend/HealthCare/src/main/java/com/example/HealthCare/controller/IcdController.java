package com.example.HealthCare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.IcdChapterDto;
import com.example.HealthCare.dto.IcdDiseaseSearchItemDto;
import com.example.HealthCare.dto.IcdMedicationItemDto;
import com.example.HealthCare.service.IcdDataImportService;
import com.example.HealthCare.service.IcdService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/icd")
@RequiredArgsConstructor
public class IcdController {

    private final IcdService icdService;
    private final IcdDataImportService icdDataImportService;

    /**
     * Import ICD data from CSV. Runs only if table is empty, unless force=true.
     * POST /api/icd/import         -> import if empty
     * POST /api/icd/import?force=true -> delete all and re-import
     */
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<Map<String, Object>> importFromCsv(
            @RequestParam(required = false, defaultValue = "false") boolean force) {
        int imported = force
                ? icdDataImportService.forceImportFromCsv()
                : icdDataImportService.importFromCsvIfEmpty();
        String message = imported > 0
                ? "Đã import " + imported + " dòng từ CSV."
                : force ? "Đã import 0 dòng (kiểm tra file CSV)." : "Bảng đã có dữ liệu, bỏ qua. Dùng ?force=true để import lại.";
        return ResponseEntity.ok(Map.of(
                "imported", imported,
                "message", message
        ));
    }

    @GetMapping("/chapters")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<List<IcdChapterDto>> getChapters() {
        return ResponseEntity.ok(icdService.getChapters());
    }

    @GetMapping("/codes")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<List<IcdDiseaseSearchItemDto>> getCodesByRange(
            @RequestParam String from,
            @RequestParam String to) {
        List<IcdDiseaseSearchItemDto> results = icdService.getCodesByRange(from, to);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<List<IcdDiseaseSearchItemDto>> search(
            @RequestParam(required = false, defaultValue = "") String q) {
        List<IcdDiseaseSearchItemDto> results = icdService.search(q);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{icdCode}/medications")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<List<IcdMedicationItemDto>> getMedicationsByIcdCode(
            @PathVariable String icdCode) {
        List<IcdMedicationItemDto> medications = icdService.getMedicationsByIcdCode(icdCode);
        return ResponseEntity.ok(medications);
    }
}
