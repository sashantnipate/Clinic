import React from "react";

export function PrimaryAndCustomDetails({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      {/* Primary Context */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-primary uppercase border-b pb-2">Primary Information</h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Email Address</span>
            <div className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm items-center truncate">{patient.email}</div>
          </div>
          <div className="col-span-12 md:col-span-6 grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Mobile Number</span>
            <div className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm items-center">{patient.phone}</div>
          </div>
        </div>
      </div>

      {/* Custom Template Assessment Sections */}
      {patient.customSections?.map((section: any) => (
        <div key={section.id} className="space-y-4 pt-2">
          <h3 className="text-xs font-semibold tracking-wide text-primary uppercase border-b pb-2">{section.title}</h3>
          <div className="grid grid-cols-12 gap-4">
            {section.fields.map((field: any) => (
              <div key={field.id} className="col-span-12 md:col-span-4 grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                <div className="flex min-h-10 w-full rounded-md border border-input bg-muted/10 px-3 py-2 text-sm items-center break-all">
                  {patient.customData?.[field.id] || <span className="text-muted-foreground/40 italic">Not specified</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}