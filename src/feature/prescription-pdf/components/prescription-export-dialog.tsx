"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      <DialogContent className="flex max-h-[94vh] w-[96vw] max-w-6xl flex-col gap-4 overflow-hidden p-5">
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
          <div className="flex min-h-[520px] flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Preparing clinic, patient, and prescription data...</p>
          </div>
        ) : payload && sections ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="min-h-0 rounded-md border bg-background">
              <div className="flex items-center justify-between border-b p-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sections</p>
                  <p className="text-[11px] text-muted-foreground">Unavailable fields are disabled.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pdf-preview-switch" className="text-[11px] font-medium text-muted-foreground">
                    Preview
                  </Label>
                  <Switch id="pdf-preview-switch" size="sm" checked={showPreview} onCheckedChange={setShowPreview} />
                </div>
              </div>

              <ScrollArea className="h-[560px]">
                <div className="space-y-4 p-3">
                  {prescriptionPdfSectionGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{group.title}</p>
                      <div className="space-y-2">
                        {group.keys.map((key) => {
                          const disabled = unavailableSections.has(key);
                          return (
                            <label
                              key={key}
                              className="flex min-h-8 items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors has-disabled:opacity-50"
                            >
                              <Checkbox
                                checked={sections[key]}
                                disabled={disabled}
                                onCheckedChange={(checked) => updateSection(key, checked === true)}
                              />
                              <span className="font-medium">{prescriptionPdfSectionLabels[key]}</span>
                            </label>
                          );
                        })}
                      </div>
                      <Separator />
                    </div>
                  ))}

                  {!sections.medications ? (
                    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>Medication list is deselected. The generated PDF will read as an encounter summary.</p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>

            <PrescriptionPdfPreview payload={payload} sections={sections} showPreview={showPreview} />
          </div>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-md border border-dashed text-xs font-medium text-muted-foreground">
            Select an encounter to prepare a prescription PDF.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
