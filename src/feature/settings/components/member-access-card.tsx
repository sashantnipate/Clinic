
"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { SIDEBAR_TABS } from "@/constants/sidebar-tabs";

interface MemberAccessCardProps {
  member: any;
  roles: any[];
  departments: any[];
  // Re-introducing standard visibility context flags for your page.tsx router
  isOpen?: boolean; 
  onOpenChange?: (open: boolean) => void;
  isSaving: boolean;
  onSave: (payload: any) => void;
  onCancel: () => void;
}

export function MemberAccessCard({
  member,
  roles,
  departments,
  isOpen = true,
  onOpenChange,
  isSaving,
  onSave,
  onCancel,
}: MemberAccessCardProps) {
  if (!member) return null;

  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.roleIds || []);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(member.departmentIds || []);
  const [accessMode, setAccessMode] = useState<"strict" | "shared" | "global">(member.accessMode || "strict");
  const [customTabs, setCustomTabs] = useState<string[]>(member.visibleTabs || []);

  const inheritedTabs = useMemo(() => {
    const tabs = new Set<string>();
    selectedRoles.forEach(roleId => {
      const match = roles.find(r => r._id === roleId);
      if (match?.allowedTabs) {
        match.allowedTabs.forEach((t: string) => tabs.add(t));
      }
    });
    return Array.from(tabs);
  }, [selectedRoles, roles]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleToggleDept = (deptId: string) => {
    setSelectedDepts(prev => 
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const handleToggleTab = (tabId: string) => {
    if (inheritedTabs.includes(tabId)) return;
    setCustomTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      userId: member._id,
      roleIds: selectedRoles,
      departmentIds: selectedDepts,
      accessMode,
      visibleTabs: customTabs.filter(tabId => !inheritedTabs.includes(tabId))
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-5 will-change-transform antialiased text-foreground">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure Clearance Matrix
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configuring parameters for <span className="font-semibold text-foreground">{member.email}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCommit} className="space-y-4">
          {/* ACCESS MODE DATA VISIBILITY POLICY */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Patient Ledger Data Visibility Strategy</Label>
            <Select value={accessMode} onValueChange={(v: any) => setAccessMode(v)}>
              <SelectTrigger className="h-9 text-sm bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict Mode (Isolated Lanes / Department Assignment Only)</SelectItem>
                <SelectItem value="shared">Shared Mode (Department + Externally Referred Records)</SelectItem>
                <SelectItem value="global">Global Mode (Unrestricted Global Tenant Clearance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* STRUCTURAL CLINIC DEPARTMENTS MAPPING AREA */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assignable Clinical Units Matrix</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 border rounded-lg bg-muted/10">
              {departments.map(dept => (
                <div key={dept._id} className="flex items-center space-x-2 bg-background px-2 py-1.5 rounded-md border shadow-3xs">
                  <Checkbox 
                    id={`modal-dept-check-${dept._id}`}
                    checked={selectedDepts.includes(dept._id)}
                    onCheckedChange={() => handleToggleDept(dept._id)}
                  />
                  <label htmlFor={`modal-dept-check-${dept._id}`} className="text-xs font-semibold leading-none cursor-pointer text-foreground/90 select-none">
                    {dept.name}
                  </label>
                </div>
              ))}
              {departments.length === 0 && (
                <span className="text-xs text-muted-foreground italic p-0.5">No active clinic units configured under Base Settings.</span>
              )}
            </div>
          </div>

          {/* ROLE BASED ARCHETYPES */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Workspace Roles Blueprints</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 border rounded-lg bg-muted/10">
              {roles.map(role => (
                <div key={role._id} className="flex items-center space-x-2 bg-background px-2 py-1.5 rounded-md border shadow-3xs">
                  <Checkbox 
                    id={`modal-role-check-${role._id}`}
                    checked={selectedRoles.includes(role._id)}
                    onCheckedChange={() => handleToggleRole(role._id)}
                  />
                  <label htmlFor={`modal-role-check-${role._id}`} className="text-xs font-semibold leading-none cursor-pointer text-foreground/90 select-none">
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* COMBINED OVERRIDES SIDEBAR NAVIGATION SYSTEM (GRID LAYOUT) */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Workspace Layout Module Routes (Inherited + Custom Multi-Selection Overrides)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-lg bg-muted/10">
              {SIDEBAR_TABS.map(tab => {
                const isRoleInherited = inheritedTabs.includes(tab.id);
                const isChecked = isRoleInherited || customTabs.includes(tab.id);

                return (
                  <div 
                    key={tab.id} 
                    className={`flex items-center justify-between p-2 rounded-md border shadow-3xs transition-colors text-xs ${
                      isRoleInherited 
                        ? "bg-blue-50/40 dark:bg-blue-950/10 text-muted-foreground border-blue-100/50" 
                        : "bg-background hover:bg-background/80"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-1">
                      <span className="font-semibold text-foreground block truncate">{tab.label}</span>
                      {isRoleInherited ? (
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wide">Inherited</span>
                      ) : customTabs.includes(tab.id) ? (
                        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Override</span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/60 font-normal">Disabled</span>
                      )}
                    </div>
                    <Checkbox 
                      id={`modal-tab-check-${tab.id}`}
                      checked={isChecked}
                      disabled={isRoleInherited}
                      onCheckedChange={() => handleToggleTab(tab.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* DIALOG FOOTER LAYER */}
          <DialogFooter className="pt-3 border-t gap-1.5 flex items-center justify-end bg-transparent">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs px-3">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} size="sm" className="h-8 text-xs font-semibold px-4 shadow-xs bg-primary text-primary-foreground">
              {isSaving ? "Syncing..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}