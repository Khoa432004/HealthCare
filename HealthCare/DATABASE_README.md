# Database Setup Guide

## Files Overview

### 🗃️ **database_reset.sql**
- **Purpose**: Completely recreate database structure from scratch
- **Usage**: When you need to reset everything and start fresh
- **What it does**: 
  - Drops all existing tables
  - Creates new tables with updated schema
  - Includes all new fields (address details, professional info)
  - Creates indexes for performance

### 📊 **database_setup.sql** 
- **Purpose**: Full setup with comprehensive sample data
- **Usage**: For development and demo purposes
- **What it includes**:
  - Complete database structure
  - 4 roles (ADMIN, DOCTOR, PATIENT, OTHER)
  - 7 sample accounts with varied data
  - Professional information for doctors
  - Detailed addresses for all users
  - Collection data (specialties, languages, conditions)

### ⚡ **database_minimal_setup.sql**
- **Purpose**: Quick setup with minimal test data
- **Usage**: For basic testing and quick development
- **What it includes**:
  - Essential roles
  - 2 basic accounts (admin + doctor)
  - Minimal user data
  - No professional collections

## How to Use

### Option 1: Complete Fresh Start
```sql
-- Run this to completely reset and setup
\i database_reset.sql
\i database_setup.sql
```

### Option 2: Quick Development Setup
```sql
-- Run this for minimal but functional setup
\i database_reset.sql
\i database_minimal_setup.sql
```

### Option 3: Update Existing Database
```sql
-- If you just want sample data on existing structure
\i database_setup.sql
```

## Sample Login Credentials

### After running database_setup.sql:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| ADMIN | admin | Admin@123 | admin@healthcare.com |
| DOCTOR | doctor1 | Doctor@123 | doctor1@healthcare.com |
| DOCTOR | doctor2 | Doctor@456 | doctor2@healthcare.com |
| PATIENT | patient1 | Patient@123 | patient1@email.com |
| PATIENT | patient2 | Patient@456 | patient2@email.com |
| NURSE | nurse1 | Nurse@123 | nurse1@healthcare.com |
| RECEPTIONIST | receptionist1 | Reception@123 | reception1@healthcare.com |

### After running database_minimal_setup.sql:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| ADMIN | admin | admin123 | admin@test.com |
| DOCTOR | doctor_test | doctor123 | doctor@test.com |

## Database Schema Changes

### ✅ New Fields in `users` table:
- `country` - Country
- `state_province` - State/Province  
- `city` - City/District
- `zip_code` - Postal code
- `address_line_1` - Detailed address line 1
- `address_line_2` - Detailed address line 2

### ✅ New Fields in `accounts` table:
- `title` - Professional title
- `current_province` - Current working province
- `clinic_hospital` - Workplace
- `care_for_adults` - Can treat adults
- `care_for_children` - Can treat children
- `practicing_certification_id` - License ID
- `work_from_year` - Work experience start
- `work_to_year` - Work experience end
- `work_clinic_hospital` - Previous workplace
- `work_location` - Work location
- `educational_institution` - School/University
- `graduation_year` - Graduation year
- `specialty_education` - Field of study

### ✅ New Collection Tables:
- `account_specialties` - Doctor specialties
- `account_treatment_conditions` - Treatable conditions
- `account_languages` - Spoken languages
- `account_work_specialties` - Work experience specialties

## Testing the New APIs

After setup, you can test the 2-step registration:

### Step 1: Personal Info
```bash
curl -X POST http://localhost:8080/api/auth/register/personal-info \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Doctor",
    "phone": "0999888777",
    "identityCard": "999888777666",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": "Test Address",
    "country": "Vietnam",
    "state": "Ho Chi Minh City",
    "city": "District 1",
    "zipCode": "700000",
    "addressLine1": "123 Test Street",
    "addressLine2": "Test Building"
  }'
```

### Step 2: Professional Info
```bash
curl -X POST http://localhost:8080/api/auth/register/professional-info \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "username": "test_doctor",
    "email": "test@doctor.com",
    "password": "password123",
    "title": "DOCTOR",
    "currentProvince": "Ho Chi Minh City",
    "clinicHospital": "Test Hospital",
    "careForAdults": true,
    "careForChildren": false,
    "specialties": ["CARDIOLOGY"],
    "treatmentConditions": ["HYPERTENSION"],
    "languages": ["VIETNAMESE", "ENGLISH"],
    "department": "Cardiology"
  }'
```

## Troubleshooting

### If you get foreign key errors:
- Make sure to run the scripts in order
- Check that all referenced IDs exist

### If you get sequence errors:
- The reset script should handle this
- Manually reset: `ALTER SEQUENCE table_id_seq RESTART WITH 1;`

### If you need to check data:
```sql
-- Check sample data
SELECT * FROM roles;
SELECT username, email, title FROM accounts;
SELECT full_name, phone, department FROM users;
```
