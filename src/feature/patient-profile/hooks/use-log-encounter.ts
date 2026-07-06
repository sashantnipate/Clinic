"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { createClinicalEncounterAction, updateClinicalEncounterAction, getPrescriptionForEncounterAction } from "@/lib/actions/medical-history.actions";
import { getDoctorAssignedDepartmentsAction } from "@/lib/actions/department.actions";
import { getPharmacyItems } from "@/lib/actions/pharmacy.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface MedicationExcelRow {
  name: string;
  dosageQuantity: string;
  timingInterval: string;
  durationDays: string;
  relationToFood: string;
}

interface UseLogEncounterProps {
  open: boolean;
  patientId: string;
  selectedParentId: string;
  initialSpecialty?: string;
  initialType: "one-time" | "followup" | "merge";
  latestTimelineNodes: any[];
  editableEncounter?: any;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useLogEncounter({
  open,
  patientId,
  selectedParentId,
  initialSpecialty,
  initialType,
  latestTimelineNodes,
  editableEncounter,
  onSuccess,
  onOpenChange,
}: UseLogEncounterProps) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [adminDepartments, setAdminDepartments] = useState<any[]>([]);
  const [pharmacyInventory, setPharmacyInventory] = useState<any[]>([]);
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState(initialType);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [branchName, setBranchName] = useState("");
  const [medications, setMedications] = useState<MedicationExcelRow[]>([]);
  const [globalInstructions, setGlobalInstructions] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchClinicData() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const [deptRes, pharmacyRes] = await Promise.all([
          getDoctorAssignedDepartmentsAction(token),
          getPharmacyItems(token),
        ]);

        if (deptRes.success && Array.isArray(deptRes.data)) {
          setAdminDepartments(deptRes.data);
        }
        if (pharmacyRes.success && Array.isArray(pharmacyRes.items)) {
          setPharmacyInventory(pharmacyRes.items);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (open) fetchClinicData();
  }, [open]);

  const doctorName = useMemo(() => {
    if (!user) return "Active Session Tracking...";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }, [user]);

  const parentNode = useMemo(() => {
    return latestTimelineNodes.find(n => n.nodeId === selectedParentId);
  }, [selectedParentId, latestTimelineNodes]);

  useEffect(() => {
    if (open) {
      if (editableEncounter) {
        setComplaint(editableEncounter.complaint || "");
        setNotes(editableEncounter.notes || "");
        setType(editableEncounter.type);
        setSpecialty(editableEncounter.specialty || "General");
        setBranchName(editableEncounter.branchName || "");
        setFollowupDate(editableEncounter.followupDate || "");

        const fetchMeds = async () => {
          const token = localStorage.getItem("clinic_jwt") || "";
          const encounterId = editableEncounter._id || editableEncounter.id;
          if (encounterId) {
            const res = await getPrescriptionForEncounterAction(token, encounterId);
            if (res.success && res.data && res.data.medications && res.data.medications.length > 0) {
              const parsedMeds: MedicationExcelRow[] = res.data.medications.map((m: any) => {
                let parsedInstructions: any = {};
                try { if (m.instructions) parsedInstructions = JSON.parse(m.instructions); } catch (e) { }

                const freqStr = m.frequency || "";
                let dosage = "";
                let timing = freqStr;
                if (freqStr.includes("(") && freqStr.endsWith(")")) {
                  const parts = freqStr.split("(");
                  timing = parts[0].trim();
                  dosage = parts[1].slice(0, -1).trim();
                }

                if (parsedInstructions.globalNotes) {
                  setGlobalInstructions(parsedInstructions.globalNotes);
                }

                return {
                  name: m.name,
                  dosageQuantity: dosage,
                  timingInterval: timing,
                  durationDays: m.duration || "",
                  relationToFood: parsedInstructions.relationToFood || ""
                };
              });
              setMedications(parsedMeds);
            } else {
              setMedications([{ name: "", dosageQuantity: "", timingInterval: "", durationDays: "", relationToFood: "" }]);
              setGlobalInstructions("");
            }
          }
        };
        fetchMeds();

      } else {
        setComplaint("");
        setNotes("");
        setMedications([{ name: "", dosageQuantity: "", timingInterval: "", durationDays: "", relationToFood: "" }]);
        setGlobalInstructions("");
        setFollowupDate("");

        if (selectedParentId) {
          setType("followup");
          setBranchName(parentNode?.branchName || "Sub-Branch Thread");
          setSpecialty(parentNode?.specialty || "General");
        } else {
          setType(initialType);
          setBranchName("");
          setSpecialty(initialSpecialty);
        }
      }
    }
  }, [open, initialType, selectedParentId, parentNode, initialSpecialty, editableEncounter]);

  const handleAddExcelRow = () => {
    setMedications([...medications, { name: "", dosageQuantity: "", timingInterval: "", durationDays: "", relationToFood: "" }]);
  };

  const handleRemoveExcelRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleExcelValueChange = (index: number, key: keyof MedicationExcelRow, value: any) => {
    setMedications(prev => prev.map((med, i) => i === index ? { ...med, [key]: value } : med));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const compiledPrescriptions = medications
      .filter(m => m.name.trim() !== "")
      .map(m => ({
        name: m.name.trim(),
        frequency: m.dosageQuantity.trim() ? `${m.timingInterval.trim()} (${m.dosageQuantity.trim()})` : m.timingInterval.trim(),
        duration: m.durationDays.trim() || "",
        instructions: JSON.stringify({
          relationToFood: m.relationToFood.trim() || undefined,
          globalNotes: globalInstructions.trim() || undefined
        })
      }));

    if (compiledPrescriptions.length === 0) {
      toast.error("Prescription formulation payload requires at least one entry.");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";

      let calculatedLane: "center-trunk" | "left-branch" | "right-branch" = "center-trunk";
      if (type === "followup" || type === "merge") {
        calculatedLane = ["General", "Cardiology", "Dermatology"].includes(specialty) ? "left-branch" : "right-branch";
      }

      let parents = selectedParentId ? [selectedParentId] : [];
      if (type === "merge") {
        const lastTrunkNode = latestTimelineNodes.find((n) => n.lane === "center-trunk")?.nodeId;
        if (lastTrunkNode && lastTrunkNode !== selectedParentId) {
          parents.push(lastTrunkNode);
        }
      }

      let res;

      const encounterPayload = {
        patientId,
        doctor: doctorName,
        specialty: specialty || "General",
        complaint: complaint.trim() || undefined,
        notes: notes.trim() || undefined,
        type,
        lane: calculatedLane,
        branchName: type !== "one-time" ? (branchName.trim() || undefined) : undefined,
        followupDate: type === "followup" ? followupDate : undefined,
        parents,
        prescriptionRx: compiledPrescriptions,
      };

      if (editableEncounter) {
        res = await updateClinicalEncounterAction(token, editableEncounter._id || editableEncounter.id, encounterPayload);
      } else {
        res = await createClinicalEncounterAction(token, encounterPayload);
      }

      if (res.success) {
        toast.success(editableEncounter ? "Encounter updated successfully." : "Encounter tracked successfully.");
        onOpenChange(false);
        router.refresh();
        onSuccess();
      } else {
        toast.error(res.error || "Failed to persist ledger blocks.");
      }
    } catch {
      toast.error("Internal write exception encountered.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    doctorName,
    adminDepartments,
    pharmacyInventory,
    complaint, setComplaint,
    notes, setNotes,
    type, setType,
    specialty, setSpecialty,
    branchName, setBranchName,
    medications,
    globalInstructions, setGlobalInstructions,
    followupDate, setFollowupDate,
    isSaving,
    isUserLoaded,
    handleAddExcelRow,
    handleRemoveExcelRow,
    handleExcelValueChange,
    handleFormSubmit,
  };
}