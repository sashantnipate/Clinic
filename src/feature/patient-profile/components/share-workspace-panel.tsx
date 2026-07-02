import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function ShareWorkspacePanel({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Cross-Clinic Secure Sharing Matrix</h3>
        <p className="text-xs text-muted-foreground">Grant another specialized clinic organization ledger read permissions to this patient's intake folder securely.</p>
      </div>
      <div className="border rounded-xl p-4 bg-muted/5 flex items-center justify-between">
        <div className="text-xs font-medium">Currently Authorized External Orgs: <span className="text-muted-foreground italic font-normal">None</span></div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Share2 className="h-3 w-3" /> Authorize Org</Button>
      </div>
    </div>
  );
}