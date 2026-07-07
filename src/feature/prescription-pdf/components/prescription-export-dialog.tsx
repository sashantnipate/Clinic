"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getPrescriptionPdfPayloadAction } from "@/lib/actions/prescription-pdf.actions";
import {
  buildDefaultPrescriptionPdfSections,
  isPrescriptionPdfSectionAvailable,
  prescriptionPdfSectionGroups,
  prescriptionPdfSectionLabels,
} from "../defaults";
import type { PrescriptionPdfPayload, PrescriptionPdfSectionKey, PrescriptionPdfSections } from "../types";
import { PrescriptionPdfPreview } from "./prescription-pdf-preview";

interface PrescriptionExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  encounterId?: string;
}

export function PrescriptionExportDialog({
  open,
  onOpenChange,
  patientId,
  encounterId,
}: PrescriptionExportDialogProps) {
  const [payload, setPayload] = useState<PrescriptionPdfPayload | null>(null);
  const [sections, setSections] = useState<PrescriptionPdfSections | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPayload() {
      if (!open || !encounterId) return;

      try {
        setIsLoading(true);
        setPayload(null);
        setSections(null);
        const token = localStorage.getItem("clinic_jwt") || "";
        const res = await getPrescriptionPdfPayloadAction(token, { patientId, encounterId });

        if (cancelled) return;

        if (res.success) {
          setPayload(res.data);
          setSections(buildDefaultPrescriptionPdfSections(res.data));
        } else {
          toast.error(res.error || "Could not prepare prescription PDF.");
        }
      } catch {
        if (!cancelled) toast.error("Prescription PDF preparation failed.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPayload();

    return () => {
      cancelled = true;
    };
  }, [encounterId, open, patientId]);

  const unavailableSections = useMemo(() => {
    if (!payload) return new Set<PrescriptionPdfSectionKey>();
    return new Set(
      Object.keys(prescriptionPdfSectionLabels).filter(
        (key) => !isPrescriptionPdfSectionAvailable(key as PrescriptionPdfSectionKey, payload)
      ) as PrescriptionPdfSectionKey[]
    );
  }, [payload]);

  const updateSection = (key: PrescriptionPdfSectionKey, checked: boolean) => {
    setSections((current) => (current ? { ...current, [key]: checked } : current));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Forcing explicit layout sizes directly using inline styles to override hardcoded component styles */}
      <DialogContent
        className="flex max-h-[92vh] flex-col gap-4 overflow-hidden p-6"
        style={{ maxWidth: "1240px", width: "94vw" }}
      >
        <DialogHeader className="shrink-0 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <FileText className="h-4 w-4 text-primary" />
            Prescription PDF Export
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select what the doctor wants to include, preview the PDF, then download it. This version does not store the PDF.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[550px] flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Preparing clinic, patient, and prescription data...</p>
          </div>
        ) : payload && sections ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            <div className="flex min-h-0 flex-col rounded-xl border bg-card shadow-3xs overflow-hidden h-[540px]">
              <div className="flex items-center justify-between border-b p-4 bg-muted/20 shrink-0">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground">Visible Fields</p>
                  <p className="text-[11px] text-muted-foreground">Omitted fields are disabled</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pdf-preview-switch" className="text-[11px] font-medium text-muted-foreground">
                    Preview
                  </Label>
                  <Switch id="pdf-preview-switch" size="sm" checked={showPreview} onCheckedChange={setShowPreview} />
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-5 p-4">
                  <Accordion
                    type="multiple"
                    defaultValue={prescriptionPdfSectionGroups.map((g) => g.title)}
                    className="w-full space-y-4"
                  >
                    {prescriptionPdfSectionGroups.map((group) => (
                      <AccordionItem
                        key={group.title}
                        value={group.title}
                        className="rounded-xl border bg-card px-4 py-1 shadow-2xs border-stone-200"
                      >
                        <AccordionTrigger className="hover:no-underline py-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {group.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-3">
                          <div className="space-y-2">
                            {group.keys.map((key) => {
                              const disabled = unavailableSections.has(key);
                              return (
                                <label
                                  key={key}
                                  className="flex min-h-8 items-center gap-3 rounded-lg border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/30 cursor-pointer has-disabled:opacity-40 has-disabled:cursor-not-allowed"
                                >
                                  <Checkbox
                                    checked={sections[key]}
                                    disabled={disabled}
                                    onCheckedChange={(checked) => updateSection(key, checked === true)}
                                  />
                                  <span className="font-medium text-foreground/90">
                                    {prescriptionPdfSectionLabels[key]}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {!sections.medications && (
                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="leading-normal">Medication list is unselected. The document will export explicitly as a medical encounter clinical summary case file.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <PrescriptionPdfPreview payload={payload} sections={sections} showPreview={showPreview} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[550px] items-center justify-center rounded-xl border border-dashed text-xs font-medium text-muted-foreground">
            Select an encounter node trajectory sequence block to mount prescription schemas.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}