package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.UpdateWorkScheduleRequest;
import com.example.HealthCare.dto.response.WorkScheduleResponse;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.model.DoctorScheduleRule;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;
import com.example.HealthCare.service.DoctorScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRuleRepository scheduleRuleRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<Integer> VALID_SESSION_DURATIONS = List.of(10, 15, 20, 30, 60);

    @Override
    public WorkScheduleResponse getWorkSchedule(UUID doctorId) {
        log.info("Getting work schedule for doctor: {}", doctorId);
        
        try {
            List<DoctorScheduleRule> rules = scheduleRuleRepository
                    .findByDoctorIdOrderByWeekdayAscStartTimeAsc(doctorId);
            
            log.info("Found {} schedule rules for doctor: {}", rules.size(), doctorId);
            
            // If no rules exist, return empty schedule (all days disabled)
            if (rules.isEmpty()) {
                log.info("No schedule rules found, returning empty schedule for doctor: {}", doctorId);
                return createEmptySchedule();
            }
            
            // Group by weekday
            Map<Short, List<DoctorScheduleRule>> rulesByWeekday = rules.stream()
                    .collect(Collectors.groupingBy(DoctorScheduleRule::getWeekday));
            
            // Get common session duration and appointment cost (use first rule's values)
            Integer sessionDuration = rules.get(0).getSessionMinutes();
            BigDecimal appointmentCost = rules.get(0).getAppointmentCost();
            
            // Build response - all 7 days
            List<WorkScheduleResponse.DayScheduleResponse> days = new ArrayList<>();
            for (short weekday = 1; weekday <= 7; weekday++) {
                List<DoctorScheduleRule> dayRules = rulesByWeekday.getOrDefault(weekday, List.of());
                boolean enabled = !dayRules.isEmpty();
                
                List<WorkScheduleResponse.TimeSlotResponse> timeSlots = dayRules.stream()
                        .map(rule -> WorkScheduleResponse.TimeSlotResponse.builder()
                                .startTime(rule.getStartTime().format(TIME_FORMATTER))
                                .endTime(rule.getEndTime().format(TIME_FORMATTER))
                                .build())
                        .collect(Collectors.toList());
                
                days.add(WorkScheduleResponse.DayScheduleResponse.builder()
                        .weekday(weekday)
                        .enabled(enabled)
                        .timeSlots(timeSlots)
                        .build());
            }
            
            return WorkScheduleResponse.builder()
                    .sessionDuration(sessionDuration)
                    .appointmentCost(appointmentCost)
                    .days(days)
                    .build();
        } catch (Exception e) {
            log.error("Error getting work schedule for doctor {}: {}", doctorId, e.getMessage(), e);
            throw new RuntimeException("Failed to get work schedule: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public WorkScheduleResponse updateWorkSchedule(UUID doctorId, UpdateWorkScheduleRequest request) {
        log.info("Updating work schedule for doctor: {}", doctorId);
        
        // Validate session duration
        if (!VALID_SESSION_DURATIONS.contains(request.getSessionDuration())) {
            throw new BadRequestException("Session duration must be one of: 10, 15, 20, 30, 60 minutes");
        }
        
        // Validate appointment cost
        if (request.getAppointmentCost() == null || request.getAppointmentCost().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Appointment cost must be greater than 0");
        }
        
        // Validate and process each day
        List<DoctorScheduleRule> newRules = new ArrayList<>();
        
        if (request.getDays() != null) {
            for (UpdateWorkScheduleRequest.DayScheduleRequest dayRequest : request.getDays()) {
                if (dayRequest.getEnabled() && dayRequest.getTimeSlots() != null 
                        && !dayRequest.getTimeSlots().isEmpty()) {
                    
                    // Validate weekday
                    if (dayRequest.getWeekday() < 1 || dayRequest.getWeekday() > 7) {
                        throw new BadRequestException("Weekday must be between 1 (Monday) and 7 (Sunday)");
                    }
                    
                    // Sort time slots by start time
                    List<UpdateWorkScheduleRequest.TimeSlotRequest> sortedSlots = 
                            dayRequest.getTimeSlots().stream()
                                    .sorted(Comparator.comparing(UpdateWorkScheduleRequest.TimeSlotRequest::getStartTime))
                                    .collect(Collectors.toList());
                    
                    // Validate each time slot and check for overlaps
                    for (int i = 0; i < sortedSlots.size(); i++) {
                        UpdateWorkScheduleRequest.TimeSlotRequest slot = sortedSlots.get(i);
                        
                        LocalTime startTime = parseTime(slot.getStartTime());
                        LocalTime endTime = parseTime(slot.getEndTime());
                        
                        // Validate time order
                        if (!startTime.isBefore(endTime)) {
                            throw new BadRequestException(
                                    String.format("Start time must be before end time for weekday %d, slot %d", 
                                            dayRequest.getWeekday(), i + 1));
                        }
                        
                        // Check for overlaps with previous slots
                        if (i > 0) {
                            LocalTime prevEndTime = parseTime(sortedSlots.get(i - 1).getEndTime());
                            if (!startTime.isAfter(prevEndTime) && !startTime.equals(prevEndTime)) {
                                throw new BadRequestException(
                                        String.format("Time slots overlap for weekday %d", dayRequest.getWeekday()));
                            }
                        }
                        
                        // Create rule
                        DoctorScheduleRule rule = DoctorScheduleRule.builder()
                                .doctorId(doctorId)
                                .weekday(dayRequest.getWeekday())
                                .startTime(startTime)
                                .endTime(endTime)
                                .sessionMinutes(request.getSessionDuration())
                                .appointmentCost(request.getAppointmentCost())
                                .build();
                        
                        newRules.add(rule);
                    }
                }
            }
        }
        
        // Delete existing rules
        scheduleRuleRepository.deleteByDoctorId(doctorId);
        
        // Save new rules
        if (!newRules.isEmpty()) {
            scheduleRuleRepository.saveAll(newRules);
        }
        
        log.info("Work schedule updated successfully for doctor: {}. Created {} rules.", doctorId, newRules.size());
        
        // Return updated schedule
        return getWorkSchedule(doctorId);
    }

    private LocalTime parseTime(String timeStr) {
        try {
            return LocalTime.parse(timeStr, TIME_FORMATTER);
        } catch (Exception e) {
            throw new BadRequestException("Invalid time format: " + timeStr + ". Expected format: HH:mm");
        }
    }

    private WorkScheduleResponse createEmptySchedule() {
        List<WorkScheduleResponse.DayScheduleResponse> days = new ArrayList<>();
        // All 7 days disabled by default
        for (short weekday = 1; weekday <= 7; weekday++) {
            days.add(WorkScheduleResponse.DayScheduleResponse.builder()
                    .weekday(weekday)
                    .enabled(false)
                    .timeSlots(List.of())
                    .build());
        }
        
        return WorkScheduleResponse.builder()
                .sessionDuration(15) // Default value
                .appointmentCost(new BigDecimal("150000")) // Default value
                .days(days)
                .build();
    }
}

