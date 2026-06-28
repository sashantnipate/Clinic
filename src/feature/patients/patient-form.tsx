// src/feature/patients/patient-form.tsx
"use client";

import React, { useState } from "react";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormModalProps {
  onAddPatient?: (patient: any) => void;
}

export function PatientFormModal({ onAddPatient }: PatientFormModalProps) {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [gender, setGender] = useState<string>("male");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onAddPatient) {
      onAddPatient({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        dob: date ? date.toLocaleDateString() : "",
        gender,
        status: "Active",
        createdAt: new Date().toLocaleDateString(),
      });
    }

    // Reset Form
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
    });
    setDate(undefined);
    setGender("male");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Patient
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 will-change-transform antialiased">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl md:text-2xl">Register New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's personal records and mandatory demographic information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Primary Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase border-b pb-2">
              Primary Details
            </h3>
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  className="h-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="h-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  className="h-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Shrunk Date of Birth from 8 columns down to 4 to mirror the layout of other fields */}
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dob"
                      className={cn(
                        "h-10 justify-start text-left font-normal px-3 bg-background",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      {date ? date.toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      defaultMonth={date}
                      captionLayout="dropdown"
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setCalendarOpen(false);
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender" className="h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 grid gap-1.5">
                <Label htmlFor="address">
                  Home Address <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                </Label>
                <Input
                  id="address"
                  className="h-10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contact (Marked explicitly as Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase border-b pb-2">
              Emergency Contact <span className="text-muted-foreground font-normal text-xs lowercase normal-case">(Optional)</span>
            </h3>
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input
                  id="emergencyName"
                  className="h-10"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                />
              </div>
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  className="h-10"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </div>
              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Input
                  id="emergencyRelation"
                  className="h-10"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Notes Area for Doctors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase border-b pb-2">
              Clinical Context
            </h3>
            <div className="grid col-span-12 gap-1.5">
              <Label htmlFor="notes">
                Patient Notes / Chief Complaint <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
              </Label>
              {/* Uses standard shadcn base text input structural style configured as a multi-line textarea */}
              <textarea
                id="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t gap-3 flex items-center justify-end bg-transparent">
            <Button 
              type="button" 
              variant="outline" 
              className="px-5 h-10"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-5 h-10"
            >
              Save Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}