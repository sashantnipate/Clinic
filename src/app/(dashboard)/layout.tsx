import AppSidebar from "@/feature/side-layout/app-sidebar";
import { Header } from "@/feature/side-layout/header";
import { SidebarProvider } from "@/feature/side-layout/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}