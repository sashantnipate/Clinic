import { Schema, model, models, Types } from "mongoose";

export interface IPatient {
  _id: string;
  // Relationships
  ownerOrgId: Types.ObjectId;       // The internal DB organization that created this record
  sharedWithOrgs: Types.ObjectId[]; // List of other internal DB orgs granted access

  // Vendor Lock-In Protection (Binds data to Clerk identity but keeps DB structural integrity)
  clerkOwnerOrgId: string;

  // Patient Demographics
  name: string;
  email: string;
  phone: string;
  dob: Date;
  gender: "male" | "female" | "other";
  address?: string;
  customSections: ICustomSection[];
  customData: Record<string, any>;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}


export interface ICustomField {
  id: string;                    // Unique string identifier (e.g., "diet_type")
  label: string;                 // UI input header (e.g., "Preferred Diet Plan")
  type: "text" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];            // Optional dropdown array for "select" type
}

export interface ICustomSection {
  id: string;                    // Unique grouping string (e.g., "sec_lifestyle")
  title: string;                 // Header for the section (e.g., "Lifestyle Custom Profiles")
  fields: ICustomField[];        // Array of inputs inside this section
}

const CustomFieldSchema = new Schema<ICustomField>({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["text", "number", "textarea", "select"],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [
    { type: String }
  ]
});

const CustomSectionSchema = new Schema<ICustomSection>({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fields: [CustomFieldSchema]
});

const PatientSchema = new Schema<IPatient>(
  {
    ownerOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    sharedWithOrgs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Organization"
      }
    ],
    clerkOwnerOrgId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true
    },
    address: {
      type: String
    },
    customSections: [CustomSectionSchema],
    customData: {
      type: Schema.Types.Mixed,
      default: {},
      required: true
    }
  },
  { timestamps: true }
);

// Compound index for super fast queries scoped to a clinic
PatientSchema.index({ ownerOrgId: 1, name: 1 });
PatientSchema.index({ ownerOrgId: 1, email: 1 });
PatientSchema.index({ ownerOrgId: 1, phone: 1 });
PatientSchema.index({ ownerOrgId: 1, createdAt: -1 });

export const Patient = models.Patient || model<IPatient>("Patient", PatientSchema);