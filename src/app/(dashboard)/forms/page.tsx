"use client";

import React, { useState, useEffect } from "react";
import { CreateSectionModal } from "@/feature/forms/create-section-modal";
import { FileSpreadsheet, Calendar, Edit2, Trash2, Loader2, LayoutGrid, Type, Hash, AlignLeft, ChevronDown, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  saveRegistrationSection, 
  getRegistrationSections, 
  deleteRegistrationSection 
} from "@/lib/actions/section.actions";

export default function FormsDashboardPage() {
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);

  const getBrowserToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clinic_jwt") || "";
    }
    return "";
  };

  useEffect(() => {
    async function loadSavedLayouts() {
      try {
        setIsLoadingSections(true);
        const token = getBrowserToken();
        const result = await getRegistrationSections(token);
        if (result.success) {
          setSectionsList(result.sections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSavedLayouts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSection(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (section: any) => {
    const formattedFields = section.fields.map((f: any) => ({
      label: f.label,
      type: f.type,
      required: f.required || false,
      placeholder: f.placeholder || "",
      defaultValue: f.defaultValue || "",
      options: f.options || [],
    }));

    setEditingSection({ ...section, fields: formattedFields });
    setModalOpen(true);
  };

  const handleToggleActive = async (section: any) => {
    const originalStatus = section.isActive;
    const toggledStatus = !originalStatus;

    // Optimistically update the UI to make the interaction instant
    setSectionsList((prev) =>
      prev.map((s) => (s._id === section._id ? { ...s, isActive: toggledStatus } : s))
    );

    try {
      const token = getBrowserToken();
      const updatedPayload = {
        _id: section._id,
        title: section.title,
        isActive: toggledStatus,
        fields: section.fields,
      };
      
      const result = await saveRegistrationSection(token, updatedPayload);
      if (!result.success) {
        // Rollback state if server action fails
        setSectionsList((prev) =>
          prev.map((s) => (s._id === section._id ? { ...s, isActive: originalStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
      // Rollback state on error
      setSectionsList((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, isActive: originalStatus } : s))
      );
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const token = getBrowserToken();
      const result = await deleteRegistrationSection(token, id);
      if (result.success) {
        setSectionsList((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSectionData = async (compiledSection: any) => {
    try {
      const token = getBrowserToken();
      const payload = {
        _id: compiledSection._id,
        title: compiledSection.title,
        fields: compiledSection.fields
      };

      const result = await saveRegistrationSection(token, payload);
      if (!result.success) return;

      setSectionsList((prev) => {
        const exists = prev.some((s) => s._id === compiledSection._id);
        if (exists) {
          return prev.map((s) => (s._id === compiledSection._id ? result.section : s));
        } else {
          return [result.section, ...prev];
        }
      });
      setModalOpen(false);
      setEditingSection(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "number": return <Hash className="h-3.5 w-3.5" />;
      case "textarea": return <AlignLeft className="h-3.5 w-3.5" />;
      case "select": return <ChevronDown className="h-3.5 w-3.5" />;
      default: return <Type className="h-3.5 w-3.5" />;
    }
  };

  const filteredSections = sectionsList.filter((section) =>
    section.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 min-h-screen antialiased text-foreground">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Registration Sections</h1>
          <p className="text-sm text-muted-foreground">
            Manage your template layout structures used across active client intakes.
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0">
          <CreateSectionModal 
            open={modalOpen} 
            onOpenChange={setModalOpen}
            editingSection={editingSection}
            onSaveSection={handleSaveSectionData}
            triggerButton={
              <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
                Create New Section
              </Button>
            }
          />
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 shadow-3xs"
        />
      </div>

      <Separator />

      {isLoadingSections ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading schema layouts securely from database...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FileSpreadsheet className="h-10 w-10 mx-auto opacity-40 mb-3 text-primary" />
            <p className="font-semibold text-sm">No layout structures found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredSections.map((section) => (
            <Card key={section._id} className="shadow-xs rounded-2xl border border-muted/60 flex flex-col justify-between bg-background">
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
                        <span>{section.createdAt ? new Date(section.createdAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Shadcn Toggle component implementation replacing old switch components */}
                  <div className="flex items-center shrink-0">
                    <Toggle
                      pressed={section.isActive}
                      onPressedChange={() => handleToggleActive(section)}
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
                      onClick={() => handleOpenEditModal(section)}
                      className="h-9 w-9 rounded-xl border border-muted/70 text-muted-foreground hover:text-foreground shadow-3xs bg-background"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteSection(section._id)}
                      className="h-9 w-9 rounded-xl border border-muted/70 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shadow-3xs bg-background"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}