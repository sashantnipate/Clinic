"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { Building2, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [address, setAddress] = useState("123 Health Care Way, Medical District");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [timings, setTimings] = useState([
    { days: "Monday - Friday", open: "08:00 AM", close: "05:00 PM" }
  ]);
  
  const [selectedDept, setSelectedDept] = useState("General");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTimingRow = () => {
    setTimings([...timings, { days: "Saturday", open: "09:00 AM", close: "01:00 PM" }]);
  };

  const handleRemoveTimingRow = (index: number) => {
    setTimings(timings.filter((_, i) => i !== index));
  };

  const handleUpdateTiming = (index: number, key: string, value: string) => {
    setTimings(prev => prev.map((t, i) => i === index ? { ...t, [key]: value } : t));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      
      const res = await updateClinicSettingAction(token, {
        address,
        phone,
        timings
      });

      if (res.success) {
        alert("Clinic configurations saved successfully.");
      } else {
        alert(res.error || "Failed to commit changes.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-foreground antialiased pb-12">
      <Card className="w-full shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Master Clinic Management Blueprint
          </CardTitle>
          <CardDescription>
            Update your operational profile records, define department targets, and track care operations.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Main profile metadata definitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="clinic-phone" className="text-xs font-semibold">Contact Telephone Number</Label>
              <Input id="clinic-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="clinic-address" className="text-xs font-semibold">Physical Location Address</Label>
              <Input id="clinic-address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Dynamic operating hours configuration mapping layout */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Clinic Operating Schedule</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTimingRow} className="h-8 gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Timing Window
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {timings.map((time, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 border p-3 rounded-lg bg-background/50">
                  <div className="w-full sm:flex-1">
                    <Input 
                      placeholder="e.g. Mon - Fri" 
                      value={time.days} 
                      onChange={(e) => handleUpdateTiming(idx, "days", e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-64">
                    <Input 
                      placeholder="08:00 AM" 
                      value={time.open} 
                      onChange={(e) => handleUpdateTiming(idx, "open", e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Input 
                      placeholder="05:00 PM" 
                      value={time.close} 
                      onChange={(e) => handleUpdateTiming(idx, "close", e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  {timings.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimingRow(idx)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Department Selection & Treatment Mapping Viewport */}
          <div className="border-t pt-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Configure Treatment Protocols</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Target Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Practice</SelectItem>
                    <SelectItem value="Cardiology">Cardiology Unit</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics Dept</SelectItem>
                    <SelectItem value="Dermatology">Dermatology Skin Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">Procedures and Protocols (JSON or Notes String)</Label>
                <Textarea 
                  rows={2} 
                  placeholder="Enter detailed treatment procedures here..." 
                  value={treatmentNotes} 
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/20 p-4 flex justify-end">
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving} className="h-9 px-6 text-xs font-semibold">
            {isSaving ? "Syncing profile..." : "Commit Clinic Parameters"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}