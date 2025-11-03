package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;
import com.example.HealthCare.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // GET /api/doctors?search=Le
    @GetMapping
    public ResponseEntity<List<DoctorSummaryDto>> getDoctors(
            @RequestParam(required = false) String search) {
        List<DoctorSummaryDto> doctors = doctorService.getAllDoctors(search);
        return ResponseEntity.ok(doctors);
    }

    // GET /api/doctors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDetailDto> getDoctorDetail(@PathVariable String id) {
        DoctorDetailDto doctor = doctorService.getDoctorDetail(UUID.fromString(id));
        return ResponseEntity.ok(doctor);
    }
}