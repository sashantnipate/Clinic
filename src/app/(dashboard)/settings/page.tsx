  
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ShieldAlert, Layers, ShieldCheck } from "lucide-react";
import { getOrganizationMembersAction } from "@/lib/actions/access-settings.actions";
import { getRolesAction, syncUserAccessAction } from "@/lib/actions/role.actions";
import { getDepartmentsAction } from "@/lib/actions/department.actions";
import { SIDEBAR_TABS } from "@/constants/sidebar-tabs";
import { MemberAccessCard } from "@/feature/settings/components/member-access-card";
import { RoleConfigPanel } from "@/feature/settings/components/role-config-panel";

type SettingsTab = "members" | "roles";

export default function AccessSettingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>("members");
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
        localStorage.removeItem("clinic_allowed_tabs");
        setMembers(prev => prev.map(m => m._id === payload.userId ? res.data : m));
        toast.success("Security workspace configuration profiles aligned.");
        setSelectedMember(null);
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
    <div className="w-full space-y-6 text-foreground antialiased pb-12 max-w-5xl mx-auto">
      
      

      {/* VIEW DECOUPLING HEADER TOGGLE MATRIX */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "members"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" /> Team Clearances Roster
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "roles"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" /> Workspace Security Blueprints
        </button>
      </div>

      {/* DYNAMIC COMPONENT MOUNT ACCORDING TO HEADER STATE */}
      <div className="pt-2 animate-in fade-in-30 duration-200">
        {activeTab === "roles" ? (
          <section className="space-y-2">
            <p className="text-xs text-muted-foreground pb-2">
              Construct and manage template layouts containing default allowed navigation views assigned to specific archetypes.
            </p>
            <div onBlur={refreshControlData}>
              <RoleConfigPanel />
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <p className="text-xs text-muted-foreground pb-2">
              Select an employee profile record from the directory index roster below to spawn the access control configuration popup modal.
            </p>
            
            <div className="w-full divide-y border rounded-xl bg-background overflow-hidden shadow-2xs">
              {members.map((member) => {
                const hasName = member.firstName || member.lastName;
                const displayName = hasName 
                  ? `${member.firstName || ""} ${member.lastName || ""}`.trim() 
                  : member.email.split("@")[0];
                
                const isTargeted = selectedMember?._id === member._id;
                const directOverrideTabStrings = member.visibleTabs || [];
                
                const userRoleObjects = (member.roleIds || []).map((id: any) => {
                  const matchedId = typeof id === "object" && id?._id ? id._id.toString() : id.toString();
                  return roles.find(r => r._id === matchedId);
                }).filter(Boolean);

                const inheritedTabStrings = userRoleObjects.flatMap((r: any) => r.allowedTabs || []);
                const unifiedPreviewTabs = Array.from(new Set([...directOverrideTabStrings, ...inheritedTabStrings]));

                return (
                  <div 
                    key={member._id}
                    onClick={() => setSelectedMember(member)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors gap-3 cursor-pointer ${
                      isTargeted ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-medium border-l-2 border-emerald-600" : "hover:bg-muted/40"
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
                      {userRoleObjects.map((role: any) => (
                        <Badge key={role._id} className="text-[9px] bg-blue-600 hover:bg-blue-600 text-white uppercase font-bold tracking-wide border-none px-2 rounded">
                          {role.name}
                        </Badge>
                      ))}
                      
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
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-10">No member accounts registered under this clinic workspace.</p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* DYNAMIC POPUP MODAL ENVELOPE CONTROLLER */}
      {selectedMember && (
        <MemberAccessCard
          member={selectedMember}
          roles={roles}
          departments={departments}
          isOpen={!!selectedMember}
          onOpenChange={(open) => {
            if (!open) setSelectedMember(null);
          }}
          isSaving={isUpdating}
          onSave={handleUpdateMemberAccess}
          onCancel={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}