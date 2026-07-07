"use client";

import { PatientFormModal } from "@/feature/patients/patient-form";
import { PatientsTable } from "@/feature/patients/patients-table";
import { usePatientsTable } from "@/feature/patients/hooks/use-patients-table";
import { Patient } from "@/feature/patients/types";

export default function PatientsPage() {
  const tableState = usePatientsTable(10);

  const handleAddPatient = () => {
    tableState.triggerRefresh();
  };

  const handleUpdatePatient = () => {
    tableState.triggerRefresh();
  };

  const handleDeletePatient = () => {
    tableState.triggerRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your clinic's registered records and check clinical intake statuses.
          </p>
        </div>
        <div className="shrink-0">
          <PatientFormModal onAddPatient={handleAddPatient} />
        </div>
      </div>

      <PatientsTable
        tableState={tableState}
        onUpdatePatient={handleUpdatePatient}
        onDeletePatient={handleDeletePatient}
      />
    </div>
  );
}