// FILE: src/database/models/medical-history.model.ts
import { Schema, model, models, Types } from "mongoose";

export interface IMedicationRx {
  name: string;          // e.g., "Amitriptyline"
  dosage: string;        // e.g., "25mg"
  frequency: string;     // e.g., "Once daily at bedtime"
  duration: string;      // e.g., "30 days"
  instructions?: string; // e.g., "Take with food"
}

export interface IFulfillmentLog {
  dispensedAt: Date;
  dispensedBy: string;   // Pharmacist user pointer context
  quantityDispensed: number;
  status: "completed" | "partial" | "returned";
  notes?: string;
}

export interface IPrescription {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  encounterId: Types.ObjectId; // Ties back to specific timeline node checkpoint
  prescribedBy: string;        // Doctor name copy or user pointer
  medications: IMedicationRx[];
  status: "active" | "completed" | "cancelled" | "filled";
  fulfillmentHistory: IFulfillmentLog[];
  createdAt: Date;
}

export interface IMedicalEncounter {
  _id: Types.ObjectId;
  ownerOrgId: Types.ObjectId;
  patientId: Types.ObjectId;
  
  // Clones graph node schema architecture directly 
  nodeId: string;              // e.g., "n-31" generated identifier
  date: string;                // "DD/MM/YYYY" format matching rendering layer
  time: string;                // "HH:MM AM/PM"
  doctor: string;
  specialty: string;
  complaint: string;
  notes: string;
  type: "registration" | "one-time" | "followup" | "merge";
  lane: "center-trunk" | "left-branch" | "right-branch";
  parents: string[];           // Tracks parent graph nodes strings mappings
  
  createdAt: Date;
}

const MedicationRxSchema = new Schema<IMedicationRx>({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String }
}, { _id: false });

const FulfillmentLogSchema = new Schema<IFulfillmentLog>({
  dispensedAt: { type: Date, required: true, default: Date.now },
  dispensedBy: { type: String, required: true },
  quantityDispensed: { type: Number, required: true },
  status: { type: String, enum: ["completed", "partial", "returned"], required: true },
  notes: { type: String }
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescription>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  encounterId: { type: Schema.Types.ObjectId, ref: "MedicalEncounter", required: true, index: true },
  prescribedBy: { type: String, required: true },
  medications: [MedicationRxSchema],
  status: { type: String, enum: ["active", "completed", "cancelled", "filled"], default: "active", index: true },
  fulfillmentHistory: [FulfillmentLogSchema]
}, { timestamps: { createdAt: true, updatedAt: false } });

const MedicalEncounterSchema = new Schema<IMedicalEncounter>({
  ownerOrgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  nodeId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  doctor: { type: String, required: true },
  specialty: { type: String, required: true },
  complaint: { type: String, required: true },
  notes: { type: String, required: true },
  type: { type: String, enum: ["registration", "one-time", "followup", "merge"], required: true },
  lane: { type: String, enum: ["center-trunk", "left-branch", "right-branch"], required: true },
  parents: [{ type: String }]
}, { timestamps: true });

// Multi-tenant compound layout optimization index
MedicalEncounterSchema.index({ ownerOrgId: 1, patientId: 1, createdAt: -1 });

export const MedicalEncounter = models.MedicalEncounter || model<IMedicalEncounter>("MedicalEncounter", MedicalEncounterSchema);
export const Prescription = models.Prescription || model<IPrescription>("Prescription", PrescriptionSchema);