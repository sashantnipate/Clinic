"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Plus, Pencil, Trash2, Loader2, LayoutGrid } from "lucide-react";
import { SIDEBAR_TABS } from "@/constants/sidebar-tabs";
import { saveRoleAction, getRolesAction, deleteRoleAction } from "@/lib/actions/role.actions";

export function RoleConfigPanel() {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const res = await getRolesAction(token);
        if (res.success && res.data) {
          setRoles(res.data);
        }
      } catch (err) {
        console.error("Failed to load schema roles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoles();
  }, []);

  const handleToggleTab = (tabId: string) => {
    setSelectedTabs(prev =>
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleOpenCreatePopup = () => {
    handleResetForm();
    setDialogOpen(true);
  };

  const handleStartEdit = (role: any) => {
    setEditingRoleId(role._id);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedTabs(role.allowedTabs || []);
    setDialogOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await saveRoleAction(token, {
        id: editingRoleId || undefined,
        name: roleName.trim(),
        description: description.trim() || undefined,
        allowedTabs: selectedTabs,
      });

      if (res.success && res.data) {
        if (editingRoleId) {
          setRoles(prev => prev.map(r => r._id === editingRoleId ? res.data : r));
          toast.success("Role configuration updated successfully.");
        } else {
          setRoles(prev => [res.data, ...prev]);
          toast.success("New role blueprint successfully deployed.");
        }
        setDialogOpen(false);
        handleResetForm();
      } else {
        toast.error(res.error || "Failed to save role configuration.");
      }
    } catch (err) {
      toast.error("Network communication fault.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role profile?")) return;
    try {
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await deleteRoleAction(token, id);
      if (res.success) {
        setRoles(prev => prev.filter(r => r._id !== id));
        toast.success("Role removed from workspace.");
      }
    } catch {
      toast.error("Failed to execute data modification chain.");
    }
  };

  const handleResetForm = () => {
    setEditingRoleId(null);
    setName("");
    setDescription("");
    setSelectedTabs([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2 border border-dashed rounded-xl">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">Extracting facility role profiles...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-foreground antialiased">
      
      {/* HEADER CONTROL STRIP */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Workspace Security Archetypes
          </h3>
        </div>
        <Button onClick={handleOpenCreatePopup} size="sm" className="h-9 text-xs font-semibold gap-1.5 px-4 shadow-xs">
          <Plus className="h-4 w-4" /> Create New Role
        </Button>
      </div>

      {/* POPUP METHOD MODAL CONTAINER: REPLICATES MATCHING GRID METRICS IN image_ddffff.png */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) handleResetForm(); }}>
        <DialogContent className="w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-6 will-change-transform antialiased">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" /> {editingRoleId ? "Edit Role Blueprint Scope" : "Provision Security Blueprint"}
            </DialogTitle>
            <DialogDescription>
              Specify the role identity parameters and assign explicit application modular route filters directly below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-6 pt-2">
            
            {/* Form Fields Section mirroring style parameters of image_ddffff.png */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="popupRoleName" className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" /> Role Identity Name *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <Input
                  id="popupRoleName"
                  required
                  placeholder="e.g., Insurance Coordinator, Senior Consultant"
                  className="h-10 text-sm font-medium bg-background"
                  value={roleName}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Optional brief operational descriptor..."
                  className="h-10 text-sm font-normal text-muted-foreground bg-background"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Alignment Layout Headers referencing input configuration grids of image_ddffff.png */}
            <div className="space-y-2 pt-4 border-t">
              <div className="grid grid-cols-12 gap-3 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                <div className="col-span-5">Workspace Navigation Tab</div>
                <div className="col-span-4">Application Module Path</div>
                <div className="col-span-3 text-center">Grant Access</div>
              </div>

              <div className="divide-y divide-border/60 max-h-[240px] overflow-y-auto pr-1">
                {SIDEBAR_TABS.map((tab) => (
                  <div key={tab.id} className="grid grid-cols-12 gap-3 py-2.5 items-center hover:bg-muted/10 px-2 rounded-md transition-colors">
                    <div className="col-span-5 text-xs font-semibold text-foreground/90">{tab.label}</div>
                    <div className="col-span-4 text-xs font-mono text-muted-foreground">{tab.id}</div>
                    <div className="col-span-3 flex justify-center">
                      <Checkbox
                        id={`popup-tab-check-${tab.id}`}
                        checked={selectedTabs.includes(tab.id)}
                        onCheckedChange={() => handleToggleTab(tab.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialog Form Control Actions Footer Row */}
            <DialogFooter className="pt-4 border-t gap-2 flex items-center justify-end bg-transparent">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-9 text-xs px-4">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !roleName.trim()} size="sm" className="h-9 text-xs font-semibold px-5 shadow-xs">
                {isSaving ? "Persisting changes..." : editingRoleId ? "Update Blueprint" : "Deploy Role Blueprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MATRIX ROLES PRINTOUT LIST */}
      <Card className="border-muted/60 shadow-2xs bg-background">
        <div className="p-3.5 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b rounded-t-xl">
          Configured Tenant System Roles Matrix ({roles.length})
        </div>
        <CardContent className="p-2 divide-y divide-border/50">
          {roles.map((role) => (
            <div key={role._id} className="p-4 space-y-3 transition-colors hover:bg-muted/10 rounded-lg">
              
              {/* ROW LINE 1: ROLE TITLE IDENTITY */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground tracking-tight">{role.name}</h4>
                  {role.description && <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>}
                </div>
              </div>

              {/* ROW LINE 2: ALL INDIVIDUAL GRANTED MODULE TABS + INLINE ACTION STRIPS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-dashed border-border/60">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] tracking-wider font-semibold uppercase text-muted-foreground mr-1.5">Authorized Views:</span>
                  {role.allowedTabs?.map((tabId: string) => {
                    const label = SIDEBAR_TABS.find(t => t.id === tabId)?.label || tabId;
                    return (
                      <Badge key={tabId} variant="secondary" className="text-[11px] font-medium bg-muted/60 px-2 py-0.5 rounded border">
                        {label}
                      </Badge>
                    );
                  })}
                  {(!role.allowedTabs || role.allowedTabs.length === 0) && (
                    <span className="text-xs text-destructive font-medium italic">No workspace tabs linked.</span>
                  )}
                </div>

                {/* EDIT + DELETE ROW OPTIONS INTEGRATED DIRECTLY ON LINE TWO */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(role)}
                    className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role._id)}
                    className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>

            </div>
          ))}

          {roles.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-10">
              No configuration roles found within this clinic ledger. Use the "Create New Role" trigger strip above.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}