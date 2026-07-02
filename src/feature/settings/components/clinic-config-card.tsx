// src/feature/settings/components/clinic-config-card.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export function ClinicConfigCard() {
  const [depts, setDepts] = useState([
    { name: "Cardiology", treatments: ["Holter Monitor", "Echocardiogram"] },
    { name: "Orthopedics", treatments: ["Joint Injection", "Cast Application"] }
  ]);
  
  const [newDept, setNewDept] = useState("");
  const [newTreatment, setNewTreatment] = useState("");
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    setDepts([...depts, { name: newDept.trim(), treatments: [] }]);
    setNewDept("");
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatment.trim()) return;
    setDepts(prev => prev.map((d, idx) => 
      idx === selectedDeptIndex 
        ? { ...d, treatments: [...d.treatments, newTreatment.trim()] } 
        : d
    ));
    setNewTreatment("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-primary">
          <Building2 className="h-5 w-5" /> Clinic Workspace Configurations
        </CardTitle>
        <CardDescription>Manage master departments and assignable treatment protocols.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Department Formulation Management Block */}
          <div className="space-y-4 border-r pr-0 md:pr-4 border-border/60">
            <form onSubmit={handleAddDept} className="space-y-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Create Department Branch
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Neurology" 
                    value={newDept} 
                    onChange={(e) => setNewDept(e.target.value)} 
                    className="h-9 text-sm" 
                  />
                  <Button type="submit" size="sm" className="h-9 text-xs">Add</Button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
                Active Departments
              </span>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {depts.map((dept, idx) => (
                  <div 
                    key={dept.name} 
                    onClick={() => setSelectedDeptIndex(idx)}
                    className={`p-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                      selectedDeptIndex === idx 
                        ? "bg-primary/5 border-primary text-primary font-semibold" 
                        : "bg-background hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    {dept.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Treatment Array Management Block */}
          <div className="space-y-4">
            <form onSubmit={handleAddTreatment} className="space-y-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Append Treatment to: <span className="text-primary font-bold">{depts[selectedDeptIndex]?.name || "None"}</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Nerve Conduction Study" 
                    value={newTreatment} 
                    disabled={depts.length === 0}
                    onChange={(e) => setNewTreatment(e.target.value)} 
                    className="h-9 text-sm" 
                  />
                  <Button type="submit" size="sm" disabled={depts.length === 0} className="h-9 text-xs">
                    Append
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
                Linked Procedures Matrix
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {depts[selectedDeptIndex]?.treatments.map((treat) => (
                  <Badge key={treat} variant="secondary" className="px-2.5 py-1 text-xs font-medium">
                    {treat}
                  </Badge>
                ))}
                {(!depts[selectedDeptIndex] || depts[selectedDeptIndex].treatments.length === 0) && (
                  <span className="text-xs text-muted-foreground/60 italic pt-1">
                    No procedures appended yet.
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}