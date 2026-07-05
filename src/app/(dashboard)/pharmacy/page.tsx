"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PharmacySheet } from "@/feature/pharmacy/pharmacy-sheet";
import { PharmacyItem, PharmacyItemFormValues } from "@/feature/pharmacy/types";
import {
  createPharmacyItem,
  deletePharmacyItem,
  getPharmacyItems,
  updatePharmacyItem,
} from "@/lib/actions/pharmacy.actions";

function getBrowserToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("clinic_jwt") || "";
  }

  return "";
}

function mapPharmacyItem(item: any): PharmacyItem {
  return {
    id: item._id,
    name: item.name,
    stock: Number(item.stock) || 0,
    price: Number(item.price) || 0,
    tax: Number(item.tax) || 0,
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-GB") : undefined,
  };
}

export default function PharmacyPage() {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadPharmacyItems() {
      try {
        setIsLoading(true);
        setPageError("");

        const token = getBrowserToken();
        const result = await getPharmacyItems(token);

        if (result.success) {
          setItems((result.items || []).map(mapPharmacyItem));
        } else {
          setPageError(result.error || "Failed to load pharmacy items.");
        }
      } catch (err) {
        console.error("Failed to load pharmacy items", err);
        setPageError("An unexpected error occurred while loading pharmacy records.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPharmacyItems();
  }, []);

  const handleCreateItem = async (values: PharmacyItemFormValues) => {
    try {
      const token = getBrowserToken();
      const result = await createPharmacyItem(token, values);

      if (result.success) {
        setItems((prev) => [mapPharmacyItem(result.item), ...prev]);
        return { success: true };
      }

      return { success: false, error: result.error || "Failed to create prescription." };
    } catch (err) {
      console.error("Failed to create pharmacy item", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const handleUpdateItem = async (id: string, values: PharmacyItemFormValues) => {
    try {
      const token = getBrowserToken();
      const result = await updatePharmacyItem(token, id, values);

      if (result.success) {
        const updatedItem = mapPharmacyItem(result.item);
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
        return { success: true };
      }

      return { success: false, error: result.error || "Failed to update prescription." };
    } catch (err) {
      console.error("Failed to update pharmacy item", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const token = getBrowserToken();
      const result = await deletePharmacyItem(token, id);

      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        return { success: true };
      }

      return { success: false, error: result.error || "Failed to delete prescription." };
    } catch (err) {
      console.error("Failed to delete pharmacy item", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pharmacy</h1>
          <p className="text-sm text-muted-foreground">
            Manage prescription stock, pricing, and tax details in a spreadsheet-style inventory.
          </p>
        </div>
      </div>

      {pageError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive">
          {pageError}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border bg-card py-20 text-muted-foreground shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading pharmacy records...</p>
        </div>
      ) : (
        <PharmacySheet
          items={items}
          onCreateItem={handleCreateItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </div>
  );
}
