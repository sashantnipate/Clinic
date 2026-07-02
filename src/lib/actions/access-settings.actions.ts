"use server";

import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Membership } from "@/database/models/membership.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

async function verifyAdminRoleFromDB(token: string) {
  const session = await verifyJWTString(token);
  if (!session) return null;

  await connectToDB();

  const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
  const userId = new mongoose.Types.ObjectId(session.userId);

  const membership = await Membership.findOne({ 
    orgId, 
    userId, 
    role: { $in: ["admin", "org:admin"] } 
  }).lean();

  if (!membership) return null;

  return { userId, orgId };
}

export async function getOrganizationMembersAction(token: string) {
  try {
    const authContext = await verifyAdminRoleFromDB(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    // 1. Fetch only memberships belonging to this orgId where role is 'org:member'
    const memberRecords = await Membership.find({
      orgId: authContext.orgId,
      role: "org:member"
    }).lean();

    if (memberRecords.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Extract the user IDs from those memberships
    const userIds = memberRecords.map(m => m.userId);

    // 3. Query the User collection directly to pull their identity details and visible tabs matrix
    const users = await User.find({
      _id: { $in: userIds }
    }).sort({ firstName: 1 }).lean();

    const structuralMembers = users.map((u: any) => ({
      _id: u._id.toString(),
      clerkId: u.clerkId || "",
      email: u.email || "",
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      visibleTabs: Array.isArray(u.visibleTabs) ? u.visibleTabs : ["/", "/patients"],
      role: "org:member"
    }));

    return { success: true, data: structuralMembers };
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

    return { 
      success: true, 
      data: {
        _id: updatedUser._id.toString(),
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        visibleTabs: updatedUser.visibleTabs || []
      } 
    };
  } catch (error: any) {
    console.error("Access change execution fault:", error);
    return { success: false, error: error.message || "Database modification failure." };
  }
}