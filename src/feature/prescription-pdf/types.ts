export interface PrescriptionPdfSections {
  clinicLogo: boolean;
  clinicName: boolean;
  clinicAddress: boolean;
  clinicPhone: boolean;
  clinicTimings: boolean;
  patientName: boolean;
  patientDobAge: boolean;
  patientGender: boolean;
  patientPhone: boolean;
  patientEmail: boolean;
  patientAddress: boolean;
  encounterDetails: boolean;
  complaint: boolean;
  notes: boolean;
  medications: boolean;
  followupDate: boolean;
}

export type PrescriptionPdfSectionKey = keyof PrescriptionPdfSections;

export interface PrescriptionPdfPayload {
  clinic: {
    name: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    timings: Array<{ days: string; open: string; close: string }>;
  };
  patient: {
    name: string;
    dob?: string;
    ageText?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  encounter: {
    id: string;
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    complaint?: string;
    notes?: string;
    followupDate?: string;
  };
  prescription: {
    id?: string;
    medications: Array<{
      name: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  };
}

export interface PrescriptionPdfSnapshot {
  clinic: PrescriptionPdfPayload["clinic"];
  patient: PrescriptionPdfPayload["patient"];
  encounter: Omit<PrescriptionPdfPayload["encounter"], "id">;
  prescription: PrescriptionPdfPayload["prescription"];
}
