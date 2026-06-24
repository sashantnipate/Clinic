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

const items = [
  // { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
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

  return (
    <aside className="w-64 bg-background">
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-card border shadow-sm"
                    : "hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}