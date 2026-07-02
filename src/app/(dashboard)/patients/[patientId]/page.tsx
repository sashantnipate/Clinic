"use client";

import React from "react";
import { useParams } from "next/navigation";
import { usePatientProfile } from "@/feature/patient-profile/hooks/use-patient-profile";
import { PatientProfileDashboard } from "@/feature/patient-profile/components/patient-profile-dashboard";
import { Loader2 } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const { patient, isLoading, error, ageText } = usePatientProfile(patientId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading medical file...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-4 text-center text-sm font-medium text-destructive border border-destructive/20 rounded-lg bg-destructive/5 max-w-md mx-auto mt-8">
        {error || "Record not found or access permission boundaries violation check failure."}
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <PatientProfileDashboard patient={patient} ageText={ageText} />
    </div>
  );
}