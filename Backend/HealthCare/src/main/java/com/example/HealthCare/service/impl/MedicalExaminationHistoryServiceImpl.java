package com.example.HealthCare.service.impl;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.service.MedicalExaminationHistoryService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalExaminationHistoryServiceImpl implements MedicalExaminationHistoryService {
    
    private final AppointmentRepository appointmentRepository;


    @Override
    public List<MedicalExaminationHistorySummaryDto> getHistoryByPatientId(UUID patientId) {
        List<Appointment> appointments = appointmentRepository.findCompletedByPatientId(patientId);

        return appointments.stream()
            .map(apt -> MedicalExaminationHistorySummaryDto.builder()
                .id(apt.getId().toString())
                .patientId(patientId.toString())
                .doctor(apt.getDoctor().getFullName())
                .date(apt.getScheduledStart())
                .reason(apt.getReason())
                .clinic(apt.getDoctor().getDoctorProfile().getWorkplaceName())
                .build()
            )
            .collect(Collectors.toList());
    }


    @Override
    public List<MedicalExaminationHistoryDetailDto> getDetailHistoryByAppointmentId(UUID appointmentUuid) {
        List<Appointment> appointments = appointmentRepository.detailAppointmentsHistory(appointmentUuid);

        UserAccount patient = appointmentRepository.inforPatientByAppointmentId(appointmentUuid);

        UUID medicalReportId = appointments.get(0).getMedicalReport().getId();
        List<MedicalExaminationHistoryDetailDto.Prescription> prescriptions = appointmentRepository
                        .detailMedicationHistoryByAppointments(medicalReportId)
                        .stream()
                        .map(exp -> MedicalExaminationHistoryDetailDto.Prescription.builder()
                                
                                .name(exp.getMedicationName())
                                .dosage(exp.getDosage())    
                                .medicationType(exp.getMedicationType())
                                .mealRelation(exp.getMealRelation().toString())
                                .duration(exp.getDurationDays())
                                .startDay(exp.getStartDate())
                                .note(exp.getNote())
                                .build())
                        .collect(Collectors.toList());
        
        
            return appointments.stream()
            .map(apt -> MedicalExaminationHistoryDetailDto.builder()
                .id(apt.getMedicalReport().getId().toString())
                .patientId(apt.getPatientId().toString())
                .doctor(apt.getDoctor().getFullName())
                .clinic(apt.getMedicalReport().getClinic())
                .doctorMajor(apt.getDoctor().getDoctorProfile().getFacilityName())
                .date(apt.getScheduledStart())
                .timeIn(apt.getScheduledStart())
                .timeOut(apt.getScheduledEnd())
                .patientName(patient.getFullName())
                .gender(patient.getGender().toString())
                .birthDateTime(patient.getDateOfBirth())
                .reason(apt.getReason())
                .diagnosis(apt.getMedicalReport().getDiagnosis())
                .clinicalDiagnosis(null)/// To be filled with clinical diagnosis
                .treatment(apt.getMedicalReport().getRecommendation())
                .notes(apt.getMedicalReport().getNote())
                .prescriptions(prescriptions)
                .build()
            )
            .collect(Collectors.toList());
    }
}
