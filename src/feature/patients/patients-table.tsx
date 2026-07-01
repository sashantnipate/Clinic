"use client";

import React from "react";
import { Phone, Mail, Calendar as CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { Popover as ShadcnPopover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label as ShadcnLabel } from "@/components/ui/label";
import { Button as ShadcnButton } from "@/components/ui/button";

import { usePatientsTable } from "./hooks/use-patients-table";
import { TableFilters, NameHeaderFilter, MetricsHeaderFilter } from "./components/table-filters";
import { RowActions } from "./components/row-actions";
import { TablePagination } from "./components/table-pagination";
import { Patient } from "./types";

interface PatientsTableProps {
  patients: Patient[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export function PatientsTable({ patients, onUpdatePatient, onDeletePatient }: PatientsTableProps) {
  const t = usePatientsTable(patients);

  return (
    <div className="w-full space-y-4">
      {/* Search & Global Column Configuration Bar */}
      <TableFilters
        globalSearch={t.globalSearch}
        setGlobalSearch={t.setGlobalSearch}
        setCurrentPage={t.setCurrentPage}
        visibleColumns={t.visibleColumns}
        setVisibleColumns={t.setVisibleColumns}
        nameFilter={t.nameFilter}
        setNameFilter={t.setNameFilter}
        genderFilter={t.genderFilter}
        setGenderFilter={t.setGenderFilter}
        ageCondition={t.ageCondition}
        setAgeCondition={t.setAgeCondition}
        ageValue={t.ageValue}
        setAgeValue={t.setAgeValue}
        contactFilter={t.contactFilter}
        setContactFilter={t.setContactFilter}
        regDateFilter={t.regDateFilter}
        setRegDateFilter={t.setRegDateFilter}
        setSortOrder={t.setSortOrder}
      />

      {/* 📱 Mobile Responsive Cards Display Grid */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {t.paginatedPatients.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground text-sm bg-card">
            No matching patient records found.
          </div>
        ) : (
          t.paginatedPatients.map((patient) => {
            const age = t.parseAge(patient.dob);
            const isSelected = t.selectedIds.includes(patient.id);

            return (
              <div
                key={patient.id}
                className={cn(
                  "rounded-lg border p-4 bg-card space-y-3 shadow-xs transition-colors relative",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => t.handleToggleRow(patient.id, !!v)}
                      aria-label="Select row item"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground tracking-tight">{patient.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground capitalize">
                        <span>{patient.gender}</span>
                        <span>•</span>
                        <span>{age !== null ? `${age} Yrs old` : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <RowActions
                    patient={patient}
                    onUpdatePatient={onUpdatePatient}
                    onDeletePatient={onDeletePatient}
                    setSelectedIds={t.setSelectedIds}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end text-right space-y-1">
                    <span className="text-[10px] tracking-wider uppercase font-medium">Registered:</span>
                    <div className="flex items-center justify-end gap-1 text-foreground">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{patient.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 💻 Desktop Grid Mode Data Table Viewport */}
      <div className="hidden md:block rounded-md border bg-card max-h-[600px] overflow-y-auto relative shadow-2xs">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card border-b shadow-xs">
            <TableRow className="bg-muted/10 hover:bg-transparent">
              <TableHead className="w-[50px] h-12 bg-card">
                <Checkbox
                  checked={t.isAllSelected ? true : t.isSomeSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => t.handleToggleAll(!!v)}
                  aria-label="Select all rows"
                />
              </TableHead>

              <TableHead className="h-12 min-w-[200px] bg-card">
                <NameHeaderFilter
                  nameFilter={t.nameFilter}
                  setNameFilter={t.setNameFilter}
                  setCurrentPage={t.setCurrentPage}
                  setSortOrder={t.setSortOrder}
                />
              </TableHead>

              {t.visibleColumns.genderAge && (
                <TableHead className="h-12 bg-card">
                  <MetricsHeaderFilter
                    genderFilter={t.genderFilter}
                    setGenderFilter={t.setGenderFilter}
                    ageCondition={t.ageCondition}
                    setAgeCondition={t.setAgeCondition}
                    ageValue={t.ageValue}
                    setAgeValue={t.setAgeValue}
                    setCurrentPage={t.setCurrentPage}
                  />
                </TableHead>
              )}

              {t.visibleColumns.contactInfo && (
                <TableHead className="h-12 min-w-[200px] bg-card">
                  <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    <span>Contact Info</span>
                    <ShadcnPopover>
                      <PopoverTrigger asChild>
                        <ShadcnButton variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                          <Filter className={cn("h-3.5 w-3.5", t.contactFilter && "text-primary fill-primary/10")} />
                        </ShadcnButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-3 space-y-2" align="start">
                        <ShadcnLabel className="text-xs font-medium">Search Email or Phone</ShadcnLabel>
                        <ShadcnInput 
                          placeholder="Type email or digits..." 
                          value={t.contactFilter} 
                          onChange={(e) => { t.setContactFilter(e.target.value); t.setCurrentPage(1); }} 
                          className="h-8 text-xs"
                        />
                        {t.contactFilter && (
                          <ShadcnButton onClick={() => { t.setContactFilter(""); t.setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">
                            Clear Filter
                          </ShadcnButton>
                        )}
                      </PopoverContent>
                    </ShadcnPopover>
                  </div>
                </TableHead>
              )}

              {t.visibleColumns.regDate && (
                <TableHead className="h-12 bg-card">
                  <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    <span>Registration Date</span>
                    <ShadcnPopover>
                      <PopoverTrigger asChild>
                        <ShadcnButton variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                          <Filter className={cn("h-3.5 w-3.5", t.regDateFilter && "text-primary fill-primary/10")} />
                        </ShadcnButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-3 space-y-2" align="start">
                        <ShadcnLabel className="text-xs font-medium">Search exact date string</ShadcnLabel>
                        <ShadcnInput 
                          placeholder="e.g. 01/07/2026" 
                          value={t.regDateFilter} 
                          onChange={(e) => { t.setRegDateFilter(e.target.value); t.setCurrentPage(1); }} 
                          className="h-8 text-xs"
                        />
                        {t.regDateFilter && (
                          <ShadcnButton onClick={() => { t.setRegDateFilter(""); t.setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">
                            Clear Filter
                          </ShadcnButton>
                        )}
                      </PopoverContent>
                    </ShadcnPopover>
                  </div>
                </TableHead>
              )}

              <TableHead className="w-[50px] h-12 bg-card"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {t.paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No matching patients found within specified metrics.
                </TableCell>
              </TableRow>
            ) : (
              t.paginatedPatients.map((patient) => {
                const age = t.parseAge(patient.dob);
                const isSelected = t.selectedIds.includes(patient.id);

                return (
                  <TableRow key={patient.id} data-state={isSelected && "selected"} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) => t.handleToggleRow(patient.id, !!v)}
                        aria-label="Select row selection state"
                      />
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-foreground tracking-tight">
                      {patient.name}
                    </TableCell>
                    {t.visibleColumns.genderAge && (
                      <TableCell className="py-3 capitalize text-muted-foreground text-sm">
                        {patient.gender}{" "}
                        <span className="text-xs font-medium bg-muted/60 px-1.5 py-0.5 rounded-sm ml-1 text-foreground">
                          {age !== null ? `${age} Yrs` : "N/A"}
                        </span>
                      </TableCell>
                    )}
                    {t.visibleColumns.contactInfo && (
                      <TableCell className="py-3">
                        <div className="flex flex-col text-xs">
                          <span className="text-foreground font-medium">{patient.phone}</span>
                          <span className="text-muted-foreground font-normal">{patient.email}</span>
                        </div>
                      </TableCell>
                    )}
                    {t.visibleColumns.regDate && (
                      <TableCell className="py-3 text-muted-foreground text-sm">{patient.createdAt}</TableCell>
                    )}

                    {/* Perfectly clean integration with RowActions container */}
                    <TableCell className="py-3 text-right">
                      <RowActions
                        patient={patient}
                        onUpdatePatient={onUpdatePatient}
                        onDeletePatient={onDeletePatient}
                        setSelectedIds={t.setSelectedIds}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer Controls Component Block */}
      <TablePagination
        selectedVisibleCount={t.selectedVisibleCount}
        totalFilteredRecords={t.processedPatients.length}
        currentPage={t.currentPage}
        setCurrentPage={t.setCurrentPage}
        totalPages={t.totalPages}
      />
    </div>
  );
}