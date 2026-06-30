// src/app/(dashboard)/layout.tsx
import AppSidebar from "@/feature/side-layout/app-sidebar";
import { Header } from "@/feature/side-layout/header";
import { SidebarProvider } from "@/feature/side-layout/sidebar-context";
import { getNativeJWTString } from "@/lib/actions/auth.actions";
import { LayoutGuardian } from "@/components/layout-guardian"; 
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the raw signed JWT token string seamlessly using the server-side action context
  const session = await getNativeJWTString();

  // 2. If Clerk is unauthenticated or user documents are completely missing, reject page render immediately
  if (!session.success || !session.token) {
    redirect("/sign-in");
  }

  return (
    <LayoutGuardian serverToken={session.token}>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Header />

          <div className="mx-auto flex max-w-7xl pt-16 px-4 sm:px-6 lg:px-8">
            <AppSidebar />

            <main className="flex-1 p-6 transition-all duration-300">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </LayoutGuardian>
  );
}