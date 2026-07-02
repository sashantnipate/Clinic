// src/feature/patient-profile/hooks/use-patient-profile.ts
"use client";

import { useState, useEffect } from "react";
import { getPatientById } from "@/lib/actions/patient.actions";

export function usePatientProfile(patientId: string) {
  const [patient, setPatient] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientDetails() {
      try {
        setIsLoading(true);
        // Pull down the active secure browser session JWT token
        const token = localStorage.getItem("clinic_jwt") || "";
        const result = await getPatientById(token, patientId);

        if (result.success) {
          setPatient(result.patient);
        } else {
          setError(result.error || "Failed to locate profile records.");
        }
      } catch (err) {
        console.error("Critical patient detail compilation exception:", err);
        setError("An unexpected exception took place.");
      } finally {
        setIsLoading(false);
      }
    }

    if (patientId) {
      loadPatientDetails();
    }
  }, [patientId]);

  /**
   * Helper utility function to parse the patient's Date of Birth
   * and calculate their current age string dynamically.
   */
  const parseAge = (dobString: string) => {
    if (!dobString) return "N/A";
    
    let birthYear = new Date(dobString).getFullYear();
    
    // Backup fallback if date parser encounters string segments containing slashes
    if (isNaN(birthYear) && dobString.includes("/")) {
      const segments = dobString.split("/");
      const yearCandidate = parseInt(segments[segments.length - 1], 10);
      if (yearCandidate) birthYear = yearCandidate;
    }
    
    if (isNaN(birthYear)) return "N/A";
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return `${age} Yrs old`;
  };

  return {
    patient,
    isLoading,
    error,
    ageText: parseAge(patient?.dob),
  };
}