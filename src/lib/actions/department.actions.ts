"use server";

import { connectToDB } from "@/database/db";
import { Department } from "@/database/models/department.model";
import { Membership } from "@/database/models/membership.model";
import { User } from "@/database/models/user.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

interface CreateDepartmentParams {
  id?: string;          // Added optional ID parameter to track explicit edits
  name: string;
  treatments: string[];
}

export async function addDepartmentAction(token: string, params: CreateDepartmentParams) {
  try {
    const session = await verifyJWTString(token);
    if (!session) {
      return { success: false, error: "Unauthorized profile signature." };
    }

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
    const userId = new mongoose.Types.ObjectId(session.userId);

    const membership = await Membership.findOne({ userId, orgId }).lean();
    if (!membership || (membership.role !== "org:admin" && membership.role !== "admin")) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const cleanName = params.name.trim();
    if (!cleanName) {
      return { success: false, error: "Department name cannot be blank." };
    }

    const cleanTreatments = params.treatments
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let department;

    if (params.id) {
      department = await Department.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id), ownerOrgId: orgId },
        {
          $set: {
            name: cleanName,
            treatments: cleanTreatments
          }
        },
        { new: true }
      );

      if (!department) {
        return { success: false, error: "Department target not found." };
      }
    } else {
      const exactDuplicate = await Department.findOne({
        ownerOrgId: orgId,
        name: { $regex: new RegExp(`^${cleanName}$`, "i") }
      });

      if (exactDuplicate) {
        return { success: false, error: "A department with this name already exists." };
      }

      // Safe creation block
      department = await Department.create({
        ownerOrgId: orgId,
        name: cleanName,
        treatments: cleanTreatments
      });
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(department))
    };

  } catch (error: any) {
    console.error("Department database operation failure:", error);
    return {
      success: false,
      error: error.code === 11000 ? "Department name collision occurred." : (error.message || "Database execution failure.")
    };
  }
}

export async function getDepartmentsAction(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized signature." };

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);

    const departments = await Department.find({ ownerOrgId: orgId }).sort({ name: 1 }).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(departments))
    };
  } catch (error: any) {
    console.error("Failed to fetch clinic departments:", error);
    return { success: false, error: error.message || "Database execution failure." };
  }
}

export async function getDoctorAssignedDepartmentsAction(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized signature." };

    await connectToDB();
    const userId = new mongoose.Types.ObjectId(session.userId);

    const user = await User.findById(userId)
      .populate({ path: "departments", model: Department })
      .populate({ path: "departmentIds", model: Department })
      .lean();

    if (!user) {
      return { success: false, error: "User profile not found." };
    }

    const assigned = [];
    if (Array.isArray(user.departments)) assigned.push(...user.departments);
    if (Array.isArray(user.departmentIds)) assigned.push(...user.departmentIds);

    // Deduplicate by department _id
    const map = new Map();
    for (const d of assigned) {
      if (d && d._id) {
        map.set(d._id.toString(), d);
      }
    }

    const assignedDepartments = Array.from(map.values());

    return {
      success: true,
      data: JSON.parse(JSON.stringify(assignedDepartments))
    };
  } catch (error: any) {
    console.error("Failed to fetch doctor assigned departments:", error);
    return { success: false, error: error.message || "Database execution failure." };
  }
}