-- Healthcare Database Setup Script
-- Updated to match new User and Account models

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clear existing data (if any) - Order matters due to foreign keys
DELETE FROM account_work_specialties WHERE account_id > 0;
DELETE FROM account_specialties WHERE account_id > 0;
DELETE FROM account_treatment_conditions WHERE account_id > 0;
DELETE FROM account_languages WHERE account_id > 0;
DELETE FROM users WHERE id > 0;
DELETE FROM accounts WHERE id > 0;
DELETE FROM role_privileges WHERE role_id > 0;
DELETE FROM roles WHERE id > 0;

-- Reset sequences
ALTER SEQUENCE roles_id_seq RESTART WITH 1;
ALTER SEQUENCE accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Insert Roles
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'System Administrator with full access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'DOCTOR', 'Medical doctor with patient management access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'PATIENT', 'Patient with limited access to own records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'OTHER', 'Other staff members', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Role Privileges
INSERT INTO role_privileges (role_id, privilege) VALUES
-- Admin privileges (all)
(1, 'VIEW_USER'), (1, 'CREATE_USER'), (1, 'MODIFY_USER'), (1, 'DELETE_USER'), (1, 'LOCK_UNLOCK_USER'),
(1, 'VIEW_ROLE'), (1, 'CREATE_ROLE'), (1, 'UPDATE_ROLE'), (1, 'DELETE_ROLE'),
-- Doctor privileges
(2, 'VIEW_USER'), (2, 'CREATE_USER'), (2, 'MODIFY_USER'),
(2, 'VIEW_ROLE'),
-- Patient privileges (limited)
(3, 'VIEW_USER'),
-- Other staff privileges
(4, 'VIEW_USER'), (4, 'VIEW_ROLE');

-- Insert Accounts (with BCrypt hashed passwords and professional information)
INSERT INTO accounts (
    id, username, password, email, role_id, is_deleted,
    -- Professional information fields
    title, current_province, clinic_hospital, care_for_adults, care_for_children,
    practicing_certification_id, work_from_year, work_to_year, work_clinic_hospital, work_location,
    educational_institution, graduation_year, specialty_education,
    created_at, updated_at
) VALUES
-- Admin Account (minimal professional info)
(1, 'admin', crypt('Admin@123', gen_salt('bf')), 'admin@healthcare.com', 1, false,
 'ADMIN', 'Ho Chi Minh City', 'Healthcare System', false, false,
 null, null, null, null, null,
 'Healthcare Management Institute', 2010, 'Healthcare Administration',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Doctor Accounts (full professional info)
(2, 'doctor1', crypt('Doctor@123', gen_salt('bf')), 'doctor1@healthcare.com', 2, false,
 'DOCTOR', 'Ho Chi Minh City', 'Cho Ray Hospital', true, false,
 'CERT-VN-2015-001', 2015, null, 'Cho Ray Hospital', 'Ho Chi Minh City',
 'University of Medicine and Pharmacy at Ho Chi Minh City', 2012, 'Cardiology',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 'doctor2', crypt('Doctor@456', gen_salt('bf')), 'doctor2@healthcare.com', 2, false,
 'DOCTOR', 'Hanoi', 'Bach Mai Hospital', true, true,
 'CERT-VN-2018-002', 2018, null, 'Bach Mai Hospital', 'Hanoi',
 'Hanoi Medical University', 2015, 'Neurology',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Patient Accounts (no professional info needed)
(4, 'patient1', crypt('Patient@123', gen_salt('bf')), 'patient1@email.com', 3, false,
 null, null, null, null, null,
 null, null, null, null, null,
 null, null, null,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, 'patient2', crypt('Patient@456', gen_salt('bf')), 'patient2@email.com', 3, false,
 null, null, null, null, null,
 null, null, null, null, null,
 null, null, null,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Other Staff Accounts
(6, 'nurse1', crypt('Nurse@123', gen_salt('bf')), 'nurse1@healthcare.com', 4, false,
 'NURSE', 'Ho Chi Minh City', 'District 1 Medical Center', true, true,
 'NURSE-CERT-2020-001', 2020, null, 'District 1 Medical Center', 'Ho Chi Minh City',
 'Ho Chi Minh City Nursing School', 2018, 'General Nursing',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(7, 'receptionist1', crypt('Reception@123', gen_salt('bf')), 'reception1@healthcare.com', 4, false,
 'RECEPTIONIST', 'Ho Chi Minh City', 'District 1 Medical Center', false, false,
 null, 2022, null, 'District 1 Medical Center', 'Ho Chi Minh City',
 'Ho Chi Minh City University', 2021, 'Business Administration',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Users (linked to accounts with detailed address information)
INSERT INTO users (
    id, full_name, phone, identity_card, date_of_birth, gender, 
    address, country, state_province, city, zip_code, address_line_1, address_line_2,
    department, is_deleted, is_locked, account_id, 
    created_at, updated_at
) VALUES
(1, 'Nguyễn Văn Admin', '0123456789', '123456789012', '1980-01-15', 'MALE', 
 '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 1', '700000', '123 Đường Nguyễn Huệ', 'Phường Bến Nghé',
 'IT Department', false, false, 1, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 'Bác sĩ Trần Thị Bình', '0987654321', '987654321098', '1985-05-20', 'FEMALE', 
 '456 Đường Võ Văn Tần, Phường 5, Quận 3, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 3', '700000', '456 Đường Võ Văn Tần', 'Phường 5',
 'Cardiology', false, false, 2, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 'Bác sĩ Lê Văn Cường', '0123456780', '112233445566', '1982-08-10', 'MALE', 
 '789 Đường Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 1', '700000', '789 Đường Nguyễn Thị Minh Khai', 'Phường Đa Kao',
 'Neurology', false, false, 3, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(4, 'Bệnh nhân Phạm Thị Dung', '0123456781', '223344556677', '1990-12-25', 'FEMALE', 
 '321 Đường Thảo Điền, Phường Thảo Điền, Quận 2, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 2', '700000', '321 Đường Thảo Điền', 'Phường Thảo Điền',
 'Patient', false, false, 4, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, 'Bệnh nhân Hoàng Văn Em', '0123456782', '334455667788', '1988-03-30', 'MALE', 
 '654 Đường Nguyễn Trãi, Phường 8, Quận 5, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 5', '700000', '654 Đường Nguyễn Trãi', 'Phường 8',
 'Patient', false, false, 5, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(6, 'Y tá Nguyễn Thị Phương', '0123456783', '445566778899', '1992-07-12', 'FEMALE', 
 '987 Đường 3 Tháng 2, Phường 12, Quận 10, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 10', '700000', '987 Đường 3 Tháng 2', 'Phường 12',
 'Nursing', false, false, 6, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(7, 'Lễ tân Võ Văn Giang', '0123456784', '556677889900', '1995-11-08', 'MALE', 
 '147 Đường Nguyễn Tất Thành, Phường 13, Quận 4, TP.HCM, Vietnam 700000', 
 'Vietnam', 'Ho Chi Minh City', 'District 4', '700000', '147 Đường Nguyễn Tất Thành', 'Phường 13',
 'Reception', false, false, 7, 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update user references (created_by_user_id, updated_by_user_id)
UPDATE users SET created_by_user_id = 1, updated_by_user_id = 1 WHERE id > 1;

-- Insert Account Specialties (for doctors)
INSERT INTO account_specialties (account_id, specialty) VALUES
-- Doctor 1 (Cardiology specialist)
(2, 'CARDIOLOGY'),
(2, 'INTERNAL_MEDICINE'),
-- Doctor 2 (Neurology specialist)
(3, 'NEUROLOGY'),
(3, 'GENERAL_MEDICINE'),
-- Nurse (General nursing)
(6, 'GENERAL_NURSING');

-- Insert Account Treatment Conditions (for doctors)
INSERT INTO account_treatment_conditions (account_id, condition_name) VALUES
-- Doctor 1 (Cardiologist)
(2, 'HEART_FAILURE'),
(2, 'HYPERTENSION'),
(2, 'ARRHYTHMIA'),
(2, 'CORONARY_ARTERY_DISEASE'),
-- Doctor 2 (Neurologist)
(3, 'STROKE'),
(3, 'EPILEPSY'),
(3, 'PARKINSONS_DISEASE'),
(3, 'MIGRAINE');

-- Insert Account Languages
INSERT INTO account_languages (account_id, language) VALUES
-- Admin (multilingual)
(1, 'VIETNAMESE'),
(1, 'ENGLISH'),
-- Doctor 1
(2, 'VIETNAMESE'),
(2, 'ENGLISH'),
-- Doctor 2
(3, 'VIETNAMESE'),
(3, 'ENGLISH'),
(3, 'FRENCH'),
-- Nurse
(6, 'VIETNAMESE'),
(6, 'ENGLISH'),
-- Receptionist
(7, 'VIETNAMESE');

-- Insert Account Work Specialties (work experience specialties)
INSERT INTO account_work_specialties (account_id, specialty) VALUES
-- Doctor 1 work experience
(2, 'CARDIOLOGY'),
(2, 'EMERGENCY_MEDICINE'),
-- Doctor 2 work experience
(3, 'NEUROLOGY'),
(3, 'INTERNAL_MEDICINE'),
-- Nurse work experience
(6, 'GENERAL_NURSING'),
(6, 'PEDIATRIC_NURSING');

-- Display inserted data summary
SELECT 'SETUP COMPLETE' as status;
SELECT 'Roles inserted: ' || COUNT(*) as summary FROM roles;
SELECT 'Accounts inserted: ' || COUNT(*) as summary FROM accounts;
SELECT 'Users inserted: ' || COUNT(*) as summary FROM users;
SELECT 'Specialties inserted: ' || COUNT(*) as summary FROM account_specialties;
SELECT 'Languages inserted: ' || COUNT(*) as summary FROM account_languages;
SELECT 'Treatment conditions inserted: ' || COUNT(*) as summary FROM account_treatment_conditions;
SELECT 'Work specialties inserted: ' || COUNT(*) as summary FROM account_work_specialties;
