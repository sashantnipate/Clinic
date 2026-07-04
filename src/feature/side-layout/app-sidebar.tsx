"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { sidebarTabsList } from "@/constants/sidebar-tabs";
import { useSidebar } from "./sidebar-context";

export default function AppSidebar() {
  const pathname = usePathname();
  const { orgRole } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
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
    <>
      {/* Mobile Sidebar Sheet Overlay backdrop overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={cn(
        // Base structures (desktop settings)
        "w-60 shrink-0 pr-4 fixed top-16 bottom-0 left-auto overflow-y-auto pt-6 text-foreground antialiased bg-background scrollbar-none transition-transform duration-200 z-40 md:sticky md:block md:top-16 md:h-[calc(100vh-4rem)]",
        // Mobile dynamic responsive layouts matrix toggles
        isCollapsed ? "max-md:-translate-x-full max-md:pointer-events-none" : "max-md:translate-x-0 max-md:fixed max-md:left-0 max-md:w-64 max-md:px-6 max-md:bg-background max-md:border-r max-md:shadow-xl"
      )}>
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
                onClick={() => setCollapsed(true)} // Closes automatically on item navigation selections
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
    </>
  );
}