"use server";

import { connectToDB } from "@/database/db";
import { ClinicSetting } from "@/database/models/clinic-setting.model";
import { Membership } from "@/database/models/membership.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

interface UpdateClinicParams {
  address: string;
  phone: string;
  timings: Array<{ days: string; open: string; close: string }>;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    website?: string;
  };
}

export async function updateClinicSettingAction(token: string, params: UpdateClinicParams) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized profile signature." };

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
    const userId = new mongoose.Types.ObjectId(session.userId);

    // Enforce strict workspace admin authorization check
    const membership = await Membership.findOne({ userId, orgId }).lean();
    if (!membership || (membership.role !== "org:admin" && membership.role !== "admin")) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const updatedSetting = await ClinicSetting.findOneAndUpdate(
      { ownerOrgId: orgId },
      {
        address: params.address,
        phone: params.phone,
        timings: params.timings,
        socialLinks: params.socialLinks,
      },
      { new: true, upsert: true }
    );

    return { success: true, data: JSON.parse(JSON.stringify(updatedSetting)) };
  } catch (error: any) {
    console.error("Clinic settings execution fault:", error);
    return { success: false, error: error.message || "Database update execution failure." };
  }
}

export async function getClinicSettingAction(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized signature." };

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);

    // Find settings or return fallback defaults if it doesn't exist yet
    const clinicSetting = await ClinicSetting.findOne({ ownerOrgId: orgId }).lean();

    return {
      success: true,
      data: clinicSetting ? JSON.parse(JSON.stringify(clinicSetting)) : null
    };
  } catch (error: any) {
    console.error("Failed to fetch clinic settings:", error);
    return { success: false, error: error.message || "Database execution failure." };
  }
}