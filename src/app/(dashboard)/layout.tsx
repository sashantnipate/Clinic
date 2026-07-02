// src/app/(dashboard)/layout.tsx
import AppSidebar from "@/feature/side-layout/app-sidebar";
import { Header } from "@/feature/side-layout/header";
import { SidebarProvider } from "@/feature/side-layout/sidebar-context";
import { getNativeJWTString } from "@/lib/actions/auth.actions";
import { LayoutGuardian } from "@/components/layout-guardian"; 
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Rely strictly on Clerk for the first layer of auth protection
  // This ensures we only kick completely unauthenticated users to the login screen
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Try to get the custom MongoDB token
  const session = await getNativeJWTString();
  
  // 3. DO NOT redirect to sign-in here! If it fails, just pass an empty string.
  // This stops the infinite Clerk <SignIn /> loop.
  const tokenValue = session.success && session.token ? session.token : "";

  return (
    <LayoutGuardian serverToken={tokenValue}>
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