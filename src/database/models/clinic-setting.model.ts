import { Schema, model, models, Types } from "mongoose";
import type { PrescriptionPdfSections } from "@/feature/prescription-pdf/types"; export interface IClinicTiming {
  days: string;  // e.g., "Mon - Fri"
  open: string;  // e.g., "08:00 AM"
  close: string; // e.g., "06:00 PM"
}

export interface IClinicSetting {
  _id: string;
  ownerOrgId: Types.ObjectId;
  address: string;
  phone: string;
  timings: IClinicTiming[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    website?: string;
  };
  prescriptionPdfSettings?: PrescriptionPdfSections;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicTimingSchema = new Schema<IClinicTiming>({
  days: { type: String, required: true },
  open: { type: String, required: true },
  close: { type: String, required: true }
}, { _id: false });

const ClinicSettingSchema = new Schema<IClinicSetting>(
  {
    ownerOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    timings: [ClinicTimingSchema],
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      x: { type: String },
      website: { type: String }
    },
    prescriptionPdfSettings: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const ClinicSetting = models.ClinicSetting || model<IClinicSetting>("ClinicSetting", ClinicSettingSchema);