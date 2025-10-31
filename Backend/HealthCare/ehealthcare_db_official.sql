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
  'refunded',
  'pending_refund'
);

CREATE TYPE "report_status" AS ENUM (
  'draft',
  'completed'
);

CREATE TYPE "notification_type" AS ENUM (
  'admin',
  'system'
);

CREATE TYPE "payroll_status" AS ENUM (
  'settled',
  'unsettled'
);

CREATE TABLE "appointment" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "patient_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "status" appointment_status NOT NULL DEFAULT 'scheduled',
  "scheduled_start" timestamptz NOT NULL,
  "scheduled_end" timestamptz NOT NULL,
  "reason" text,
  "symptoms_ons" text,
  "symptoms_sever" text,
  "current_medication" text,
  "notes" text,
  "consent" boolean NOT NULL DEFAULT false,
  "rescheduled_from_id" uuid,
  "canceled_at" timestamptz,
  "cancellation_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "created_by" uuid,
  "updated_by" uuid,
  "holding_until" timestamptz,
  "title" text,
  "started_at" timestamptz NOT NULL,
  "ended_at" timestamptz NOT NULL,
  "cancellation_by" text NOT NULL
);

CREATE TABLE "user_account" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "role" user_role NOT NULL,
  "status" account_status NOT NULL DEFAULT 'pending',
  "full_name" text NOT NULL,
  "gender" gender NOT NULL,
  "date_of_birth" date NOT NULL,
  "email" text NOT NULL,
  "phone_number" text NOT NULL,
  "password_hash" text,
  "first_login_required" boolean NOT NULL DEFAULT false,
  "term_accepted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "created_by" uuid,
  "updated_by" uuid,
  "is_deleted" boolean NOT NULL DEFAULT false,
  "deleted_at" timestamptz
);

CREATE TABLE "patient_profile" (
  "user_id" uuid UNIQUE PRIMARY KEY NOT NULL,
  "address" text
);

CREATE TABLE "doctor_profile" (
  "user_id" uuid NOT NULL UNIQUE,
  "cccd_number" text NOT NULL,
  "title" text NOT NULL,
  "workplace_name" text NOT NULL,
  "facility_name" text NOT NULL,
  "clinic_address" text NOT NULL,
  "care_target" text NOT NULL,
  "specialties" text NOT NULL,
  "diseases_treated" text NOT NULL,
  "practice_license_no" text NOT NULL UNIQUE,
  "education_summary" text NOT NULL,
  "training_institution" text NOT NULL,
  "graduation_year" integer NOT NULL,
  "major" text NOT NULL,
  "address" text NOT NULL,
  "province" text,
  "consultation_fee" numeric,
  PRIMARY KEY ("user_id")
);

CREATE TABLE "doctor_experience" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "doctor_id" uuid NOT NULL,
  "from_date" date NOT NULL,
  "to_date" date NOT NULL,
  "organization" text NOT NULL,
  "location" text NOT NULL,
  "specialty" text NOT NULL
);

CREATE TABLE "approval_request" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "status" request_status NOT NULL DEFAULT 'pending',
  "submitted_at" timestamptz NOT NULL DEFAULT (now()),
  "reviewed_at" timestamptz,
  "reviewed_by" uuid,
  "note" text
);

CREATE TABLE "otp_token" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "purpose" otp_purpose NOT NULL DEFAULT 'password_reset',
  "code" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "attempt_count" integer NOT NULL,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "consumed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "appointment_status_history" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "appointment_id" uuid NOT NULL,
  "old_status" appointment_status NOT NULL,
  "new_status" appointment_status NOT NULL,
  "changed_at" timestamptz NOT NULL DEFAULT (now()),
  "changed_by" uuid NOT NULL
);

CREATE TABLE "payment" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "appointment_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "discount" numeric,
  "tax" numeric DEFAULT 0.05,
  "total_amount" numeric NOT NULL,
  "method" text NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'pending',
  "payment_time" timestamptz,
  "refunded_at" timestamptz,
  "refund_reason" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "medical_report" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "appointment_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "status" report_status NOT NULL DEFAULT 'draft',
  "clinic" text,
  "province" text,
  "chronic_conditions" text,
  "illness" text,
  "medical_exam" text,
  "icd_code" text,
  "diagnosis" text,
  "coverage" text,
  "recommendation" text,
  "note" text,
  "follow_up_date" date,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "completed_at" timestamptz
);

CREATE TABLE "medical_report_vital_sign" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "medical_report_id" uuid NOT NULL,
  "sign_type" text NOT NULL,
  "value" text NOT NULL,
  "unit" text
);

CREATE TABLE "medical_report_medication" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "medical_report_id" uuid NOT NULL,
  "medication_name" text NOT NULL,
  "dosage" text NOT NULL,
  "medication_type" text NOT NULL,
  "meal_relation" text NOT NULL,
  "duration_days" integer,
  "start_date" date,
  "note" text
);

CREATE TABLE "doctor_schedule_rule" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "doctor_id" uuid NOT NULL,
  "weekday" smallint NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "session_minutes" integer NOT NULL DEFAULT 15,
  "appointment_cost" numeric NOT NULL DEFAULT 150000
);

CREATE TABLE "notification" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "title" text NOT NULL,
  "body" text,
  "created_at" timestamptz DEFAULT (now()),
  "created_by" uuid,
  "type" notification_type NOT NULL,
  "user_receive" uuid,
  "is_read" boolean NOT NULL DEFAULT false
);

CREATE TABLE "doctor_payroll" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "doctor_id" uuid NOT NULL,
  "period_month" integer NOT NULL,
  "period_year" integer NOT NULL,
  "gross_amount" numeric DEFAULT 0,
  "platform_fee" numeric DEFAULT 0,
  "net_amount" numeric DEFAULT 0,
  "status" payroll_status NOT NULL DEFAULT 'unsettled',
  "settled_at" timestamptz
);

-- 1) appointment.doctor_id -> user_account.id
ALTER TABLE "appointment"
  ADD CONSTRAINT "fk_appointment_doctor_id_user_account"
  FOREIGN KEY ("doctor_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 2) appointment.patient_id -> user_account.id
ALTER TABLE "appointment"
  ADD CONSTRAINT "fk_appointment_patient_id_user_account"
  FOREIGN KEY ("patient_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 3) doctor_experience.doctor_id -> doctor_profile.user_id
ALTER TABLE "doctor_experience"
  ADD CONSTRAINT "fk_doctor_experience_doctor_id_doctor_profile"
  FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile" ("user_id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 4) patient_profile.user_id -> user_account.id
ALTER TABLE "patient_profile"
  ADD CONSTRAINT "fk_patient_profile_user_id_user_account"
  FOREIGN KEY ("user_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 5) doctor_profile.user_id -> user_account.id
ALTER TABLE "doctor_profile"
  ADD CONSTRAINT "fk_doctor_profile_user_id_user_account"
  FOREIGN KEY ("user_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 6) otp_token.user_id -> user_account.id
ALTER TABLE "otp_token"
  ADD CONSTRAINT "fk_otp_token_user_id_user_account"
  FOREIGN KEY ("user_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 7) approval_request.user_id -> user_account.id
ALTER TABLE "approval_request"
  ADD CONSTRAINT "fk_approval_request_user_id_user_account"
  FOREIGN KEY ("user_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 8) approval_request.reviewed_by -> user_account.id
ALTER TABLE "approval_request"
  ADD CONSTRAINT "fk_approval_request_reviewed_by_user_account"
  FOREIGN KEY ("reviewed_by") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE SET NULL;

-- 9) appointment.created_by -> user_account.id
ALTER TABLE "appointment"
  ADD CONSTRAINT "fk_appointment_created_by_user_account"
  FOREIGN KEY ("created_by") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 10) appointment.rescheduled_from_id -> appointment.id (self-ref)
ALTER TABLE "appointment"
  ADD CONSTRAINT "fk_appointment_rescheduled_from_id_appointment"
  FOREIGN KEY ("rescheduled_from_id") REFERENCES "appointment" ("id")
  ON DELETE NO ACTION ON UPDATE SET NULL;

-- 11) appointment.updated_by -> user_account.id
ALTER TABLE "appointment"
  ADD CONSTRAINT "fk_appointment_updated_by_user_account"
  FOREIGN KEY ("updated_by") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 12) appointment_status_history.appointment_id -> appointment.id
ALTER TABLE "appointment_status_history"
  ADD CONSTRAINT "fk_appointment_status_history_appointment_id_appointment"
  FOREIGN KEY ("appointment_id") REFERENCES "appointment" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 13) appointment_status_history.changed_by -> user_account.id
ALTER TABLE "appointment_status_history"
  ADD CONSTRAINT "fk_appointment_status_history_changed_by_user_account"
  FOREIGN KEY ("changed_by") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 14) payment.appointment_id -> appointment.id
ALTER TABLE "payment"
  ADD CONSTRAINT "fk_payment_appointment_id_appointment"
  FOREIGN KEY ("appointment_id") REFERENCES "appointment" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 15) medical_report.appointment_id -> appointment.id
ALTER TABLE "medical_report"
  ADD CONSTRAINT "fk_medical_report_appointment_id_appointment"
  FOREIGN KEY ("appointment_id") REFERENCES "appointment" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 16) medical_report.doctor_id -> user_account.id
ALTER TABLE "medical_report"
  ADD CONSTRAINT "fk_medical_report_doctor_id_user_account"
  FOREIGN KEY ("doctor_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 17) medical_report_vital_sign.medical_report_id -> medical_report.id
ALTER TABLE "medical_report_vital_sign"
  ADD CONSTRAINT "fk_medical_report_vital_sign_medical_report_id_medical_report"
  FOREIGN KEY ("medical_report_id") REFERENCES "medical_report" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 18) medical_report_medication.medical_report_id -> medical_report.id
ALTER TABLE "medical_report_medication"
  ADD CONSTRAINT "fk_medical_report_medication_medical_report_id_medical_report"
  FOREIGN KEY ("medical_report_id") REFERENCES "medical_report" ("id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- 19) doctor_schedule_rule.doctor_id -> user_account.id
ALTER TABLE "doctor_schedule_rule"
  ADD CONSTRAINT "fk_doctor_schedule_rule_doctor_id_user_account"
  FOREIGN KEY ("doctor_id") REFERENCES "user_account" ("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 20) notification.user_receive -> user_account.id
ALTER TABLE "notification"
  ADD CONSTRAINT "fk_notification_user_receive_user_account"
  FOREIGN KEY ("user_receive") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 21) notification.created_by -> user_account.id
ALTER TABLE "notification"
  ADD CONSTRAINT "fk_notification_created_by_user_account"
  FOREIGN KEY ("created_by") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 22) doctor_payroll.doctor_id -> user_account.id
ALTER TABLE "doctor_payroll"
  ADD CONSTRAINT "fk_doctor_payroll_doctor_id_user_account"
  FOREIGN KEY ("doctor_id") REFERENCES "user_account" ("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

