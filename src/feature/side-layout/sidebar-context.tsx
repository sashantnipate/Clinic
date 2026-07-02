"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto-collapse sidebar by default on smaller mobile breakpoints
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsCollapsed(isMobile);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const setCollapsed = (collapsed: boolean) => setIsCollapsed(collapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}