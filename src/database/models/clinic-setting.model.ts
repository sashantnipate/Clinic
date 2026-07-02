import { Schema, model, models, Types } from "mongoose";

export interface IClinicTiming {
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
    timings: [ClinicTimingSchema]
  },
  { timestamps: true }
);

export const ClinicSetting = models.ClinicSetting || model<IClinicSetting>("ClinicSetting", ClinicSettingSchema);