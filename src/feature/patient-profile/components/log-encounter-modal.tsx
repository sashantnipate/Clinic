"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClinicalEncounterAction } from "@/lib/actions/medical-history.actions";
import { toast } from "sonner";

interface LogEncounterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  selectedParentId: string;
  initialSpecialty?: string;
  initialType?: "one-time" | "followup" | "merge";
  latestTimelineNodes: Array<{ lane: string; nodeId: string }>;
  onSuccess: () => void;
  containerRef?: HTMLElement | null;
}

export function LogEncounterModal({
  open,
  onOpenChange,
  patientId,
  selectedParentId,
  initialSpecialty = "General",
  initialType = "one-time",
  latestTimelineNodes,
  onSuccess,
  containerRef,
}: LogEncounterModalProps) {
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState(initialType);
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal form states with preset context when opened from parent triggers
  useEffect(() => {
    if (open) {
      setSpecialty(initialSpecialty);
      setType(initialType);
      setDoctor("");
      setComplaint("");
      setNotes("");
    }
  }, [open, initialSpecialty, initialType]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !complaint || isSaving) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";

      // FIX: Both follow-up and merge nodes belong to the branch track they originate from or terminate
      let calculatedLane: "center-trunk" | "left-branch" | "right-branch" = "center-trunk";
      if (type === "followup" || type === "merge") {
        calculatedLane =
          specialty === "General" || specialty === "Cardiology" || specialty === "Dermatology"
            ? "left-branch"
            : "right-branch";
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
        doctor,
        specialty,
        complaint,
        notes,
        type,
        lane: calculatedLane,
        parents,
        prescriptionRx: [], // Can be populated if medication extensions are added later
      });

      if (res.success) {
        toast.success("Encounter file saved securely.");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error || "Failed to commit record updates.");
      }
    } catch {
      toast.error("Network interface connection failure.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" container={containerRef || undefined}>
        <DialogHeader>
          <DialogTitle>Append Medical Note & Script</DialogTitle>
          <DialogDescription>
            Originating baseline parent context node link ID:{" "}
            <span className="font-mono font-bold text-primary">{selectedParentId || "None"}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Doctor Name</Label>
              <Input
                required
                placeholder="Dr. Name"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Encounter Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One Time Visit (Trunk)</SelectItem>
                <SelectItem value="followup">Follow-up Needed (Branch)</SelectItem>
                <SelectItem value="merge">Complete Treatment (Merge)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Diagnosis / Complaint</Label>
            <Input
              required
              placeholder="Evaluation parameters..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              rows={2}
              placeholder="Observations description context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSaving} className="w-full text-xs font-semibold h-9">
              {isSaving ? "Persisting Assets..." : "Save Clinical Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}