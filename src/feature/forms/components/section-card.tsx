"use client";

import React from "react";
import { Calendar, LayoutGrid, Edit2, Trash2, Type, Hash, AlignLeft, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: any;
  onToggleActive: (section: any) => void;
  onEdit: (section: any) => void;
  onDelete: (id: string) => void;
}

export function SectionCard({ section, onToggleActive, onEdit, onDelete }: SectionCardProps) {
  const getFieldIcon = (type: string) => {
    switch (type) {
      case "number": return <Hash className="h-3 w-3 shrink-0 text-muted-foreground/80" />;
      case "textarea": return <AlignLeft className="h-3 w-3 shrink-0 text-muted-foreground/80" />;
      case "select": return <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/80" />;
      default: return <Type className="h-3 w-3 shrink-0 text-muted-foreground/80" />;
    }
  };

  return (
    <Card className="shadow-xs hover:shadow-sm transition-all rounded-xl border border-muted/60 bg-background overflow-hidden relative">
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">

        {/* Registration Avatar & Info Block */}
        <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
          <Avatar className="rounded-xl h-12 w-12 shrink-0 bg-primary/10 border-none shadow-3xs">
            <AvatarFallback className="rounded-xl bg-transparent text-primary">
              <LayoutGrid className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-foreground tracking-tight leading-none line-clamp-1">
              {section.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">
                {section.createdAt
                  ? new Date(section.createdAt).toLocaleDateString("en-GB")
                  : new Date().toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>

        {/* Center Canvas: Premium Surface Parameter Badges */}
        <div className="flex-1 w-full md:border-l md:border-r border-border md:px-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Surface Fields ({section.fields?.length || 0})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 max-h-[80px] overflow-y-auto pr-1">
            {section.fields && section.fields.length > 0 ? (
              section.fields.map((field: any, idx: number) => (
                <TooltipProvider key={idx}>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="bg-transparent border border-muted hover:bg-muted/40 text-foreground font-medium text-xs px-2.5 py-1 rounded-full gap-1.5 max-w-[160px] cursor-default shadow-3xs"
                      >
                        {getFieldIcon(field.type)}
                        <span className="truncate pr-1">{field.label}</span>
                        {field.required && (
                          <span className="flex h-2 w-2 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive border-[1.5px] border-background"></span>
                          </span>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-[200px]">
                      <p className="font-semibold">{field.label} ({field.type})</p>
                      {field.placeholder && <p className="text-[11px] text-muted-foreground mt-0.5">Hint: {field.placeholder}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/60 italic grid place-items-center h-7 px-3 rounded-full bg-muted/20 border border-dashed">
                No configured parameters
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Wing */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
          <div className="flex items-center gap-2 md:gap-3 bg-muted/20 px-3 md:px-0 py-1 md:py-0 border md:border-0 rounded-full md:rounded-none">
            <span className={cn("text-[11px] font-bold uppercase tracking-wider transition-colors", section.isActive ? "text-primary" : "text-muted-foreground")}>
              {section.isActive ? "Live" : "Draft"}
            </span>
            <Switch
              checked={section.isActive}
              onCheckedChange={() => onToggleActive(section)}
              className="scale-90"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-background shadow-3xs border p-1 rounded-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(section)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Layout</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(section._id)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Section</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}