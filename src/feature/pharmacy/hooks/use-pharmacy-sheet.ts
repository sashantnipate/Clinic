"use client";

import { useMemo, useState } from "react";
import { PharmacyItem, PharmacySortDirection, PharmacySortKey } from "../types";

export function usePharmacySheet(items: PharmacyItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<PharmacySortKey>("name");
  const [sortDirection, setSortDirection] = useState<PharmacySortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<PharmacyItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = items.filter((item) => {
      if (!query) return true;
      return item.name.toLowerCase().includes(query);
    });

    return [...result].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * direction;
      }

      return (a[sortKey] - b[sortKey]) * direction;
    });
  }, [items, searchQuery, sortDirection, sortKey]);

  const filteredIds = filteredItems.map((item) => item.id);
  const selectedCount = filteredIds.filter((id) => selectedIds.includes(id)).length;
  const isAllSelected = filteredIds.length > 0 && selectedCount === filteredIds.length;
  const isSomeSelected = selectedCount > 0 && selectedCount < filteredIds.length;

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((rowId) => rowId !== id)));
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
      return;
    }

    setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
  };

  const handleSort = (key: PharmacySortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: PharmacyItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    sortKey,
    sortDirection,
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    editingItem,
    modalOpen,
    setModalOpen,
    filteredItems,
    handleToggleRow,
    handleToggleAll,
    handleSort,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
  };
}
