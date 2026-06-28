"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PatientFormModal } from "@/feature/patients/patient-form";
import { PatientsTable, Patient } from "@/feature/patients/patients-table";
import { Search } from "lucide-react";

export const MOCK_PATIENTS: Patient[] = [
  { id: "1", name: "Eleanor Vance", email: "eleanor.v@example.com", phone: "(555) 234-5678", dob: "1988-04-12", gender: "female", createdAt: "06/15/2026" },
  { id: "2", name: "Marcus Brody", email: "m.brody@example.com", phone: "(555) 876-5432", dob: "1974-11-23", gender: "male", createdAt: "06/20/2026" },
  { id: "3", name: "Sashant Nipate", email: "sashantnipat@gmail.com", phone: "9403909736", dob: "2006-05-14", gender: "male", createdAt: "06/28/2026" },
  { id: "4", name: "Aria Montgomery", email: "aria.m@example.com", phone: "(555) 111-2233", dob: "1992-08-30", gender: "female", createdAt: "05/10/2026" },
  { id: "5", name: "David Chen", email: "dchen.88@example.com", phone: "(555) 444-5566", dob: "1985-02-15", gender: "male", createdAt: "05/12/2026" },
  { id: "6", name: "Sarah Jenkins", email: "s.jenkins@example.com", phone: "(555) 777-8899", dob: "1979-11-05", gender: "female", createdAt: "05/14/2026" },
  { id: "7", name: "Michael Chang", email: "mike.chang@example.com", phone: "(555) 222-3344", dob: "1995-07-22", gender: "male", createdAt: "05/18/2026" },
  { id: "8", name: "Priya Sharma", email: "psharma.med@example.com", phone: "(555) 999-0000", dob: "1990-09-14", gender: "female", createdAt: "05/20/2026" },
  { id: "9", name: "James Wilson", email: "jwilson.design@example.com", phone: "(555) 123-9876", dob: "1968-03-25", gender: "male", createdAt: "05/22/2026" },
  { id: "10", name: "Elena Rodriguez", email: "elena.rod@example.com", phone: "(555) 456-1234", dob: "1982-12-10", gender: "female", createdAt: "05/25/2026" },
  { id: "11", name: "Sam Taylor", email: "staylor.art@example.com", phone: "(555) 789-4561", dob: "1998-04-18", gender: "other", createdAt: "06/01/2026" },
  { id: "12", name: "Robert Fox", email: "rfox.business@example.com", phone: "(555) 321-6549", dob: "1971-06-08", gender: "male", createdAt: "06/02/2026" },
  { id: "13", name: "Lisa Wong", email: "lwong.tech@example.com", phone: "(555) 654-9871", dob: "1987-10-29", gender: "female", createdAt: "06/05/2026" },
  { id: "14", name: "Thomas Wright", email: "twright.edu@example.com", phone: "(555) 987-1234", dob: "1965-01-15", gender: "male", createdAt: "06/07/2026" },
  { id: "15", name: "Amanda Martinez", email: "amanda.m@example.com", phone: "(555) 147-2589", dob: "1993-05-20", gender: "female", createdAt: "06/08/2026" },
  { id: "16", name: "Christopher Lee", email: "clee.dev@example.com", phone: "(555) 258-3691", dob: "1989-11-11", gender: "male", createdAt: "06/10/2026" },
  { id: "17", name: "Jessica Garcia", email: "jgarcia.hr@example.com", phone: "(555) 369-1472", dob: "1984-08-05", gender: "female", createdAt: "06/11/2026" },
  { id: "18", name: "Matthew Davis", email: "mdavis.sales@example.com", phone: "(555) 741-8529", dob: "1978-02-28", gender: "male", createdAt: "06/12/2026" },
  { id: "19", name: "Ashley Smith", email: "asmith.mktg@example.com", phone: "(555) 852-9637", dob: "1991-07-16", gender: "female", createdAt: "06/14/2026" },
  { id: "20", name: "Kevin Johnson", email: "kjohnson.ops@example.com", phone: "(555) 963-7418", dob: "1980-09-02", gender: "male", createdAt: "06/16/2026" },
  { id: "21", name: "Michelle White", email: "mwhite.finance@example.com", phone: "(555) 159-7534", dob: "1975-12-25", gender: "female", createdAt: "06/18/2026" },
  { id: "22", name: "Brian Harris", email: "bharris.legal@example.com", phone: "(555) 753-1596", dob: "1969-04-10", gender: "male", createdAt: "06/19/2026" },
  { id: "23", name: "Rachel Martin", email: "rmartin.pr@example.com", phone: "(555) 357-9514", dob: "1994-01-30", gender: "female", createdAt: "06/21/2026" },
  { id: "24", name: "Justin Thompson", email: "jthompson.it@example.com", phone: "(555) 951-3578", dob: "1986-06-14", gender: "male", createdAt: "06/22/2026" },
  { id: "25", name: "Kimberly Clark", email: "kclark.admin@example.com", phone: "(555) 246-8135", dob: "1996-10-08", gender: "female", createdAt: "06/23/2026" },
  { id: "26", name: "Eric Lewis", email: "elewis.eng@example.com", phone: "(555) 813-5246", dob: "1981-03-17", gender: "male", createdAt: "06/24/2026" },
  { id: "27", name: "Laura Robinson", email: "lrobinson.med@example.com", phone: "(555) 135-7924", dob: "1977-08-22", gender: "female", createdAt: "06/25/2026" },
  { id: "28", name: "Steven Walker", email: "swalker.arch@example.com", phone: "(555) 792-4135", dob: "1972-11-03", gender: "male", createdAt: "06/26/2026" },
  { id: "29", name: "Alex Jordan", email: "ajordan.freelance@example.com", phone: "(555) 468-2579", dob: "1999-02-14", gender: "other", createdAt: "06/27/2026" },
  { id: "30", name: "Emily Hall", email: "ehall.edu@example.com", phone: "(555) 257-9468", dob: "1983-05-27", gender: "female", createdAt: "06/28/2026" },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  // Filter patients list dynamically based on search string
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
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

      
      {/* Structured Listings Output */}
      <PatientsTable patients={filteredPatients} />
    </div>
  );
}