"use server";

import { connectToDB } from "@/database/db";
import { Organization } from "@/database/models/organization.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

export async function getAllOrganizationsAction(token: string) {
    try {
        const session = await verifyJWTString(token);
        if (!session || !session.ownerOrgId) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDB();

        const currentOrgId = new mongoose.Types.ObjectId(session.ownerOrgId);

        const organizations = await Organization.find({
            _id: { $ne: currentOrgId }
        })
            .select("_id name slug imageUrl clerkOrgId")
            .sort({ name: 1 })
            .lean();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(organizations))
        };
    } catch (error: any) {
        console.error("Failed to fetch organizations:", error);
        return { success: false, error: error.message || "Database fault" };
    }
}
