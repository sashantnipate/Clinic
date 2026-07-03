import { Schema, Types, model, models } from "mongoose";

export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  password?: string | null;
  authProvider: 'google' | 'credentials';
  departments: Types.ObjectId[];
  visibleTabs: string[];
  customPermissions: string[];
  
  roleIds: Types.ObjectId[]; 
  departmentIds: Types.ObjectId[];
  accessMode: "strict" | "shared" | "global";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    password: { type: String, default: null },
    authProvider: { 
      type: String, 
      enum: ['google', 'credentials'], 
      default: 'google' 
    },
    departments: [
      { type: Schema.Types.ObjectId, ref: "Department" } //  Links back to the structural settings
    ],
    visibleTabs: [
      { type: String, default: ["/", "/patients"] } // Core fallback defaults
    ],
    customPermissions: [
      { type: String, default: [] }
    ],
    
    // Multi-role collection pointer matrix targets
    roleIds: [
      { type: Schema.Types.ObjectId, ref: "Role", default: [] }
    ],
    departmentIds: [
      { type: Schema.Types.ObjectId, ref: "Department", default: [] }
    ],
    accessMode: {
      type: String,
      enum: ["strict", "shared", "global"],
      default: "strict"
    }
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);