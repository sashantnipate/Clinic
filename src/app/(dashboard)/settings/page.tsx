// src/app/(dashboard)/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ShieldAlert, Layers } from "lucide-react";
import { getOrganizationMembersAction, updateMemberAccessAction } from "@/lib/actions/access-settings.actions";
import { getRolesAction, syncUserAccessAction } from "@/lib/actions/role.actions";
import { getDepartmentsAction } from "@/lib/actions/department.actions";
import { SIDEBAR_TABS } from "@/constants/sidebar-tabs";
import { MemberAccessCard } from "@/feature/settings/components/member-access-card";
import { RoleConfigPanel } from "@/feature/settings/components/role-config-panel";

export default function AccessSettingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Re-sync master structural assets from database context safely
  const refreshControlData = async () => {
    try {
      const token = localStorage.getItem("clinic_jwt") || "";
      const [membersRes, rolesRes, deptsRes] = await Promise.all([
        getOrganizationMembersAction(token),
        getRolesAction(token),
        getDepartmentsAction(token)
      ]);

      if (membersRes.success && membersRes.data) setMembers(membersRes.data);
      if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
    } catch (err) {
      toast.error("Internal workspace hydration refresh error.");
    }
  };

  useEffect(() => {
    async function hydrateWorkspaceConfiguration() {
      try {
        await refreshControlData();
      } finally {
        setIsLoading(false);
      }
    }
    hydrateWorkspaceConfiguration();
  }, []);


const handleUpdateMemberAccess = async (payload: any) => {
  try {
    setIsUpdating(true);
    const token = localStorage.getItem("clinic_jwt") || "";
    const res = await syncUserAccessAction(token, payload);

    if (res.success && res.data) {
      // 1. Wipe the local storage permission caches immediately
      localStorage.removeItem("clinic_allowed_tabs");
      
      // 2. Update local state
      setMembers(prev => prev.map(m => m._id === payload.userId ? res.data : m));
      toast.success("Security workspace configuration profiles aligned.");
      setSelectedMember(null);
      
      // 3. Force browser-level validation refresh
      window.location.reload(); 
    } else {
      toast.error(res.error || "Failed to parse access structure changes.");
    }
  } catch {
    toast.error("Network communication pipeline validation error.");
  } finally {
    setIsUpdating(false);
  }
};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium">Hydrating operations configuration grid...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 text-foreground antialiased pb-12 max-w-5xl mx-auto">
      
      {/* MODULE 1: GLOBAL CLINIC ROLE BLUEPRINTS POPUP DESIGNER */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-2">
            <Layers className="h-5 w-5" /> Clinic Base Role Configurations
          </h2>
          <p className="text-sm text-muted-foreground">
            Construct and manage custom security role archetypes. Click on the action button below to trigger the creation view popup.
          </p>
        </div>
        
        {/* On operations state modifications, force dynamic structural matrix alignment refreshes */}
        <div onBlur={refreshControlData}>
          <RoleConfigPanel />
        </div>
      </section>

      {/* MODULE 2: MEMBER DIRECTORY WORKSPACE ROSTER LIST */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2 border-b pb-2">
            <Users className="h-5 w-5" /> Team Clearances Roster
          </h2>
          <p className="text-sm text-muted-foreground">
            Select an employee below to expand their advanced account access workspace card, modify assigned blueprint scopes, or configure custom overrides.
          </p>
        </div>

        <div className="w-full divide-y border rounded-lg bg-background overflow-hidden shadow-2xs">
          {members.map((member) => {
            const hasName = member.firstName || member.lastName;
            const displayName = hasName 
              ? `${member.firstName || ""} ${member.lastName || ""}`.trim() 
              : member.email.split("@")[0];
            
            const isTargeted = selectedMember?._id === member._id;

            // Gather and match reference keys cleanly
            const directOverrideTabStrings = member.visibleTabs || [];
            
            // Re-resolve populated roles references to get explicit tag badges row display metrics
            const userRoleObjects = (member.roleIds || []).map((id: any) => {
              const matchedId = typeof id === 'object' && id?._id ? id._id.toString() : id.toString();
              return roles.find(r => r._id === matchedId);
            }).filter(Boolean);

            const inheritedTabStrings = userRoleObjects.flatMap((r: any) => r.allowedTabs || []);
            const unifiedPreviewTabs = Array.from(new Set([...directOverrideTabStrings, ...inheritedTabStrings]));

            return (
              <div 
                key={member._id}
                onClick={() => setSelectedMember(member)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors gap-3 cursor-pointer ${
                  isTargeted ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-medium" : "hover:bg-muted/40"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    {displayName}
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-transparent">
                      {member.accessMode || "strict"}
                    </Badge>
                  </span>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>

                <div className="flex flex-wrap gap-1 items-center max-w-md sm:justify-end">
                  {/* Print Active Structural Role Blueprint Badges */}
                  {userRoleObjects.map((role: any) => (
                    <Badge key={role._id} className="text-[9px] bg-blue-600 hover:bg-blue-600 text-white uppercase font-bold tracking-wide border-none px-2 rounded">
                      {role.name}
                    </Badge>
                  ))}
                  
                  {/* Print Final Unified Allowed Side-Navigation Links */}
                  {unifiedPreviewTabs.map(tabId => {
                    const label = SIDEBAR_TABS.find(t => t.id === tabId)?.label || tabId;
                    return (
                      <Badge key={tabId} variant="outline" className="text-[10px] bg-background">
                        {label}
                      </Badge>
                    );
                  })}
                  {unifiedPreviewTabs.length === 0 && (
                    <span className="text-xs text-destructive font-medium flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Navigation Restricted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODULE 3: DYNAMICALLY EXPANDED ACCESS MANAGEMENT COMPONENT WORKSPACE CARD */}
      {selectedMember && (
        <section className="space-y-4 pt-4 border-t border-dashed animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
            <Layers className="h-4 w-4 text-emerald-600" /> Account Clearance Control Center
          </div>
          <MemberAccessCard
            member={selectedMember}
            roles={roles}
            departments={departments}
            isSaving={isUpdating}
            onSave={handleUpdateMemberAccess}
            onCancel={() => setSelectedMember(null)}
          />
        </section>
      )}
    </div>
  );
}