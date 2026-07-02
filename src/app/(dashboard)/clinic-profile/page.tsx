"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateClinicSettingAction, getClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { addDepartmentAction, getDepartmentsAction } from "@/lib/actions/department.actions";
import { Building2, Plus, Trash2, Layers, FolderPlus, Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface DepartmentData {
  _id?: string; 
  name: string;
  treatments: string[];
}

export default function ClinicProfilePage() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timings, setTimings] = useState([{ days: "", open: "", close: "" }]);
  const [depts, setDepts] = useState<DepartmentData[]>([]);
  
  const [newDeptName, setNewDeptName] = useState("");
  const [newTreatmentsRaw, setNewTreatmentsRaw] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadClinicMetadata() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        
        const [settingsRes, deptsRes] = await Promise.all([
          getClinicSettingAction(token),
          getDepartmentsAction(token)
        ]);

        if (settingsRes.success && settingsRes.data) {
          setAddress(settingsRes.data.address || "");
          setPhone(settingsRes.data.phone || "");
          if (settingsRes.data.timings?.length > 0) {
            setTimings(settingsRes.data.timings);
          }
        }
        
        if (deptsRes.success && deptsRes.data) {
          setDepts(deptsRes.data); // Hydrates correct _id fields cleanly
        }
      } catch (err) {
        toast.error("Failed to fetch operational profile records.");
      } finally {
        setIsLoading(false);
      }
    }
    loadClinicMetadata();
  }, []);

  const handleAddTimingRow = () => {
    setTimings([...timings, { days: "", open: "", close: "" }]);
  };

  const handleRemoveTimingRow = (index: number) => {
    setTimings(timings.filter((_, i) => i !== index));
  };

  const handleUpdateTiming = (index: number, key: string, value: string) => {
    setTimings(prev => prev.map((t, i) => i === index ? { ...t, [key]: value } : t));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await updateClinicSettingAction(token, { address, phone, timings });
      if (res.success) {
        toast.success("Clinic details updated successfully.");
      } else {
        toast.error(res.error || "Failed to commit changes.");
      }
    } catch (err) {
      toast.error("An error occurred while saving profile metrics.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingIndex(null);
    setNewDeptName("");
    setNewTreatmentsRaw("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(index);
    setNewDeptName(depts[index].name);
    setNewTreatmentsRaw(depts[index].treatments.join(", "));
    setModalOpen(true);
  };

  const handleProcessDepartmentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const parsedTreatments = newTreatmentsRaw
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      
      // Target correct record context using exact array references
      const targetId = editingIndex !== null ? depts[editingIndex]._id : undefined;

      const res = await addDepartmentAction(token, {
        id: targetId,
        name: newDeptName.trim(),
        treatments: parsedTreatments
      });

      if (res.success && res.data) {
        if (editingIndex !== null) {
          // Mutate the local view array inline, retaining its generated properties
          setDepts(prev => prev.map((item, i) => i === editingIndex ? res.data : item));
          toast.success("Department modified successfully.");
        } else {
          setDepts([...depts, res.data]);
          toast.success("Department added successfully.");
        }
        setNewDeptName("");
        setNewTreatmentsRaw("");
        setModalOpen(false);
      } else {
        toast.error(res.error || "Failed to update database record.");
      }
    } catch (err) {
      toast.error("Network communication fault detected.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium">Hydrating clinic settings metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 text-foreground antialiased pb-12">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Clinic Base Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure public registration metadata, location information, and operating timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Contact Phone Number</Label>
            <Input value={phone} placeholder="Enter clinic line..." onChange={(e) => setPhone(e.target.value)} className="h-9" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Clinic Physical Address</Label>
            <Input value={address} placeholder="Enter location..." onChange={(e) => setAddress(e.target.value)} className="h-9" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operating Operational Windows</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTimingRow} className="h-8 text-xs gap-1">
              <Plus className="h-3 w-3" /> Add Range
            </Button>
          </div>
          
          <div className="space-y-2">
            {timings.map((time, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 border p-3 rounded-lg bg-muted/20">
                <Input 
                  placeholder="Days (e.g. Mon - Fri)" 
                  value={time.days} 
                  onChange={(e) => handleUpdateTiming(idx, "days", e.target.value)}
                  className="h-9 bg-background"
                />
                <div className="grid grid-cols-2 gap-2 w-full sm:w-64">
                  <Input 
                    placeholder="Open" 
                    value={time.open} 
                    onChange={(e) => handleUpdateTiming(idx, "open", e.target.value)}
                    className="h-9 bg-background"
                  />
                  <Input 
                    placeholder="Close" 
                    value={time.close} 
                    onChange={(e) => handleUpdateTiming(idx, "close", e.target.value)}
                    className="h-9 bg-background"
                  />
                </div>
                {timings.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimingRow(idx)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end border-b pb-6">
          <Button size="sm" onClick={handleSaveProfile} disabled={isSaving} className="h-8 text-xs font-semibold">
            {isSaving ? "Saving..." : "Save Profile Details"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Layers className="h-5 w-5" /> Master Departments & Treatments
            </h2>
            <p className="text-sm text-muted-foreground">
              Provision clinic functional units and view their respective procedure menus.
            </p>
          </div>

          <Button size="sm" onClick={handleOpenCreateModal} className="h-8 text-xs gap-1">
            <FolderPlus className="h-4 w-4" /> Add Department
          </Button>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingIndex !== null ? "Edit Department Scope" : "Provision Department"}</DialogTitle>
              <DialogDescription>
                {editingIndex !== null ? "Modify this structural cluster and scale internal workflow treatments definitions safely." : "Add a new clinic department unit alongside its treatments."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProcessDepartmentForm} className="space-y-4 pt-2">
              <div className="grid gap-1.5">
                <Label htmlFor="dept-name-input" className="text-xs font-semibold">Department Name</Label>
                <Input 
                  id="dept-name-input" 
                  placeholder="e.g., Neurology" 
                  value={newDeptName} 
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="treatments-input" className="text-xs font-semibold">Initial Treatment Procedures Menu</Label>
                <Textarea 
                  id="treatments-input"
                  placeholder="Separate items with commas (e.g. EEG Test, Nerve Block)"
                  rows={4}
                  value={newTreatmentsRaw}
                  onChange={(e) => setNewTreatmentsRaw(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
              <DialogFooter>
                <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold" disabled={isSaving || !newDeptName.trim()}>
                  {editingIndex !== null ? "Update Scope Configurations" : "Create Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {depts.map((d, index) => (
            <AccordionItem key={d._id || d.name} value={`item-${index}`} className="border rounded-lg px-4 bg-background">
              <div className="flex items-center justify-between w-full">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline text-foreground py-3.5 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{d.name}</span>
                  </div>
                </AccordionTrigger>
                
                <div className="flex items-center gap-1.5 pr-2 z-10">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleOpenEditModal(index, e)} 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="pb-4 pt-1 border-t border-dashed">
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {d.treatments.map((t) => (
                    <Badge key={t} variant="secondary" className="px-2.5 py-0.5 text-[11px] font-medium border bg-muted/40">
                      {t}
                    </Badge>
                  ))}
                  {d.treatments.length === 0 && (
                    <span className="text-xs text-muted-foreground/60 italic block pt-1">
                      No active treatment protocols registered under this department.
                    </span>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {depts.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-6 border border-dashed rounded-lg">
              No clinical units provisioned yet.
            </p>
          )}
        </Accordion>
      </div>
    </div>
  );
}