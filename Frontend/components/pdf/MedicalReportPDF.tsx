import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { MedicalReport } from '../../types/medical-report';
import { BRAND_ASSETS } from '@/lib/brand';

// Register font for Vietnamese support
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Roboto',
        fontSize: 10,
        color: '#333',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007A94',
        marginBottom: 5,
    },
    logo: {
        width: 130,
        height: 44,
        objectFit: 'contain',
        marginBottom: 6,
    },
    clinicName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#e6f7fa',
        padding: 5,
        marginBottom: 8,
        color: '#005566',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
        color: '#666',
    },
    value: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%',
        marginBottom: 5,
        flexDirection: 'row',
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 5,
    },
    col1: { width: '30%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '15%' },
    col5: { width: '15%' },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
        fontSize: 8,
        color: '#999',
    },
    doctorCheck: {
        marginTop: 20,
        textAlign: 'right',
        marginRight: 20,
    }
});

interface Props {
    report: MedicalReport;
}

function getPdfLogoSrc() {
    if (typeof window !== "undefined") {
        return `${window.location.origin}${BRAND_ASSETS.logoFull}`
    }
    return BRAND_ASSETS.logoFull
}

function getMedicationUnit(medicationType: string) {
    const type = (medicationType || "").toLowerCase().trim()
    if (type === "tablet" || type === "viên") return "viên"
    if (type === "capsule" || type.includes("nang")) return "viên nang"
    if (type === "liquid" || type.includes("dung dịch") || type.includes("dich")) return "ml"
    if (type === "powder" || type === "bột" || type === "bot") return "gói"
    if (type === "injection" || type.includes("tiêm") || type.includes("tiem")) return "ống"
    return "viên"
}

function formatDosageWithUnit(dosage: string, medicationType: string) {
    const value = (dosage || "").trim()
    if (!value) return "N/A"

    if (/(mg|g|ml|mcg|iu|ui|%|viên|vien|viên nang|gói|goi|ống|ong|lần|lan)\b/i.test(value)) {
        return value
    }

    const unit = getMedicationUnit(medicationType)
    return `${value} ${unit}`
}

function formatMealRelation(mealRelation: string) {
    const value = (mealRelation || "").toLowerCase()
    if (value.includes("before")) return "Trước ăn"
    if (value.includes("after")) return "Sau ăn"
    if (value.includes("with") || value.includes("food")) return "Cùng bữa ăn"
    if (value.includes("anytime")) return "Bất kỳ lúc nào"
    return mealRelation || "Cùng bữa ăn"
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value || !value.trim()) return null
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    )
}

const MedicalReportPDF: React.FC<Props> = ({ report }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.clinicName}>{report.clinic || "Medical Clinic"}</Text>
                    <Text>{report.doctorMajor}</Text>
                    {report.province ? <Text>{report.province}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Image src={getPdfLogoSrc()} style={styles.logo} />
                    <Text>Mã: {report.id}</Text>
                    <Text>{format(new Date(report.date || new Date()), 'dd/MM/yyyy')}</Text>
                    {report.timeIn && report.timeOut ? (
                        <Text>
                            {format(new Date(report.timeIn), 'HH:mm')} - {format(new Date(report.timeOut), 'HH:mm')}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Patient Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>THÔNG TIN BỆNH NHÂN</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Họ tên:</Text>
                        <Text style={styles.value}>{report.patientName || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Giới tính:</Text>
                        <Text style={styles.value}>{report.gender || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Ngày sinh:</Text>
                        <Text style={styles.value}>
                            {report.birthDateTime
                                ? format(new Date(`${report.birthDateTime}T00:00:00`), 'dd/MM/yyyy')
                                : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Mã BN:</Text>
                        <Text style={styles.value}>{report.patientId}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Lý do khám:</Text>
                    <Text style={styles.value}>{report.reason}</Text>
                </View>
            </View>

            {/* Clinical Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>BÁO CÁO Y KHOA</Text>
                <InfoRow label="Bệnh mãn tính:" value={report.chronicConditions} />
                <InfoRow label="Bệnh lý:" value={report.illness} />
                <InfoRow label="Khám lâm sàng:" value={report.medicalExam} />
                <InfoRow
                    label="ICD-10:"
                    value={report.icdCode ? `${report.icdCode}${report.diagnosis ? ` - ${report.diagnosis}` : ""}` : undefined}
                />
                {!report.icdCode ? (
                    <View style={styles.row}>
                        <Text style={styles.label}>Chẩn đoán:</Text>
                        <Text style={styles.value}>{report.diagnosis || "N/A"}</Text>
                    </View>
                ) : null}
                {report.clinicalDiagnosis && report.clinicalDiagnosis.length > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Chỉ số sinh hiệu:</Text>
                        <Text style={styles.value}>
                            {report.clinicalDiagnosis.map(cd => `${cd.signType}: ${cd.signValue} ${cd.unit}`).join(', ')}
                        </Text>
                    </View>
                )}
                <InfoRow label="Bảo hiểm:" value={report.coverage} />
                <View style={styles.row}>
                    <Text style={styles.label}>Khuyến nghị:</Text>
                    <Text style={styles.value}>{report.treatment || "N/A"}</Text>
                </View>
                <InfoRow label="Tái khám:" value={report.followUpDate ? format(new Date(`${report.followUpDate}T00:00:00`), 'dd/MM/yyyy') : undefined} />
                {report.notes && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Ghi chú:</Text>
                        <Text style={styles.value}>{report.notes}</Text>
                    </View>
                )}
            </View>

            {/* Prescriptions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ĐƠN THUỐC</Text>
                {report.prescriptions.length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>Tên thuốc</Text>
                            <Text style={styles.col2}>Liều lượng</Text>
                            <Text style={styles.col3}>Cách dùng</Text>
                            <Text style={styles.col4}>Thời gian</Text>
                            <Text style={styles.col5}>Ghi chú</Text>
                        </View>
                        {report.prescriptions.map((p, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.col1}>{p.name}</Text>
                                <Text style={styles.col2}>
                                    {formatDosageWithUnit(p.dosage, p.medicationType)}
                                </Text>
                                <Text style={styles.col3}>{formatMealRelation(p.mealRelation)}</Text>
                                <Text style={styles.col4}>{p.duration} ngày</Text>
                                <Text style={styles.col5}>{p.note || '-'}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ color: '#666', padding: 5 }}>Không có đơn thuốc</Text>
                )}
            </View>

            {/* Signature */}
            <View style={styles.doctorCheck}>
                <Text>Bác sĩ điều trị</Text>
                <Text style={{ marginTop: 40, fontWeight: 'bold' }}>{report.doctor}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>iMed - Báo cáo này được tạo tự động vào ngày {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
            </View>
        </Page>
    </Document>
);

export default MedicalReportPDF;
