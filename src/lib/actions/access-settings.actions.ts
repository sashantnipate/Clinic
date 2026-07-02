"use server";

import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

async function verifyAdminRoleFromDB(token: string) {
  const session = await verifyJWTString(token);
  if (!session) return null;

  await connectToDB();

  const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
  const userId = new mongoose.Types.ObjectId(session.userId);

  const org = await Organization.findOne({ _id: orgId, ownerId: userId }).lean();
  if (!org) return null;

  return { userId, orgId };
}

export async function getOrganizationMembersAction(token: string) {
  try {
    const authContext = await verifyAdminRoleFromDB(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const members = await User.find({}).sort({ firstName: 1 }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(members)) };
  } catch (error: any) {
    console.error("Fetch members fault:", error);
    return { success: false, error: error.message || "Database extraction failure." };
  }
}

interface UpdateMemberAccessParams {
  userId: string; 
  visibleTabs: string[];
}

export async function updateMemberAccessAction(token: string, params: UpdateMemberAccessParams) {
  try {
    const authContext = await verifyAdminRoleFromDB(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.userId,
      { $set: { visibleTabs: params.visibleTabs } },
      { new: true }
    );

    if (!updatedUser) return { success: false, error: "Target user profile not found." };

    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    console.error("Access change execution fault:", error);
    return { success: false, error: error.message || "Database modification failure." };
  }
}