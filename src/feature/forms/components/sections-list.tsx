"use client";

import React from "react";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "./section-card";

interface SectionsListProps {
  isLoading: boolean;
  sections: any[];
  onToggleActive: (section: any) => void;
  onEdit: (section: any) => void;
  onDelete: (id: string) => void;
}

export function SectionsList({ isLoading, sections, onToggleActive, onEdit, onDelete }: SectionsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs font-medium">Loading schema layouts securely from database...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <FileSpreadsheet className="h-10 w-10 mx-auto opacity-40 mb-3 text-primary" />
          <p className="font-semibold text-sm">No layout structures found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {sections.map((section) => (
        <SectionCard
          key={section._id}
          section={section}
          onToggleActive={onToggleActive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}