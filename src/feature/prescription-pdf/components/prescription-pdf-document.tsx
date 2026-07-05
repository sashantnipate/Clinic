import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PrescriptionPdfPayload, PrescriptionPdfSections } from "../types";

interface PrescriptionPdfDocumentProps {
  payload: PrescriptionPdfPayload;
  sections: PrescriptionPdfSections;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.45,
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 12,
  },
  logo: {
    width: 54,
    height: 54,
    objectFit: "contain",
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  clinicLine: {
    fontSize: 8.5,
    color: "#4b5563",
    marginBottom: 1.5,
  },
  breaker: {
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    borderBottomStyle: "solid",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 6,
    color: "#0f172a",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  field: {
    width: "48%",
    marginBottom: 4,
  },
  label: {
    fontSize: 7.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  block: {
    marginBottom: 8,
  },
  medicationHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#334155",
  },
  medicationRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingVertical: 5,
  },
  medName: {
    width: "34%",
    paddingRight: 6,
  },
  medFrequency: {
    width: "24%",
    paddingRight: 6,
  },
  medDuration: {
    width: "18%",
    paddingRight: 6,
  },
  medInstructions: {
    width: "24%",
  },
  warning: {
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: 8,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 7,
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

function formatInstructions(value?: string) {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    return [parsed.relationToFood, parsed.globalNotes].filter(Boolean).join("; ");
  } catch {
    return value;
  }
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function PrescriptionPdfDocument({ payload, sections }: PrescriptionPdfDocumentProps) {
  const showAnyPatientDetail =
    sections.patientName ||
    sections.patientDobAge ||
    sections.patientGender ||
    sections.patientPhone ||
    sections.patientEmail ||
    sections.patientAddress;

  const showAnyEncounterDetail =
    sections.encounterDetails ||
    sections.complaint ||
    sections.notes ||
    sections.followupDate ||
    sections.medications;

  return (
    <Document title={`Prescription - ${payload.patient.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {sections.clinicLogo && payload.clinic.logoUrl ? (
            // React PDF Image has no alt prop; the generated PDF logo is decorative.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={payload.clinic.logoUrl} style={styles.logo} />
          ) : null}
          {sections.clinicName ? <Text style={styles.clinicName}>{payload.clinic.name}</Text> : null}
          {sections.clinicAddress && payload.clinic.address ? <Text style={styles.clinicLine}>{payload.clinic.address}</Text> : null}
          {sections.clinicPhone && payload.clinic.phone ? <Text style={styles.clinicLine}>Phone: {payload.clinic.phone}</Text> : null}
          {sections.clinicTimings && payload.clinic.timings.length > 0 ? (
            <Text style={styles.clinicLine}>
              {payload.clinic.timings.map((timing) => `${timing.days}: ${timing.open} - ${timing.close}`).join(" | ")}
            </Text>
          ) : null}
        </View>

        <View style={styles.breaker} />

        {showAnyPatientDetail ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>Patient Details</Text>
            <View style={styles.grid}>
              {sections.patientName ? <Field label="Name" value={payload.patient.name} /> : null}
              {sections.patientDobAge ? (
                <Field
                  label="DOB / Age"
                  value={[formatDate(payload.patient.dob), payload.patient.ageText].filter(Boolean).join(" / ")}
                />
              ) : null}
              {sections.patientGender ? <Field label="Gender" value={payload.patient.gender} /> : null}
              {sections.patientPhone ? <Field label="Phone" value={payload.patient.phone} /> : null}
              {sections.patientEmail ? <Field label="Email" value={payload.patient.email} /> : null}
              {sections.patientAddress ? <Field label="Address" value={payload.patient.address} /> : null}
            </View>
          </View>
        ) : null}

        <View style={styles.breaker} />

        {showAnyEncounterDetail ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>Prescription</Text>

            {sections.encounterDetails ? (
              <View style={styles.grid}>
                <Field label="Encounter" value={`${payload.encounter.date}, ${payload.encounter.time}`} />
                <Field label="Doctor" value={`${payload.encounter.doctor} (${payload.encounter.specialty})`} />
              </View>
            ) : null}

            {sections.complaint && payload.encounter.complaint ? (
              <View style={styles.block}>
                <Text style={styles.label}>Complaint / Diagnosis</Text>
                <Text style={styles.value}>{payload.encounter.complaint}</Text>
              </View>
            ) : null}

            {sections.notes && payload.encounter.notes ? (
              <View style={styles.block}>
                <Text style={styles.label}>Clinical Notes</Text>
                <Text style={styles.value}>{payload.encounter.notes}</Text>
              </View>
            ) : null}

            {sections.followupDate && payload.encounter.followupDate ? (
              <View style={styles.block}>
                <Text style={styles.label}>Follow-up Date</Text>
                <Text style={styles.value}>{formatDate(payload.encounter.followupDate)}</Text>
              </View>
            ) : null}

            {sections.medications ? (
              payload.prescription.medications.length > 0 ? (
                <View style={styles.block}>
                  <View style={styles.medicationHeader}>
                    <Text style={styles.medName}>Medicine</Text>
                    <Text style={styles.medFrequency}>Frequency</Text>
                    <Text style={styles.medDuration}>Duration</Text>
                    <Text style={styles.medInstructions}>Instructions</Text>
                  </View>
                  {payload.prescription.medications.map((medication, index) => (
                    <View key={`${medication.name}-${index}`} style={styles.medicationRow}>
                      <Text style={styles.medName}>{medication.name}</Text>
                      <Text style={styles.medFrequency}>{medication.frequency}</Text>
                      <Text style={styles.medDuration}>{medication.duration}</Text>
                      <Text style={styles.medInstructions}>{formatInstructions(medication.instructions)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.warning}>No linked prescription medicines were found for this encounter.</Text>
              )
            ) : (
              <Text style={styles.warning}>Medication list omitted by doctor selection. This PDF is an encounter summary.</Text>
            )}
          </View>
        ) : null}

        <Text style={styles.footer}>Generated from clinic medical history. PDF file is not stored by this version.</Text>
      </Page>
    </Document>
  );
}
