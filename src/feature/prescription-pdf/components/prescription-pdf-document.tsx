import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, Svg, Path, Circle, Rect } from "@react-pdf/renderer";
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
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  headerLeftCol: {
    flex: 1,
  },
  headerLogoNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  socialWrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  headerRightCol: {
    marginLeft: 16,
    alignItems: "flex-end",
  },
  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  socialText: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 0,
  },
  socialIconWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeIcon: {
    width: 60,
    height: 60,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
    marginRight: 10,
  },
  clinicName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
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
  footerContainer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 6,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 8,
    color: "#4b5563",
    paddingTop: 1.5,
  },
  footerDisclaimer: {
    fontSize: 7.5,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
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

const InstagramIcon = () => (
  <View style={styles.socialIconWrapper}>
    <Svg viewBox="0 0 24 24" width={10} height={10}>
      <Path d="M0 0h24v24H0z" fill="none" />
      <Rect width="16" height="16" x="4" y="4" rx="4" ry="4" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16.5 7.5v.01" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  </View>
);

const FacebookIcon = () => (
  <View style={styles.socialIconWrapper}>
    <Svg viewBox="0 0 24 24" width={10} height={10}>
      <Path d="M0 0h24v24H0z" fill="none" />
      <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const XIcon = () => (
  <View style={styles.socialIconWrapper}>
    <Svg viewBox="0 0 24 24" width={10} height={10}>
      <Path d="M0 0h24v24H0z" fill="none" />
      <Path d="M4 4l11.73 16h4.27L8.27 4ZM4 20l6.76-6.76M20 4l-6.76 6.76" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const GlobeIcon = () => (
  <View style={styles.socialIconWrapper}>
    <Svg viewBox="0 0 24 24" width={10} height={10}>
      <Path d="M0 0h24v24H0z" fill="none" />
      <Circle cx="12" cy="12" r="10" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12h20" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const MapPinIcon = () => (
  <Svg viewBox="0 0 24 24" width={10} height={10}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg viewBox="0 0 24 24" width={10} height={10}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = () => (
  <Svg viewBox="0 0 24 24" width={10} height={10}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Circle cx="12" cy="12" r="10" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 6v6l4 2" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export function PrescriptionPdfDocument({ payload, sections }: { payload: PrescriptionPdfPayload; sections: PrescriptionPdfSections }) {
  const globalAdvice = extractGlobalNotes(payload.prescription.medications);

  return (
    <Document title={`Prescription - ${payload.patient.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Dynamic Branding Header Area */}
        <View style={styles.headerWrapper}>
          {/* LEFT: Logo & Name + Social Row */}
          <View style={styles.headerLeftCol}>
            <View style={styles.headerLogoNameRow}>
              {sections.clinicLogo && payload.clinic.logoUrl ? (
                <Image src={payload.clinic.logoUrl} style={styles.logo} />
              ) : null}
              {sections.clinicName ? (
                <Text style={styles.clinicName}>{payload.clinic.name}</Text>
              ) : null}
            </View>

            <View style={styles.socialWrapRow}>
              {sections.clinicInstagram && payload.clinic.socialLinks?.instagram && (
                <View style={styles.socialItem}>
                  <InstagramIcon />
                  <Text style={styles.socialText}>{payload.clinic.socialLinks.instagram}</Text>
                </View>
              )}
              {sections.clinicFacebook && payload.clinic.socialLinks?.facebook && (
                <View style={styles.socialItem}>
                  <FacebookIcon />
                  <Text style={styles.socialText}>{payload.clinic.socialLinks.facebook}</Text>
                </View>
              )}
              {sections.clinicX && payload.clinic.socialLinks?.x && (
                <View style={styles.socialItem}>
                  <XIcon />
                  <Text style={styles.socialText}>{payload.clinic.socialLinks.x}</Text>
                </View>
              )}
              {sections.clinicWebsite && payload.clinic.socialLinks?.website && (
                <View style={styles.socialItem}>
                  <GlobeIcon />
                  <Text style={styles.socialText}>{payload.clinic.socialLinks.website.replace(/^https?:\/\//, "")}</Text>
                </View>
              )}
            </View>
          </View>

          {/* RIGHT: Dynamic QR Code Rendering */}
          <View style={styles.headerRightCol}>
            {sections.clinicWebsiteQrCode && payload.clinic.socialLinks?.website ? (
              <Image
                src={`https://quickchart.io/qr?size=150&text=${encodeURIComponent(payload.clinic.socialLinks.website)}`}
                style={styles.qrCodeIcon}
              />
            ) : null}
          </View>
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
            <View style={{ paddingVertical: 6, borderStyle: "dashed", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, textAlign: "center" }}>
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

        {/* Structured Footer Element */}
        <View style={styles.footerContainer} fixed>
          {(sections.clinicAddress || sections.clinicPhone || sections.clinicTimings) && (
            <View style={styles.footerRow}>
              {sections.clinicAddress && payload.clinic.address && (
                <View style={styles.footerItem}>
                  <MapPinIcon />
                  <Text style={styles.footerText}>{payload.clinic.address}</Text>
                </View>
              )}
              {sections.clinicPhone && payload.clinic.phone && (
                <View style={styles.footerItem}>
                  <PhoneIcon />
                  <Text style={styles.footerText}>{payload.clinic.phone}</Text>
                </View>
              )}
              {sections.clinicTimings && payload.clinic.timings.length > 0 && (
                <View style={styles.footerItem}>
                  <ClockIcon />
                  <Text style={styles.footerText}>
                    {payload.clinic.timings.map((t) => `${t.days}: ${t.open} - ${t.close}`).join(" | ")}
                  </Text>
                </View>
              )}
            </View>
          )}

        </View>
      </Page>
    </Document>
  );
}