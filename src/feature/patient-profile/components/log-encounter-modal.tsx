"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLogEncounter } from "../hooks/use-log-encounter";
import { MedicationExcelRow } from "./medication-excel-row";
import { Plus, Pill, ClipboardList, Calendar, Save, Loader2 } from "lucide-react";

interface LogEncounterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  selectedParentId: string;
  initialSpecialty?: string;
  initialType?: "one-time" | "followup" | "merge";
  latestTimelineNodes: any[];
  onSuccess: () => void;
  containerRef?: HTMLElement | null;
}

export function LogEncounterModal(props: LogEncounterModalProps) {
  const hook = useLogEncounter(props);

  if (!hook.isUserLoaded) return null;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-[96vw] md:max-w-5xl max-h-[94vh] overflow-y-auto p-6" container={props.containerRef || undefined}>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Log Clinical Case Encounter
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            {props.selectedParentId ? (
              <span>Continuing history node tracking from parent record trace: <code>{props.selectedParentId}</code></span>
            ) : (
              "Initiating baseline clinical ledger assessment entry block tracker."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={hook.handleFormSubmit} className="space-y-6 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-stone-500">Treating Clinician</Label>
              <Input value={hook.doctorName} disabled className="bg-stone-50 text-stone-700 cursor-not-allowed font-medium h-9 text-xs" />
            </div>
            
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Assigned Clinic Department</Label>
              <Select value={hook.specialty} onValueChange={hook.setSpecialty}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Division..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General (Default)</SelectItem>
                  {hook.adminDepartments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Encounter Track Type</Label>
            <Select value={hook.type} onValueChange={(v: any) => hook.setType(v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!props.selectedParentId && <SelectItem value="one-time">One Time Consultation (Main Trunk Line)</SelectItem>}
                <SelectItem value="followup">Follow-up / Split Route (Branch Track)</SelectItem>
                {!!props.selectedParentId && <SelectItem value="merge">Resolve & Close Split Sequence (Merge Back)</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {hook.type === "followup" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Branch Track Label Name</Label>
                <Input placeholder="" value={hook.branchName} onChange={(e) => hook.setBranchName(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" /> Next Follow-up Date
                </Label>
                <Input type="date" value={hook.followupDate} onChange={(e) => hook.setFollowupDate(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Chief Diagnosis / Complaint</Label>
            <Input placeholder="" value={hook.complaint} onChange={(e) => hook.setComplaint(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Clinical Examination Notes</Label>
            <Textarea rows={2} placeholder="" value={hook.notes} onChange={(e) => hook.setNotes(e.target.value)} className="text-xs resize-none" />
          </div>

          {/* Clean Spreadsheet Grid Section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-primary" /> Pharmaceutical Grid View (Excel Style)
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={hook.handleAddExcelRow} className="h-8 text-xs px-3 gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Grid Row
              </Button>
            </div>

            <div className="border border-stone-200 rounded-xl bg-white shadow-2xs overflow-visible">
              <div className="min-w-[760px] text-xs">
                <div className="grid grid-cols-12 bg-stone-50/70 font-bold uppercase tracking-wider text-stone-400 text-[10px] py-2.5 px-4 text-left divide-x divide-stone-100 border-b border-stone-200">
                  <div className="col-span-4 pl-1">Drug formulation name</div>
                  <div className="col-span-2 pl-3">Quantity / Vol</div>
                  <div className="col-span-2 pl-3">Time Interval</div>
                  <div className="col-span-2 pl-3">Duration</div>
                  <div className="col-span-1 pl-3">Food</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-stone-100 bg-white overflow-visible">
                  {hook.medications.map((med, idx) => (
                    <MedicationExcelRow
                      key={idx}
                      med={med}
                      idx={idx}
                      pharmacyInventory={hook.pharmacyInventory}
                      onValueChange={hook.handleExcelValueChange}
                      onRemove={hook.handleRemoveExcelRow}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Global Area */}
          <div className="grid grid-cols-1 gap-4 border-t pt-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Unified Macro Treatment Instructions</Label>
              <Textarea rows={2} placeholder="" value={hook.globalInstructions} onChange={(e) => hook.setGlobalInstructions(e.target.value)} className="resize-none text-xs" />
            </div>
          </div>

          <DialogFooter className="border-t pt-4 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => props.onOpenChange(false)} className="h-9 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={hook.isSaving} size="sm" className="h-9 text-xs font-semibold gap-1.5 px-4 shadow-xs">
              {hook.isSaving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing Record...</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Save Encounter Entry</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}