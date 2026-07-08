"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
    family: "Inter",
    fonts: [
        { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff", fontWeight: 400 },
        { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff", fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Inter",
        fontSize: 10,
        color: "#020817",
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 4,
        color: "#0f172a",
    },
    subtitle: {
        fontSize: 10,
        color: "#64748b",
    },
    patientInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f8fafc",
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 10,
        color: "#334155",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 10,
        color: "#0f172a",
        textTransform: "uppercase",
    },
    encounterBlock: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 4,
        padding: 10,
    },
    encounterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    encounterMeta: {
        fontSize: 9,
        color: "#475569",
    },
    encounterComplaint: {
        fontSize: 11,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 4,
    },
    encounterNotes: {
        fontSize: 10,
        color: "#334155",
        marginBottom: 8,
    },
    rxSection: {
        marginTop: 8,
        backgroundColor: "#f1f5f9",
        padding: 8,
        borderRadius: 4,
    },
    rxTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: "#334155",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    rxItem: {
        flexDirection: "row",
        marginBottom: 3,
    },
    rxName: {
        fontWeight: 700,
        width: "40%",
    },
    rxDesc: {
        width: "60%",
        color: "#475569",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        paddingTop: 10,
    }
});

export const MedicalHistoryPdfDocument = ({ patientName, patientDetails, encounters }: { patientName: string, patientDetails: string, encounters: any[] }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Complete Medical History</Text>
                <Text style={styles.subtitle}>Confidential Clinical Record Ledger</Text>
            </View>

            <View style={styles.patientInfo}>
                <Text style={styles.infoText}>Patient: {patientName}</Text>
                <Text style={styles.infoText}>{patientDetails}</Text>
            </View>

            <Text style={styles.sectionTitle}>Clinical Timeline Encounters</Text>

            {encounters.length === 0 ? (
                <Text style={styles.infoText}>No medical encounters recorded.</Text>
            ) : (
                encounters.map((enc, idx) => (
                    <View key={idx} style={styles.encounterBlock}>
                        <View style={styles.encounterHeader}>
                            <View>
                                <Text style={styles.encounterMeta}>{enc.date} - {enc.time}</Text>
                                <Text style={styles.encounterMeta}>Type: {enc.type}</Text>
                            </View>
                            <View style={{ textAlign: "right" }}>
                                <Text style={styles.encounterMeta}>Dr. {enc.doctor}</Text>
                                <Text style={styles.encounterMeta}>{enc.specialty}</Text>
                            </View>
                        </View>

                        <Text style={styles.encounterComplaint}>{enc.complaint || "Routine Evaluation Check"}</Text>
                        {enc.notes ? <Text style={styles.encounterNotes}>{enc.notes}</Text> : null}

                        {enc.prescription && enc.prescription.medications && enc.prescription.medications.length > 0 && (
                            <View style={styles.rxSection}>
                                <Text style={styles.rxTitle}>Prescriptions / Medications</Text>
                                {enc.prescription.medications.map((rx: any, rIdx: number) => (
                                    <View key={rIdx} style={styles.rxItem}>
                                        <Text style={[styles.infoText, styles.rxName]}>• {rx.name}</Text>
                                        <Text style={[styles.infoText, styles.rxDesc]}>
                                            {rx.frequency} | {rx.duration} {rx.instructions ? `| ${rx.instructions}` : ""}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))
            )}

            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `Generated on ${new Date().toLocaleDateString()}  •  Page ${pageNumber} of ${totalPages}`
            )} fixed />
        </Page>
    </Document>
);
