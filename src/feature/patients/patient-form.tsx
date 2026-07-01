"use client";

import React, { useState, useEffect } from "react";
import { Plus, CalendarIcon, Trash2, Loader2 } from "lucide-react";
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
import { getRegistrationSections } from "@/lib/actions/section.actions";
import { createPatientRecord, updatePatientRecord } from "@/lib/actions/patient.actions";

interface PatientFormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  patientToEdit?: any;
  onAddPatient?: (patient: any) => void;
  onUpdatePatient?: (patient: any) => void;
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

export function PatientFormModal({ 
  open: externalOpen, 
  onOpenChange, 
  patientToEdit, 
  onAddPatient,
  onUpdatePatient 
}: PatientFormModalProps) {
  // Support both internal standalone trigger state and external table action trigger state
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const getBrowserToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clinic_jwt") || "";
    }
    return "";
  };

  // Pre-populate fields automatically if modifying an existing clinical record
  useEffect(() => {
    if (open) {
      if (patientToEdit) {
        setFormData({
          name: patientToEdit.name || "",
          email: patientToEdit.email || "",
          phone: patientToEdit.phone || "",
          address: patientToEdit.address || "",
        });
        setGender((patientToEdit.gender?.toLowerCase() as any) || "male");
        
        // Parse date safely whether it comes as Date string or ISO candidate
        if (patientToEdit.dob) {
          const parsedDate = new Date(patientToEdit.dob);
          setDate(isNaN(parsedDate.getTime()) ? undefined : parsedDate);
        } else {
          setDate(undefined);
        }

        setCustomSections(patientToEdit.customSections || []);
        setCustomData(patientToEdit.customData || {});
      } else {
        // Clear old fields completely if opening a fresh blank addition form
        setFormData({ name: "", email: "", phone: "", address: "" });
        setGender("male");
        setDate(undefined);
        setCustomSections([]);
        setCustomData({});
      }
    }
  }, [patientToEdit, open]);

  useEffect(() => {
    async function loadTemplates() {
      if (!open) return;
      try {
        const token = getBrowserToken();
        const result = await getRegistrationSections(token);
        if (result.success) {
          setAvailableSections(result.sections.filter((s: any) => s.isActive) || []);
        }
      } catch (err) {
        console.error("Failed to load registration sections", err);
      }
    }
    loadTemplates();
  }, [open]);

  const handleAddSectionFromTemplate = () => {
    if (!selectedTemplateId) return;
    
    const template = availableSections.find(s => s._id === selectedTemplateId);
    if (!template) return;

    if (customSections.some(sec => sec.id === template._id)) {
      alert("This section has already been added.");
      return;
    }

    const newSection: CustomSection = {
      id: template._id,
      title: template.title,
      fields: template.fields.map((f: any) => ({
        id: `field_${Math.random().toString(36).substr(2, 9)}`,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
      })),
    };

    setCustomSections((prev) => [...prev, newSection]);
    setSelectedTemplateId("");
  };

  const handleRemoveSection = (sectionId: string) => {
    setCustomSections((prev) => prev.filter((sec) => sec.id !== sectionId));
    
    const sectionToRemove = customSections.find(s => s.id === sectionId);
    if (sectionToRemove) {
      setCustomData(prev => {
        const newData = { ...prev };
        sectionToRemove.fields.forEach(field => delete newData[field.id]);
        return newData;
      });
    }
  };

  const handleCustomValueChange = (fieldId: string, value: any) => {
    setCustomData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("Please select a valid date of birth.");
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || undefined,
      dob: date.toISOString(),
      gender,
      customSections,
      customData,
    };

    try {
      const token = getBrowserToken();
      
      if (patientToEdit) {
        // EXECUTE PROFILE EDIT UPDATE
        const result = await updatePatientRecord(token, patientToEdit.id, payload);
        if (result.success && onUpdatePatient) {
          onUpdatePatient({
            id: patientToEdit.id,
            name: result.patient.name,
            email: result.patient.email,
            phone: result.patient.phone,
            dob: result.patient.dob,
            gender: result.patient.gender,
            createdAt: patientToEdit.createdAt, // Retain display registration date
            customSections: result.patient.customSections,
            customData: result.patient.customData
          });
          setOpen(false);
        } else {
          alert(result.error || "Failed to update profile data.");
        }
      } else {
        // EXECUTE FRESH INTAKE CREATION
        const result = await createPatientRecord(token, payload);
        if (result.success && onAddPatient) {
          onAddPatient({
            id: result.patient._id,
            name: result.patient.name,
            email: result.patient.email,
            phone: result.patient.phone,
            dob: result.patient.dob,
            gender: result.patient.gender,
            createdAt: new Date(result.patient.createdAt).toLocaleDateString("en-GB"),
            customSections: result.patient.customSections,
            customData: result.patient.customData
          });
          setOpen(false);
        } else {
          alert(result.error || "Failed to save patient.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const unaddedSections = availableSections.filter(
    (s) => !customSections.some((cs) => cs.id === s._id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dynamic Condition: Only show primary trigger button if it's not being controlled externally */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 will-change-transform antialiased">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl md:text-2xl">
            {patientToEdit ? `Modify Profile: ${patientToEdit.name}` : "Register New Patient"}
          </DialogTitle>
          <DialogDescription>
            Enter the patient's personal records and mandatory demographic information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      {date ? date.toLocaleDateString("en-GB") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      defaultMonth={date || new Date(2000, 0, 1)}
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

          {/* Custom Template Sections Layout Renderer */}
          {customSections.map((section) => (
            <div key={section.id} className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  {section.title}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 -my-1"
                  onClick={() => handleRemoveSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="col-span-12 md:col-span-4 grid gap-1.5">
                    <Label htmlFor={field.id}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.id}
                        required={field.required}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-background"
                        value={customData[field.id] || ""}
                        onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        required={field.required}
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
                        required={field.required}
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

          {/* Template Dynamic Selector Tool */}
          <div className="pt-4 flex flex-col sm:flex-row items-end gap-3 border-t border-dashed">
            <div className="w-full sm:w-[300px] grid gap-1.5">
              <Label>Additional Assessment Structural Modules</Label>
              <Select 
                value={selectedTemplateId} 
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select custom blueprint module..." />
                </SelectTrigger>
                <SelectContent>
                  {unaddedSections.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {availableSections.length === 0 ? "No active schema template records found" : "All template profiles appended"}
                    </SelectItem>
                  ) : (
                    unaddedSections.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto h-10 shrink-0"
              onClick={handleAddSectionFromTemplate}
              disabled={!selectedTemplateId || selectedTemplateId === "none"}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Template
            </Button>
          </div>

          <DialogFooter className="pt-6 border-t gap-3 flex items-center justify-end bg-transparent">
            <Button 
              type="button" 
              variant="outline" 
              className="px-5 h-10"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-5 h-10"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Persisting Record...
                </>
              ) : (
                patientToEdit ? "Save Changes" : "Save Patient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}