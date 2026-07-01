"use client";

import React from "react";
import { CreateSectionModal } from "@/feature/forms/create-section-modal";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useSectionsDashboard } from "@/feature/forms/hooks/use-sections-dashboard";
import { SectionsList } from "@/feature/forms/components/sections-list";

export default function FormsDashboardPage() {
  const {
    searchQuery,
    setSearchQuery,
    isLoadingSections,
    modalOpen,
    setModalOpen,
    editingSection,
    filteredSections,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleToggleActive,
    handleDeleteSection,
    handleSaveSectionData,
  } = useSectionsDashboard();

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

      <SectionsList
        isLoading={isLoadingSections}
        sections={filteredSections}
        onToggleActive={handleToggleActive}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteSection}
      />
    </div>
  );
}