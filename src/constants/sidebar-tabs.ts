import { Users, LayoutGrid, FileSpreadsheet, Settings, Building2, Pill, CreditCard, Bell } from "lucide-react";
import React from "react";

export const SIDEBAR_TABS = [
  { id: "/", label: "Dashboard", icon: LayoutGrid },
  { id: "/patients", label: "Patients", icon: Users },
  { id: "/forms", label: "Custom Forms", icon: FileSpreadsheet },
  { id: "/pharmacy", label: "Pharmacy", icon: Pill },
  { id: "/clinic-profile", label: "Clinic Profile", icon: Building2 },
  { id: "/notifications", label: "Notifications", icon: Bell},
  { id: "/billing", label: "Billing", icon: CreditCard },
  { id: "/settings", label: "Access Settings", icon: Settings },
  
] as const;

export type SidebarTabId = typeof SIDEBAR_TABS[number]["id"];

export interface SidebarTabItem {
  id: SidebarTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Safely cast to clear the "readonly" status for standard array maps
export const sidebarTabsList = SIDEBAR_TABS as unknown as SidebarTabItem[];