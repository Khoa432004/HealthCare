package com.example.HealthCare.service.impl;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.dto.MedicalReportVitalSignDto;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.ReportStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReportVitalSign;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.MedicalReportVitalSignRepository;
import com.example.HealthCare.service.MedicalExaminationHistoryService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalExaminationHistoryServiceImpl implements MedicalExaminationHistoryService {
    
    private final AppointmentRepository appointmentRepository;
    private final MedicalReportVitalSignRepository medicalReportVitalSignRepository;



    @Override
    public List<MedicalExaminationHistorySummaryDto> getHistoryByPatientId(UUID patientId) {
        // UC-17: Get completed appointments with completed medical reports
        // Sorted by completed_at DESC (default), then by scheduledStart DESC
        System.out.println("MedicalExaminationHistoryService: Getting history for patientId: " + patientId);
        List<Appointment> appointments = appointmentRepository.findCompletedByPatientId(
            patientId, 
            AppointmentStatus.completed, 
            ReportStatus.completed
        );
        System.out.println("MedicalExaminationHistoryService: Found " + appointments.size() + " completed appointments");

        return appointments.stream()
            .map(apt -> {
                // Get medical report for additional information (diagnosis, notes, completedAt)
                var medicalReport = apt.getMedicalReport();
                
                return MedicalExaminationHistorySummaryDto.builder()
                    .id(apt.getId().toString())
                    .patientId(patientId.toString())
                    .doctor(apt.getDoctor().getFullName())
                    .date(apt.getScheduledStart())
                    .reason(apt.getReason())
                    .clinic(apt.getDoctor().getDoctorProfile().getWorkplaceName())
                    // UC-17: Additional fields for doctors - full notes, diagnosis, completed date
                    .diagnosis(medicalReport != null ? medicalReport.getDiagnosis() : null)
                    .notes(medicalReport != null ? medicalReport.getNote() : null)
                    .completedAt(medicalReport != null ? medicalReport.getCompletedAt() : null)
                    .build();
            })
            .collect(Collectors.toList());
    }


    @Override
    public List<MedicalExaminationHistoryDetailDto> getDetailHistoryByAppointmentId(UUID appointmentUuid) {
        
        List<Appointment> appointments = appointmentRepository.detailAppointmentsHistory(appointmentUuid);

        UserAccount patient = appointmentRepository.inforPatientByAppointmentId(appointmentUuid);

        UUID medicalReportId = appointments.get(0).getMedicalReport().getId();

        //Lấy các chỉ số y tế
        List<MedicalReportVitalSign> vitalSigns = medicalReportVitalSignRepository.findByMedicalReportId(medicalReportId);
        List<MedicalReportVitalSignDto> vitalSignDtos = vitalSigns.stream()
            .map(vs -> MedicalReportVitalSignDto.builder()
                .signType(vs.getSignType())
                .signValue(vs.getValue())
                .unit(vs.getUnit())
                .build()
            )
            .collect(Collectors.toList());
        //Đơn thuốc
        List<MedicalExaminationHistoryDetailDto.Prescription> prescriptions = appointmentRepository.detailMedicationHistoryByAppointments(medicalReportId)
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
                .clinicalDiagnosis(vitalSignDtos)
                .treatment(apt.getMedicalReport().getRecommendation())
                .notes(apt.getMedicalReport().getNote())
                .prescriptions(prescriptions)
                .build()
            )
            .collect(Collectors.toList());
    }
}
