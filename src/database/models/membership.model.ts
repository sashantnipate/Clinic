import { Schema, model, models, Types } from "mongoose";

export interface IMembership {
  _id: string;
  clerkMembershipId: string;
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    clerkMembershipId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    role: { type: String, required: true }
  },
  { timestamps: true }
);

MembershipSchema.index({ orgId: 1, userId: 1 }, { unique: true });

export const Membership = models.Membership || model<IMembership>("Membership", MembershipSchema);