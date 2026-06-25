// src/models/User.ts
import { Schema, model, models } from "mongoose";

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
    }
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);