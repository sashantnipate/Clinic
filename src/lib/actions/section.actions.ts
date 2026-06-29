"use server";

import { connectToDB } from "@/database/db";
import { RegistrationSection } from "@/database/models/registration-section.model";

interface SaveSectionParams {
  id: string;
  ownerOrgId: string; // Directly passing the pre-resolved MongoDB Organization ID string
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "number" | "textarea" | "select";
    required: boolean;
    placeholder?: string;
    defaultValue?: string;
    options?: string[];
  }>;
}

export async function saveRegistrationSection(params: SaveSectionParams) {
  try {
    const { id, ownerOrgId, title, fields } = params;

    // Core structural data validations
    if (!ownerOrgId) {
      return { success: false, error: "Missing required internal MongoDB Organization reference boundary." };
    }

    if (!title.trim() || !fields || !Array.isArray(fields)) {
      return { success: false, error: "Validation failed: Missing title or fields structure." };
    }

    await connectToDB();

    // Direct upsert using only internal database reference keys
    const updatedSection = await RegistrationSection.findOneAndUpdate(
      { id: id, ownerOrgId: ownerOrgId },
      {
        id,
        ownerOrgId: ownerOrgId,
        title: title.trim(),
        fields: fields,
        isActive: true,
      },
      { upsert: true, new: true, lean: true }
    );

    // Convert Mongo document cleanly to standard plain JSON object
    return { 
      success: true, 
      section: JSON.parse(JSON.stringify(updatedSection)) 
    };

  } catch (error: any) {
    console.error("Server Action saveRegistrationSection database fault:", error);
    return { success: false, error: error.message || "An unexpected database synchronization fault occurred." };
  }
}