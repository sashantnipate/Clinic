import { Schema, model, models, Types } from "mongoose";

export interface IRole {
  _id: string;
  ownerOrgId: Types.ObjectId; // Scoped tightly to the clinic organization workspace
  name: string;               // e.g., "Doctor", "Receptionist", "Billing Specialist"
  description?: string;
  allowedTabs: string[];      // Array of side-nav paths (e.g., ["/", "/patients", "/forms"])
  allowedPermissions: string[]; // Functional action tags (e.g., ["patients.read"])
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    ownerOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    allowedTabs: [
      { type: String, default: [] } // Standard array holding default paths for this archetype
    ],
    allowedPermissions: [
      { type: String, default: [] }
    ]
  },
  { timestamps: true }
);

// Lock names down locally per organization workspace to prevent workspace duplicate clashes
RoleSchema.index({ ownerOrgId: 1, name: 1 }, { unique: true });

export const Role = models.Role || model<IRole>("Role", RoleSchema);