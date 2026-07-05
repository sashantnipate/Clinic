"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { MedicationExcelRow as RowType } from "../hooks/use-log-encounter";

interface MedicationExcelRowProps {
  med: RowType;
  idx: number;
  pharmacyInventory?: any[];
  onValueChange: (index: number, key: keyof RowType, value: any) => void;
  onRemove: (index: number) => void;
}

export function MedicationExcelRow({ med, idx, pharmacyInventory = [], onValueChange, onRemove }: MedicationExcelRowProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const input = med.name.trim().toLowerCase();
    if (!input) return [];
    const safeInventory = Array.isArray(pharmacyInventory) ? pharmacyInventory : [];
    return safeInventory.filter(item => 
      item && item.name && item.name.toLowerCase().includes(input)
    );
  }, [med.name, pharmacyInventory]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        onValueChange(idx, "name", filteredSuggestions[highlightedIndex].name);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const hasSuggestions = showSuggestions && filteredSuggestions.length > 0;

  return (
    <div className={`grid grid-cols-12 items-center px-3 py-1.5 hover:bg-muted/10 transition-all divide-x ${hasSuggestions ? "mb-[160px]" : ""}`}>
      
      {/* Formulation Name Field */}
      <div className="col-span-4 pr-2 relative" ref={containerRef}>
        <input 
          placeholder="e.g. Paracetamol 500mg" 
          value={med.name} 
          onChange={(e) => {
            onValueChange(idx, "name", e.target.value);
            setShowSuggestions(true);
          }} 
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent focus:outline-none px-1 h-7 border-none text-xs text-foreground placeholder:text-muted-foreground/40" 
        />

        {hasSuggestions && (
          <div className="absolute left-0 right-0 top-8 bg-popover border border-muted rounded-lg shadow-xl max-h-[150px] overflow-y-auto divide-y divide-muted/60 z-[9999]">
            {filteredSuggestions.map((item, sIdx) => (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  onValueChange(idx, "name", item.name);
                  setShowSuggestions(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex justify-between items-center cursor-pointer text-foreground block bg-card ${
                  sIdx === highlightedIndex ? "bg-muted font-semibold text-primary" : ""
                }`}
              >
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Quantity Dropdown */}
      <div className="col-span-2 px-2">
        <select 
          value={med.dosageQuantity} 
          onChange={(e) => onValueChange(idx, "dosageQuantity", e.target.value)} 
          className="w-full bg-transparent focus:outline-none text-xs cursor-pointer text-foreground dark:bg-background"
        >
          <option value="1/4">1/4 Tablet</option>
          <option value="1/2">1/2 Tablet</option>
          <option value="1">1 Tablet</option>
          <option value="2">2 Tablets</option>
          <option value="3">3 Tablets</option>
        </select>
      </div>

      {/* Time Interval Selector */}
      <div className="col-span-3 px-2 flex items-center">
        <select
          value={med.timingInterval}
          onChange={(e) => onValueChange(idx, "timingInterval", e.target.value)}
          className="w-full bg-transparent focus:outline-none text-xs cursor-pointer text-foreground dark:bg-background"
        >
          <option value="1 time a day">1 time a day</option>
          <option value="2 times a day">2 times a day</option>
          <option value="3 times a day">3 times a day</option>
          <option value="Every 8 hours">Every 8 hours</option>
          <option value="Every 12 hours">Every 12 hours</option>
        </select>
      </div>

      {/* Relation to Food Selector */}
      <div className="col-span-2 px-2 flex items-center">
        <select
          value={med.relationToFood}
          onChange={(e) => onValueChange(idx, "relationToFood", e.target.value)}
          className="w-full bg-transparent focus:outline-none text-xs cursor-pointer text-foreground dark:bg-background"
        >
          <option value="After Food">After Food</option>
          <option value="Before Food">Before Food</option>
          <option value="No Requirement">No Requirement</option>
        </select>
      </div>

      <div className="col-span-1 flex justify-center items-center pl-2">
        <button 
          type="button" 
          onClick={() => onRemove(idx)} 
          className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors" 
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}