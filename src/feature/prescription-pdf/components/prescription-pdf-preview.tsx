"use client";

import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PrescriptionPdfPayload, PrescriptionPdfSections } from "../types";
import { PrescriptionPdfDocument } from "./prescription-pdf-document";

interface PrescriptionPdfPreviewProps {
  payload: PrescriptionPdfPayload;
  sections: PrescriptionPdfSections;
  showPreview: boolean;
}

function buildFileName(payload: PrescriptionPdfPayload) {
  const patientName = payload.patient.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `prescription-${patientName || "patient"}-${payload.encounter.id}.pdf`;
}

export function PrescriptionPdfPreview({ payload, sections, showPreview }: PrescriptionPdfPreviewProps) {
  const document = <PrescriptionPdfDocument payload={payload} sections={sections} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-end">
        <PDFDownloadLink document={document} fileName={buildFileName(payload)}>
          {({ loading }) => (
            <Button size="sm" className="h-8 gap-1.5 text-xs" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {showPreview ? (
        <div className="min-h-[520px] flex-1 overflow-hidden rounded-md border bg-muted">
          <PDFViewer width="100%" height="100%" showToolbar className="min-h-[520px]">
            {document}
          </PDFViewer>
        </div>
      ) : (
        <div className="flex min-h-[520px] items-center justify-center rounded-md border border-dashed bg-muted/30 text-xs font-medium text-muted-foreground">
          Preview is hidden. Download stays available.
        </div>
      )}
    </div>
  );
}
