"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PharmacyItem, PharmacyItemFormValues } from "./types";

interface PharmacyFormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  itemToEdit?: PharmacyItem | null;
  onSaveItem: (values: PharmacyItemFormValues, id?: string) => Promise<{ success: boolean; error?: string }>;
  triggerButton?: React.ReactNode;
}

const emptyValues: PharmacyItemFormValues = {
  name: "",
  stock: 0,
  price: 0,
  tax: 0,
};

export function PharmacyFormModal({
  open: externalOpen,
  onOpenChange,
  itemToEdit,
  onSaveItem,
  triggerButton,
}: PharmacyFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [values, setValues] = useState<PharmacyItemFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  const resetForm = () => {
    setValues(emptyValues);
    setError("");
  };

  const loadEditValues = (item: PharmacyItem) => {
    setValues({
      name: item.name,
      stock: item.stock,
      price: item.price,
      tax: item.tax,
    });
    setError("");
  };

  useEffect(() => {
    if (!open) return;

    if (itemToEdit) {
      loadEditValues(itemToEdit);
    } else {
      resetForm();
    }
  }, [itemToEdit, open]);

  const validateForm = () => {
    if (!values.name.trim()) return "Name of the prescription is required.";

    if (![values.stock, values.price, values.tax].every(Number.isFinite)) {
      return "Stock, price, and tax must be valid numbers.";
    }

    if (values.stock < 0 || values.price < 0 || values.tax < 0) {
      return "Stock, price, and tax cannot be negative.";
    }

    return "";
  };

  const handleNumberChange = (field: "stock" | "price" | "tax", value: string) => {
    setValues((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const result = await onSaveItem(
        {
          name: values.name.trim(),
          stock: values.stock,
          price: values.price,
          tax: values.tax,
        },
        itemToEdit?.id
      );

      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error || "Failed to save prescription.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {triggerButton || (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Prescription
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? "Edit Prescription" : "New Prescription"}</DialogTitle>
          <DialogDescription>
            Manage prescription inventory, stock, price, and tax details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="pharmacy-name">Name of the Prescription</Label>
            <Input
              id="pharmacy-name"
              value={values.name}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. Paracetamol 500mg"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="pharmacy-stock">Stock</Label>
              <Input
                id="pharmacy-stock"
                type="number"
                min="0"
                value={values.stock}
                onChange={(event) => handleNumberChange("stock", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pharmacy-price">Price</Label>
              <Input
                id="pharmacy-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => handleNumberChange("price", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pharmacy-tax">Tax</Label>
              <Input
                id="pharmacy-tax"
                type="number"
                min="0"
                step="0.01"
                value={values.tax}
                onChange={(event) => handleNumberChange("tax", event.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {itemToEdit ? "Save Changes" : "Save Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
