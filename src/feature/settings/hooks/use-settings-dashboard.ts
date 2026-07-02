"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function useSettingsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedDoctorId = searchParams.get("doctor") || "";

  // Dialog & Saving loaders
  const [isSaving, setIsSaving] = useState(false);

  // URL state synchronizer helper
  const setDoctorParam = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("doctor", id);
    } else {
      params.delete("doctor");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return {
    selectedDoctorId,
    setDoctorParam,
    isSaving,
    setIsSaving,
  };
}