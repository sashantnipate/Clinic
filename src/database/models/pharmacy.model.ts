import { Schema, model, models, Types } from "mongoose";

export interface IPharmacyItem {
  _id: string;
  ownerOrgId: Types.ObjectId;
  name: string;
  stock: number;
  price: number;
  tax: number;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacyItemSchema = new Schema<IPharmacyItem>(
  {
    ownerOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

PharmacyItemSchema.index({ ownerOrgId: 1, name: 1 });

export const PharmacyItem =
  models.PharmacyItem || model<IPharmacyItem>("PharmacyItem", PharmacyItemSchema);
