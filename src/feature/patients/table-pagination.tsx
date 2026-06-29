import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  currentPage: number;
  totalPages: number;
  selectedCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ currentPage, totalPages, selectedCount, totalCount, onPageChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4 px-1 pt-2">
      <div>{selectedCount} of {totalCount} row(s) selected.</div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>Previous</Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button key={pageNum} variant={currentPage === pageNum ? "secondary" : "ghost"} size="icon" onClick={() => onPageChange(pageNum)} className="h-8 w-8 text-xs font-medium">
              {pageNum}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
      </div>
    </div>
  );
}