"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { getPatientMedicalHistoryExportAction } from "@/lib/actions/medical-history.actions";
import { MedicalHistoryPdfDocument } from "../components/medical-history-pdf-document";
import { pdf } from "@react-pdf/renderer";

export function useMedicalHistoryExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportMedicalHistoryPdf = async (patientId: string, patientName: string, patientDetails: string) => {
        try {
            setIsExporting(true);
            const token = localStorage.getItem("clinic_jwt") || "";
            const res = await getPatientMedicalHistoryExportAction(token, patientId);

            if (res.success && res.data) {
                const encounters = res.data;

                // Generate PDF Document
                const blob = await pdf(
                    <MedicalHistoryPdfDocument
                        patientName={patientName}
                        patientDetails={patientDetails}
                        encounters={encounters}
                    />
                ).toBlob();

                // Download logic
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${patientName.replace(/\s+/g, "_")}_Medical_History.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast.success("Medical history successfully exported as PDF.");
            } else {
                toast.error(res.error || "Could not retrieve medical history data.");
            }
        } catch (error: any) {
            toast.error("An error occurred during PDF generation.");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    return { exportMedicalHistoryPdf, isExporting };
}
