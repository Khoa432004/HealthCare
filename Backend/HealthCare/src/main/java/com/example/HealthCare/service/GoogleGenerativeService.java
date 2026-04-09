package com.example.HealthCare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.HealthCare.model.DoctorProfile;
import com.example.HealthCare.model.DoctorScheduleRule;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;

@Service
public class GoogleGenerativeService {

    @Value("${google.api.key:}")
    private String apiKey;

    @Value("${google.model.id:gemini-1.5-flash}")
    private String modelId;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private DoctorScheduleRuleRepository doctorScheduleRuleRepository;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String generateText(String userQuery) throws Exception {
        // Lấy danh sách bác sĩ thực tế từ Database
        List<DoctorProfile> doctors = doctorProfileRepository.findAll();
        
        // Xây dựng context thông tin bác sĩ đầy đủ (tên, chuyên khoa, giá, lịch rãnh)
        StringBuilder contextBuilder = new StringBuilder("=== THÔNG TIN BÁC SĨ TẠI PHÒNG KHÁM ===\n\n");
        
        if (!doctors.isEmpty()) {
            for (DoctorProfile doctor : doctors) {
                // Basic info
                String doctorName = doctor.getUserAccount() != null ? doctor.getUserAccount().getFullName() : "N/A";
                String specialty = doctor.getSpecialties() != null ? doctor.getSpecialties() : "N/A";
                String title = doctor.getTitle() != null ? doctor.getTitle() : "";
                
                contextBuilder.append(String.format("👨‍⚕️ %s %s\n", title, doctorName));
                contextBuilder.append(String.format("   Chuyên khoa: %s\n", specialty));
                
                // Get schedule and price
                List<DoctorScheduleRule> schedules = doctorScheduleRuleRepository
                        .findByDoctorIdOrderByWeekdayAscStartTimeAsc(doctor.getUserId());
                
                if (!schedules.isEmpty()) {
                    // Get cost from first schedule
                    String appointmentCost = String.format("%,d đ", schedules.get(0).getAppointmentCost().intValue());
                    
                    contextBuilder.append(String.format("   Giá khám: %s\n", appointmentCost));
                    
                    // Group schedules by weekday for better readability
                    Map<Short, List<DoctorScheduleRule>> schedulesByDay = schedules.stream()
                            .collect(Collectors.groupingBy(DoctorScheduleRule::getWeekday));
                    
                    contextBuilder.append("   Lịch rãnh:\n");
                    String[] daysOfWeek = {"", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
                    
                    for (int i = 2; i <= 7; i++) { // 2=Monday to 7=Sunday in backend, skip 1=Monday
                        List<DoctorScheduleRule> daySchedules = schedulesByDay.get((short) i);
                        if (daySchedules != null && !daySchedules.isEmpty()) {
                            String dayName = daysOfWeek[i];
                            StringBuilder timeSlots = new StringBuilder();
                            for (DoctorScheduleRule rule : daySchedules) {
                                if (timeSlots.length() > 0) timeSlots.append(", ");
                                timeSlots.append(String.format("%s-%s", 
                                        rule.getStartTime().toString(), 
                                        rule.getEndTime().toString()));
                            }
                            contextBuilder.append(String.format("      %s: %s\n", dayName, timeSlots.toString()));
                        }
                    }
                    // Handle Sunday separately (weekday 7)
                    List<DoctorScheduleRule> sundaySchedules = schedulesByDay.get((short) 7);
                    if (sundaySchedules != null && !sundaySchedules.isEmpty()) {
                        StringBuilder timeSlots = new StringBuilder();
                        for (DoctorScheduleRule rule : sundaySchedules) {
                            if (timeSlots.length() > 0) timeSlots.append(", ");
                            timeSlots.append(String.format("%s-%s", 
                                    rule.getStartTime().toString(), 
                                    rule.getEndTime().toString()));
                        }
                        contextBuilder.append(String.format("      Chủ nhật: %s\n", timeSlots.toString()));
                    }
                } else {
                    contextBuilder.append("   Giá khám: 150.000đ (giá mặc định)\n");
                    contextBuilder.append("   Lịch rãnh: Chưa cập nhật\n");
                }
                
                contextBuilder.append("\n");
            }
        } else {
            contextBuilder.append("Hiện chưa có thông tin bác sĩ trong hệ thống.\n\n");
        }
        
        // Kết hợp context bác sĩ + câu hỏi của người dùng
        contextBuilder.append("=== CÂU HỎI ===\n");
        contextBuilder.append(userQuery);
        
        String finalPrompt = contextBuilder.toString();
        
        int maxRetries = 2;
        for (int i = 0; i <= maxRetries; i++) {
            try {
                return callGenerativeLanguage(finalPrompt);
            } catch (IllegalStateException e) {
                // Nếu gặp lỗi 429 và chưa quá số lần thử lại
                if (e.getMessage().contains("429") && i < maxRetries) {
                    // Chờ 2 giây rồi thử lại (thời gian chờ có thể điều chỉnh)
                    Thread.sleep(2000);
                    continue;
                }
                throw e;
            }
        }
        return "Hệ thống đang bận, vui lòng thử lại sau vài giây.";
    }

    private String callGenerativeLanguage(String prompt) throws Exception {
        // Đảm bảo URL dùng v1beta và nối đúng cấu trúc models/
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key="
                + apiKey;

        // Body JSON chuẩn cho các dòng Gemini 2.x và 3.x
        String jsonBody = String.format(
                "{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}",
                escapeJson(prompt));

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        String respBody = resp.body() != null ? resp.body() : "";

        if (resp.statusCode() == 200) {
            return extractResponseText(respBody);
        }

        // In lỗi chi tiết nếu vẫn thất bại
        throw new IllegalStateException(
                "Lỗi Gemini " + resp.statusCode() + " - URL: " + url + " - Chi tiết: " + respBody);
    }

    private String extractResponseText(String jsonResponse) {
        try {
            String searchStr = "\"text\": \"";
            int textIndex = jsonResponse.indexOf(searchStr);
            if (textIndex == -1)
                return "AI không trả về văn bản.";

            int start = textIndex + searchStr.length();
            int end = jsonResponse.indexOf("\"", start);

            if (start > 0 && end > start) {
                return jsonResponse.substring(start, end)
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
            }
            return "Lỗi parse JSON.";
        } catch (Exception e) {
            return "Lỗi: " + e.getMessage();
        }
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}