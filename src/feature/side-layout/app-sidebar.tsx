"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { sidebarTabsList } from "@/constants/sidebar-tabs";

export default function AppSidebar() {
  const pathname = usePathname();
  const { orgRole } = useAuth();
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";

  useEffect(() => {
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
        {sidebarTabsList.map((item) => {
          const hasAccess = isAdmin || allowedTabs.includes(item.id);
          if (!hasAccess) return null;

          const isActive = pathname === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-card border shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}