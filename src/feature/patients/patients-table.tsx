"use client";

import React from "react";
import { Phone, Mail, Calendar as CalendarIcon, Filter, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { Popover as ShadcnPopover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label as ShadcnLabel } from "@/components/ui/label";
import { Button, Button as ShadcnButton } from "@/components/ui/button";

import { TableFilters } from "./components/table-filters";
import { RowActions } from "./components/row-actions";
import { TablePagination } from "./components/table-pagination";
import { Patient } from "./types";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface PatientsTableProps {
  tableState: any; // We can use ReturnType<typeof usePatientsTable> if we imported, but any works for refactoring fast
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export function PatientsTable({ tableState: t, onUpdatePatient, onDeletePatient }: PatientsTableProps) {


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
        {t.isLoading ? (
          <div className="rounded-md border p-8 bg-card flex flex-col items-center justify-center space-y-2 text-muted-foreground shadow-xs">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Fetching records...</p>
          </div>
        ) : t.paginatedPatients.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground text-sm bg-card">
            No matching patient records found.
          </div>
        ) : (
          t.paginatedPatients.map((patient: Patient) => {
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground tracking-tight">{patient.name}</h4>
                        {patient.sharedWithOrgs && patient.sharedWithOrgs.length > 0 && (
                          <ShadcnPopover>
                            <PopoverTrigger asChild>
                              <div className="cursor-pointer bg-primary/10 p-1 rounded-full text-primary hover:bg-primary/20 transition-colors" title="Shared with other orgs">
                                <Share2 className="h-3 w-3" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3 text-sm z-[100]">
                              <p className="font-medium text-xs text-muted-foreground uppercase mb-2">Shared With</p>
                              <div className="space-y-2">
                                {patient.sharedWithOrgs.map(org => (
                                  <div key={org._id} className="flex items-center gap-2">
                                    {org.imageUrl ? (
                                      <img src={org.imageUrl} alt={org.name} className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                                        {org.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className="font-medium truncate">{org.name}</span>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </ShadcnPopover>
                        )}
                      </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1.5 hover:bg-muted font-semibold text-xs uppercase tracking-wider px-2"
                  onClick={() => t.setSortOrder(t.sortOrder === "asc" ? "desc" : "asc")}
                >
                  <span>Patient Name</span>
                  <Filter strokeWidth={3} className={cn("h-3 w-3 shrink-0 ml-1 opacity-50", t.sortOrder === 'desc' && 'rotate-180')} />
                </Button>
              </TableHead>

              <TableHead className="h-12 bg-card">
                <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <span className="pl-1">Gender / Age</span>
                </div>
              </TableHead>

              <TableHead className="h-12 min-w-[200px] bg-card">
                <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <span className="pl-1">Contact Info</span>
                </div>
              </TableHead>

              <TableHead className="h-12 bg-card">
                <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <span className="pl-1">Registration Date</span>
                </div>
              </TableHead>

              <TableHead className="w-[50px] h-12 bg-card"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {t.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs font-medium">Fetching patient records...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : t.paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No matching patients found within specified metrics.
                </TableCell>
              </TableRow>
            ) : (
              t.paginatedPatients.map((patient: Patient) => {
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
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/patients/${patient.id}`} className="font-semibold text-foreground tracking-tight hover:text-primary hover:underline transition-colors cursor-pointer">
                          {patient.name}
                        </Link>

                        {patient.sharedWithOrgs && patient.sharedWithOrgs.length > 0 && (
                          <ShadcnPopover>
                            <PopoverTrigger asChild>
                              <div className="cursor-pointer bg-primary/10 p-1 rounded-full text-primary hover:bg-primary/20 transition-colors" title="Shared with other orgs">
                                <Share2 className="h-3 w-3" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3 text-sm z-[100]">
                              <p className="font-medium text-xs text-muted-foreground uppercase mb-2">Shared With</p>
                              <div className="space-y-2">
                                {patient.sharedWithOrgs.map(org => (
                                  <div key={org._id} className="flex items-center gap-2">
                                    {org.imageUrl ? (
                                      <img src={org.imageUrl} alt={org.name} className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                                        {org.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className="font-medium truncate">{org.name}</span>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </ShadcnPopover>
                        )}
                      </div>
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
        totalFilteredRecords={t.totalRecords}
        currentPage={t.currentPage}
        setCurrentPage={t.setCurrentPage}
        totalPages={t.totalPages}
      />
    </div>
  );
}