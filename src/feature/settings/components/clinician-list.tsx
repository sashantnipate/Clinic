"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

const MOCK_DOCTORS_REGISTRY = [
  { id: "doc-101", name: "Dr. Sarah Jenkins", email: "s.jenkins@clinic.com" },
  { id: "doc-102", name: "Dr. Robert Chen", email: "r.chen@clinic.com" },
  { id: "doc-103", name: "Dr. Lisa Wong", email: "l.wong@clinic.com" }
];

interface ClinicianListProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ClinicianList({ selectedId, onSelect }: ClinicianListProps) {
  return (
    <Card className="h-full">
      <div className="p-3 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b rounded-t-xl">
        Medical Staff Directory (Members)
      </div>
      <CardContent className="p-2 divide-y divide-border/60">
        {MOCK_DOCTORS_REGISTRY.map((doc) => {
          const isSelected = selectedId === doc.id;
          return (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 text-sm my-1 first:mt-0 last:mb-0",
                isSelected 
                  ? "bg-primary/5 border-l-2 border-primary text-foreground font-semibold" 
                  : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="text-foreground font-medium truncate">{doc.name}</div>
                <div className="text-[11px] text-muted-foreground/80 truncate">{doc.email}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}