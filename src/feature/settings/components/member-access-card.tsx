"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  isSaving: boolean;
  onSave: (payload: any) => void;
  onCancel: () => void;
}

export function MemberAccessCard({ member, roles, departments, isSaving, onSave, onCancel }: MemberAccessCardProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.roleIds || []);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(member.departmentIds || []);
  const [accessMode, setAccessMode] = useState<"strict" | "shared" | "global">(member.accessMode || "strict");
  const [customTabs, setCustomTabs] = useState<string[]>(member.visibleTabs || []);

  // 1. Compile baseline navigation tabs inherited straight from assigned roles
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

  // 2. Clear any redundant custom additions if they get covered by an assigned role later
  const handleToggleTab = (tabId: string) => {
    if (inheritedTabs.includes(tabId)) return; // Skip if role already covers it
    setCustomTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleCommit = () => {
    onSave({
      userId: member._id,
      roleIds: selectedRoles,
      departmentIds: selectedDepts,
      accessMode,
      // Filter out individual entries that are already provided by roles before payload dispatch
      visibleTabs: customTabs.filter(tabId => !inheritedTabs.includes(tabId))
    });
  };

  return (
    <Card className="shadow-xs border-muted/60 animate-in fade-in-50 duration-200">
      <CardHeader className="border-b bg-muted/10 pb-4 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure Clearance Matrix
          </CardTitle>
          <CardDescription>
            Configuring parameters for <span className="font-semibold text-foreground">{member.email}</span>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 text-xs">Cancel</Button>
          <Button size="sm" onClick={handleCommit} disabled={isSaving} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
            {isSaving ? "Syncing Workspace..." : "Authorize Access Matrix"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* ACCESS MODE DATA VISIBILITY POLICY */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Patient Ledger Data Visibility Strategy</Label>
          <Select value={accessMode} onValueChange={(v: any) => setAccessMode(v)}>
            <SelectTrigger className="h-9">
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
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignable Clinical Units Matrix</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/20 p-3 border rounded-xl">
            {departments.map(dept => (
              <div key={dept._id} className="flex items-center space-x-2.5 bg-background p-2.5 rounded-lg border shadow-2xs">
                <Checkbox 
                  id={`dept-check-${dept._id}`}
                  checked={selectedDepts.includes(dept._id)}
                  onCheckedChange={() => handleToggleDept(dept._id)}
                />
                <label htmlFor={`dept-check-${dept._id}`} className="text-xs font-semibold leading-none cursor-pointer text-foreground/90 select-none">
                  {dept.name}
                </label>
              </div>
            ))}
            {departments.length === 0 && (
              <span className="text-xs text-muted-foreground italic p-1">No active clinic units configured under Base Settings.</span>
            )}
          </div>
        </div>

        {/* ROLE BASED ARCHETYPES */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Roles Blueprints</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/20 p-3 border rounded-xl">
            {roles.map(role => (
              <div key={role._id} className="flex items-center space-x-2.5 bg-background p-2.5 rounded-lg border shadow-2xs">
                <Checkbox 
                  id={`role-check-${role._id}`}
                  checked={selectedRoles.includes(role._id)}
                  onCheckedChange={() => handleToggleRole(role._id)}
                />
                <label htmlFor={`role-check-${role._id}`} className="text-xs font-semibold leading-none cursor-pointer text-foreground/90 select-none">
                  {role.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* COMBINED OVERRIDES SIDEBAR NAVIGATION SYSTEM */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Workspace Layout Module Routes (Inherited + Custom Multi-Selection Overrides)
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 border rounded-xl bg-muted/20">
            {SIDEBAR_TABS.map(tab => {
              const isRoleInherited = inheritedTabs.includes(tab.id);
              const isChecked = isRoleInherited || customTabs.includes(tab.id);

              return (
                <div 
                  key={tab.id} 
                  className={`flex flex-col justify-between p-2.5 rounded-lg border shadow-2xs transition-colors ${
                    isRoleInherited 
                      ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80" 
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Checkbox 
                      id={`tab-check-${tab.id}`}
                      checked={isChecked}
                      disabled={isRoleInherited} // Lock down interaction only if it is already granted via Role
                      onCheckedChange={() => handleToggleTab(tab.id)}
                    />
                    <label 
                      htmlFor={`tab-check-${tab.id}`} 
                      className={`text-xs font-semibold leading-none select-none ${
                        isRoleInherited ? "text-blue-700 dark:text-blue-400" : "text-foreground/90 cursor-pointer"
                      }`}
                    >
                      {tab.label}
                    </label>
                  </div>
                  
                  {/* Subtle status layout hints */}
                  {isRoleInherited && (
                    <span className="text-[9px] text-blue-500 font-medium tracking-wide mt-1.5 ml-6 uppercase">
                      Inherited
                    </span>
                  )}
                  {!isRoleInherited && customTabs.includes(tab.id) && (
                    <span className="text-[9px] text-emerald-600 font-semibold tracking-wide mt-1.5 ml-6 uppercase">
                      Override Grant
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}