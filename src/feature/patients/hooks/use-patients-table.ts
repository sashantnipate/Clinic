"use client";

import { useState, useMemo, useEffect } from "react";
import { Patient, VisibleColumns } from "../types";
import { getPatients } from "@/lib/actions/patient.actions";

export function usePatientsTable(itemsPerPage = 10) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Filters
  const [nameFilter, setNameFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageCondition, setAgeCondition] = useState<"gt" | "lt" | "eq" | "none">("none");
  const [ageValue, setAgeValue] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [regDateFilter, setRegDateFilter] = useState("");

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    genderAge: true,
    contactInfo: true,
    regDate: true,
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0); // Optional force refresh

  const triggerRefresh = () => setRefreshTick(prev => prev + 1);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const result = await getPatients(token, {
          page: currentPage,
          limit: itemsPerPage,
          globalSearch,
          nameFilter,
          genderFilter,
          ageCondition,
          ageValue,
          contactFilter,
          regDateFilter,
          sortOrder,
        });

        if (result.success) {
          const formattedPatients = result.patients.map((p: any) => ({
            id: p._id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            dob: p.dob,
            gender: p.gender,
            createdAt: new Date(p.createdAt).toLocaleDateString("en-GB"),
            customSections: p.customSections,
            customData: p.customData
          }));
          setPatients(formattedPatients);
          setTotalRecords(result.totalRecords || 0);
          setTotalPages(result.totalPages || 1);
        } else {
          setPatients([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load patients", err);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [
    currentPage,
    itemsPerPage,
    globalSearch,
    nameFilter,
    genderFilter,
    ageCondition,
    ageValue,
    contactFilter,
    regDateFilter,
    sortOrder,
    refreshTick
  ]);

  const parseAge = (dobString: string) => {
    if (!dobString) return null;
    let birthYear = new Date(dobString).getFullYear();
    if (isNaN(birthYear) && dobString.includes("/")) {
      const segments = dobString.split("/");
      const yearCandidate = parseInt(segments[segments.length - 1], 10);
      if (yearCandidate) birthYear = yearCandidate;
    }
    if (isNaN(birthYear)) return null;
    return new Date().getFullYear() - birthYear;
  };

  const currentFilteredIds = patients.map((p) => p.id);
  const selectedVisibleCount = currentFilteredIds.filter((id) => selectedIds.includes(id)).length;
  const isAllSelected = currentFilteredIds.length > 0 && selectedVisibleCount === currentFilteredIds.length;
  const isSomeSelected = selectedVisibleCount > 0 && selectedVisibleCount < currentFilteredIds.length;

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)));
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    }
  };

  return {
    globalSearch, setGlobalSearch,
    sortOrder, setSortOrder,
    currentPage, setCurrentPage, totalPages, totalRecords,
    nameFilter, setNameFilter,
    genderFilter, setGenderFilter,
    ageCondition, setAgeCondition,
    ageValue, setAgeValue,
    contactFilter, setContactFilter,
    regDateFilter, setRegDateFilter,
    visibleColumns, setVisibleColumns,
    selectedIds, setSelectedIds, isAllSelected, isSomeSelected, selectedVisibleCount,
    paginatedPatients: patients,
    isLoading,
    triggerRefresh,
    setPatients,
    handleToggleRow, handleToggleAll, parseAge,
  };
}