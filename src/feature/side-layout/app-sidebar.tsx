"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CreditCard,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Pill,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Patients", icon: Users, href: "/patients" },
  { title: "Medical Records", icon: FileText, href: "/medical-records" },
  { title: "Appointments", icon: Calendar, href: "/appointments" },
  { title: "Doctors", icon: UserRound, href: "/doctors" },
  { title: "Billing", icon: CreditCard, href: "/billing" },
  { title: "Pharmacy", icon: Pill, href: "/pharmacy" },
  { title: "Lab Reports", icon: FlaskConical, href: "/lab-reports" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    // Only close the sidebar on link click if the user is on a mobile screen
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={cn(
        "bg-background transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
        isCollapsed 
          ? "w-0 opacity-0 pointer-events-none" 
          : "w-60 opacity-100"
      )}
    >
      <div className="py-4 px-4 w-60">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 w-full",
                  isActive
                    ? "bg-card border shadow-sm"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}