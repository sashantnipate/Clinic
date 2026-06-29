// src/feature/patients/patient-form.tsx
"use client";

import React, { useState } from "react";
import { Plus, CalendarIcon, Trash2, PlusCircle } from "lucide-react";
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

interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

interface CustomSection {
  id: string;
  title: string;
  fields: CustomField[];
}

export function PatientFormModal({ onAddPatient }: PatientFormModalProps) {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Core model-defined variables only
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Structural dynamic tracking state for custom sections & fields
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  
  // Captures inputted transactional data from dynamically rendered components
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const handleAddSection = () => {
    const sectionTitle = prompt("Enter section name (e.g., Lifestyle Information):");
    if (!sectionTitle) return;

    const newSection: CustomSection = {
      id: `sec_${Math.random().toString(36).substr(2, 9)}`,
      title: sectionTitle,
      fields: [],
    };
    setCustomSections((prev) => [...prev, newSection]);
  };

  const handleAddField = (sectionId: string) => {
    const label = prompt("Enter field display name (e.g., Blood Type):");
    if (!label) return;

    const type = prompt("Enter input type ('text', 'number', 'textarea', 'select'):") as any;
    if (!["text", "number", "textarea", "select"].includes(type)) {
      alert("Invalid field variant type configured.");
      return;
    }

    let options: string[] = [];
    if (type === "select") {
      const rawOptions = prompt("Enter comma-separated dropdown values (e.g., A+, O-, B+):");
      if (rawOptions) {
        options = rawOptions.split(",").map((opt) => opt.trim());
      }
    }

    const newField: CustomField = {
      id: `field_${Math.random().toString(36).substr(2, 9)}`,
      label,
      type,
      required: false,
      options: options.length > 0 ? options : undefined,
    };

    setCustomSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, fields: [...sec.fields, newField] } : sec
      )
    );
  };

  const handleRemoveSection = (sectionId: string) => {
    setCustomSections((prev) => prev.filter((sec) => sec.id !== sectionId));
  };

  const handleCustomValueChange = (fieldId: string, value: any) => {
    setCustomData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("Please select a valid date of birth.");
      return;
    }

    if (onAddPatient) {
      onAddPatient({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        dob: date,
        gender,
        customSections,
        customData,
        createdAt: new Date().toLocaleDateString(),
      });
    }

    // Reset components to initial states
    setFormData({ name: "", email: "", phone: "", address: "" });
    setCustomSections([]);
    setCustomData({});
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
          {/* Section 1: Core Mongoose Data Fields Only */}
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

              <div className="col-span-12 md:col-span-4 grid gap-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dob"
                      type="button"
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
                <Select value={gender} onValueChange={(v: any) => setGender(v)}>
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

          {/* Dynamic Sections and Fields Render Engine */}
          {customSections.map((section) => (
            <div key={section.id} className="space-y-4 pt-2 border-t border-dashed">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  {section.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleAddField(section.id)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Add Field
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="col-span-12 md:col-span-4 grid gap-1.5">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.id}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-background"
                        value={customData[field.id] || ""}
                        onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={customData[field.id] || ""}
                        onValueChange={(v) => handleCustomValueChange(field.id, v)}
                      >
                        <SelectTrigger id={field.id} className="h-10">
                          <SelectValue placeholder="Select choice" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        className="h-10"
                        value={customData[field.id] || ""}
                        onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Interactive Actions Zone */}
          <div className="pt-2 flex justify-start">
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed gap-2 h-11"
              onClick={handleAddSection}
            >
              <Plus className="h-4 w-4" /> Add Custom Field Section
            </Button>
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