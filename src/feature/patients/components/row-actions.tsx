"use client";

import React, { useState } from "react";
import { MoreHorizontal, FileText, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-md" disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Swapped text & icon to point to Medical Records */}
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4 text-muted-foreground" /> Medical Records
          </DropdownMenuItem>
          
          {/* This item now triggers the form modal directly */}
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4 text-muted-foreground" /> Edit Profile
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteAlertOpen(true)}
            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Delete Records
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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