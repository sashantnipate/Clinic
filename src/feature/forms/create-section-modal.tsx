"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, LayoutGrid, X, AlertCircle, GripVertical } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSection: any | null;
  onSaveSection?: (compiledSection: any) => void;
  triggerButton: React.ReactNode;
}

interface RegistrationField {
  label: string;
  type: "text" | "number" | "textarea" | "select";
  required: boolean;
  placeholder: string;
  defaultValue: string;
  options: string[];
}

const createEmptyField = (): RegistrationField => ({
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  defaultValue: "",
  options: [],
});

export function CreateSectionModal({ 
  open, 
  onOpenChange, 
  editingSection, 
  onSaveSection,
  triggerButton 
}: CreateSectionModalProps) {
  const [sectionTitle, setSectionTitle] = useState("");
  const [fields, setFields] = useState<RegistrationField[]>([createEmptyField()]);
  const [newOptionTexts, setNewOptionTexts] = useState<Record<number, string>>({});
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      if (editingSection) {
        setSectionTitle(editingSection.title);
        setFields(
          editingSection.fields.map((f: any) => ({
            label: f.label || "",
            type: f.type || "text",
            required: f.required || false,
            placeholder: f.placeholder || "",
            defaultValue: f.defaultValue || "",
            options: f.options || [],
          }))
        );
      } else {
        setSectionTitle("");
        setFields([createEmptyField()]);
      }
      setNewOptionTexts({});
    }
  }, [open, editingSection]);

  const handleAddField = () => {
    setFields((prev) => [...prev, createEmptyField()]);
  };

  const handleRemoveField = (indexToRemove: number) => {
    setFields((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewOptionTexts((prev) => {
      const updated = { ...prev };
      delete updated[indexToRemove];
      return updated;
    });
  };

  const updateField = (index: number, key: keyof RegistrationField, value: any) => {
    setFields((prev) =>
      prev.map((field, idx) => (idx === index ? { ...field, [key]: value } : field))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedFieldIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, hoverIndex: number) => {
    e.preventDefault();
    if (draggedFieldIndex === null || draggedFieldIndex === hoverIndex) return;

    const reorderedFields = [...fields];
    const draggedItem = reorderedFields[draggedFieldIndex];
    
    reorderedFields.splice(draggedFieldIndex, 1);
    reorderedFields.splice(hoverIndex, 0, draggedItem);

    setDraggedFieldIndex(hoverIndex);
    setFields(reorderedFields);
  };

  const handleDragEnd = () => {
    setDraggedFieldIndex(null);
  };

  const handleAddDropdownOption = (fieldIndex: number) => {
    const text = newOptionTexts[fieldIndex]?.trim();
    if (!text) return;

    setFields((prev) =>
      prev.map((field, idx) => {
        if (idx === fieldIndex) {
          if (field.options.includes(text)) return field;
          return { ...field, options: [...field.options, text] };
        }
        return field;
      })
    );

    setNewOptionTexts((prev) => ({ ...prev, [fieldIndex]: "" }));
  };

  const handleRemoveDropdownOption = (fieldIndex: number, optionToRemove: string) => {
    setFields((prev) =>
      prev.map((field, idx) =>
        idx === fieldIndex
          ? { ...field, options: field.options.filter((opt) => opt !== optionToRemove) }
          : field
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveSection) {
      onSaveSection({
        _id: editingSection?._id,
        title: sectionTitle,
        fields: fields,
      });
    }
    onOpenChange(false);
  };

  const isFormValid = sectionTitle.trim().length > 0 && fields.every((f) => f.label.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>

      <DialogContent className="w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto p-6 will-change-transform antialiased">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">
            {editingSection ? "Edit Section Properties" : "Design Custom Section"}
          </DialogTitle>
          <DialogDescription>
            Specify the section identity scope parameters and arrange input rows directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 max-w-sm">
            <Label htmlFor="sectionTitle" className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" /> Section Name
            </Label>
            <Input
              id="sectionTitle"
              required
              placeholder="e.g., Insurance Details"
              className="h-10 text-sm bg-background font-medium"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              <div className="col-span-1 text-center">Move</div>
              <div className="col-span-3">Field Name *</div>
              <div className="col-span-2">Input Type</div>
              <div className="col-span-2">Placeholder</div>
              <div className="col-span-2">Default Value</div>
              <div className="col-span-1 text-center">Required</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-border/60 space-y-3 md:space-y-0">
              {fields.map((field, index) => (
                <div 
                  key={index} 
                  className={`py-3 md:py-2.5 first:pt-0 last:pb-0 space-y-2 transition-all rounded-md ${
                    draggedFieldIndex === index ? "opacity-40 bg-muted/40" : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="hidden md:flex col-span-12 md:col-span-1 items-center justify-center">
                      <div className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors rounded-sm">
                        <GripVertical className="h-4 w-4 shrink-0" />
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-3 grid gap-1 md:gap-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground md:hidden">Field Name *</span>
                      <Input
                        required
                        placeholder="e.g., Policy ID"
                        value={field.label}
                        onChange={(e) => updateField(index, "label", e.target.value)}
                        className="h-9 text-xs bg-transparent"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-2 grid gap-1 md:gap-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground md:hidden">Input Type</span>
                      <Select
                        value={field.type}
                        onValueChange={(v) => updateField(index, "type", v)}
                      >
                        <SelectTrigger className="h-9 text-xs bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12 md:col-span-2 grid gap-1 md:gap-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground md:hidden">Placeholder</span>
                      <Input
                        placeholder="Optional hint..."
                        value={field.placeholder}
                        onChange={(e) => updateField(index, "placeholder", e.target.value)}
                        className="h-9 text-xs bg-transparent"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-2 grid gap-1 md:gap-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground md:hidden">Default Value</span>
                      <Input
                        placeholder="None"
                        value={field.defaultValue}
                        onChange={(e) => updateField(index, "defaultValue", e.target.value)}
                        className="h-9 text-xs bg-transparent"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-1 flex items-center justify-start md:justify-center gap-2 md:gap-0">
                      <Checkbox
                        id={`required_${index}`}
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(index, "required", !!checked)}
                      />
                      <label htmlFor={`required_${index}`} className="text-xs text-muted-foreground md:hidden cursor-pointer">
                        Required
                      </label>
                    </div>

                    <div className="hidden md:flex col-span-12 md:col-span-1 justify-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent"
                          onClick={() => handleRemoveField(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div className="grid grid-cols-12 gap-3 pt-1.5 pb-2 pl-2 border-l-2 border-l-primary/40 bg-primary/5 rounded-r-md mt-1 md:ml-12">
                      <div className="col-span-12 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 max-w-xs w-full">
                          <Input
                            placeholder="Add choice option..."
                            value={newOptionTexts[index] || ""}
                            onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [index]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddDropdownOption(index);
                              }
                            }}
                            className="h-8 text-xs bg-background"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs font-semibold border px-3 shrink-0"
                            onClick={() => handleAddDropdownOption(index)}
                          >
                            Add Option
                          </Button>
                        </div>

                        {field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {field.options.map((opt) => (
                              <span 
                                key={opt}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-background text-foreground border rounded-md px-2 py-0.5 shadow-3xs"
                              >
                                {opt}
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"
                                  onClick={() => handleRemoveDropdownOption(index, opt)}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 py-1">
                            <AlertCircle className="h-3 w-3 text-amber-500" /> Dropdown values must be assigned before saving.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-dashed border-primary/30 text-primary hover:bg-primary/5 h-9 text-xs rounded-lg gap-1 px-3 transition-colors"
              onClick={handleAddField}
            >
              <Plus className="h-3.5 w-3.5" /> Add Field Row
            </Button>
          </div>

          <DialogFooter className="pt-4 border-t gap-2 flex items-center justify-end bg-transparent">
            <Button
              type="button"
              variant="outline"
              className="px-4 h-9 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-4 h-9 text-xs font-semibold bg-primary text-primary-foreground"
              disabled={!isFormValid}
            >
              Save Section
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}