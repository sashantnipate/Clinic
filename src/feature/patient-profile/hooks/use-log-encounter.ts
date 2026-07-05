"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { createClinicalEncounterAction, getPatientClinicalTimeline } from "@/lib/actions/medical-history.actions";
import { getDepartmentsAction } from "@/lib/actions/department.actions";
import { getPharmacyItems } from "@/lib/actions/pharmacy.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface MedicationExcelRow {
  name: string;
  dosageQuantity: string;
  timingInterval: string;
  relationToFood: string;
}

interface UseLogEncounterProps {
  open: boolean;
  patientId: string;
  selectedParentId: string;
  initialSpecialty: string;
  initialType: "one-time" | "followup" | "merge";
  latestTimelineNodes: any[];
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
  const [courseDays, setCourseDays] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchClinicData() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const [deptRes, pharmacyRes] = await Promise.all([
          getDepartmentsAction(token),
          getPharmacyItems(token),
        ]);

        if (deptRes.success && Array.isArray(deptRes.data)) {
          setAdminDepartments(deptRes.data);
        }
        if (pharmacyRes.success && Array.isArray(pharmacyRes.items)) {
          setPharmacyInventory(pharmacyRes.items);
        }
      } catch (err) {
        console.error("Failed to extract active clinic dependencies:", err);
      }
    }
    if (open) fetchClinicData();
  }, [open]);

  const doctorName = useMemo(() => {
    if (!user) return "Fetching active session...";
    return `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim();
  }, [user]);

  const parentNode = useMemo(() => {
    return latestTimelineNodes.find(n => n.nodeId === selectedParentId);
  }, [selectedParentId, latestTimelineNodes]);

  useEffect(() => {
    if (open) {
      setComplaint("");
      setNotes("");
      setMedications([{ name: "", dosageQuantity: "1", timingInterval: "2 times a day", relationToFood: "After Food" }]);
      setGlobalInstructions("");
      setCourseDays("");
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
  }, [open, initialType, selectedParentId, parentNode, initialSpecialty]);

  const handleAddExcelRow = () => {
    setMedications([...medications, { name: "", dosageQuantity: "1", timingInterval: "2 times a day", relationToFood: "After Food" }]);
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
        frequency: `${m.timingInterval} (${m.dosageQuantity} Tab)`,
        duration: courseDays ? `${courseDays} Days` : "As directed",
        instructions: JSON.stringify({
          relationToFood: m.relationToFood,
          globalNotes: globalInstructions.trim() || undefined
        })
      }));

    if (compiledPrescriptions.length === 0) {
      toast.error("You must prescribe at least one valid medication formulation.");
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

      const res = await createClinicalEncounterAction(token, {
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
      });

      if (res.success) {
        toast.success("Encounter record logged successfully.");
        onOpenChange(false);
        router.refresh();
        onSuccess();
      } else {
        toast.error(res.error || "Failed to commit record updates.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network write pipeline exception encountered.");
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
    courseDays, setCourseDays,
    followupDate, setFollowupDate,
    isSaving,
    isUserLoaded,
    handleAddExcelRow,
    handleRemoveExcelRow,
    handleExcelValueChange,
    handleFormSubmit,
  };
}