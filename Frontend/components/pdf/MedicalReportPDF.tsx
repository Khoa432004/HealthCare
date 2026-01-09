import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { MedicalReport } from '../../types/medical-report';

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
        color: '#16a1bd',
        marginBottom: 5,
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
        color: '#0d6171',
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

const MedicalReportPDF: React.FC<Props> = ({ report }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.clinicName}>{report.clinic}</Text>
                    <Text>{report.doctorMajor}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.title}>BÁO CÁO Y KHOA</Text>
                    <Text>Mã: {report.id}</Text>
                    <Text>{format(new Date(report.date || new Date()), 'dd/MM/yyyy')}</Text>
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

            {/* Diagnosis */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>KẾT QUẢ KHÁM & CHẨN ĐOÁN</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Chẩn đoán:</Text>
                    <Text style={styles.value}>{report.diagnosis}</Text>
                </View>
                {report.clinicalDiagnosis && report.clinicalDiagnosis.length > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Khám lâm sàng:</Text>
                        <Text style={styles.value}>
                            {report.clinicalDiagnosis.map(cd => `${cd.signType}: ${cd.signValue} ${cd.unit}`).join(', ')}
                        </Text>
                    </View>
                )}
                <View style={styles.row}>
                    <Text style={styles.label}>Hướng điều trị:</Text>
                    <Text style={styles.value}>{report.treatment}</Text>
                </View>
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
                                <Text style={styles.col2}>{p.dosage}</Text>
                                <Text style={styles.col3}>
                                    {p.mealRelation === 'before' ? 'Trước' :
                                        p.mealRelation === 'after' ? 'Sau' :
                                            p.mealRelation === 'with' ? 'Cùng' : 'Cùng'} ăn
                                </Text>
                                <Text style={styles.col4}>{p.duration} ngày</Text>
                                <Text style={styles.col5}>{p.note || '-'}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ fontStyle: 'italic', color: '#666', padding: 5 }}>Không có đơn thuốc</Text>
                )}
            </View>

            {/* Signature */}
            <View style={styles.doctorCheck}>
                <Text>Bác sĩ điều trị</Text>
                <Text style={{ marginTop: 40, fontWeight: 'bold' }}>{report.doctor}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>HealthCare System - Báo cáo này được tạo tự động vào ngày {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
            </View>
        </Page>
    </Document>
);

export default MedicalReportPDF;
