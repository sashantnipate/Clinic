import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PrescriptionPdfPayload, PrescriptionPdfSections } from "../types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#000000",
    lineHeight: 1.4,
  },
  headerContainer: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 3,
  },
  clinicSubText: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  groupHeading: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  inlineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  inlineField: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    color: "#4b5563",
    width: 90,
  },
  fieldValue: {
    color: "#000000",
    flex: 1,
  },
  metaDividerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderTopStyle: "solid",
    borderBottomStyle: "solid",
    paddingVertical: 6,
    marginVertical: 8,
  },
  encounterLabel: {
    color: "#4b5563",
  },
  encounterValue: {
    color: "#000000",
  },
  longRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 2,
  },
  longLabel: {
    color: "#4b5563",
    width: 110,
  },
  longValue: {
    color: "#000000",
    flex: 1,
  },
  rxHeader: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginTop: 12,
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid",
    paddingVertical: 5,
    alignItems: "center",
  },
  thText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#4b5563",
    textTransform: "uppercase",
  },
  colMed: { width: "30%" },
  colQty: { width: "15%" },
  colFreq: { width: "20%" },
  colDur: { width: "15%" },
  colFood: { width: "20%" },
  medNameText: {
    fontFamily: "Helvetica",
    color: "#000000",
  },
  followupContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 8,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 44,
    right: 44,
    fontSize: 7.5,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function formatDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB");
}

function parseFoodRelation(inst?: string) {
  if (!inst) return "---";
  try {
    const parsed = JSON.parse(inst);
    return parsed.relationToFood || "---";
  } catch {
    return inst || "---";
  }
}

function parseFrequencyText(rawFreq?: string) {
  if (!rawFreq) return { timing: "", dosage: "" };
  let dosage = "";
  let timing = rawFreq;
  if (rawFreq.includes("(") && rawFreq.endsWith(")")) {
    const parts = rawFreq.split("(");
    timing = parts[0].trim();
    dosage = parts[1].slice(0, -1).trim();
  }
  return { timing, dosage };
}

function extractGlobalNotes(medications: any[]) {
  for (const med of medications) {
    if (med.instructions) {
      try {
        const parsed = JSON.parse(med.instructions);
        if (parsed.globalNotes) return parsed.globalNotes;
      } catch { }
    }
  }
  return "";
}

export function PrescriptionPdfDocument({ payload, sections }: { payload: PrescriptionPdfPayload; sections: PrescriptionPdfSections }) {
  const globalAdvice = extractGlobalNotes(payload.prescription.medications);

  return (
    <Document title={`Prescription - ${payload.patient.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Centered Branding Header Area */}
        <View style={styles.headerContainer}>
          {sections.clinicLogo && payload.clinic.logoUrl ? (
            <Image src={payload.clinic.logoUrl} style={styles.logo} />
          ) : null}
          {sections.clinicName ? <Text style={styles.clinicName}>{payload.clinic.name}</Text> : null}
          {sections.clinicAddress && payload.clinic.address ? <Text style={styles.clinicSubText}>{payload.clinic.address}</Text> : null}
          {sections.clinicPhone && payload.clinic.phone ? <Text style={styles.clinicSubText}>Phone: {payload.clinic.phone}</Text> : null}
          {sections.clinicTimings && payload.clinic.timings.length > 0 ? (
            <Text style={styles.clinicSubText}>
              {payload.clinic.timings.map((t) => `${t.days}: ${t.open} - ${t.close}`).join(" | ")}
            </Text>
          ) : null}
        </View>

        {/* Dynamic Patient Details */}
        {(sections.patientName || sections.patientDobAge || sections.patientGender) && (
          <View>
            <Text style={styles.groupHeading}>Patient Profile Details</Text>
            <View style={styles.inlineRow}>
              {sections.patientName && (
                <View style={styles.inlineField}>
                  <Text style={styles.fieldLabel}>Patient Name:</Text>
                  <Text style={styles.fieldValue}>{payload.patient.name}</Text>
                </View>
              )}
              {sections.patientDobAge && (
                <View style={styles.inlineField}>
                  <Text style={styles.fieldLabel}>DOB / Age:</Text>
                  <Text style={styles.fieldValue}>
                    {[formatDate(payload.patient.dob), payload.patient.ageText].filter(Boolean).join(" / ")}
                  </Text>
                </View>
              )}
              {sections.patientGender && (
                <View style={styles.inlineField}>
                  <Text style={styles.fieldLabel}>Gender Identity:</Text>
                  <Text style={[styles.fieldValue, { textTransform: "capitalize" }]}>{payload.patient.gender}</Text>
                </View>
              )}
              {sections.patientPhone && payload.patient.phone && (
                <View style={styles.inlineField}>
                  <Text style={styles.fieldLabel}>Contact Phone:</Text>
                  <Text style={styles.fieldValue}>{payload.patient.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Balanced Encounter Header Bar */}
        {(sections.encounterDate || sections.encounterDoctor || sections.encounterDepartment) && (
          <View style={styles.metaDividerBar}>
            {sections.encounterDate ? (
              <Text style={styles.encounterLabel}>Date Checked: <Text style={styles.encounterValue}>{payload.encounter.date} {payload.encounter.time}</Text></Text>
            ) : null}
            {(sections.encounterDoctor || sections.encounterDepartment) ? (
              <Text style={styles.encounterLabel}>
                Consultant: <Text style={styles.encounterValue}>
                  {[sections.encounterDoctor ? payload.encounter.doctor : "", sections.encounterDepartment ? `(${payload.encounter.specialty})` : ""].filter(Boolean).join(" ")}
                </Text>
              </Text>
            ) : null}
          </View>
        )}

        {/* Diagnosis & notes rows */}
        {sections.complaint && payload.encounter.complaint ? (
          <View style={styles.longRow}>
            <Text style={styles.longLabel}>Chief Diagnosis:</Text>
            <Text style={styles.longValue}>{payload.encounter.complaint}</Text>
          </View>
        ) : null}

        {sections.notes && payload.encounter.notes ? (
          <View style={styles.longRow}>
            <Text style={styles.longLabel}>Clinical Notes:</Text>
            <Text style={styles.longValue}>{payload.encounter.notes}</Text>
          </View>
        ) : null}

        {/* Medical prescriptions list */}
        <View>
          <Text style={styles.rxHeader}>Rx</Text>
          {sections.medications && payload.prescription.medications.length > 0 ? (
            <View>
              <View style={styles.tableHeader}>
                <View style={styles.colMed}><Text style={styles.thText}>Medicine Formulation</Text></View>
                <View style={styles.colQty}><Text style={styles.thText}>Quantity / Vol</Text></View>
                <View style={styles.colFreq}><Text style={styles.thText}>Time Interval</Text></View>
                <View style={styles.colDur}><Text style={styles.thText}>Duration</Text></View>
                <View style={styles.colFood}><Text style={styles.thText}>Food</Text></View>
              </View>
              {payload.prescription.medications.map((med, idx) => {
                const { timing, dosage } = parseFrequencyText(med.frequency);
                return (
                  <View key={idx} style={styles.tableRow}>
                    <View style={styles.colMed}><Text style={styles.medNameText}>{med.name}</Text></View>
                    <View style={styles.colQty}><Text>{dosage}</Text></View>
                    <View style={styles.colFreq}><Text>{timing}</Text></View>
                    <View style={styles.colDur}><Text>{med.duration}</Text></View>
                    <View style={styles.colFood}><Text>{parseFoodRelation(med.instructions)}</Text></View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ py: 6, borderStyle: "dashed", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, textAlign: "center" }}>
              <Text style={{ color: "#94a3b8", fontSize: 8.5 }}>No prescription items selected for this clinical summary sheet.</Text>
            </View>
          )}
        </View>

        {/* Extracted Global Advice Care Routine Section */}
        {globalAdvice ? (
          <View style={[styles.longRow, { marginTop: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f3f4f6", borderTopStyle: "solid" }]}>
            <Text style={styles.longLabel}>Doctor's Advice:</Text>
            <Text style={styles.longValue}>{globalAdvice}</Text>
          </View>
        ) : null}

        {sections.followupDate && payload.encounter.followupDate ? (
          <View style={styles.followupContainer}>
            <Text style={{ color: "#4b5563" }}>
              Recommended Follow-up Target Timeline: <Text style={{ color: "#000000", fontFamily: "Helvetica-Bold" }}>{formatDate(payload.encounter.followupDate)}</Text>
            </Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Clinic ERP Metadata Document System • Authentic Verification Verified Ledger</Text>
      </Page>
    </Document>
  );
}