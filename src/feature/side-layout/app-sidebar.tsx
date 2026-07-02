"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Users, LayoutGrid, FileSpreadsheet, Settings, Building2, Pill } from "lucide-react";

const ALL_AVAILABLE_TABS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/forms", label: "Custom Forms", icon: FileSpreadsheet },
  { href: "/pharmacy", label: "Pharmacy", icon: Pill },
  { href: "/clinic-profile", label: "Clinic Profile", icon: Building2 }, 
  { href: "/settings", label: "Access Settings", icon: Settings },       
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { orgRole } = useAuth();
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";

  useEffect(() => {
    // Reads directly from local storage values saved by the layout guardian
    const savedTabsRaw = localStorage.getItem("clinic_allowed_tabs");
    if (savedTabsRaw) {
      setAllowedTabs(JSON.parse(savedTabsRaw));
    } else {
      setAllowedTabs([]);
    }
  }, [pathname]);

  return (
    <aside className="w-60 shrink-0 pr-4 min-h-[calc(100vh-4rem)] hidden md:block pt-6 text-foreground antialiased bg-background">
      <nav className="space-y-1">
        {ALL_AVAILABLE_TABS.map((item) => {
          const hasAccess = isAdmin || allowedTabs.includes(item.href);
          if (!hasAccess) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-card border shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}