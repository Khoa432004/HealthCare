-- Migration: Create patient exam package purchase and payment tables
-- Version: V2__create_patient_package_purchase_tables.sql

-- Create patient_exam_package_purchase table
CREATE TABLE IF NOT EXISTS patient_exam_package_purchase (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    package_id UUID NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL,
    price_vnd BIGINT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    remaining_messages INTEGER DEFAULT 12,
    remaining_sessions INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    payment_id UUID,
    FOREIGN KEY (patient_id) REFERENCES user_account(id),
    FOREIGN KEY (doctor_id) REFERENCES user_account(id),
    CONSTRAINT fk_patient_exam_package_purchase_payment FOREIGN KEY (payment_id) REFERENCES package_purchase_payment(id)
);

CREATE INDEX idx_patient_exam_package_purchase_patient_id ON patient_exam_package_purchase(patient_id);
CREATE INDEX idx_patient_exam_package_purchase_doctor_id ON patient_exam_package_purchase(doctor_id);
CREATE INDEX idx_patient_exam_package_purchase_purchase_date ON patient_exam_package_purchase(purchase_date);

-- Create package_purchase_payment table
CREATE TABLE IF NOT EXISTS package_purchase_payment (
    id UUID PRIMARY KEY,
    package_purchase_id UUID NOT NULL UNIQUE,
    amount NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(255),
    transaction_ref VARCHAR(255),
    payment_time TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (package_purchase_id) REFERENCES patient_exam_package_purchase(id)
);

CREATE INDEX idx_package_purchase_payment_package_purchase_id ON package_purchase_payment(package_purchase_id);
CREATE INDEX idx_package_purchase_payment_transaction_id ON package_purchase_payment(transaction_id);
