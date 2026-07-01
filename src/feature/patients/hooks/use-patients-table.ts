"use client";

import { useState, useMemo } from "react";
import { Patient, VisibleColumns } from "../types";

export function usePatientsTable(initialPatients: Patient[], itemsPerPage = 10) {
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

  const processedPatients = useMemo(() => {
    let result = initialPatients.filter((p) => {
      if (!p) return false;
      const name = p.name?.toLowerCase() || "";
      const email = p.email?.toLowerCase() || "";
      const phone = p.phone || "";
      const createdAt = p.createdAt || "";
      const query = globalSearch.toLowerCase();

      const matchesGlobal = name.includes(query) || email.includes(query) || phone.includes(query);
      const matchesNameColumn = name.includes(nameFilter.toLowerCase());
      const matchesGenderColumn = genderFilter === "all" || (p.gender?.toLowerCase() || "") === genderFilter;
      const matchesContactColumn = email.includes(contactFilter.toLowerCase()) || phone.includes(contactFilter);
      const matchesRegDateColumn = createdAt.includes(regDateFilter);

      let matchesAgeCondition = true;
      if (ageCondition !== "none" && ageValue) {
        const patientAge = parseAge(p.dob);
        const targetAge = parseInt(ageValue, 10);
        if (patientAge !== null && !isNaN(targetAge)) {
          if (ageCondition === "gt") matchesAgeCondition = patientAge > targetAge;
          if (ageCondition === "lt") matchesAgeCondition = patientAge < targetAge;
          if (ageCondition === "eq") matchesAgeCondition = patientAge === targetAge;
        } else {
          matchesAgeCondition = false;
        }
      }

      return matchesGlobal && matchesNameColumn && matchesGenderColumn && matchesAgeCondition && matchesContactColumn && matchesRegDateColumn;
    });

    if (sortOrder) {
      result.sort((a, b) => {
        if (sortOrder === "asc") return (a.name || "").localeCompare(b.name || "");
        return (b.name || "").localeCompare(a.name || "");
      });
    }

    return result;
  }, [initialPatients, globalSearch, sortOrder, nameFilter, genderFilter, ageCondition, ageValue, contactFilter, regDateFilter]);

  const totalPages = Math.max(Math.ceil(processedPatients.length / itemsPerPage), 1);
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const paginatedPatients = useMemo(() => {
    const startIdx = (activePage - 1) * itemsPerPage;
    return processedPatients.slice(startIdx, startIdx + itemsPerPage);
  }, [processedPatients, activePage, itemsPerPage]);

  const currentFilteredIds = processedPatients.map((p) => p.id);
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
    currentPage: activePage, setCurrentPage, totalPages,
    nameFilter, setNameFilter,
    genderFilter, setGenderFilter,
    ageCondition, setAgeCondition,
    ageValue, setAgeValue,
    contactFilter, setContactFilter,
    regDateFilter, setRegDateFilter,
    visibleColumns, setVisibleColumns,
    selectedIds, setSelectedIds, isAllSelected, isSomeSelected, selectedVisibleCount,
    processedPatients, paginatedPatients,
    handleToggleRow, handleToggleAll, parseAge,
  };
}