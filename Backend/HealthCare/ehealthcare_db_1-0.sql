CREATE TYPE "user_role" AS ENUM (
	'patient',
	'doctor',
	'admin'
);

CREATE TYPE "account_status" AS ENUM (
	'pending',
	'active',
	'inactive'
);

CREATE TYPE "gender" AS ENUM (
	'male',
	'female'
);

CREATE TYPE "otp_purpose" AS ENUM (
	'password_reset',
	'login_mfa',
	'email_verify'
);

CREATE TYPE "request_status" AS ENUM (
	'pending',
	'approved',
	'rejected'
);

CREATE TYPE "appointment_status" AS ENUM (
	'scheduled',
	'canceled',
	'completed',
	'in_process'
);

CREATE TYPE "payment_status" AS ENUM (
	'pending',
	'paid',
	'failed',
	'refunded'
);

CREATE TYPE "report_status" AS ENUM (
	'draft',
	'completed'
);

CREATE TABLE IF NOT EXISTS "appointment" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"patient_id" UUID NOT NULL,
	"doctor_id" UUID NOT NULL,
	"status" APPOINTMENT_STATUS NOT NULL DEFAULT 'scheduled',
	"scheduled_start" TIMESTAMPTZ NOT NULL,
	"scheduled_end" TIMESTAMPTZ NOT NULL,
	"reason" TEXT,
	"symptoms_ons" TEXT,
	"symptoms_sever" TEXT,
	"current_medication" TEXT,
	"notes" TEXT,
	"consent" BOOLEAN NOT NULL DEFAULT FALSE,
	"rescheduled_from_id" UUID,
	"canceled_at" TIMESTAMPTZ,
	"cancellation_reason" TEXT,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"created_by" UUID,
	"updated_by" UUID,
	"holding_until" TIMESTAMPTZ,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "user_account" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"role" USER_ROLE NOT NULL,
	"status" ACCOUNT_STATUS NOT NULL DEFAULT 'pending',
	"full_name" TEXT NOT NULL,
	"gender" GENDER NOT NULL,
	"date_of_birth" DATE NOT NULL,
	"email" TEXT NOT NULL UNIQUE,
	"phone_number" TEXT NOT NULL UNIQUE,
	"password_hash" TEXT,
	"first_login_required" BOOLEAN NOT NULL DEFAULT FALSE,
	"term_accepted_at" TIMESTAMPTZ,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"created_by" UUID,
	"updated_by" UUID,
	"is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
	"deleted_at" TIMESTAMPTZ,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "patient_profile" (
	"user_id" UUID NOT NULL UNIQUE,
	"address" TEXT,
	PRIMARY KEY("user_id")
);




CREATE TABLE IF NOT EXISTS "doctor_profile" (
	"user_id" UUID NOT NULL UNIQUE,
	"cccd_number" TEXT NOT NULL,
	"title" TEXT NOT NULL,
	"workplace_name" TEXT NOT NULL,
	"facility_name" TEXT NOT NULL,
	"clinic_address" TEXT NOT NULL,
	"care_target" TEXT ARRAY NOT NULL,
	"specialties" TEXT ARRAY NOT NULL,
	"diseases_treated" TEXT ARRAY NOT NULL,
	"practice_license_no" TEXT NOT NULL,
	"education_summary" TEXT NOT NULL,
	"training_institution" TEXT NOT NULL,
	"graduation_year" INTEGER NOT NULL,
	"major" TEXT NOT NULL,
	"address" TEXT NOT NULL,
	"province" TEXT,
	"consultation_fee" NUMERIC,
	PRIMARY KEY("user_id", "practice_license_no")
);




CREATE TABLE IF NOT EXISTS "doctor_experience" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"doctor_id" UUID NOT NULL,
	"from_date" DATE NOT NULL,
	"to_date" DATE NOT NULL,
	"organization" TEXT NOT NULL,
	"location" TEXT NOT NULL,
	"specialty" TEXT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "approval_request" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"user_id" UUID NOT NULL,
	"type" TEXT NOT NULL CHECK("type" = 'doctor_onboarding'),
	"status" REQUEST_STATUS NOT NULL DEFAULT 'pending',
	"submitted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"reviewed_at" TIMESTAMPTZ,
	"reviewed_by" UUID,
	"note" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "otp_token" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"user_id" UUID NOT NULL,
	"purpose" OTP_PURPOSE NOT NULL DEFAULT 'password_reset',
	"code" TEXT NOT NULL,
	"expires_at" TIMESTAMPTZ NOT NULL,
	"attempt_count" INTEGER NOT NULL DEFAULT 0,
	"max_attempts" INTEGER NOT NULL DEFAULT 5,
	"consumed_at" TIMESTAMPTZ,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "appointment_status_history" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"appointment_id" UUID NOT NULL,
	"old_status" APPOINTMENT_STATUS NOT NULL,
	"new_status" APPOINTMENT_STATUS NOT NULL,
	"changed_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"changed_by" UUID NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "payment" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"appointment_id" UUID NOT NULL UNIQUE,
	"amount" NUMERIC NOT NULL,
	"discount" NUMERIC DEFAULT 0,
	"tax" NUMERIC DEFAULT 0.08,
	"total_amount" NUMERIC NOT NULL,
	"method" TEXT NOT NULL CHECK("method" IN ('vnpay','cash','insurance')),
	"status" PAYMENT_STATUS NOT NULL DEFAULT 'pending',
	"payment_time" TIMESTAMPTZ,
	"refunded_at" TIMESTAMPTZ,
	"refund_reason" TEXT,
	"created_at" TIMESTAMPTZ DEFAULT now(),
	"updated_at" TIMESTAMPTZ DEFAULT now(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "medical_report" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"appointment_id" UUID NOT NULL UNIQUE,
	"doctor_id" UUID NOT NULL,
	"status" REPORT_STATUS NOT NULL DEFAULT 'draft',
	"clinic" TEXT,
	"province" TEXT,
	"chronic_conditions" TEXT ARRAY,
	"illness" TEXT,
	"medical_exam" TEXT,
	"icd_code" TEXT,
	"diagnosis" TEXT,
	"coverage" TEXT,
	"recommendation" TEXT,
	"note" TEXT,
	"follow_up_date" DATE,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"update_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"completed_at" TIMESTAMPTZ,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "medical_report_vital_sign" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"medical_report_id" UUID NOT NULL,
	"sign_type" TEXT NOT NULL,
	"value" TEXT NOT NULL,
	"unit" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "medical_report_medication" (
	"id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	"medical_report_id" UUID NOT NULL,
	"medication_name" TEXT NOT NULL,
	"dosage" TEXT NOT NULL,
	"medication_type" TEXT NOT NULL,
	"meal_relation" TEXT NOT NULL CHECK("meal_relation" IN ('before','after','with')),
	"duration_days" INTEGER,
	"start_date" DATE,
	"note" TEXT,
	PRIMARY KEY("id")
);



ALTER TABLE "appointment"
ADD FOREIGN KEY("doctor_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "appointment"
ADD FOREIGN KEY("patient_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "doctor_experience"
ADD FOREIGN KEY("doctor_id") REFERENCES "doctor_profile"("user_id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "patient_profile"
ADD FOREIGN KEY("user_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "doctor_profile"
ADD FOREIGN KEY("user_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "otp_token"
ADD FOREIGN KEY("user_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "approval_request"
ADD FOREIGN KEY("user_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "approval_request"
ADD FOREIGN KEY("reviewed_by") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "appointment"
ADD FOREIGN KEY("created_by") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "appointment"
ADD FOREIGN KEY("rescheduled_from_id") REFERENCES "appointment"("id")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "appointment"
ADD FOREIGN KEY("updated_by") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "appointment_status_history"
ADD FOREIGN KEY("appointment_id") REFERENCES "appointment"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "appointment_status_history"
ADD FOREIGN KEY("changed_by") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "payment"
ADD FOREIGN KEY("appointment_id") REFERENCES "appointment"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "medical_report"
ADD FOREIGN KEY("appointment_id") REFERENCES "appointment"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "medical_report"
ADD FOREIGN KEY("doctor_id") REFERENCES "user_account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "medical_report_vital_sign"
ADD FOREIGN KEY("medical_report_id") REFERENCES "medical_report"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "medical_report_medication"
ADD FOREIGN KEY("medical_report_id") REFERENCES "medical_report"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;