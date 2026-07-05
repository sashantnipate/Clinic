import { Schema, model, models, Types } from "mongoose";

export interface IMedicationRx {
  name: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  encounterId: Types.ObjectId;
  prescribedBy: string;
  medications: IMedicationRx[];
  status: "active" | "completed" | "cancelled" | "filled";
  createdAt: Date;
}

export interface IMedicalEncounter {
  _id: Types.ObjectId;
  ownerOrgId: Types.ObjectId;
  patientId: Types.ObjectId;
  nodeId: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  complaint?: string;
  notes?: string;
  type: "one-time" | "followup" | "merge";
  lane: "center-trunk" | "left-branch" | "right-branch";
  branchName?: string;
  followupDate?: string;
  parents: string[];
  createdAt: Date;
}

const MedicationRxSchema = new Schema<IMedicationRx>({
  name: { type: String, required: true, trim: true }, 
  frequency: { type: String, default: "" },
  duration: { type: String, default: "" },
  instructions: { type: String }
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: "MedicalEncounter", required: true, index: true },
    prescribedBy: { type: String, default: "" },
    medications: { 
      type: [MedicationRxSchema], 
      required: true
    },
    status: { type: String, enum: ["active", "completed", "cancelled", "filled"], default: "active", index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const MedicalEncounterSchema = new Schema<IMedicalEncounter>(
  {
    ownerOrgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    nodeId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    doctor: { type: String, default: "Unknown Doctor" },
    specialty: { type: String, default: "General" },
    complaint: { type: String, default: "" },
    notes: { type: String, default: "" },     
    type: { type: String, enum: ["one-time", "followup", "merge"], required: true },
    lane: { type: String, enum: ["center-trunk", "left-branch", "right-branch"], required: true },
    branchName: { type: String, trim: true },
    followupDate: { type: String, trim: true },
    parents: [{ type: String }]
  },
  { timestamps: true }
);

MedicalEncounterSchema.index({ ownerOrgId: 1, patientId: 1, createdAt: -1 });

if (models.MedicalEncounter) delete models.MedicalEncounter;
if (models.Prescription) delete models.Prescription;

export const MedicalEncounter = model<IMedicalEncounter>("MedicalEncounter", MedicalEncounterSchema);
export const Prescription = model<IPrescription>("Prescription", PrescriptionSchema);