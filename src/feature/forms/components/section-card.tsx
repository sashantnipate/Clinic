"use client";

import React from "react";
import { Calendar, LayoutGrid, Eye, EyeOff, Edit2, Trash2, Type, Hash, AlignLeft, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionCardProps {
  section: any;
  onToggleActive: (section: any) => void;
  onEdit: (section: any) => void;
  onDelete: (id: string) => void;
}

export function SectionCard({ section, onToggleActive, onEdit, onDelete }: SectionCardProps) {
  const getFieldIcon = (type: string) => {
    switch (type) {
      case "number": return <Hash className="h-3.5 w-3.5" />;
      case "textarea": return <AlignLeft className="h-3.5 w-3.5" />;
      case "select": return <ChevronDown className="h-3.5 w-3.5" />;
      default: return <Type className="h-3.5 w-3.5" />;
    }
  };

  return (
    <Card className="shadow-xs rounded-2xl border border-muted/60 flex flex-col justify-between bg-background">
      <CardContent className="p-5 space-y-5 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="rounded-xl h-12 w-12 shrink-0 bg-[#E2DFCD] border-none">
              <AvatarFallback className="rounded-xl bg-transparent text-[#606050]">
                <LayoutGrid className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-0.5">
              <h3 className="text-base font-medium text-[#333333] tracking-tight line-clamp-1">
                {section.title}
              </h3>
              <div className="flex items-center gap-1 text-[13px] text-muted-foreground/80">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> 
                <span>
                  {section.createdAt 
                    ? new Date(section.createdAt).toLocaleDateString("en-GB") 
                    : new Date().toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <Toggle
              pressed={section.isActive}
              onPressedChange={() => onToggleActive(section)}
              size="sm"
              aria-label="Toggle section activation state"
              className="h-8 px-2.5 rounded-lg border border-muted data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-200/60"
            >
              {section.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground/80" />
              )}
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Surface Fields ({section.fields?.length || 0})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
            {section.fields && section.fields.length > 0 ? (
              section.fields.map((field: any, idx: number) => (
                <TooltipProvider key={idx}>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="default" 
                        className="bg-[#5D87E6] hover:bg-[#5D87E6] text-white font-normal text-[12px] px-3 py-1.5 rounded-lg gap-1.5 max-w-[150px] truncate border-none shadow-3xs"
                      >
                        {getFieldIcon(field.type)}
                        <span className="truncate">{field.label}</span>
                        {field.required && <span className="text-red-300 font-bold text-[11px] leading-none ml-0.5">*</span>}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">{field.label} ({field.type})</p>
                      {field.placeholder && <p className="text-[10px] text-muted-foreground">Hint: {field.placeholder}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No fields configured</span>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            Status: <span className={section.isActive ? "text-emerald-600 font-semibold" : "text-muted-foreground font-medium"}>{section.isActive ? "Live" : "Off"}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(section)}
              className="h-9 w-9 rounded-xl border border-muted/70 text-muted-foreground hover:text-foreground shadow-3xs bg-background"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(section._id)}
              className="h-9 w-9 rounded-xl border border-muted/70 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shadow-3xs bg-background"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}