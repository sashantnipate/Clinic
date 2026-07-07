import { Schema, model, models, Types } from "mongoose";

export interface IPrescriptionPdfSections {
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
  encounterDate: boolean;
  encounterDoctor: boolean;
  encounterDepartment: boolean;
  complaint: boolean;
  notes: boolean;
  medications: boolean;
  followupDate: boolean;
}

export interface IPrescriptionPdf {
  _id: string;
  ownerOrgId: Types.ObjectId;
  patientId: Types.ObjectId;
  encounterId: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  generatedByUserId: Types.ObjectId;
  generatedByName: string;
  selectedSections: IPrescriptionPdfSections;
  snapshot: {
    clinic: {
      name: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
      timings?: Array<{ days: string; open: string; close: string }>;
    };
    patient: {
      name: string;
      dob?: Date;
      ageText?: string;
      gender?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
    encounter: {
      date: string;
      time: string;
      doctor: string;
      specialty: string;
      complaint?: string;
      notes?: string;
      followupDate?: string;
    };
    prescription: {
      medications: Array<{
        name: string;
        frequency: string;
        duration: string;
        instructions?: string;
      }>;
    };
  };
  file?: {
    url?: string;
    storageKey?: string;
    sha256?: string;
    sizeBytes?: number;
  };
  status: "generated" | "stored" | "void";
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionPdfSchema = new Schema<IPrescriptionPdf>(
  {
    ownerOrgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: "MedicalEncounter", required: true, index: true },
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription" },
    generatedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    generatedByName: { type: String, required: true, trim: true },
    selectedSections: {
      clinicLogo: { type: Boolean, default: true },
      clinicName: { type: Boolean, default: true },
      clinicAddress: { type: Boolean, default: true },
      clinicPhone: { type: Boolean, default: true },
      clinicTimings: { type: Boolean, default: true },
      patientName: { type: Boolean, default: true },
      patientDobAge: { type: Boolean, default: true },
      patientGender: { type: Boolean, default: true },
      patientPhone: { type: Boolean, default: true },
      patientEmail: { type: Boolean, default: true },
      patientAddress: { type: Boolean, default: true },
      encounterDate: { type: Boolean, default: true },
      encounterDoctor: { type: Boolean, default: true },
      encounterDepartment: { type: Boolean, default: true },
      complaint: { type: Boolean, default: true },
      notes: { type: Boolean, default: true },
      medications: { type: Boolean, default: true },
      followupDate: { type: Boolean, default: true },
    },
    snapshot: { type: Schema.Types.Mixed, required: true },
    file: {
      url: { type: String },
      storageKey: { type: String },
      sha256: { type: String },
      sizeBytes: { type: Number },
    },
    status: { type: String, enum: ["generated", "stored", "void"], default: "generated", index: true },
  },
  { timestamps: true }
);

PrescriptionPdfSchema.index({ ownerOrgId: 1, patientId: 1, createdAt: -1 });
PrescriptionPdfSchema.index({ ownerOrgId: 1, encounterId: 1 });
PrescriptionPdfSchema.index({ ownerOrgId: 1, generatedByUserId: 1, createdAt: -1 });

export const PrescriptionPdf =
  models.PrescriptionPdf || model<IPrescriptionPdf>("PrescriptionPdf", PrescriptionPdfSchema);
