"use client";

import React, { useState } from "react";
import { FileText, Edit, Trash2, Loader2, Link as NextLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePatientRecord } from "@/lib/actions/patient.actions";
import { PatientFormModal } from "../patient-form";
import { Patient } from "../types";

interface RowActionsProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function RowActions({ patient, onUpdatePatient, onDeletePatient, setSelectedIds }: RowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleConfirmedDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const result = await deletePatientRecord(token, patient.id);

      if (result.success) {
        onDeletePatient(patient.id);
        setSelectedIds((prev) => prev.filter((id) => id !== patient.id));
      }
    } catch (error) {
      console.error("Deletion process error: ", error);
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Medical Records Link / Action */}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0" onClick={() => { }}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Medical Records</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0" onClick={() => setEditModalOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Profile</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                disabled={isDeleting}
                onClick={() => setDeleteAlertOpen(true)}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Records</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Danger Zone Deletion Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the clinical records for{" "}
              <strong className="text-foreground">{patient.name}</strong>. This operational action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Controlled rendering configuration for modifying existing files */}
      {editModalOpen && (
        <PatientFormModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          patientToEdit={patient}
          onUpdatePatient={(updatedPatient) => {
            onUpdatePatient(updatedPatient);
            setEditModalOpen(false);
          }}
        />
      )}
    </>
  );
}