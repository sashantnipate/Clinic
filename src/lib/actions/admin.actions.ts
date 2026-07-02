"use server";

import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Membership } from "@/database/models/membership.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

interface UpdateStaffAccessParams {
  targetUserId: string;
  departments: string[]; // Array of Department ObjectIds
  visibleTabs: string[];  // Array of sidebar href layout paths
}

export async function updateStaffAccessControl(token: string, params: UpdateStaffAccessParams) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
    const adminUserId = new mongoose.Types.ObjectId(session.userId);

    // Verify that the requester is a certified administrator for this tenant workspace
    const adminMembership = await Membership.findOne({ userId: adminUserId, orgId }).lean();
    if (!adminMembership || (adminMembership.role !== "org:admin" && adminMembership.role !== "admin")) {
      return { success: false, error: "Access Denied: Administrative privileges required." };
    }

    const { targetUserId, departments, visibleTabs } = params;

    // Commit updates directly to the User profile
    const updatedStaff = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(targetUserId) },
      {
        departments: departments.map(id => new mongoose.Types.ObjectId(id)),
        visibleTabs: visibleTabs
      },
      { new: true }
    );

    if (!updatedStaff) return { success: false, error: "Target clinician could not be found." };

    return { success: true };
  } catch (error: any) {
    console.error("Failed to commit access control configurations:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}