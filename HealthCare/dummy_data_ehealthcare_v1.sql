
--
-- Dummy data for eHealthCare database version 1
-- Generated on 2025-10-13T06:32:03.864072

-- Insert users (patients, doctors, admin)
INSERT INTO user_account (role, status, full_name, gender, date_of_birth, email, phone_number, password_hash, first_login_required, term_accepted_at)
VALUES
    ('patient','active','Nguyễn Văn An','male','1990-04-15','an.nguyen@example.com','0909123456','hashed_password',FALSE,now()),
    ('patient','active','Lê Thị Mai','female','1995-12-30','mai.le@example.com','0909333444','hashed_password',FALSE,now()),
    ('doctor','active','Trần Thị Bình','female','1985-05-20','dr.binh@example.com','0909555444',NULL,FALSE,now()),
    ('doctor','active','Nguyễn Thanh Long','male','1978-09-02','dr.long@example.com','0909777888',NULL,FALSE,now()),
    ('admin','active','Admin Nguyễn','male','1980-01-01','admin@example.com','0909000000','hashed_password',FALSE,now());

-- Insert patient profiles
INSERT INTO patient_profile (user_id, address)
VALUES
    ((SELECT id FROM user_account WHERE email='an.nguyen@example.com'), '123 Lê Lợi, Quận 1, TP.HCM'),
    ((SELECT id FROM user_account WHERE email='mai.le@example.com'), '45 Nguyễn Huệ, Quận 1, TP.HCM');

-- Insert doctor profiles
INSERT INTO doctor_profile (
    user_id, cccd_number, title, workplace_name, facility_name, clinic_address,
    care_target, specialties, diseases_treated, practice_license_no,
    education_summary, training_institution, graduation_year, major, address,
    province, consultation_fee
)
VALUES
    (
      (SELECT id FROM user_account WHERE email='dr.binh@example.com'),
      '011234567890', 'Bác sĩ CKI', 'Bệnh viện Nhân dân 115', 'Khoa Tim mạch',
      '527 Sư Vạn Hạnh, Quận 10, TP.HCM',
      ARRAY['Người lớn','Người cao tuổi'],
      ARRAY['Tim mạch','Huyết áp'],
      ARRAY['Tăng huyết áp','Rối loạn nhịp tim'],
      'PL-00123',
      'ĐH Y Dược TP.HCM - Chuyên khoa Tim mạch',
      'ĐH Y Dược TP.HCM',
      2010,
      'Tim mạch',
      '123 Lê Văn Sỹ, Quận 3, TP.HCM',
      'Ho Chi Minh',
      600000
    ),
    (
      (SELECT id FROM user_account WHERE email='dr.long@example.com'),
      '022345678901', 'Bác sĩ CKII', 'Bệnh viện Chợ Rẫy', 'Khoa Tiêu hóa',
      '201B Nguyễn Chí Thanh, Quận 5, TP.HCM',
      ARRAY['Người lớn','Trẻ em'],
      ARRAY['Tiêu hóa','Nội soi'],
      ARRAY['Đau dạ dày','Viêm gan'],
      'PL-00234',
      'ĐH Y Hà Nội - Chuyên khoa Tiêu hóa',
      'ĐH Y Hà Nội',
      2005,
      'Tiêu hóa',
      '45 Ngô Tất Tố, Bình Thạnh, TP.HCM',
      'Ho Chi Minh',
      700000
    );

-- Insert doctor experiences
INSERT INTO doctor_experience (doctor_id, from_date, to_date, organization, location, specialty)
VALUES
    ((SELECT user_id FROM doctor_profile WHERE user_id=(SELECT id FROM user_account WHERE email='dr.binh@example.com')), '2011-01-01', '2015-12-31', 'Bệnh viện Tim Tâm Đức', 'TP.HCM', 'Tim mạch'),
    ((SELECT user_id FROM doctor_profile WHERE user_id=(SELECT id FROM user_account WHERE email='dr.binh@example.com')), '2016-01-01', '2024-12-31', 'Bệnh viện Nhân dân 115', 'TP.HCM', 'Tim mạch'),
    ((SELECT user_id FROM doctor_profile WHERE user_id=(SELECT id FROM user_account WHERE email='dr.long@example.com')), '2005-01-01', '2015-12-31', 'Bệnh viện Bạch Mai', 'Hà Nội', 'Tiêu hóa'),
    ((SELECT user_id FROM doctor_profile WHERE user_id=(SELECT id FROM user_account WHERE email='dr.long@example.com')), '2016-01-01', '2025-12-31', 'Bệnh viện Chợ Rẫy', 'TP.HCM', 'Tiêu hóa');

-- Insert approval requests for doctors
INSERT INTO approval_request (user_id, type, status, submitted_at, reviewed_at, reviewed_by, note)
VALUES
    ((SELECT id FROM user_account WHERE email='dr.binh@example.com'), 'doctor_onboarding', 'approved', now() - INTERVAL '40 days', now() - INTERVAL '30 days', (SELECT id FROM user_account WHERE email='admin@example.com'), 'Hồ sơ đạt yêu cầu'),
    ((SELECT id FROM user_account WHERE email='dr.long@example.com'), 'doctor_onboarding', 'approved', now() - INTERVAL '20 days', now() - INTERVAL '10 days', (SELECT id FROM user_account WHERE email='admin@example.com'), 'Đủ tiêu chuẩn hành nghề');

-- Insert OTP tokens
INSERT INTO otp_token (user_id, purpose, code, expires_at, attempt_count, max_attempts, created_at)
VALUES
    ((SELECT id FROM user_account WHERE email='an.nguyen@example.com'), 'password_reset', '654321', now() + INTERVAL '5 minutes', 0, 5, now()),
    ((SELECT id FROM user_account WHERE email='dr.binh@example.com'), 'login_mfa', '987654', now() + INTERVAL '2 minutes', 0, 5, now());

-- Insert appointments
INSERT INTO appointment (
    patient_id, doctor_id, status, scheduled_start, scheduled_end, reason,
    symptoms_ons, symptoms_sever, current_medication, notes, consent,
    rescheduled_from_id, canceled_at, cancellation_reason, created_at, updated_at,
    created_by, updated_by, holding_until
)
VALUES
    -- Appointment A: scheduled, future
    (
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      (SELECT id FROM user_account WHERE email='dr.binh@example.com'),
      'scheduled', '2025-10-15 09:00:00+07', '2025-10-15 09:30:00+07',
      'Khám tim mạch định kỳ', '2025-10-14 08:00:00+07', 'mild', 'Không',
      'Bệnh nhân hơi mệt', TRUE, NULL, NULL, NULL, '2025-10-01 10:00:00+07', '2025-10-01 10:00:00+07',
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      '2025-10-14 12:00:00+07'
    ),
    -- Appointment B: completed
    (
      (SELECT id FROM user_account WHERE email='mai.le@example.com'),
      (SELECT id FROM user_account WHERE email='dr.long@example.com'),
      'completed', '2025-10-10 10:00:00+07', '2025-10-10 10:45:00+07',
      'Đau dạ dày kéo dài', '2025-10-07 12:00:00+07', 'moderate', 'Omeprazole',
      'Đau nhiều buổi tối', TRUE, NULL, NULL, NULL, '2025-10-01 09:00:00+07', '2025-10-10 11:00:00+07',
      (SELECT id FROM user_account WHERE email='mai.le@example.com'),
      (SELECT id FROM user_account WHERE email='dr.long@example.com'),
      NULL
    ),
    -- Appointment C: canceled
    (
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      (SELECT id FROM user_account WHERE email='dr.long@example.com'),
      'canceled', '2025-10-20 14:00:00+07', '2025-10-20 14:30:00+07',
      'Khám tiêu hóa', '2025-10-15 09:00:00+07', 'mild', 'Không',
      'Bệnh nhân đổi lịch', TRUE, NULL, '2025-10-18 12:00:00+07', 'Có việc bận', '2025-10-01 11:00:00+07', '2025-10-18 12:00:00+07',
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      (SELECT id FROM user_account WHERE email='an.nguyen@example.com'),
      NULL
    ),
    -- Appointment D: in_process
    (
      (SELECT id FROM user_account WHERE email='mai.le@example.com'),
      (SELECT id FROM user_account WHERE email='dr.binh@example.com'),
      'in_process', '2025-10-13 16:00:00+07', '2025-10-13 16:30:00+07',
      'Kiểm tra huyết áp', '2025-10-13 08:00:00+07', 'mild', 'Không',
      'Theo dõi huyết áp định kỳ', TRUE, NULL, NULL, NULL, '2025-10-01 12:00:00+07', '2025-10-13 16:05:00+07',
      (SELECT id FROM user_account WHERE email='mai.le@example.com'),
      (SELECT id FROM user_account WHERE email='dr.binh@example.com'),
      '2025-10-13 15:30:00+07'
    );

-- Insert appointment status history
INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_at, changed_by)
VALUES
    -- History for Appointment A: scheduled -> in_process -> completed
    ((SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ'), 'scheduled', 'in_process', '2025-10-15 09:05:00+07', (SELECT id FROM user_account WHERE email='dr.binh@example.com')),
    ((SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ'), 'in_process', 'completed', '2025-10-15 09:40:00+07', (SELECT id FROM user_account WHERE email='dr.binh@example.com')),
    -- History for Appointment B: scheduled -> completed
    ((SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài'), 'scheduled', 'completed', '2025-10-10 10:45:00+07', (SELECT id FROM user_account WHERE email='dr.long@example.com')),
    -- History for Appointment C: scheduled -> canceled
    ((SELECT id FROM appointment WHERE reason='Khám tiêu hóa'), 'scheduled', 'canceled', '2025-10-18 12:00:00+07', (SELECT id FROM user_account WHERE email='an.nguyen@example.com')),
    -- History for Appointment D: scheduled -> in_process
    ((SELECT id FROM appointment WHERE reason='Kiểm tra huyết áp'), 'scheduled', 'in_process', '2025-10-13 16:00:00+07', (SELECT id FROM user_account WHERE email='dr.binh@example.com'));

-- Insert payments
INSERT INTO payment (appointment_id, amount, discount, tax, total_amount, method, status, payment_time, refunded_at, refund_reason)
VALUES
    ((SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ'), 600000, 0, 0.05, 630000, 'vnpay','paid','2025-10-14 12:30:00+07', NULL, NULL),
    ((SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài'), 700000, 0, 0.05, 735000, 'vnpay','paid','2025-10-09 15:00:00+07', NULL, NULL),
    ((SELECT id FROM appointment WHERE reason='Khám tiêu hóa'), 700000, 0, 0.05, 735000, 'vnpay','refunded','2025-10-18 10:00:00+07','2025-10-18 12:00:00+07','Hủy lịch trước 8 giờ'),
    ((SELECT id FROM appointment WHERE reason='Kiểm tra huyết áp'), 600000, 0, 0.05, 630000, 'vnpay','pending',NULL, NULL, NULL);

-- Insert medical reports
INSERT INTO medical_report (
    appointment_id, doctor_id, status, clinic, province,
    chronic_conditions, illness, medical_exam, icd_code, diagnosis,
    coverage, recommendation, note, follow_up_date, created_at, update_at, completed_at
)
VALUES
    -- Report for Appointment A
    (
      (SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ'),
      (SELECT id FROM user_account WHERE email='dr.binh@example.com'),
      'completed', 'Bệnh viện Nhân dân 115', 'Ho Chi Minh',
      ARRAY['Tăng huyết áp'], 'Tim đập nhanh', 'Đo huyết áp, điện tâm đồ', 'I10', 'Tăng huyết áp',
      'Bảo hiểm y tế', 'Uống thuốc theo đơn và tái khám sau 1 tháng', 'Chú ý đo huyết áp hằng ngày',
      '2025-11-15', '2025-10-15 09:45:00+07', '2025-10-15 09:50:00+07', '2025-10-15 09:50:00+07'
    ),
    -- Report for Appointment B
    (
      (SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài'),
      (SELECT id FROM user_account WHERE email='dr.long@example.com'),
      'completed', 'Bệnh viện Chợ Rẫy', 'Ho Chi Minh',
      ARRAY['Viêm dạ dày'], 'Đau dạ dày kéo dài', 'Nội soi dạ dày', 'K29.70', 'Viêm dạ dày mạn tính',
      'Bảo hiểm y tế', 'Ăn uống điều độ, tránh bia rượu, tái khám sau 1 tháng', 'Cần tuân thủ liệu trình điều trị',
      '2025-11-10', '2025-10-10 10:45:00+07', '2025-10-10 10:50:00+07', '2025-10-10 10:50:00+07'
    );

-- Insert vital signs for reports
INSERT INTO medical_report_vital_sign (medical_report_id, sign_type, value, unit)
VALUES
    -- For Report 1 (Appointment A)
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ')), 'blood_pressure', '135/85', 'mmHg'),
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ')), 'heart_rate', '90', 'bpm'),
    -- For Report 2 (Appointment B)
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài')), 'temperature', '37.2', '°C');

-- Insert medications for reports
INSERT INTO medical_report_medication (
    medical_report_id, medication_name, dosage, medication_type, meal_relation, duration_days, start_date, note
)
VALUES
    -- Medications for Report 1 (Appointment A)
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Khám tim mạch định kỳ')), 'Amlodipine', '5mg', 'tablet', 'after', 30, '2025-10-15', 'Uống 1 viên sau bữa sáng mỗi ngày'),
    -- Medications for Report 2 (Appointment B)
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài')), 'Omeprazole', '20mg', 'capsule', 'before', 14, '2025-10-10', 'Uống 1 viên trước bữa sáng'),
    ((SELECT id FROM medical_report WHERE appointment_id=(SELECT id FROM appointment WHERE reason='Đau dạ dày kéo dài')), 'Sucralfate', '1g', 'suspension', 'after', 14, '2025-10-10', 'Uống sau bữa ăn trưa và tối');

