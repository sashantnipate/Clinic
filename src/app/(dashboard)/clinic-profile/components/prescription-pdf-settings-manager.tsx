"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { prescriptionPdfSectionGroups, prescriptionPdfSectionLabels } from "@/feature/prescription-pdf/defaults";
import type { PrescriptionPdfSections, PrescriptionPdfSectionKey } from "@/feature/prescription-pdf/types";

// Base all true default
const FULL_SECTIONS_DEFAULT: PrescriptionPdfSections = {
    clinicLogo: true, clinicName: true, clinicAddress: true, clinicPhone: true, clinicTimings: true,
    clinicInstagram: true, clinicFacebook: true, clinicX: true, clinicWebsite: true, clinicWebsiteQrCode: true,
    patientName: true, patientDobAge: true, patientGender: true, patientPhone: true, patientEmail: true, patientAddress: true,
    encounterDate: true, encounterDoctor: true, encounterDepartment: true, complaint: true, notes: true, medications: true, followupDate: true
};

export function PrescriptionPdfSettingsManager({ initialSettings }: { initialSettings: any }) {
    const [sections, setSections] = useState<PrescriptionPdfSections>(initialSettings?.prescriptionPdfSettings || FULL_SECTIONS_DEFAULT);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialSettings?.prescriptionPdfSettings) {
            setSections(initialSettings.prescriptionPdfSettings);
        }
    }, [initialSettings]);

    const updateSection = (key: PrescriptionPdfSectionKey, checked: boolean) => {
        setSections((current) => {
            const updated = { ...current, [key]: checked };
            return updated;
        });
    };

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("clinic_jwt") || "";

            // Passing along other existing settings to prevent overwrite
            const updatedPayload = {
                address: initialSettings?.address || "",
                phone: initialSettings?.phone || "",
                timings: initialSettings?.timings || [],
                socialLinks: initialSettings?.socialLinks || {},
                prescriptionPdfSettings: sections,
            };

            const res = await updateClinicSettingAction(token, updatedPayload);
            if (res.success) {
                toast.success("Prescription PDF preferences updated successfully.");
            } else {
                toast.error(res.error || "Failed to save PDF preferences.");
            }
        } catch (err) {
            toast.error("Failed to commit PDF preferences to the database.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Prescription PDF Export Defaults
                </h2>
                <p className="text-sm text-muted-foreground">
                    Select which sections should be included by default when exporting the clinical case summary to PDF. Doctors can still toggle the visibility for individual encounters during export without saving the changes.
                </p>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-4 bg-muted/20">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-foreground">Visible Settings Block</p>
                    </div>
                </div>

                <div className="p-4">
                    <Accordion type="multiple" defaultValue={prescriptionPdfSectionGroups.map((g) => g.title)} className="w-full space-y-4">
                        {prescriptionPdfSectionGroups.map((group) => (
                            <AccordionItem key={group.title} value={group.title} className="rounded-xl border bg-card px-4 py-1 shadow-sm border-stone-200">
                                <AccordionTrigger className="hover:no-underline py-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {group.title}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-1 pb-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {group.keys.map((key) => (
                                            <label
                                                key={key}
                                                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/30 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={sections[key]}
                                                    onCheckedChange={(checked) => updateSection(key, checked === true)}
                                                />
                                                <span className="font-medium text-foreground/90">
                                                    {prescriptionPdfSectionLabels[key]}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div className="p-4 flex justify-end border-t bg-muted/20">
                    <Button size="sm" onClick={handleSaveSettings} disabled={isSaving} className="h-8 text-xs font-semibold">
                        {isSaving ? "Saving..." : "Save PDF Preferences"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
