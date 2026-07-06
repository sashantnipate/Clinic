  "use client";

  import React, { useState, useMemo, useRef, useEffect } from "react";
  import { Trash2 } from "lucide-react";
  import { MedicationExcelRow as RowType } from "../hooks/use-log-encounter";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, colIdx: number) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT";

      if (showSuggestions && filteredSuggestions.length > 0 && colIdx === 0) {
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
        if (colIdx === 4) return; // Let Shadcn Select Handle Enter
        e.preventDefault();
        const nextCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx + 1}"]`) as HTMLElement;
        if (nextCell) {
          nextCell.focus();
        } else {
          const firstCellNextRow = document.querySelector(`[data-cell="cell-${idx + 1}-0"]`) as HTMLElement;
          if (firstCellNextRow) firstCellNextRow.focus();
        }
      }

      if (e.key === "ArrowRight") {
        const canMove = isInput ? (target as HTMLInputElement).selectionEnd === (target as HTMLInputElement).value.length : true;
        if (canMove) {
          const nextCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx + 1}"]`) as HTMLElement;
          if (nextCell) nextCell.focus();
        }
      }

      if (e.key === "ArrowLeft") {
        const canMove = isInput ? (target as HTMLInputElement).selectionStart === 0 : true;
        if (canMove) {
          const prevCell = document.querySelector(`[data-cell="cell-${idx}-${colIdx - 1}"]`) as HTMLElement;
          if (prevCell) prevCell.focus();
        }
      }

      if (e.key === "ArrowDown") {
        if (colIdx === 4) return;
        e.preventDefault();
        const downCell = document.querySelector(`[data-cell="cell-${idx + 1}-${colIdx}"]`) as HTMLElement;
        if (downCell) downCell.focus();
      }

      if (e.key === "ArrowUp") {
        if (colIdx === 4) return;
        e.preventDefault();
        const upCell = document.querySelector(`[data-cell="cell-${idx - 1}-${colIdx}"]`) as HTMLElement;
        if (upCell) upCell.focus();
      }
    };

    return (
      <div className="grid grid-cols-12 items-center hover:bg-stone-50/60 transition-all divide-x divide-stone-100 border-b border-stone-100 last:border-none bg-white relative">

        {/* 1. Medicine Name Input */}
        <div className="col-span-3 p-1 relative text-left" ref={containerRef}>
          <input
            data-cell={`cell-${idx}-0`}
            placeholder="e.g. Paracetamol"
            value={med.name}
            onChange={(e) => {
              onValueChange(idx, "name", e.target.value);
              setShowSuggestions(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            className="w-full bg-white border border-stone-200 rounded-md shadow-3xs focus:outline-hidden h-8 px-2 text-xs font-medium text-stone-900 focus:border-emerald-500"
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
                  className={`w-full text-left px-3 py-2 text-xs transition-colors text-stone-800 font-medium ${sIdx === highlightedIndex ? "bg-stone-100 text-emerald-600 font-semibold" : "bg-white"
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Quantity / Volume Input */}
        <div className="col-span-2 px-1 py-1">
          <input
            list={`qty-list-${idx}`}
            data-cell={`cell-${idx}-1`}
            placeholder="e.g. 1 Tab"
            value={med.dosageQuantity}
            onChange={(e) => onValueChange(idx, "dosageQuantity", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            className="w-full bg-white border border-stone-200 rounded-md px-2 h-8 text-xs focus:outline-hidden focus:border-emerald-500 shadow-3xs font-medium"
          />
          <datalist id={`qty-list-${idx}`}>
            <option value="1 Tab" />
            <option value="1/2 Tab" />
            <option value="5 ml" />
            <option value="10 ml" />
            <option value="15 ml" />
            <option value="Apply Locally" />
            <option value="1 Drop" />
            <option value="2 Drops" />
          </datalist>
        </div>

        {/* 3. Time Interval Input */}
        <div className="col-span-2 px-1 py-1">
          <input
            list={`time-list-${idx}`}
            data-cell={`cell-${idx}-2`}
            placeholder="e.g. 2 times a day"
            value={med.timingInterval}
            onChange={(e) => onValueChange(idx, "timingInterval", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            className="w-full bg-white border border-stone-200 rounded-md px-2 h-8 text-xs focus:outline-hidden focus:border-emerald-500 shadow-3xs font-medium"
          />
          <datalist id={`time-list-${idx}`}>
            <option value="1-1-1" />
            <option value="1-0-1" />
            <option value="1-0-0" />
            <option value="0-0-1" />
            <option value="0-1-0" />
            <option value="SOS" />
          </datalist>
        </div>

        {/* 4. Medication Duration Input */}
        <div className="col-span-2 px-1 py-1">
          <input
            list={`duration-list-${idx}`}
            data-cell={`cell-${idx}-3`}
            placeholder="e.g. 5 Days"
            value={med.durationDays}
            onChange={(e) => onValueChange(idx, "durationDays", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            className="w-full bg-white border border-stone-200 rounded-md px-2 h-8 text-xs focus:outline-hidden focus:border-emerald-500 shadow-3xs font-medium"
          />
          <datalist id={`duration-list-${idx}`}>
            <option value="3 Days" />
            <option value="5 Days" />
            <option value="7 Days" />
            <option value="14 Days" />
            <option value="1 Month" />
          </datalist>
        </div>

        {/* 5. Relation to Food Input */}
        <div className="col-span-2 px-1 py-1">
          <Select
            value={med.relationToFood || "blank"}
            onValueChange={(val) => onValueChange(idx, "relationToFood", val === "blank" ? "" : val)}
          >
            <SelectTrigger
              data-cell={`cell-${idx}-4`}
              onKeyDown={(e) => handleKeyDown(e, 4)}
              className="w-full bg-white border border-stone-200 rounded-md px-2 h-8 text-xs focus:ring-emerald-500 shadow-3xs font-medium focus:outline-none"
            >
              <SelectValue placeholder="Blank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Blank</SelectItem>
              <SelectItem value="After Food">After Food</SelectItem>
              <SelectItem value="Before Food">Before Food</SelectItem>
              <SelectItem value="With Food">With Food</SelectItem>
              <SelectItem value="Empty Stomach">Empty Stomach</SelectItem>
            </SelectContent>
          </Select>
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