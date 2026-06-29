// src/app/forms/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { CreateSectionModal } from "@/feature/forms/create-section-modal";
import { ListPlus, CheckCircle2, XCircle, FileSpreadsheet, Calendar, Edit2, Trash2, Power, Loader2 } from "lucide-react";
import { saveRegistrationSection } from "@/lib/actions/section.actions";
import { verifyAndFetchWorkspace } from "@/lib/actions/auth.actions";

export default function FormsDashboardPage() {
  const { signOut } = useClerk();
  
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function enforceSessionSync() {
      try {
        setIsVerifying(true);
        const result = await verifyAndFetchWorkspace();

        // CATCH 1: True Authorization failure -> Force push logout
        if (!result.success && result.authError) {
          console.warn("Security policy violation. Executing forced logout...");
          await signOut({ redirectUrl: "/sign-in" });
          return;
        }

        // CATCH 2: Webhook database synchronization race condition handler
        if (!result.success && result.retry && retryCount < 5) {
          console.log("Database record synchronization in progress. Retrying step...");
          setTimeout(() => setRetryCount(prev => prev + 1), 1500);
          return;
        }

        // SUCCESS: Native data is ready and verified
        if (result.success && result.ownerOrgId) {
          setActiveOrgId(result.ownerOrgId);
        }
      } catch (err) {
        console.error("Auth layer exception handler:", err);
      } finally {
        setIsVerifying(false);
      }
    }
    enforceSessionSync();
  }, [signOut, retryCount]);

  useEffect(() => {
    if (!activeOrgId) return;

    async function loadSavedLayouts() {
      try {
        setIsLoadingSections(true);
        const response = await fetch(`/api/sections?ownerOrgId=${activeOrgId}`);
        if (response.ok) {
          const data = await response.json();
          setSectionsList(data.sections || []);
        }
      } catch (err) {
        console.error("Failed to sync structural form builder layouts:", err);
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSavedLayouts();
  }, [activeOrgId]);

  const handleOpenCreateModal = () => {
    setEditingSection(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (section: any) => {
    const formattedFields = section.fields.map((f: any) => ({
      id: f.id,
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
    if (!activeOrgId) return;
    try {
      const updatedPayload = {
        ...section,
        ownerOrgId: activeOrgId,
        isActive: !section.isActive
      };
      
      const result = await saveRegistrationSection(updatedPayload);
      if (result.success) {
        setSectionsList((prev) =>
          prev.map((s) => (s.id === section.id ? result.section : s))
        );
      }
    } catch (err) {
      console.error("Failed to mutate section visibility status:", err);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!activeOrgId) return;
    try {
      const response = await fetch(`/api/sections/${id}?ownerOrgId=${activeOrgId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSectionsList((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to execute collection deletion request:", err);
    }
  };

  const handleSaveSectionData = async (compiledSection: any) => {
    if (!activeOrgId) return;
    try {
      const completePayload = {
        ...compiledSection,
        ownerOrgId: activeOrgId, 
      };

      const result = await saveRegistrationSection(completePayload);

      if (!result.success) {
        console.error("Database save transaction rejected:", result.error);
        return;
      }

      setSectionsList((prev) => {
        const exists = prev.some((s) => s.id === compiledSection.id);
        if (exists) {
          return prev.map((s) => (s.id === compiledSection.id ? result.section : s));
        } else {
          return [result.section, ...prev];
        }
      });

    } catch (err) {
      console.error("Failed to run native database save layout pipeline:", err);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 bg-background text-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Verifying secure workspace parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 min-h-screen antialiased text-foreground">
      
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
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
              <button 
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 h-10 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                Create New Section
              </button>
            }
          />
        </div>
      </div>

      {/* Stacked Row Layout Wrapper */}
      <div className="space-y-3">
        {isLoadingSections ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium">Loading schema layouts securely from database...</p>
          </div>
        ) : sectionsList.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-card">
            <FileSpreadsheet className="h-10 w-10 mx-auto opacity-40 mb-3 text-primary" />
            <p className="font-semibold text-sm">No custom dynamic sections created yet.</p>
            <p className="text-xs max-w-xs mx-auto mt-1">Click the button above to begin structural field configurations.</p>
          </div>
        ) : (
          sectionsList.map((section) => (
            <div 
              key={section.id}
              className="border bg-card rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary/20 transition-all shadow-3xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground tracking-tight">
                      {section.title}
                    </h3>
                    {section.isActive ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-sm border border-emerald-200/40">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm border">
                        <XCircle className="h-2.5 w-2.5" /> Off
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono opacity-60 tracking-wider text-[10px]">{section.id.toUpperCase()}</span>
                    <span className="hidden sm:inline text-muted-foreground/40">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> 
                      {section.createdAt ? new Date(section.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-md border text-[11px] font-medium text-muted-foreground max-w-fit shrink-0">
                  <ListPlus className="h-3.5 w-3.5 text-primary" /> {section.fields?.length || 0} Inputs
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenEditModal(section)}
                  className="h-9 sm:h-8 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted bg-background transition-colors text-foreground w-full sm:w-auto"
                >
                  <Edit2 className="h-3 w-3 text-primary shrink-0" />
                  <span>Edit Layout</span>
                </button>

                <button
                  onClick={() => handleToggleActive(section)}
                  className={`h-9 sm:h-8 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto ${
                    section.isActive 
                      ? "hover:bg-amber-50 text-amber-600 hover:text-amber-700 bg-background" 
                      : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 bg-background"
                  }`}
                >
                  <Power className="h-3 w-3 shrink-0" />
                  <span>{section.isActive ? "Deactivate" : "Activate"}</span>
                </button>

                <button
                  onClick={() => handleDeleteSection(section._id || section.id)}
                  className="h-9 sm:h-8 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-destructive/10 text-destructive bg-background transition-colors w-full sm:w-auto"
                >
                  <Trash2 className="h-3 w-3 shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}