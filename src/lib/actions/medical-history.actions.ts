"use server";

import { connectToDB } from "@/database/db";
import { MedicalEncounter, Prescription } from "@/database/models/medical-history.model";
import { verifyJWTString } from "./auth.actions";
import mongoose from "mongoose";

export async function getPatientClinicalTimeline(token: string, patientId: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDB();

    const encounters = await MedicalEncounter.find({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      patientId: new mongoose.Types.ObjectId(patientId)
    }).sort({ createdAt: -1 }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(encounters)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

interface LogEncounterParams {
  patientId: string;
  doctor: string;
  specialty: string;
  complaint: string;
  notes: string;
  type: "one-time" | "followup" | "merge";
  lane: "center-trunk" | "left-branch" | "right-branch";
  parents: string[];
  prescriptionRx?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
}

export async function createClinicalEncounterAction(token: string, params: LogEncounterParams) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDB();
    const now = new Date();

    const newEncounter = await MedicalEncounter.create({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      patientId: new mongoose.Types.ObjectId(params.patientId),
      nodeId: `n-${Math.random().toString(36).substring(2, 9)}`,
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      doctor: params.doctor,
      specialty: params.specialty,
      complaint: params.complaint,
      notes: params.notes,
      type: params.type,
      lane: params.lane,
      parents: params.parents
    });

    // If medications are logged inside this modal, insert the script context automatically
    if (params.prescriptionRx && params.prescriptionRx.length > 0) {
      await Prescription.create({
        patientId: new mongoose.Types.ObjectId(params.patientId),
        encounterId: newEncounter._id,
        prescribedBy: params.doctor,
        medications: params.prescriptionRx,
        status: "active"
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(newEncounter)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fillPrescriptionAction(token: string, rxId: string, payload: { pharmacist: string; quantity: number; notes?: string }) {
  try {
    const session = await verifyJWTString(token);
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDB();

    const rx = await Prescription.findByIdAndUpdate(
      rxId,
      {
        $set: { status: "filled" },
        $push: {
          fulfillmentHistory: {
            dispensedAt: new Date(),
            dispensedBy: payload.pharmacist,
            quantityDispensed: payload.quantity,
            status: "completed",
            notes: payload.notes
          }
        }
      },
      { new: true }
    );

    return { success: true, data: JSON.parse(JSON.stringify(rx)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}