"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { getDepartmentsAction } from "@/lib/actions/department.actions";
import { Loader2 } from "lucide-react";
import { ClinicBaseProfile } from "./components/clinic-base-profile";
import { DepartmentManager } from "./components/department-manager";

export default function ClinicProfilePage() {
  const [initialSettings, setInitialSettings] = useState<any>(null);
  const [initialDepts, setInitialDepts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClinicMetadata() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";

        const [settingsRes, deptsRes] = await Promise.all([
          getClinicSettingAction(token),
          getDepartmentsAction(token)
        ]);

        if (settingsRes.success && settingsRes.data) {
          setInitialSettings(settingsRes.data);
        }

        if (deptsRes.success && deptsRes.data) {
          setInitialDepts(deptsRes.data);
        }
      } catch (err) {
        toast.error("Failed to fetch operational profile records.");
      } finally {
        setIsLoading(false);
      }
    }
    loadClinicMetadata();
  }, []);

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
      <ClinicBaseProfile initialData={initialSettings} />

      <DepartmentManager initialDepts={initialDepts} />
    </div>
  );
}