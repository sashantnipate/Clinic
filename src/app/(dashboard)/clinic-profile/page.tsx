"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { getDepartmentsAction } from "@/lib/actions/department.actions";
import { Loader2, Building2, LayoutGrid, FileText } from "lucide-react";
import { ClinicBaseProfile } from "./components/clinic-base-profile";
import { DepartmentManager } from "./components/department-manager";
import { PrescriptionPdfSettingsManager } from "./components/prescription-pdf-settings-manager";

export default function ClinicProfilePage() {
  const [activeTab, setActiveTab] = useState<"general" | "departments" | "pdf">("general");
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
    <div className="flex flex-col gap-6 w-full text-foreground antialiased pb-12">
      <header className="border-b border-border/40 shrink-0">
        <nav className="flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              }`}
          >
            <Building2 className="h-4 w-4" /> Base Profile
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "departments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              }`}
          >
            <LayoutGrid className="h-4 w-4" /> Departments
          </button>

          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "pdf"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              }`}
          >
            <FileText className="h-4 w-4" /> PDF Settings
          </button>
        </nav>
      </header>

      <main className="w-full min-w-0">
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="p-6">
            {activeTab === "general" && <ClinicBaseProfile initialData={initialSettings} />}
            {activeTab === "departments" && <DepartmentManager initialDepts={initialDepts} />}
            {activeTab === "pdf" && <PrescriptionPdfSettingsManager initialSettings={initialSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
}