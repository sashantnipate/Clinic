import { Schema, model, models, Types } from "mongoose";

export interface IOrganization {
  _id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    clerkOrgId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

export const Organization = models.Organization || model<IOrganization>("Organization", OrganizationSchema);