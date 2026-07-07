import { Schema, model, models, Types } from "mongoose";



export interface IPrescriptionPdf {
  _id: string;
  ownerOrgId: Types.ObjectId;
  patientId: Types.ObjectId;
  encounterId: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  generatedByUserId: Types.ObjectId;
  generatedByName: string;
  snapshot: {
    clinic: {
      name: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
      timings?: Array<{ days: string; open: string; close: string }>;
      socialLinks?: {
        instagram?: string;
        facebook?: string;
        x?: string;
        website?: string;
      };
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
