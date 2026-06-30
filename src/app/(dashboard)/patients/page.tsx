"use client";

import { useState, useEffect } from "react";
import { PatientFormModal } from "@/feature/patients/patient-form";
import { PatientsTable, Patient } from "@/feature/patients/patients-table";
import { getPatients } from "@/lib/actions/patient.actions";
import { Loader2 } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const result = await getPatients(token);
        
        if (result.success) {
          const formattedPatients = result.patients.map((p: any) => ({
            id: p._id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            dob: p.dob, 
            gender: p.gender,
            createdAt: new Date(p.createdAt).toLocaleDateString("en-GB"),
            // Pass along custom fields for the Edit Modal
            customSections: p.customSections,
            customData: p.customData
          }));
          setPatients(formattedPatients);
        }
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, []);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) => 
      prev.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    );
  };

  const handleDeletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2 border rounded-md bg-card shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading patient records...</p>
        </div>
      ) : (
        <PatientsTable 
          patients={patients} 
          onUpdatePatient={handleUpdatePatient}
          onDeletePatient={handleDeletePatient} 
        />
      )}
    </div>
  );
}