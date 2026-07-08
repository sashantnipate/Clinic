"use client";

import React from "react";
import { Filter, ArrowUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VisibleColumns } from "../types";

interface TableFiltersProps {
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  setCurrentPage: (p: number) => void;
  visibleColumns: VisibleColumns;
  setVisibleColumns: React.Dispatch<React.SetStateAction<VisibleColumns>>;
  nameFilter: string;
  setNameFilter: (v: string) => void;
  genderFilter: string;
  setGenderFilter: (v: string) => void;
  ageCondition: "gt" | "lt" | "eq" | "none";
  setAgeCondition: (v: "gt" | "lt" | "eq" | "none") => void;
  ageValue: string;
  setAgeValue: (v: string) => void;
  contactFilter: string;
  setContactFilter: (v: string) => void;
  regDateFilter: string;
  setRegDateFilter: (v: string) => void;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc" | null>>;
}

export function TableFilters({
  globalSearch,
  setGlobalSearch,
  setCurrentPage,
  visibleColumns,
  setVisibleColumns,
  nameFilter,
  setNameFilter,
  genderFilter,
  setGenderFilter,
  ageCondition,
  setAgeCondition,
  ageValue,
  setAgeValue,
  contactFilter,
  setContactFilter,
  regDateFilter,
  setRegDateFilter,
  setSortOrder,
}: TableFiltersProps) {

  const ColumnTogglePill = ({ label, isVisible, toggleFn }: { label: string; isVisible: boolean; toggleFn: () => void }) => (
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
    <div className="space-y-4 w-full">
      {/* Top row: Global Search + Column Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Global search patients..."
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:max-w-sm h-9 bg-background font-medium"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1 uppercase tracking-wider">Cols:</span>
          <ColumnTogglePill
            label="Gender / Age"
            isVisible={visibleColumns.genderAge}
            toggleFn={() => setVisibleColumns((p) => ({ ...p, genderAge: !p.genderAge }))}
          />
          <ColumnTogglePill
            label="Contact"
            isVisible={visibleColumns.contactInfo}
            toggleFn={() => setVisibleColumns((p) => ({ ...p, contactInfo: !p.contactInfo }))}
          />
          <ColumnTogglePill
            label="Date"
            isVisible={visibleColumns.regDate}
            toggleFn={() => setVisibleColumns((p) => ({ ...p, regDate: !p.regDate }))}
          />
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", nameFilter && "border-primary text-primary")}>
              <Filter className="h-3 w-3" />
              Name {nameFilter && <span className="ml-1 px-1 bg-primary/10 rounded">Active</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 space-y-2" align="start">
            <Label className="text-xs font-medium">Filter by Name</Label>
            <Input
              placeholder="e.g. John Doe"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 text-xs"
            />
            {nameFilter && (
              <Button onClick={() => { setNameFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">
                Clear Name Filter
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", (genderFilter !== "all" || ageCondition !== "none") && "border-primary text-primary")}>
              <Filter className="h-3 w-3" />
              Gender/Age {(genderFilter !== "all" || ageCondition !== "none") && <span className="ml-1 px-1 bg-primary/10 rounded">Active</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-3" align="start">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Gender</Label>
              <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Age</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={ageCondition} onValueChange={(v: any) => { setAgeCondition(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Filter</SelectItem>
                    <SelectItem value="gt">&gt; Greater</SelectItem>
                    <SelectItem value="lt">&lt; Less</SelectItem>
                    <SelectItem value="eq">= Equal</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" disabled={ageCondition === "none"} placeholder="0" value={ageValue} onChange={(e) => { setAgeValue(e.target.value); setCurrentPage(1); }} className="h-8 text-xs" />
              </div>
            </div>
            {(genderFilter !== "all" || ageCondition !== "none") && (
              <Button onClick={() => { setGenderFilter("all"); setAgeCondition("none"); setAgeValue(""); setCurrentPage(1); }} variant="ghost" className="h-7 w-full text-xs text-destructive hover:bg-destructive/5">
                Clear Filters
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", contactFilter && "border-primary text-primary")}>
              <Filter className="h-3 w-3" />
              Contact {contactFilter && <span className="ml-1 px-1 bg-primary/10 rounded">Active</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 space-y-2" align="start">
            <Label className="text-xs font-medium">Filter by Phone/Email</Label>
            <Input placeholder="Type email or digits..." value={contactFilter} onChange={(e) => { setContactFilter(e.target.value); setCurrentPage(1); }} className="h-8 text-xs" />
            {contactFilter && (
              <Button onClick={() => { setContactFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">
                Clear Contact Filter
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", regDateFilter && "border-primary text-primary")}>
              <Filter className="h-3 w-3" />
              Date {regDateFilter && <span className="ml-1 px-1 bg-primary/10 rounded">Active</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 space-y-2" align="start">
            <Label className="text-xs font-medium">Registration Date String</Label>
            <Input placeholder="DD/MM/YYYY" value={regDateFilter} onChange={(e) => { setRegDateFilter(e.target.value); setCurrentPage(1); }} className="h-8 text-xs" />
            {regDateFilter && (
              <Button onClick={() => { setRegDateFilter(""); setCurrentPage(1); }} variant="ghost" className="h-6 w-full text-xs text-destructive hover:bg-destructive/5">
                Clear Date Filter
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface NameHeaderFilterProps {
  nameFilter: string;
  setNameFilter: (v: string) => void;
  setCurrentPage: (p: number) => void;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc" | null>>;
}

export function NameHeaderFilter({ nameFilter, setNameFilter, setCurrentPage, setSortOrder }: NameHeaderFilterProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 gap-1.5 hover:bg-muted font-semibold text-xs uppercase tracking-wider px-2"
        onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
      >
        <span>Patient Name</span>
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground ml-auto">
            <Filter className={cn("h-3.5 w-3.5", nameFilter && "text-primary fill-primary/10")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-3 space-y-2" align="start">
          <Label className="text-xs font-medium">Search matching name</Label>
          <Input
            placeholder="Type standard string value..."
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 text-xs"
          />
          {nameFilter && (
            <Button
              onClick={() => {
                setNameFilter("");
                setCurrentPage(1);
              }}
              variant="ghost"
              className="h-6 w-full text-xs text-destructive hover:bg-destructive/5"
            >
              Clear Filter
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface MetricsHeaderFilterProps {
  genderFilter: string;
  setGenderFilter: (v: string) => void;
  ageCondition: "gt" | "lt" | "eq" | "none";
  setAgeCondition: (v: "gt" | "lt" | "eq" | "none") => void;
  ageValue: string;
  setAgeValue: (v: string) => void;
  setCurrentPage: (p: number) => void;
}

export function MetricsHeaderFilter({
  genderFilter,
  setGenderFilter,
  ageCondition,
  setAgeCondition,
  ageValue,
  setAgeValue,
  setCurrentPage,
}: MetricsHeaderFilterProps) {
  return (
    <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
      <span className="pl-1">Gender / Age</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-muted-foreground ml-auto">
            <Filter className={cn("h-3.5 w-3.5", (genderFilter !== "all" || ageCondition !== "none") && "text-primary fill-primary/10")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-3" align="start">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Filter Gender Selection</Label>
            <Select
              value={genderFilter}
              onValueChange={(v) => {
                setGenderFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
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
              <Select
                value={ageCondition}
                onValueChange={(v: any) => {
                  setAgeCondition(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Filter</SelectItem>
                  <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                  <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                  <SelectItem value="eq">Equals (=)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                disabled={ageCondition === "none"}
                placeholder="Age..."
                value={ageValue}
                onChange={(e) => {
                  setAgeValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
          {(genderFilter !== "all" || ageCondition !== "none") && (
            <Button
              onClick={() => {
                setGenderFilter("all");
                setAgeCondition("none");
                setAgeValue("");
                setCurrentPage(1);
              }}
              variant="ghost"
              className="h-7 w-7 w-full text-xs text-destructive hover:bg-destructive/5"
            >
              Reset Metric Filter
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}