"use server";

import { connectToDB } from "@/database/db";
import { RegistrationSection } from "@/database/models/registration-section.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

interface SaveSectionParams {
  _id?: string;
  title: string;
  isActive?: boolean;
  fields: Array<{
    label: string;
    type: "text" | "number" | "textarea" | "select";
    required: boolean;
    placeholder?: string;
    defaultValue?: string;
    options?: string[];
  }>;
}

export async function saveRegistrationSection(token: string, params: SaveSectionParams) {
  try {
    const { _id, title, fields, isActive } = params;

    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title.trim() || !fields || !Array.isArray(fields)) {
      return { success: false, error: "Validation failed" };
    }

    await connectToDB();

    const currentOrgId = new mongoose.Types.ObjectId(session.ownerOrgId);
    let updatedSection;

    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      const targetId = new mongoose.Types.ObjectId(_id);

      // 1. Authenticate ownership explicitly before running updates
      const existingDoc = await RegistrationSection.findOne({ _id: targetId });

      if (existingDoc && !existingDoc.ownerOrgId.equals(currentOrgId)) {
        return { success: false, error: "Access denied: This section belongs to a different workspace." };
      }

      // 2. Perform a standard update without upsert to bypass the duplicate insert constraint
      const updateData: any = {
        title: title.trim(),
        fields: fields,
      };
      if (isActive !== undefined) updateData.isActive = isActive;

      updatedSection = await RegistrationSection.findOneAndUpdate(
        { _id: targetId, ownerOrgId: currentOrgId },
        updateData,
        { new: true } // Same as returnDocument: 'after'
      );
    } else {
      // 3. Fall through to an intentional creation route if no valid ID exists
      updatedSection = await RegistrationSection.create({
        ownerOrgId: currentOrgId,
        title: title.trim(),
        fields: fields,
        isActive: isActive !== undefined ? isActive : true,
      });
    }

    if (!updatedSection) {
      return { success: false, error: "Target document layout could not be found or processed." };
    }

    return { 
      success: true, 
      section: JSON.parse(JSON.stringify(updatedSection)) 
    };

  } catch (error: any) {
    console.error("Save section error detail:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function getRegistrationSections(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDB();
    
    const sections = await RegistrationSection.find({ 
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId) 
    }).lean();

    return { success: true, sections: JSON.parse(JSON.stringify(sections)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRegistrationSection(token: string, id: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid identifier format" };
    }

    await connectToDB();
    await RegistrationSection.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId) 
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}