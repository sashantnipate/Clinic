"use server";

import { connectToDB } from "@/database/db";
import { Role } from "@/database/models/role.model";
import { User } from "@/database/models/user.model";
import { Membership } from "@/database/models/membership.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

// Reusable administrative context gatekeeper
async function verifyAdminAccess(token: string) {
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


interface SaveRoleParams {
  id?: string; // Present if modifying an existing role
  name: string;
  description?: string;
  allowedTabs: string[];
  allowedPermissions?: string[];
}

export async function saveRoleAction(token: string, params: SaveRoleParams) {
  try {
    const authContext = await verifyAdminAccess(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const cleanName = params.name.trim();
    if (!cleanName) return { success: false, error: "Role name cannot be blank." };

    let roleDocument;

    if (params.id) {
      // Update existing role layout bounds
      roleDocument = await Role.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id), ownerOrgId: authContext.orgId },
        {
          $set: {
            name: cleanName,
            description: params.description,
            allowedTabs: params.allowedTabs,
            allowedPermissions: params.allowedPermissions || []
          }
        },
        { new: true }
      );
      if (!roleDocument) return { success: false, error: "Target role matrix not found." };
    } else {
      // Prevent structural title duplicate collisions within the same workspace
      const duplicate = await Role.findOne({
        ownerOrgId: authContext.orgId,
        name: { $regex: new RegExp(`^${cleanName}$`, "i") }
      });
      if (duplicate) return { success: false, error: "A role with this configuration name already exists." };

      roleDocument = await Role.create({
        ownerOrgId: authContext.orgId,
        name: cleanName,
        description: params.description,
        allowedTabs: params.allowedTabs,
        allowedPermissions: params.allowedPermissions || []
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(roleDocument)) };
  } catch (error: any) {
    console.error("Save role exception:", error);
    return { success: false, error: error.message || "Database execution failure." };
  }
}


export async function getRolesAction(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized session token." };

    await connectToDB();
    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);

    const roles = await Role.find({ ownerOrgId: orgId }).sort({ name: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(roles)) };
  } catch (error: any) {
    console.error("Fetch roles exception:", error);
    return { success: false, error: error.message || "Extraction breakdown fault." };
  }
}


export async function deleteRoleAction(token: string, roleId: string) {
  try {
    const authContext = await verifyAdminAccess(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative access required." };
    }

    const targetRoleId = new mongoose.Types.ObjectId(roleId);

    // Pull the role off any assigned users to preserve database referential integrity
    await User.updateMany(
      { roleIds: targetRoleId },
      { $pull: { roleIds: targetRoleId } }
    );

    // Delete the configuration document permanently
    await Role.deleteOne({ _id: targetRoleId, ownerOrgId: authContext.orgId });

    return { success: true };
  } catch (error: any) {
    console.error("Delete role execution fault:", error);
    return { success: false, error: error.message || "Deletion sequence crash." };
  }
}


interface SyncUserAccessParams {
  userId: string;       // Explicit incoming string identifier
  roleIds: string[];
  visibleTabs: string[];
  accessMode?: "strict" | "shared" | "global";
  departmentIds?: string[];
}

export async function syncUserAccessAction(token: string, params: SyncUserAccessParams) {
  try {
    const authContext = await verifyAdminAccess(token);
    if (!authContext) {
      return { success: false, error: "Forbidden: Administrative privileges verified failure." };
    }

    // Explicit compilation block mapping parameters to our schema targets
    const updateFields: any = {
      roleIds: params.roleIds.map(id => new mongoose.Types.ObjectId(id)),
      visibleTabs: params.visibleTabs, 
    };

    if (params.accessMode) updateFields.accessMode = params.accessMode;
    
    if (params.departmentIds) {
      updateFields.departmentIds = params.departmentIds.map(id => new mongoose.Types.ObjectId(id));
    }

    const updatedUser = await User.findByIdAndUpdate(
        params.userId,
        { $set: updateFields },
        { 
            returnDocument: 'after',
            runValidators: true,
            new: true // Dual insurance parameter flag
        }
        ).populate({
        path: "roleIds",
        options: { strictPopulate: false }
        });

    if (!updatedUser) return { success: false, error: "Target employee record not found." };

    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    console.error("User privilege synchronization failure:", error);
    return { success: false, error: error.message || "Database write routing crash." };
  }
}