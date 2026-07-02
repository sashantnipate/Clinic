// src/components/layout-guardian.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation"; 
import { Loader2 } from "lucide-react";

interface GuardianProps {
  serverToken: string;
  children: React.ReactNode;
}

export function LayoutGuardian({ serverToken, children }: GuardianProps) {
  const { userId: isClerkAuthenticated, isLoaded } = useAuth();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // 1. Clean token up smoothly if user signs out via Clerk UI
    if (!isClerkAuthenticated) {
      localStorage.removeItem("clinic_jwt");
      setIsReady(false);
      return;
    }

    // 2. If a valid token value was sent down from the server layout, store it
    if (serverToken) {
      localStorage.setItem("clinic_jwt", serverToken);
      setIsReady(true);
      return;
    }

    // 3. Evaluate local storage state without forcing a redirect cycle
    const currentToken = localStorage.getItem("clinic_jwt");

    if (currentToken && currentToken.trim() !== "") {
      setIsReady(true);
    } else {
      // Keep loading instead of calling router.push() or signOut()
      // This stops the infinite redirect loop dead in its tracks.
      setIsReady(false); 
    }
  }, [pathname, serverToken, isClerkAuthenticated, isLoaded]);

  if (!isLoaded || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Authorizing application credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}