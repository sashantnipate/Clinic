import type {
  PrescriptionPdfPayload,
  PrescriptionPdfSectionKey,
  PrescriptionPdfSections,
} from "./types";

export const prescriptionPdfSectionLabels: Record<PrescriptionPdfSectionKey, string> = {
  clinicLogo: "Clinic logo",
  clinicName: "Clinic name",
  clinicAddress: "Clinic address",
  clinicPhone: "Clinic phone",
  clinicTimings: "Clinic timings",
  clinicInstagram: "Instagram link",
  clinicFacebook: "Facebook link",
  clinicX: "X (Twitter) link",
  clinicWebsite: "Website link",
  clinicWebsiteQrCode: "Website QR code",
  patientName: "Patient name",
  patientDobAge: "Patient DOB / age",
  patientGender: "Patient gender",
  patientPhone: "Patient phone",
  patientEmail: "Patient email",
  patientAddress: "Patient address",
  encounterDate: "Encounter date",
  encounterDoctor: "Consultant doctor",
  encounterDepartment: "Assigned department",
  complaint: "Complaint / diagnosis",
  notes: "Clinical notes",
  medications: "Prescription medicines",
  followupDate: "Follow-up date",
};

export const prescriptionPdfSectionGroups: Array<{
  title: string;
  keys: PrescriptionPdfSectionKey[];
}> = [
    {
      title: "Clinic header",
      keys: ["clinicLogo", "clinicName", "clinicAddress", "clinicPhone", "clinicTimings", "clinicInstagram", "clinicFacebook", "clinicX", "clinicWebsite", "clinicWebsiteQrCode"],
    },
    {
      title: "Patient details",
      keys: ["patientName", "patientDobAge", "patientGender", "patientPhone", "patientEmail", "patientAddress"],
    },
    {
      title: "Medical history",
      keys: ["encounterDate", "encounterDoctor", "encounterDepartment", "complaint", "notes", "followupDate", "medications"],
    },
  ];

export function buildDefaultPrescriptionPdfSections(payload: PrescriptionPdfPayload): PrescriptionPdfSections {
  return {
    clinicLogo: Boolean(payload.clinic.logoUrl),
    clinicName: true,
    clinicAddress: Boolean(payload.clinic.address),
    clinicPhone: Boolean(payload.clinic.phone),
    clinicTimings: payload.clinic.timings.length > 0,
    clinicInstagram: Boolean(payload.clinic.socialLinks?.instagram),
    clinicFacebook: Boolean(payload.clinic.socialLinks?.facebook),
    clinicX: Boolean(payload.clinic.socialLinks?.x),
    clinicWebsite: Boolean(payload.clinic.socialLinks?.website),
    clinicWebsiteQrCode: Boolean(payload.clinic.socialLinks?.website),
    patientName: true,
    patientDobAge: Boolean(payload.patient.dob || payload.patient.ageText),
    patientGender: Boolean(payload.patient.gender),
    patientPhone: Boolean(payload.patient.phone),
    patientEmail: Boolean(payload.patient.email),
    patientAddress: Boolean(payload.patient.address),
    encounterDate: true,
    encounterDoctor: true,
    encounterDepartment: true,
    complaint: Boolean(payload.encounter.complaint),
    notes: Boolean(payload.encounter.notes),
    medications: payload.prescription.medications.length > 0,
    followupDate: Boolean(payload.encounter.followupDate),
  };
}

export function isPrescriptionPdfSectionAvailable(
  key: PrescriptionPdfSectionKey,
  payload: PrescriptionPdfPayload
) {
  const defaults = buildDefaultPrescriptionPdfSections(payload);
  if (key === "clinicName" || key === "patientName" || key === "encounterDate" || key === "encounterDoctor" || key === "encounterDepartment") return true;
  return defaults[key];
}
