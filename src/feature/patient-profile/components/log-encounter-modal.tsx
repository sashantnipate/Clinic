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
import { Plus, Pill, ClipboardList, Clock, Calendar, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEncounterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  selectedParentId: string;
  initialSpecialty?: string;
  initialType?: "one-time" | "followup" | "merge";
  latestTimelineNodes: Array<{ lane: string; nodeId: string; branchName?: string; specialty?: string }>;
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
          <DialogDescription className="text-xs text-muted-foreground">
            {props.selectedParentId ? (
              <span>Continuing trajectory from trace parent segment: <code className="font-mono font-bold text-primary">{props.selectedParentId}</code></span>
            ) : (
              "Initiating a baseline chart tracking matrix block event."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={hook.handleFormSubmit} className="space-y-6 pt-3"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
              e.preventDefault();
            }
          }}
        >
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Treating Clinician</Label>
              <Input value={hook.doctorName} disabled className="bg-muted/50 text-foreground cursor-not-allowed font-medium h-9 text-xs" />
            </div>
            
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Assigned Clinic Department</Label>
              <Select value={hook.specialty} onValueChange={hook.setSpecialty}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Division Location..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General (Default)</SelectItem>
                  {hook.adminDepartments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trajectory Configuration */}
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

          {/* Followup Conditional Inputs Context Grid */}
          {hook.type === "followup" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Branch Track Label Name</Label>
                <Input
                  placeholder="Name your branch sequence..."
                  value={hook.branchName}
                  onChange={(e) => hook.setBranchName(e.target.value)}
                  disabled={!!props.selectedParentId}
                  className="h-9 text-xs disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                  required={false}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Next Follow-up Date
                </Label>
                <Input
                  type="date"
                  value={hook.followupDate}
                  onChange={(e) => hook.setFollowupDate(e.target.value)}
                  className="h-9 text-xs text-foreground"
                  required={false}
                />
              </div>
            </div>
          )}

          {/* Merge Conditional Input Row */}
          {hook.type === "merge" && (
            <div className="grid gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs font-semibold">Branch Track Label Name</Label>
              <Input
                placeholder="Name your branch sequence..."
                value={hook.branchName}
                onChange={(e) => hook.setBranchName(e.target.value)}
                disabled={!!props.selectedParentId}
                className="h-9 text-xs disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                required={false}
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Chief Diagnosis / Complaint</Label>
            <Input placeholder="Optional primary presentation parameters..." value={hook.complaint} onChange={(e) => hook.setComplaint(e.target.value)} required={false} className="h-9 text-xs" />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Clinical Examination Notes</Label>
            <Textarea rows={2} placeholder="Optional treatment observation notes details..." value={hook.notes} onChange={(e) => hook.setNotes(e.target.value)} className="text-xs resize-none" />
          </div>

          {/* Excel Spreadsheet Medication Entry Block */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-primary" /> Pharmaceutical Grid View (Excel Style)
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={hook.handleAddExcelRow} className="h-7 text-xs px-2.5 gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Grid Row
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto shadow-2xs">
              <div className="min-w-[700px] divide-y text-xs">
                <div className="grid grid-cols-12 bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px] py-2 px-3 text-left divide-x border-b">
                  <div className="col-span-4 pl-1">Drug formulation name</div>
                  <div className="col-span-2 pl-2">Quantity Per Int.</div>
                  <div className="col-span-3 pl-2">Time Interval</div>
                  <div className="col-span-2 pl-2">Relation to Food</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y bg-background">
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

          {/* Trailing Macro Instructions Layout Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t pt-4">
            <div className="col-span-12 md:col-span-8 grid gap-1.5">
              <Label className="text-xs font-semibold">Unified Macro Treatment Instructions</Label>
              <Textarea rows={2} placeholder="Applies globally to all lines (e.g. Rest well, avoid heavy foods)..." value={hook.globalInstructions} onChange={(e) => hook.setGlobalInstructions(e.target.value)} className="resize-none text-xs" />
            </div>
            
            <div className="col-span-12 md:col-span-4 grid gap-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Course Timeline Duration</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="e.g. 5, 10" 
                  value={hook.courseDays} 
                  onChange={(e) => hook.setCourseDays(e.target.value)} 
                  className="h-9 text-xs flex-1" 
                  required={false}
                />
                <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg border border-muted">Days Track</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => props.onOpenChange(false)} className="h-9 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={hook.isSaving} size="sm" className="h-9 text-xs font-semibold gap-1.5 px-4">
              {hook.isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Committing Changes...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Encounter Entry
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}