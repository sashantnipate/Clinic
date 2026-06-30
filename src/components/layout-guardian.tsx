// src/components/layout-guardian.tsx
"use client";

import { useEffect, useState } from "react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GuardianProps {
  serverToken: string;
  children: React.ReactNode;
}

export function LayoutGuardian({ serverToken, children }: GuardianProps) {
  const { signOut } = useClerk();
  const { userId: isClerkAuthenticated } = useAuth(); // Tracks live Clerk session status
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. If the user clicks logout, immediately wipe your custom JWT string
    if (!isClerkAuthenticated) {
      localStorage.removeItem("clinic_jwt");
      setIsReady(false);
      return;
    }

    // 2. Auto-generation path (Your correct idea): 
    // If the token is missing but they are authenticated, write the serverToken back to storage
    if (serverToken) {
      localStorage.setItem("clinic_jwt", serverToken);
    }

    // 3. Re-evaluate token presence strictly
    const currentToken = localStorage.getItem("clinic_jwt");

    if (!currentToken || currentToken.trim() === "") {
      console.warn("Security Exception: Custom token missing.");
      setIsReady(false);
      signOut({ redirectUrl: "/sign-in" });
    } else {
      setIsReady(true);
    }
  }, [pathname, serverToken, signOut, isClerkAuthenticated]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Authorizing application credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}