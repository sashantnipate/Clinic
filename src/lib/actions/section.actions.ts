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

    const targetObjectId = mongoose.Types.ObjectId.isValid(_id || "") 
      ? new mongoose.Types.ObjectId(_id) 
      : new mongoose.Types.ObjectId();

    const updateData: any = {
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      title: title.trim(),
      fields: fields,
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedSection = await RegistrationSection.findOneAndUpdate(
      { _id: targetObjectId, ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId) },
      updateData,
      { upsert: true, new: true }
    );

    return { 
      success: true, 
      section: JSON.parse(JSON.stringify(updatedSection)) 
    };

  } catch (error: any) {
    console.error(error);
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