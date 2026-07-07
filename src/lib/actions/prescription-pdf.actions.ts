"use server";

import { connectToDB } from "@/database/db";
import { ClinicSetting } from "@/database/models/clinic-setting.model";
import { MedicalEncounter, Prescription } from "@/database/models/medical-history.model";
import { Organization } from "@/database/models/organization.model";
import { Patient } from "@/database/models/patient.model";
import { User } from "@/database/models/user.model";
import type { PrescriptionPdfPayload } from "@/feature/prescription-pdf/types";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

interface ClinicTimingPayload {
  days: string;
  open: string;
  close: string;
}

function buildAgeText(dob?: Date | string) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
  }

  return years >= 0 ? `${years} years` : "";
}

export async function getPrescriptionPdfPayloadAction(
  token: string,
  params: { patientId: string; encounterId: string }
): Promise<{ success: true; data: PrescriptionPdfPayload } | { success: false; error: string }> {
  try {
    const session = await verifyJWTString(token);
    if (!session?.ownerOrgId || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(params.patientId) || !mongoose.Types.ObjectId.isValid(params.encounterId)) {
      return { success: false, error: "Invalid patient or encounter ID." };
    }

    await connectToDB();

    const orgId = new mongoose.Types.ObjectId(session.ownerOrgId);
    const patientObjectId = new mongoose.Types.ObjectId(params.patientId);
    const encounterObjectId = new mongoose.Types.ObjectId(params.encounterId);

    const patient = await Patient.findOne({
      _id: patientObjectId,
      $or: [{ ownerOrgId: orgId }, { sharedWithOrgs: orgId }],
    }).lean();

    if (!patient) {
      return { success: false, error: "Patient record not found or access denied." };
    }

    const encounter = await MedicalEncounter.findOne({
      _id: encounterObjectId,
      patientId: patientObjectId,
      ownerOrgId: orgId,
    }).lean();

    if (!encounter) {
      return { success: false, error: "Encounter record not found or access denied." };
    }

    const [organization, clinicSetting, prescription, user] = await Promise.all([
      Organization.findById(orgId).lean(),
      ClinicSetting.findOne({ ownerOrgId: orgId }).lean(),
      Prescription.findOne({ patientId: patientObjectId, encounterId: encounterObjectId }).lean(),
      User.findById(new mongoose.Types.ObjectId(session.userId)).lean(),
    ]);

    const payload: PrescriptionPdfPayload = {
      clinic: {
        name: organization?.name || "Clinic Workspace",
        logoUrl: organization?.imageUrl || undefined,
        address: clinicSetting?.address || undefined,
        phone: clinicSetting?.phone || undefined,
        timings: clinicSetting?.timings
          ? (clinicSetting.timings as ClinicTimingPayload[]).map((timing) => ({
            days: timing.days,
            open: timing.open,
            close: timing.close,
          }))
          : [],
        socialLinks: clinicSetting?.socialLinks || undefined,
        defaultPdfSettings: clinicSetting?.prescriptionPdfSettings || undefined,
      },
      patient: {
        name: patient.name,
        dob: patient.dob ? new Date(patient.dob).toISOString() : undefined,
        ageText: buildAgeText(patient.dob),
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address || undefined,
      },
      encounter: {
        id: encounter._id.toString(),
        date: encounter.date,
        time: encounter.time,
        doctor: encounter.doctor || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown Doctor",
        specialty: encounter.specialty || "General",
        complaint: encounter.complaint || undefined,
        notes: encounter.notes || undefined,
        followupDate: encounter.followupDate || undefined,
      },
      prescription: {
        id: prescription?._id?.toString(),
        medications: prescription?.medications
          ? prescription.medications.map((medication) => ({
            name: medication.name,
            frequency: medication.frequency,
            duration: medication.duration,
            instructions: medication.instructions,
          }))
          : [],
      },
    };

    return { success: true, data: JSON.parse(JSON.stringify(payload)) };
  } catch (error: unknown) {
    console.error("Prescription PDF payload fetch failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to prepare prescription PDF." };
  }
}
