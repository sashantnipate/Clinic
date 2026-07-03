"use client";

import React, { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Plus, Pencil, Trash2, Loader2, LayoutGrid } from "lucide-react";
import { SIDEBAR_TABS } from "@/constants/sidebar-tabs";
import {
  saveRoleAction,
  getRolesAction,
  deleteRoleAction,
} from "@/lib/actions/role.actions";

export function RoleConfigPanel() {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [roleIdToDelete, setRoleIdToDelete] = useState<string | null>(null);
  const [roleNameToDelete, setRoleNameToDelete] = useState("");

  useEffect(() => {
    async function loadRoles() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const res = await getRolesAction(token);

        if (res.success && res.data) {
          setRoles(res.data);
        } else {
          toast.error(res.error || "Failed to load roles.");
        }
      } catch (err) {
        console.error("Failed to load schema roles:", err);
        toast.error("Failed to load roles.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRoles();
  }, []);

  const handleToggleTab = (tabId: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  const handleResetForm = () => {
    setEditingRoleId(null);
    setName("");
    setDescription("");
    setSelectedTabs([]);
  };

  const handleOpenCreatePopup = () => {
    handleResetForm();
    setDialogOpen(true);
  };

  const handleStartEdit = (role: any) => {
    setEditingRoleId(role._id);
    setName(role.name || "");
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
          setRoles((prev) =>
            prev.map((r) => (r._id === editingRoleId ? res.data : r))
          );
          toast.success("Role updated successfully.");
        } else {
          setRoles((prev) => [res.data, ...prev]);
          toast.success("Role created successfully.");
        }

        setDialogOpen(false);
        handleResetForm();
      } else {
        toast.error(res.error || "Failed to save role.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerDeleteAlert = (id: string, name: string) => {
    setRoleIdToDelete(id);
    setRoleNameToDelete(name);
    setDeleteAlertOpen(true);
  };

  const handleConfirmedDelete = async () => {
    if (!roleIdToDelete) return;

    try {
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await deleteRoleAction(token, roleIdToDelete);

      if (res.success) {
        setRoles((prev) => prev.filter((r) => r._id !== roleIdToDelete));
        toast.success("Role deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete role.");
      }
    } catch {
      toast.error("Failed to delete role.");
    } finally {
      setDeleteAlertOpen(false);
      setRoleIdToDelete(null);
      setRoleNameToDelete("");
    }
  };

  const renderedRoles = [...roles].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Loading roles...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 text-foreground antialiased">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Workspace Security Archetypes
          </h3>
        </div>

        <Button
          onClick={handleOpenCreatePopup}
          size="sm"
          className="h-8 gap-1 px-3 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Role
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) handleResetForm();
        }}
      >
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-5 md:max-w-4xl">
          <DialogHeader className="mb-1">
            <DialogTitle className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-primary">
              <Shield className="h-4 w-4" />
              {editingRoleId
                ? "Edit Role Blueprint Scope"
                : "Provision Security Blueprint"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Specify the role name and assign access to the desired application
              views below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="popupRoleName"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                Role Identity Name *
              </Label>

              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="popupRoleName"
                  required
                  placeholder="e.g., Insurance Coordinator"
                  className="h-9 bg-background text-xs font-medium"
                  value={roleName}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Optional brief operational descriptor..."
                  className="h-9 bg-background text-xs font-normal text-muted-foreground"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t">
              <div className="grid grid-cols-12 gap-2 border-b px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-5">Workspace Navigation Tab</div>
                <div className="col-span-4">Application Module Path</div>
                <div className="col-span-3 text-center">Grant Access</div>
              </div>

              <div className="max-h-[200px] divide-y divide-border/60 overflow-y-auto pr-1">
                {SIDEBAR_TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className="grid grid-cols-12 items-center gap-2 rounded-sm px-1 py-2 transition-colors hover:bg-muted/10"
                  >
                    <div className="col-span-5 text-xs font-semibold text-foreground/90">
                      {tab.label}
                    </div>
                    <div className="col-span-4 font-mono text-xs text-muted-foreground">
                      {tab.id}
                    </div>
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

            <DialogFooter className="flex items-center justify-end gap-1.5 border-t bg-transparent pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !roleName.trim()}
                size="sm"
                className="h-8 px-4 text-xs font-semibold"
              >
                {isSaving
                  ? "Persisting changes..."
                  : editingRoleId
                  ? "Update Blueprint"
                  : "Deploy Role Blueprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="p-5">
          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-sm font-bold">
              Delete role?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete{" "}
              <strong className="font-semibold text-foreground">
                {roleNameToDelete}
              </strong>
              . Members using this role may lose access to authorized pages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-2 gap-1.5">
            <AlertDialogCancel
              size="sm"
              className="h-8 text-xs"
              onClick={() => setRoleIdToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleConfirmedDelete}
              className="h-8 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 gap-2">
        {renderedRoles.map((role) => (
          <Card
            key={role._id}
            className="overflow-hidden rounded-lg border bg-card shadow-sm"
          >
            <CardContent className="px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 md:items-center">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {role.name}
                      </h4>
                      {role.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(role)}
                        className="h-8 px-2 text-xs"
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerDeleteAlert(role._id, role.name)}
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 md:max-w-[45%] md:justify-end">
                  <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Authorized Views:
                  </span>

                  {role.allowedTabs?.length > 0 ? (
                    role.allowedTabs.map((tabId: string) => {
                      const label =
                        SIDEBAR_TABS.find((t) => t.id === tabId)?.label || tabId;

                      return (
                        <Badge
                          key={tabId}
                          variant="secondary"
                          className="h-6 rounded-md border border-muted/60 bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground"
                        >
                          {label}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-[11px] italic text-destructive/80">
                      None linked
                    </span>
                  )}
                </div>

                <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(role)}
                    className="h-8 px-2 text-xs"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerDeleteAlert(role._id, role.name)}
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {roles.length === 0 && (
          <p className="rounded-lg border border-dashed bg-card/30 py-6 text-center text-xs italic text-muted-foreground">
            No blueprints discovered. Use the button above to create a role.
          </p>
        )}
      </div>
    </div>
  );
}