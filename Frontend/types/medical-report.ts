export interface PrescriptionItem {
    id?: string
    name: string
    dosage: string
    medicationType: string
    mealRelation: string
    duration: number
    startDay: string
    note: string
}

export interface ClinicalDiagnosis {
    signType: string
    signValue: string
    unit: string
}

export interface MedicalReport {
    id: string
    patientId: string
    doctor: string
    clinic: string
    doctorMajor: string
    date: string
    timeIn: string
    timeOut: string
    patientName: string | null
    gender: string | null
    birthDateTime: string | null
    reason: string
    diagnosis: string
    clinicalDiagnosis: ClinicalDiagnosis[]
    treatment: string
    notes: string
    prescriptions: PrescriptionItem[]
}
