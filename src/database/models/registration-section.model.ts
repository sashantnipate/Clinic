import { Schema, model, models, Types } from "mongoose";

export interface IRegistrationField {
  label: string;
  type: "text" | "number" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
}

export interface IRegistrationSection {
  _id: Types.ObjectId; 
  ownerOrgId: Types.ObjectId; 
  title: string;
  fields: IRegistrationField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationFieldSchema = new Schema<IRegistrationField>({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "number", "textarea", "select"],
    required: true,
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  defaultValue: { type: String, default: "" },
  options: [{ type: String }],
});

const RegistrationSectionSchema = new Schema<IRegistrationSection>(
  {
    ownerOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fields: [RegistrationFieldSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

RegistrationSectionSchema.index({ ownerOrgId: 1, isActive: 1, createdAt: -1 });

export const RegistrationSection =
  models.RegistrationSection ||
  model<IRegistrationSection>("RegistrationSection", RegistrationSectionSchema);