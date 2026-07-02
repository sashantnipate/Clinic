import { Schema, model, models, Types } from "mongoose";

export interface IDepartment {
  _id: string;
  ownerOrgId: Types.ObjectId; 
  name: string;               
  treatments: string[];       
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
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
    treatments: [
      { type: String, trim: true } 
    ]
  },
  { timestamps: true }
);

DepartmentSchema.index({ ownerOrgId: 1, name: 1 }, { unique: true });

export const Department = models.Department || model<IDepartment>("Department", DepartmentSchema);