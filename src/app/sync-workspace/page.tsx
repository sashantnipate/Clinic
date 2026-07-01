"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SyncWorkspacePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    localStorage.removeItem("clinic_jwt");
    
    const redirectTo = searchParams.get("redirect") || "/";
    
    window.location.href = redirectTo;
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">
        Synchronizing clinic workspace...
      </p>
    </div>
  );
}