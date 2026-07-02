"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation"; 
import { Loader2, ShieldAlert } from "lucide-react";

interface GuardianProps {
  serverToken: string;
  children: React.ReactNode;
}

export function LayoutGuardian({ serverToken, children }: GuardianProps) {
  const { userId: isClerkAuthenticated, isLoaded, orgRole } = useAuth();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";

  useEffect(() => {
    if (!isLoaded) return;

    if (!isClerkAuthenticated) {
      localStorage.removeItem("clinic_jwt");
      localStorage.removeItem("clinic_allowed_tabs");
      setIsReady(false);
      setIsValidating(false);
      return;
    }

    if (serverToken) {
      localStorage.setItem("clinic_jwt", serverToken);
    }

    const currentToken = localStorage.getItem("clinic_jwt");
    if (!currentToken || currentToken.trim() === "") {
      setIsReady(false);
      setIsValidating(false);
      return;
    }

    setIsReady(true);

    if (isAdmin) {
      setHasAccess(true);
      setIsValidating(false);
      return;
    }

    async function syncAndVerifyPaths() {
      try {
        setIsValidating(true);
        const token = localStorage.getItem("clinic_jwt") || "";
        
        // Call the updated server-side token resolver endpoint
        const res = await fetch("/api/users/permissions", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        if (res.success && Array.isArray(res.visibleTabs)) {
          localStorage.setItem("clinic_allowed_tabs", JSON.stringify(res.visibleTabs));
          
          const matchingAccess = res.visibleTabs.some((tab: string) => 
            pathname === tab || (tab !== "/" && pathname.startsWith(tab))
          );
          setHasAccess(matchingAccess);
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error("Guardian verification crash:", err);
        setHasAccess(false);
      } finally {
        setIsValidating(false);
      }
    }

    syncAndVerifyPaths();
  }, [pathname, serverToken, isClerkAuthenticated, isLoaded, isAdmin]);

  if (!isLoaded || !isReady || isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Verifying workspace permissions...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Your profile account layout matrix lacks authorization metadata for path: <span className="font-mono text-destructive bg-destructive/5 px-1.5 py-0.5 rounded text-xs">{pathname}</span>
        </p>
        <button 
          onClick={() => {
            // Hard refresh back to base route safely clear states
            window.location.href = "/";
          }}
          className="mt-6 text-xs font-semibold px-4 py-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          Return to Allowed Workspace
        </button>
      </div>
    );
  }

  return <>{children}</>;
}