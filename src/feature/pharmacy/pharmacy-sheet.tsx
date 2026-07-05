"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PharmacyFormModal } from "./pharmacy-form-modal";
import { usePharmacySheet } from "./hooks/use-pharmacy-sheet";
import { PharmacyItem, PharmacyItemFormValues, PharmacySortKey } from "./types";

interface PharmacySheetProps {
  items: PharmacyItem[];
  onCreateItem: (values: PharmacyItemFormValues) => Promise<{ success: boolean; error?: string }>;
  onUpdateItem: (id: string, values: PharmacyItemFormValues) => Promise<{ success: boolean; error?: string }>;
  onDeleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
}

type DraftRow = Record<string, PharmacyItemFormValues>;

const numberFields = ["stock", "price", "tax"] as const;

export function PharmacySheet({ items, onCreateItem, onUpdateItem, onDeleteItem }: PharmacySheetProps) {
  const sheet = usePharmacySheet(items);
  const [draftRows, setDraftRows] = useState<DraftRow>({});
  const [dirtyIds, setDirtyIds] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    setDraftRows((prev) => {
      const next: DraftRow = {};
      items.forEach((item) => {
        next[item.id] = prev[item.id] || {
          name: item.name,
          stock: item.stock,
          price: item.price,
          tax: item.tax,
        };
      });
      return next;
    });
  }, [items]);

  const selectedVisibleState = sheet.isAllSelected ? true : sheet.isSomeSelected ? "indeterminate" : false;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const parseNumberInput = (value: string) => {
    if (value === "") return 0;
    return Number(value);
  };

  const validateDraft = (draft: PharmacyItemFormValues) => {
    if (!draft.name.trim()) return "Name of the prescription is required.";
    if (numberFields.some((field) => !Number.isFinite(draft[field]))) {
      return "Stock, price, and tax must be valid numbers.";
    }
    if (numberFields.some((field) => draft[field] < 0)) {
      return "Stock, price, and tax cannot be negative.";
    }
    return "";
  };

  const handleDraftChange = (
    id: string,
    field: keyof PharmacyItemFormValues,
    value: string
  ) => {
    setDraftRows((prev) => {
      const current = prev[id] || { name: "", stock: 0, price: 0, tax: 0 };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: field === "name" ? value : parseNumberInput(value),
        },
      };
    });

    setDirtyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setRowErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSaveRow = async (itemId: string) => {
    const draft = draftRows[itemId];
    if (!draft) return;

    const validationError = validateDraft(draft);
    if (validationError) {
      setRowErrors((prev) => ({ ...prev, [itemId]: validationError }));
      return;
    }

    setSavingIds((prev) => [...prev, itemId]);
    const result = await onUpdateItem(itemId, {
      name: draft.name.trim(),
      stock: draft.stock,
      price: draft.price,
      tax: draft.tax,
    });

    if (result.success) {
      setDirtyIds((prev) => prev.filter((id) => id !== itemId));
      setRowErrors((prev) => ({ ...prev, [itemId]: "" }));
    } else {
      setRowErrors((prev) => ({ ...prev, [itemId]: result.error || "Failed to save row." }));
    }

    setSavingIds((prev) => prev.filter((id) => id !== itemId));
  };

  const handleAddBlankRow = () => {
    sheet.handleOpenCreateModal();
  };

  const handleDeleteRow = async (id: string) => {
    const confirmed = window.confirm("Delete this prescription from the pharmacy sheet?");
    if (!confirmed) return;

    setDeletingIds((prev) => [...prev, id]);
    const result = await onDeleteItem(id);

    if (!result.success) {
      setRowErrors((prev) => ({ ...prev, [id]: result.error || "Failed to delete prescription." }));
    }

    setDeletingIds((prev) => prev.filter((rowId) => rowId !== id));
  };

  const handleModalSave = async (values: PharmacyItemFormValues, id?: string) => {
    if (id) return onUpdateItem(id, values);
    return onCreateItem(values);
  };

  const sortIcon = useMemo(() => {
    return sheet.sortDirection === "asc" ? (
      <ArrowUpAZ className="h-3.5 w-3.5" />
    ) : (
      <ArrowDownAZ className="h-3.5 w-3.5" />
    );
  }, [sheet.sortDirection]);

  const SortButton = ({ field, label }: { field: PharmacySortKey; label: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-1.5 text-xs font-semibold uppercase"
      onClick={() => sheet.handleSort(field)}
    >
      {label}
      {sheet.sortKey === field && sortIcon}
    </Button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={sheet.searchQuery}
            onChange={(event) => sheet.setSearchQuery(event.target.value)}
            placeholder="Search prescriptions..."
            className="h-9 pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {sheet.selectedCount > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {sheet.selectedCount} selected
            </span>
          )}
          <Button onClick={handleAddBlankRow} className="gap-2">
            <Plus className="h-4 w-4" />
            New Prescription
          </Button>
          <PharmacyFormModal
            open={sheet.modalOpen}
            onOpenChange={sheet.setModalOpen}
            itemToEdit={sheet.editingItem}
            onSaveItem={handleModalSave}
          />
        </div>
      </div>

      <div className="rounded-md border bg-background shadow-xs">
        <div className="max-h-[620px] overflow-auto">
          <Table className="min-w-[820px] border-collapse">
            <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 border-r border-b bg-muted/70 text-center">
                  <Checkbox
                    checked={selectedVisibleState}
                    onCheckedChange={(checked) => sheet.handleToggleAll(!!checked)}
                    aria-label="Select all pharmacy rows"
                  />
                </TableHead>
                <TableHead className="min-w-[320px] border-r border-b bg-muted/70">
                  <SortButton field="name" label="Name of the Prescription" />
                </TableHead>
                <TableHead className="w-36 border-r border-b bg-muted/70">
                  <SortButton field="stock" label="Stock" />
                </TableHead>
                <TableHead className="w-36 border-r border-b bg-muted/70">
                  <SortButton field="price" label="Price" />
                </TableHead>
                <TableHead className="w-36 border-r border-b bg-muted/70">
                  <SortButton field="tax" label="Tax" />
                </TableHead>
                <TableHead className="w-24 border-b bg-muted/70 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sheet.filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                    No pharmacy prescriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                sheet.filteredItems.map((item) => {
                  const draft = draftRows[item.id] || {
                    name: item.name,
                    stock: item.stock,
                    price: item.price,
                    tax: item.tax,
                  };
                  const isDirty = dirtyIds.includes(item.id);
                  const isSaving = savingIds.includes(item.id);
                  const isDeleting = deletingIds.includes(item.id);
                  const isSelected = sheet.selectedIds.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      data-state={isSelected && "selected"}
                      className="h-10 hover:bg-muted/30"
                    >
                      <TableCell className="border-r p-1.5 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => sheet.handleToggleRow(item.id, !!checked)}
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell className="border-r p-1">
                        <Input
                          value={draft.name}
                          onChange={(event) => handleDraftChange(item.id, "name", event.target.value)}
                          className="h-8 border-0 bg-transparent px-2 shadow-none focus-visible:ring-1"
                        />
                        {rowErrors[item.id] && (
                          <p className="px-2 pt-1 text-xs text-destructive">{rowErrors[item.id]}</p>
                        )}
                      </TableCell>
                      <TableCell className="border-r p-1">
                        <Input
                          type="number"
                          min="0"
                          value={draft.stock}
                          onChange={(event) => handleDraftChange(item.id, "stock", event.target.value)}
                          className="h-8 border-0 bg-transparent px-2 text-right shadow-none focus-visible:ring-1"
                        />
                      </TableCell>
                      <TableCell className="border-r p-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.price}
                          onChange={(event) => handleDraftChange(item.id, "price", event.target.value)}
                          className="h-8 border-0 bg-transparent px-2 text-right shadow-none focus-visible:ring-1"
                          title={`Price: ${formatCurrency(draft.price)}`}
                        />
                      </TableCell>
                      <TableCell className="border-r p-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.tax}
                          onChange={(event) => handleDraftChange(item.id, "tax", event.target.value)}
                          className="h-8 border-0 bg-transparent px-2 text-right shadow-none focus-visible:ring-1"
                        />
                      </TableCell>
                      <TableCell className="p-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant={isDirty ? "default" : "ghost"}
                            size="icon"
                            className={cn("h-8 w-8", !isDirty && "text-muted-foreground")}
                            disabled={!isDirty || isSaving || isDeleting}
                            onClick={() => handleSaveRow(item.id)}
                            title="Save row"
                          >
                            <Save className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isSaving || isDeleting}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open row actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => sheet.handleOpenEditModal(item)}>
                                <Pencil className="h-4 w-4" />
                                Edit in modal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteRow(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
