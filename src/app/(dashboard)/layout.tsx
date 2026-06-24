import AppSidebar from "@/feature/side-layout/app-sidebar";
import { Header } from "@/feature/side-layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto flex max-w-7xl pt-16 px-6">
        <AppSidebar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}