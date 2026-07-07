"use server";

import { connectToDB } from "@/database/db";
import { Patient } from "@/database/models/patient.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";
import { Organization } from "@/database/models/organization.model";

export async function createPatientRecord(token: string, patientData: any) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDB();

    const newPatient = await Patient.create({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      clerkOwnerOrgId: session.ownerOrgId,
      ...patientData
    });

    return {
      success: true,
      patient: JSON.parse(JSON.stringify(newPatient))
    };
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function getPatients(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDB();

    const currentOrgObjectId = new mongoose.Types.ObjectId(session.ownerOrgId);

    const patients = await Patient.find({
      $or: [
        { ownerOrgId: currentOrgObjectId },
        { sharedWithOrgs: currentOrgObjectId }
      ]
    }).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      patients: JSON.parse(JSON.stringify(patients))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePatientRecord(token: string, id: string, patientData: any) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDB();

    const updatedPatient = await Patient.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId)
      },
      { ...patientData },
      { new: true }
    );

    if (!updatedPatient) {
      return { success: false, error: "Patient not found or access denied." };
    }

    return {
      success: true,
      patient: JSON.parse(JSON.stringify(updatedPatient))
    };
  } catch (error: any) {
    console.error("Failed to update patient:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function deletePatientRecord(token: string, id: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid patient ID format" };
    }

    await connectToDB();

    const result = await Patient.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId)
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Patient not found or unauthorized to delete." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete patient:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function getPatientById(token: string, id: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid patient record ID format" };
    }

    await connectToDB();

    const currentOrgObjectId = new mongoose.Types.ObjectId(session.ownerOrgId);

    // Enforce multi-tenant access restriction boundaries matrix
    const patient = await Patient.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [
        { ownerOrgId: currentOrgObjectId },
        { sharedWithOrgs: currentOrgObjectId } // Checks if organization ID exists in the shared array
      ]
    }).populate("sharedWithOrgs", "_id name slug imageUrl").lean();

    if (!patient) {
      return { success: false, error: "Patient record not found or access denied" };
    }

    return {
      success: true,
      patient: JSON.parse(JSON.stringify(patient)),
    };
  } catch (error: any) {
    console.error("Failed to fetch patient detail logs:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function updatePatientSharingStatus(token: string, patientId: string, sharedWithOrgsIds: string[]) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return { success: false, error: "Invalid patient ID format" };
    }

    await connectToDB();

    const updatedPatient = await Patient.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(patientId),
        ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId)
      },
      {
        sharedWithOrgs: sharedWithOrgsIds.map(id => new mongoose.Types.ObjectId(id))
      },
      { new: true }
    ).lean();

    if (!updatedPatient) {
      return { success: false, error: "Patient not found or you are not the owner of this record." };
    }

    return {
      success: true,
      patient: JSON.parse(JSON.stringify(updatedPatient))
    };
  } catch (error: any) {
    console.error("Failed to update patient sharing status:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}
