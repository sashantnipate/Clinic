"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, MoreHorizontal, ArrowUpDown, Filter, Eye, Edit, Trash2, X, Plus, Phone, Mail, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  createdAt: string;
}

interface PatientsTableProps {
  patients: Patient[];
}

export function PatientsTable({ patients }: PatientsTableProps) {
  // Global View & Sorting States
  const [globalSearch, setGlobalSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Specific Column Filters State
  const [nameFilter, setNameFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageCondition, setAgeCondition] = useState<"gt" | "lt" | "eq" | "none">("none");
  const [ageValue, setAgeValue] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [regDateFilter, setRegDateFilter] = useState("");

  // Column Visibility States (Pills)
  const [visibleColumns, setVisibleColumns] = useState({
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
    let result = patients.filter((p) => {
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
  }, [patients, globalSearch, sortOrder, nameFilter, genderFilter, ageCondition, ageValue, contactFilter, regDateFilter]);

  const totalPages = Math.max(Math.ceil(processedPatients.length / ITEMS_PER_PAGE), 1);
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const paginatedPatients = useMemo(() => {
    const startIdx = (activePage - 1) * ITEMS_PER_PAGE;
    return processedPatients.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [processedPatients, activePage]);

  const currentFilteredIds = processedPatients.map((p) => p.id);
  const selectedVisibleCount = currentFilteredIds.filter((id) => selectedIds.includes(id)).length;

  const isAllSelected = currentFilteredIds.length > 0 && selectedVisibleCount === currentFilteredIds.length;
  const isSomeSelected = selectedVisibleCount > 0 && selectedVisibleCount < currentFilteredIds.length;

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    }
  };

  const ColumnTogglePill = ({ label, isVisible, toggleFn }: { label: string, isVisible: boolean, toggleFn: () => void }) => (
    <Button
      variant={isVisible ? "secondary" : "outline"}
      size="sm"
      className={cn("h-7 text-xs rounded-full px-3 transition-all", !isVisible && "text-muted-foreground")}
      onClick={toggleFn}
    >
      {label}
      {isVisible ? <X className="ml-1.5 h-3 w-3 opacity-70" /> : <Plus className="ml-1.5 h-3 w-3 opacity-70" />}
    </Button>
  );

  return (
    <div className="w-full space-y-4">
      {/* Top Global Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Filter patients..."
          value={globalSearch}
          onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
          className="w-full sm:max-w-sm h-9 bg-background"
        />
      </div>

      {/* Interactive Column Visibility Pills (Hidden on small mobile viewports for clean spacing) */}
      <div className="hidden sm:flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-medium text-muted-foreground mr-1 uppercase tracking-wider">Visible Columns:</span>
        <ColumnTogglePill 
          label="Gender / Age" 
          isVisible={visibleColumns.genderAge} 
          toggleFn={() => setVisibleColumns(p => ({ ...p, genderAge: !p.genderAge }))} 
        />
        <ColumnTogglePill 
          label="Contact Info" 
          isVisible={visibleColumns.contactInfo} 
          toggleFn={() => setVisibleColumns(p => ({ ...p, contactInfo: !p.contactInfo }))} 
        />
        <ColumnTogglePill 
          label="Registration Date" 
          isVisible={visibleColumns.regDate} 
          toggleFn={() => setVisibleColumns(p => ({ ...p, regDate: !p.regDate }))} 
        />
      </div>

      {/* 📱 Mobile and Tablet Layout Mode View (Cards stack vertically) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedPatients.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground text-sm bg-card">
            No matching patients found within specified metrics.
          </div>
        ) : (
          paginatedPatients.map((patient) => {
            const age = parseAge(patient.dob);
            const isSelected = selectedIds.includes(patient.id);

            return (
              <div 
                key={patient.id} 
                className={cn(
                  "rounded-lg border p-4 bg-card space-y-3 shadow-xs transition-colors relative",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                {/* Top header row inside the patient profile card block */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={(v) => handleToggleRow(patient.id, !!v)} 
                      aria-label="Select row" 
                      className="mt-0.5"
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

                  {/* Actions Dropdown Trigger matching the actions grid panel structure */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-md">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-muted-foreground" /> View Chart
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4 text-muted-foreground" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                        <Trash2 className="h-4 w-4" /> Delete Records
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Patient Contact & Registration Date Grid Details */}
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

      {/* 💻 Desktop Viewport Layout Mode Container (Hidden entirely on mobile/tablets) */}
      <div className="hidden md:block rounded-md border bg-card max-h-[600px] overflow-y-auto relative shadow-2xs">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card border-b shadow-xs">
            <TableRow className="bg-muted/10 hover:bg-transparent">
              <TableHead className="w-[50px] h-12 bg-card">
                <Checkbox 
                  checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} 
                  onCheckedChange={(v) => handleToggleAll(!!v)} 
                  aria-label="Select all rows" 
                />
              </TableHead>
              
              <TableHead className="h-12 min-w-[200px] bg-card">
                <div className="flex items-center justify-between gap-1">
                  <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1.5 hover:bg-muted font-semibold text-xs uppercase tracking-wider" onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")}>
                    Patient Name
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                        <Filter className={cn("h-3.5 w-3.5", nameFilter && "text-primary fill-primary/10")} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-3 space-y-2" align="start">
                      <Label className="text-xs font-medium">Search matching name</Label>
                      <Input placeholder="Type standard string value..." value={nameFilter} onChange={(e) => { setNameFilter(e.target.value); setCurrentPage(1); }} className="h-8 text-xs"/>
                      {nameFilter && <Button onClick={() => { setNameFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">Clear Filter</Button>}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>

              {visibleColumns.genderAge && (
                <TableHead className="h-12 bg-card">
                  <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    <span>Gender / Age</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                          <Filter className={cn("h-3.5 w-3.5", (genderFilter !== "all" || ageCondition !== "none") && "text-primary fill-primary/10")} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 space-y-3" align="start">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Filter Gender Selection</Label>
                          <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genders</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Age Condition Matrix</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={ageCondition} onValueChange={(v: any) => { setAgeCondition(v); setCurrentPage(1); }}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Filter</SelectItem>
                                <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                                <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                                <SelectItem value="eq">Equals (=)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="number" disabled={ageCondition === "none"} placeholder="Age..." value={ageValue} onChange={(e) => { setAgeValue(e.target.value); setCurrentPage(1); }} className="h-8 text-xs" />
                          </div>
                        </div>
                        {(genderFilter !== "all" || ageCondition !== "none") && (
                          <Button onClick={() => { setGenderFilter("all"); setAgeCondition("none"); setAgeValue(""); setCurrentPage(1); }} variant="ghost" className="h-7 w-full text-xs text-destructive hover:bg-destructive/5">
                            Reset Metric Filter
                          </Button>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.contactInfo && (
                <TableHead className="h-12 min-w-[200px] bg-card">
                  <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    <span>Contact Info</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                          <Filter className={cn("h-3.5 w-3.5", contactFilter && "text-primary fill-primary/10")} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-3 space-y-2" align="start">
                        <Label className="text-xs font-medium">Search Email or Phone</Label>
                        <Input placeholder="Type email or digits..." value={contactFilter} onChange={(e) => { setContactFilter(e.target.value); setCurrentPage(1); }} className="h-8 text-xs"/>
                        {contactFilter && <Button onClick={() => { setContactFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">Clear Filter</Button>}
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              )}

              {visibleColumns.regDate && (
                <TableHead className="h-12 bg-card">
                   <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    <span>Registration Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground">
                          <Filter className={cn("h-3.5 w-3.5", regDateFilter && "text-primary fill-primary/10")} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-3 space-y-2" align="start">
                        <Label className="text-xs font-medium">Search exact date string</Label>
                        <Input placeholder="e.g. 06/15/2026" value={regDateFilter} onChange={(e) => { setRegDateFilter(e.target.value); setCurrentPage(1); }} className="h-8 text-xs"/>
                        {regDateFilter && <Button onClick={() => { setRegDateFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">Clear Filter</Button>}
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              )}

              <TableHead className="w-[50px] h-12 bg-card"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No matching patients found within specified metrics.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient) => {
                const age = parseAge(patient.dob);
                const isSelected = selectedIds.includes(patient.id);

                return (
                  <TableRow key={patient.id} data-state={isSelected && "selected"} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="py-3">
                      <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={(v) => handleToggleRow(patient.id, !!v)} 
                        aria-label="Select row" 
                      />
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-foreground tracking-tight">
                      {patient.name}
                    </TableCell>
                    {visibleColumns.genderAge && (
                      <TableCell className="py-3 capitalize text-muted-foreground text-sm">
                        {patient.gender} <span className="text-xs font-medium bg-muted/60 px-1.5 py-0.5 rounded-sm ml-1 text-foreground">{age !== null ? `${age} Yrs` : "N/A"}</span>
                      </TableCell>
                    )}
                    {visibleColumns.contactInfo && (
                      <TableCell className="py-3">
                        <div className="flex flex-col text-xs">
                          <span className="text-foreground font-medium">{patient.phone}</span>
                          <span className="text-muted-foreground font-normal">{patient.email}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.regDate && (
                      <TableCell className="py-3 text-muted-foreground text-sm">
                        {patient.createdAt}
                      </TableCell>
                    )}
                    
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-md">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-muted-foreground" /> View Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4 text-muted-foreground" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                            <Trash2 className="h-4 w-4" /> Delete Records
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4 px-1 pt-2">
        <div>
          {selectedVisibleCount} of {processedPatients.length} row(s) selected.
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-background" 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={activePage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={activePage === pageNum ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 text-xs font-medium rounded-md"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-background" 
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={activePage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}