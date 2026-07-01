"use client";

import { useState, useEffect } from "react";
import { 
  getRegistrationSections, 
  saveRegistrationSection, 
  deleteRegistrationSection 
} from "@/lib/actions/section.actions";

export function useSectionsDashboard() {
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
        setSectionsList((prev) =>
          prev.map((s) => (s._id === section._id ? { ...s, isActive: originalStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
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

  const filteredSections = sectionsList.filter((section) =>
    section.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
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
  };
}