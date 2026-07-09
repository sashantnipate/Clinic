"use server";

import { connectToDB } from "@/database/db";
import { Patient } from "@/database/models/patient.model";
import { MedicalEncounter, Prescription } from "@/database/models/medical-history.model";
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

export async function getPatients(token: string, params: any = {}) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDB();

    const currentOrgObjectId = new mongoose.Types.ObjectId(session.ownerOrgId);

    const {
      page = 1,
      limit = 10,
      globalSearch = "",
      nameFilter = "",
      genderFilter = "all",
      ageCondition = "none",
      ageValue = "",
      contactFilter = "",
      regDateFilter = "",
      sortOrder = null,
    } = params;

    const query: any = {
      $or: [
        { ownerOrgId: currentOrgObjectId },
        { sharedWithOrgs: currentOrgObjectId }
      ]
    };

    const filters: any[] = [];

    if (globalSearch) {
      filters.push({
        $or: [
          { name: { $regex: globalSearch, $options: "i" } },
          { email: { $regex: globalSearch, $options: "i" } },
          { phone: { $regex: globalSearch, $options: "i" } },
        ]
      });
    }

    if (nameFilter) {
      filters.push({ name: { $regex: nameFilter, $options: "i" } });
    }

    if (genderFilter && genderFilter !== "all") {
      filters.push({ gender: genderFilter.toLowerCase() });
    }

    if (contactFilter) {
      filters.push({
        $or: [
          { email: { $regex: contactFilter, $options: "i" } },
          { phone: { $regex: contactFilter, $options: "i" } }
        ]
      });
    }

    if (regDateFilter) {
      const parts = regDateFilter.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const startOfDay = new Date(year, month, day);
          const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
          filters.push({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          });
        }
      }
    }

    if (ageCondition !== "none" && ageValue) {
      const targetAge = parseInt(ageValue, 10);
      if (!isNaN(targetAge)) {
        const todayYear = new Date().getFullYear();
        const targetYear = todayYear - targetAge;

        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

        if (ageCondition === "eq") {
          filters.push({ dob: { $gte: startOfYear, $lte: endOfYear } });
        } else if (ageCondition === "gt") {
          filters.push({ dob: { $lt: startOfYear } });
        } else if (ageCondition === "lt") {
          filters.push({ dob: { $gt: endOfYear } });
        }
      }
    }

    if (filters.length > 0) {
      query.$and = filters;
    }

    const sortOpt: any = {};
    if (sortOrder) {
      sortOpt.name = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOpt.createdAt = -1;
    }

    const skipIndex = (page - 1) * limit;

    const [patients, totalRecords] = await Promise.all([
      Patient.find(query).populate("sharedWithOrgs", "_id name slug imageUrl").sort(sortOpt).skip(skipIndex).limit(limit).lean(),
      Patient.countDocuments(query)
    ]);

    const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

    return {
      success: true,
      patients: JSON.parse(JSON.stringify(patients)),
      totalRecords,
      totalPages
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

    // Cascade delete related records
    await MedicalEncounter.deleteMany({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      patientId: new mongoose.Types.ObjectId(id)
    });
    await Prescription.deleteMany({
      patientId: new mongoose.Types.ObjectId(id)
    });

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
