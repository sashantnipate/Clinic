"use client";

import React, { useState, useEffect } from "react";
import { toast } from  "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getOrganizationMembersAction, updateMemberAccessAction } from "@/lib/actions/access-settings.actions";
import { ShieldAlert, Loader2, Users } from "lucide-react";

interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  visibleTabs: string[];
  role?: string;
}

const SIDEBAR_TABS = [
  { id: "/", label: "Dashboard" },
  { id: "/patients", label: "Patients" },
  { id: "/forms", label: "Custom Forms" },
  { id: "/pharmacy", label: "Pharmacy" },
  { id: "/clinic-profile", label: "Clinic Profile" },
];

export default function AccessSettingsPage() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);

  useEffect(() => {
    async function loadTeamProfiles() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const res = await getOrganizationMembersAction(token);
        if (res.success && res.data) {
          setMembers(res.data);
        } else {
          toast.error(res.error || "Failed to load team directory.");
        }
      } catch (err) {
        toast.error("Internal connection routing exception.");
      } finally {
        setIsLoading(false);
      }
    }
    loadTeamProfiles();
  }, []);

  const handleSelectMember = (member: UserProfile) => {
    setSelectedMember(member);
    setSelectedTabs(member.visibleTabs || []);
  };

  const handleToggleTab = (tabId: string) => {
    setSelectedTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleCommitAccessMatrix = async () => {
    if (!selectedMember) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await updateMemberAccessAction(token, {
        userId: selectedMember._id,
        visibleTabs: selectedTabs,
      });

      if (res.success && res.data) {
        setMembers(prev => prev.map(m => m._id === selectedMember._id ? { ...m, ...res.data } : m));
        toast.success(`Access permissions updated successfully.`);
        setSelectedMember(null);
      } else {
        toast.error(res.error || "Failed to modify structural properties.");
      }
    } catch {
      toast.error("Network synchronization exception occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium">Hydrating user roles matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 text-foreground antialiased pb-12 max-w-5xl mx-auto">
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2 border-b pb-2">
            <Users className="h-5 w-5" /> Team Access Workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage operational team profiles and control layout navigation module filters directly.
          </p>
        </div>

        <div className="w-full divide-y border rounded-lg bg-background overflow-hidden">
          {members.map((member) => {
            const hasName = member.firstName || member.lastName;
            const displayName = hasName 
              ? `${member.firstName || ""} ${member.lastName || ""}`.trim() 
              : member.email.split("@")[0];

            return (
              <div 
                key={member._id}
                onClick={() => handleSelectMember(member)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors gap-3 cursor-pointer hover:bg-muted/40"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    {displayName}
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                      Member
                    </Badge>
                  </span>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>

                <div className="flex flex-wrap gap-1 items-center max-w-md sm:justify-end">
                  {member.visibleTabs?.map(tabId => {
                    const label = SIDEBAR_TABS.find(t => t.id === tabId)?.label || tabId;
                    return (
                      <Badge key={tabId} variant="outline" className="text-[10px] bg-background">
                        {label}
                      </Badge>
                    );
                  })}
                  {(!member.visibleTabs || member.visibleTabs.length === 0) && (
                    <span className="text-xs text-destructive font-medium flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Navigation Restricted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-8">
              No organization staff members matched this workspace filter context.
            </p>
          )}
        </div>
      </section>

      {selectedMember && (
        <section className="space-y-6 pt-6 border-t animate-in fade-in-50 duration-200">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Modify Layout Permissions: <span className="text-emerald-600 font-extrabold">{selectedMember.firstName || "User"}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle visible side-navigation routes enabled for this profile.</p>
          </div>

          <div className="grid gap-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Allowed Workspace Layout Sub-modules</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-4 border rounded-xl">
              {SIDEBAR_TABS.map((tab) => (
                <div key={tab.id} className="flex items-center space-x-3 bg-background p-2.5 rounded-lg border border-border/40 shadow-3xs">
                  <Checkbox 
                    id={`tab-checkbox-${tab.id}`} 
                    checked={selectedTabs.includes(tab.id)}
                    onCheckedChange={() => handleToggleTab(tab.id)}
                  />
                  <label 
                    htmlFor={`tab-checkbox-${tab.id}`}
                    className="text-xs font-semibold leading-none cursor-pointer flex-1 select-none text-foreground/90"
                  >
                    {tab.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="h-9 text-xs">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleCommitAccessMatrix} 
              disabled={isUpdating} 
              className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs font-semibold px-6 shadow-xs"
            >
              {isUpdating ? "Syncing Tabs..." : "Authorize Access Matrix"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}