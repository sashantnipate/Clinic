import { describe, it, expect, vi, beforeEach } from "vitest";
import { deletePatientRecord } from "@/lib/actions/patient.actions";
import { Patient } from "@/database/models/patient.model";
import { MedicalEncounter, Prescription } from "@/database/models/medical-history.model";
import mongoose from "mongoose";

// Mock dependencies to prevent real DB queries during execution
vi.mock("@/database/db", () => ({
    connectToDB: vi.fn(),
}));

vi.mock("@/lib/actions/auth.actions", () => ({
    verifyJWTString: vi.fn(),
}));

// Provide mocked functions for mongoose models
vi.mock("@/database/models/patient.model", () => ({
    Patient: {
        deleteOne: vi.fn(),
    },
}));

vi.mock("@/database/models/medical-history.model", () => ({
    MedicalEncounter: {
        deleteMany: vi.fn(),
    },
    Prescription: {
        deleteMany: vi.fn(),
    },
}));

describe("Patient Actions - deletePatientRecord with cascading updates", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should cascade delete patient, medical encounters, and prescriptions successfully", async () => {
        // 1. Setup Auth Session Mock
        const authActions = await import("@/lib/actions/auth.actions");
        const mockSession = { ownerOrgId: new mongoose.Types.ObjectId().toString() };
        (authActions.verifyJWTString as any).mockResolvedValue(mockSession);

        // 2. Setup Successful Database Action Mocks
        (Patient.deleteOne as any).mockResolvedValue({ deletedCount: 1 });
        (MedicalEncounter.deleteMany as any).mockResolvedValue({ deletedCount: 5 });
        (Prescription.deleteMany as any).mockResolvedValue({ deletedCount: 2 });

        const patientId = new mongoose.Types.ObjectId().toString();
        const result = await deletePatientRecord("dummy-token", patientId);

        // 3. Assert Response Success Map
        expect(result).toEqual({ success: true });

        // 4. Assert Initial Patient deletion executes targeting specific properties
        expect(Patient.deleteOne).toHaveBeenCalledWith({
            _id: new mongoose.Types.ObjectId(patientId),
            ownerOrgId: new mongoose.Types.ObjectId(mockSession.ownerOrgId)
        });

        // 5. Assert Cascade Delete for dependencies
        expect(MedicalEncounter.deleteMany).toHaveBeenCalledWith({
            ownerOrgId: new mongoose.Types.ObjectId(mockSession.ownerOrgId),
            patientId: new mongoose.Types.ObjectId(patientId)
        });

        expect(Prescription.deleteMany).toHaveBeenCalledWith({
            patientId: new mongoose.Types.ObjectId(patientId)
        });
    });

    it("should fail gracefully if unauthorized and skip cascading deletion", async () => {
        // 1. Setup Invalid Auth Session
        const authActions = await import("@/lib/actions/auth.actions");
        (authActions.verifyJWTString as any).mockResolvedValue(null);

        const result = await deletePatientRecord("invalid-token", new mongoose.Types.ObjectId().toString());

        // 2. Check early-returning error struct
        expect(result).toEqual({ success: false, error: "Unauthorized" });

        // 3. Guarantee deletion endpoints are completely untouched
        expect(Patient.deleteOne).not.toHaveBeenCalled();
        expect(MedicalEncounter.deleteMany).not.toHaveBeenCalled();
    });
});
