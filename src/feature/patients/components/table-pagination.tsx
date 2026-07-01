"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  selectedVisibleCount: number;
  totalFilteredRecords: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
}

export function TablePagination({
  selectedVisibleCount,
  totalFilteredRecords,
  currentPage,
  setCurrentPage,
  totalPages,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4 px-1 pt-2">
      <div>
        {selectedVisibleCount} of {totalFilteredRecords} row(s) selected.
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-background"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "secondary" : "ghost"}
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
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}