"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileClock, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-views (We decouple these into their own files below)
import { PrimaryAndCustomDetails } from "./primary-and-custom-details";
import { MedicalHistoryPlaceholder } from "./medical-history-placeholder";
import { ShareWorkspacePanel } from "./share-workspace-panel";

interface PatientProfileDashboardProps {
  patient: any;
  ageText: string;
}

type ActiveTab = "details" | "history" | "share";

export function PatientProfileDashboard({ patient, ageText }: PatientProfileDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");

  return (
    <div className="w-full space-y-6 text-foreground antialiased">
      
      {/* 1. Minimalist Profile Header */}
      <div className="flex flex-row items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {patient.gender} • {ageText} • DOB: {new Date(patient.dob).toLocaleDateString("en-GB")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/patients")} className="h-9">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* 2. Simplified Action Button Matrix Row */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeTab === "details" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("details")}
          className="h-9"
        >
          <User className="mr-2 h-4 w-4" /> Details
        </Button>
        <Button 
          variant={activeTab === "history" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("history")}
          className="h-9"
        >
          <FileClock className="mr-2 h-4 w-4" /> Medical History
        </Button>
        <Button 
          variant={activeTab === "share" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("share")}
          className="h-9"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share with Org
        </Button>
      </div>

      {/* 3. Dynamic Conditional Content Target Area */}
      <div className="pt-2">
        {activeTab === "details" && (
          <PrimaryAndCustomDetails patient={patient} />
        )}
        {activeTab === "history" && (
          <MedicalHistoryPlaceholder />
        )}
        {activeTab === "share" && (
          <ShareWorkspacePanel patient={patient} />
        )}
      </div>

    </div>
  );
}