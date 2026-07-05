"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { MedicationExcelRow as RowType } from "../hooks/use-log-encounter";

interface MedicationExcelRowProps {
  med: RowType;
  idx: number;
  pharmacyInventory?: any[];
  onValueChange: (index: number, key: any, value: any) => void;
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
    return pharmacyInventory.filter(item => 
      item?.name?.toLowerCase().includes(input)
    );
  }, [med.name, pharmacyInventory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, colIdx: number) => {
    const target = e.target as HTMLElement;

    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(p => (p < filteredSuggestions.length - 1 ? p + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(p => (p > 0 ? p - 1 : filteredSuggestions.length - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          onValueChange(idx, "name", filteredSuggestions[highlightedIndex].name);
          setShowSuggestions(false);
          const nextCell = document.querySelector(`[data-cell="cell-${idx}-1"]`) as HTMLElement;
          if (nextCell) nextCell.focus();
        }
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const nextCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx + 1}"]`) as HTMLElement;
      if (nextCell) {
        nextCell.focus();
      } else {
        const firstCellNextRow = document.querySelector(`[data-cell="cell-${idx + 1}-0"]`) as HTMLElement;
        if (firstCellNextRow) firstCellNextRow.focus();
      }
    }

    if (e.key === "ArrowRight" && (target.tagName === "SELECT" || (target as HTMLInputElement).selectionEnd === (target as HTMLInputElement).value.length)) {
      const nextCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx + 1}"]`) as HTMLElement;
      if (nextCell) nextCell.focus();
    }

    if (e.key === "ArrowLeft" && (target.tagName === "SELECT" || (target as HTMLInputElement).selectionStart === 0)) {
      const prevCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx - 1}"]`) as HTMLElement;
      if (prevCell) prevCell.focus();
    }

    if (e.key === "ArrowDown" && target.tagName !== "SELECT") {
      e.preventDefault();
      const downCell = document.querySelector(`[data-cell="cell-${idx + 1}-${colIdx}"]`) as HTMLElement;
      if (downCell) downCell.focus();
    }

    if (e.key === "ArrowUp" && target.tagName !== "SELECT") {
      e.preventDefault();
      const upCell = document.querySelector(`[data-cell="cell-${idx - 1}-${colIdx}"]`) as HTMLElement;
      if (upCell) upCell.focus();
    }
  };

  return (
    <div className="grid grid-cols-12 items-center hover:bg-stone-50/60 transition-all divide-x divide-stone-100 border-b border-stone-100 last:border-none bg-white relative">
      
      {/* 1. Medicine Name Input */}
      <div className="col-span-4 p-1 relative text-left" ref={containerRef}>
        <input 
          data-cell={`cell-${idx}-0`}
          placeholder="" 
          value={med.name} 
          onChange={(e) => {
            onValueChange(idx, "name", e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(0);
          }} 
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          className="w-full bg-white border border-stone-200 rounded-md shadow-3xs focus:outline-none h-8 px-2 text-xs font-medium text-stone-900 focus:border-emerald-500" 
        />

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-1 right-1 top-10 bg-white border border-stone-200 rounded-lg shadow-xl max-h-[160px] overflow-y-auto divide-y divide-stone-50 z-[9999]">
            {filteredSuggestions.map((item, sIdx) => (
              <button
                key={item._id || sIdx}
                type="button"
                onClick={() => {
                  onValueChange(idx, "name", item.name);
                  setShowSuggestions(false);
                  const nextCell = document.querySelector(`[data-cell="cell-${idx}-1"]`) as HTMLElement;
                  if (nextCell) nextCell.focus();
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors text-stone-800 font-medium ${
                  sIdx === highlightedIndex ? "bg-stone-100 text-emerald-600 font-semibold" : "bg-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 2. Quantity / Volume Selection */}
      <div className="col-span-2 px-2 py-1 flex items-center gap-1">
        <select 
          data-cell={`cell-${idx}-1`}
          value={["", "1/4 Tab", "1/2 Tab", "1 Tab", "2 Tabs", "5 ml", "10 ml", "Apply Thinly"].includes(med.dosageQuantity) ? med.dosageQuantity : "custom"} 
          onChange={(e) => {
            const val = e.target.value;
            onValueChange(idx, "dosageQuantity", val === "custom" ? "" : val);
          }}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          className="bg-white border border-stone-200 rounded-md h-8 text-xs text-stone-800 px-2 shadow-3xs w-full focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">---</option>
          <option value="1/4 Tab">1/4 Tab</option>
          <option value="1/2 Tab">1/2 Tab</option>
          <option value="1 Tab">1 Tab</option>
          <option value="2 Tabs">2 Tabs</option>
          <option value="5 ml">5 ml</option>
          <option value="10 ml">10 ml</option>
          <option value="Apply Thinly">Apply Thinly</option>
          <option value="custom">Custom...</option>
        </select>
        
        {!["", "1/4 Tab", "1/2 Tab", "1 Tab", "2 Tabs", "5 ml", "10 ml", "Apply Thinly"].includes(med.dosageQuantity) && (
          <input
            data-cell={`cell-${idx}-1-custom`}
            placeholder=""
            value={med.dosageQuantity}
            onChange={(e) => onValueChange(idx, "dosageQuantity", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            className="w-20 bg-white border border-stone-200 rounded-md px-2 h-8 text-xs focus:outline-none focus:border-emerald-500 shadow-3xs"
          />
        )}
      </div>

      {/* 3. Time Interval */}
      <div className="col-span-2 px-2 py-1 flex items-center">
        <select
          data-cell={`cell-${idx}-2`}
          value={med.timingInterval}
          onChange={(e) => onValueChange(idx, "timingInterval", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 2)}
          className="w-full bg-white border border-stone-200 rounded-md h-8 text-xs text-stone-800 px-2 shadow-3xs focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">---</option>
          <option value="1 time a day">1 time a day</option>
          <option value="2 times a day">2 times a day</option>
          <option value="3 times a day">3 times a day</option>
          <option value="Every 8 hours">Every 8 hours</option>
          <option value="Every 12 hours">Every 12 hours</option>
          <option value="As needed (SOS)">As needed (SOS)</option>
        </select>
      </div>

      {/* 4. Separate Medication Duration Box */}
      <div className="col-span-2 px-2 py-1 flex items-center">
        <select
          data-cell={`cell-${idx}-3`}
          value={med.durationDays}
          onChange={(e) => onValueChange(idx, "durationDays", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 3)}
          className="w-full bg-white border border-stone-200 rounded-md h-8 text-xs text-stone-800 px-2 shadow-3xs focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">---</option>
          <option value="1 Day">1 Day</option>
          <option value="3 Days">3 Days</option>
          <option value="5 Days">5 Days</option>
          <option value="7 Days">7 Days</option>
          <option value="10 Days">10 Days</option>
          <option value="14 Days">14 Days</option>
          <option value="30 Days">30 Days</option>
        </select>
      </div>

      {/* 5. Relation to Food */}
      <div className="col-span-1 px-2 py-1 flex items-center">
        <select
          data-cell={`cell-${idx}-4`}
          value={med.relationToFood}
          onChange={(e) => onValueChange(idx, "relationToFood", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 4)}
          className="w-full bg-white border border-stone-200 rounded-md h-8 text-xs text-stone-800 px-1 shadow-3xs focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">---</option>
          <option value="After Food">After Food</option>
          <option value="Before Food">Before Food</option>
          <option value="No Requirement">No Requirement</option>
        </select>
      </div>

      {/* 6. Deletion Control */}
      <div className="col-span-1 flex justify-center items-center">
        <button 
          type="button" 
          onClick={() => onRemove(idx)} 
          className="text-stone-300 hover:text-red-500 p-1.5 rounded transition-colors" 
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}