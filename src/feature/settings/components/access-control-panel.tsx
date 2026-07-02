"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { updateStaffAccessControl } from "@/lib/actions/admin.actions";
import { ShieldCheck } from "lucide-react";

interface AccessControlPanelProps {
  doctorId: string;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
}

const DEPARTMENTS = [
  { id: "dept-1", name: "Cardiology" },
  { id: "dept-2", name: "Orthopedics" },
  { id: "dept-3", name: "Dermatology" }
];

const SIDEBAR_TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
  { href: "/billing", label: "Billing" },
  { href: "/forms", label: "Custom Forms" }
];

export function AccessControlPanel({ doctorId, isSaving, setIsSaving }: AccessControlPanelProps) {
  const [checkedDepts, setCheckedDepts] = useState<string[]>([]);
  const [checkedTabs, setCheckedTabs] = useState<string[]>([]);

  // Simulation step updating parameters perfectly on URL doctor shifts
  useEffect(() => {
    if (doctorId === "doc-101") {
      setCheckedDepts(["dept-1"]);
      setCheckedTabs(["/", "/patients"]);
    } else if (doctorId === "doc-102") {
      setCheckedDepts(["dept-2"]);
      setCheckedTabs(["/", "/patients", "/appointments"]);
    } else {
      setCheckedDepts([]);
      setCheckedTabs(["/", "/patients"]);
    }
  }, [doctorId]);

  const handleCommit = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await updateStaffAccessControl(token, {
        targetUserId: doctorId,
        departments: checkedDepts,
        visibleTabs: checkedTabs
      });
      if (res.success) alert("Privileges serialized successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3 space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Core Scope Authorization
          </CardTitle>
          <CardDescription>Configure explicit runtime lanes for context reference: <span className="font-mono text-primary font-bold">{doctorId}</span></CardDescription>
        </div>
        <Button size="sm" onClick={handleCommit} disabled={isSaving} className="h-8 text-xs font-semibold px-4">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* DEPARTMENTS MAPPING MATRIX */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">Allowed Departments</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEPARTMENTS.map((d) => (
              <div key={d.id} className="flex items-center space-x-2.5 border rounded-lg p-3 bg-background hover:bg-muted/10 transition-colors">
                <Checkbox 
                  id={d.id} 
                  checked={checkedDepts.includes(d.id)} 
                  onCheckedChange={(v) => setCheckedDepts(p => v ? [...p, d.id] : p.filter(x => x !== d.id))} 
                />
                <label htmlFor={d.id} className="text-sm font-medium leading-none cursor-pointer">{d.name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR TABS ACCESS MATRIX */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">Allowed Sidebar Navigation Views</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SIDEBAR_TABS.map((t) => (
              <div key={t.href} className="flex items-center space-x-2.5 border rounded-lg p-3 bg-background hover:bg-muted/10 transition-colors">
                <Checkbox 
                  id={t.href} 
                  checked={checkedTabs.includes(t.href)} 
                  onCheckedChange={(v) => setCheckedTabs(p => v ? [...p, t.href] : p.filter(x => x !== t.href))} 
                />
                <label htmlFor={t.href} className="text-sm font-medium leading-none cursor-pointer">{tab.label}</label>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}