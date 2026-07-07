"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getAllOrganizationsAction } from "@/lib/actions/organization.actions";
import { updatePatientSharingStatus } from "@/lib/actions/patient.actions";

export function ShareWorkspacePanel({ patient }: { patient: any }) {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sharedOrgs, setSharedOrgs] = useState<any[]>(patient?.sharedWithOrgs || []);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        if (!token) return;
        const res = await getAllOrganizationsAction(token);
        if (res?.success) {
          setOrganizations(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load local organizations:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizations();
  }, []);

  const handleAuthorize = async () => {
    if (!selectedOrgId) return;

    // Check if already authorized
    if (sharedOrgs.find(org => org._id === selectedOrgId)) {
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("clinic_jwt") || "";
      const currentSharedIds = sharedOrgs.map(org => org._id);
      const newSharedIds = [...currentSharedIds, selectedOrgId];

      const res = await updatePatientSharingStatus(token, patient._id, newSharedIds);
      if (res?.success) {
        const orgToAdd = organizations.find(o => o._id === selectedOrgId);
        if (orgToAdd) {
          setSharedOrgs([...sharedOrgs, orgToAdd]);
        }
        setSelectedOrgId("");
      } else {
        alert(res?.error || "Failed to update sharing settings.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async (orgId: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("clinic_jwt") || "";
      const newSharedIds = sharedOrgs.filter(org => org._id !== orgId).map(org => org._id);

      const res = await updatePatientSharingStatus(token, patient._id, newSharedIds);
      if (res?.success) {
        setSharedOrgs(sharedOrgs.filter(org => org._id !== orgId));
      } else {
        alert(res?.error || "Failed to update sharing settings.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const availableOrganizations = organizations.filter(
    org => !sharedOrgs.find(so => so._id === org._id)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Cross-Clinic Secure Sharing Matrix</h3>
        <p className="text-xs text-muted-foreground">Grant another specialized clinic organization ledger read permissions to this patient's intake folder securely.</p>
      </div>

      <div className="border rounded-xl p-4 bg-muted/5 space-y-4">
        <div>
          <div className="text-xs font-medium mb-3">Currently Authorized External Orgs:</div>
          {sharedOrgs.length === 0 ? (
            <div className="text-xs text-muted-foreground italic font-normal">None</div>
          ) : (
            <div className="space-y-2">
              {sharedOrgs.map(org => (
                <div key={org._id} className="flex flex-row items-center justify-between text-xs p-2 border rounded-md bg-card">
                  <span className="font-medium text-foreground">{org.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRevoke(org._id)}
                    disabled={isUpdating}
                    title={"Revoke Organization Access"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-[260px]">
              <Select
                value={selectedOrgId}
                onValueChange={setSelectedOrgId}
                disabled={isLoading || availableOrganizations.length === 0 || isUpdating}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={
                    isLoading ? "Loading..." :
                      availableOrganizations.length === 0 ? "No other organizations available" :
                        "Select an organization..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableOrganizations.map(org => (
                    <SelectItem key={org._id} value={org._id} className="text-xs py-1.5">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 text-xs shrink-0 w-full sm:w-auto"
              onClick={handleAuthorize}
              disabled={!selectedOrgId || isUpdating || isLoading}
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              Authorize Org
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}