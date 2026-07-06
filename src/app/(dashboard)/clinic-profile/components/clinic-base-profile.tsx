"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateClinicSettingAction } from "@/lib/actions/clinic-setting.actions";
import { Building2, Plus, Trash2, Globe, Link } from "lucide-react";

export function ClinicBaseProfile({ initialData }: { initialData: any }) {
    const [address, setAddress] = useState(initialData?.address || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [timings, setTimings] = useState(initialData?.timings?.length > 0 ? initialData.timings : [{ days: "", open: "", close: "" }]);

    const [socialLinks, setSocialLinks] = useState({
        instagram: initialData?.socialLinks?.instagram || "",
        facebook: initialData?.socialLinks?.facebook || "",
        x: initialData?.socialLinks?.x || "",
        website: initialData?.socialLinks?.website || ""
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setAddress(initialData.address || "");
            setPhone(initialData.phone || "");
            if (initialData.timings?.length > 0) {
                setTimings(initialData.timings);
            }
            if (initialData.socialLinks) {
                setSocialLinks({
                    instagram: initialData.socialLinks.instagram || "",
                    facebook: initialData.socialLinks.facebook || "",
                    x: initialData.socialLinks.x || "",
                    website: initialData.socialLinks.website || ""
                });
            }
        }
    }, [initialData]);

    const handleAddTimingRow = () => {
        setTimings([...timings, { days: "", open: "", close: "" }]);
    };

    const handleRemoveTimingRow = (index: number) => {
        setTimings(timings.filter((_: any, i: number) => i !== index));
    };

    const handleUpdateTiming = (index: number, key: string, value: string) => {
        setTimings((prev: any[]) => prev.map((t, i) => i === index ? { ...t, [key]: value } : t));
    };

    const handleSocialLinkChange = (key: keyof typeof socialLinks, value: string) => {
        setSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("clinic_jwt") || "";
            const res = await updateClinicSettingAction(token, { address, phone, timings, socialLinks });
            if (res.success) {
                toast.success("Clinic details updated successfully.");
            } else {
                toast.error(res.error || "Failed to commit changes.");
            }
        } catch (err) {
            toast.error("An error occurred while saving profile metrics.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Clinic Base Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                    Configure public registration metadata, location information, and operating timelines.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Contact Phone Number</Label>
                    <Input value={phone} placeholder="Enter clinic line..." onChange={(e) => setPhone(e.target.value)} className="h-9" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Clinic Physical Address</Label>
                    <Input value={address} placeholder="Enter location..." onChange={(e) => setAddress(e.target.value)} className="h-9" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5"><Globe className="h-3 w-3" /> Website Link</Label>
                    <Input value={socialLinks.website} placeholder="https://..." onChange={(e) => handleSocialLinkChange("website", e.target.value)} className="h-9" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5"><Link className="h-3 w-3" /> Instagram Link</Label>
                    <Input value={socialLinks.instagram} placeholder="https://instagram.com/..." onChange={(e) => handleSocialLinkChange("instagram", e.target.value)} className="h-9" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5"><Link className="h-3 w-3" /> Facebook Link</Label>
                    <Input value={socialLinks.facebook} placeholder="https://facebook.com/..." onChange={(e) => handleSocialLinkChange("facebook", e.target.value)} className="h-9" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5"><Link className="h-3 w-3" /> X (Twitter) Link</Label>
                    <Input value={socialLinks.x} placeholder="https://x.com/..." onChange={(e) => handleSocialLinkChange("x", e.target.value)} className="h-9" />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operating Operational Windows</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTimingRow} className="h-8 text-xs gap-1">
                        <Plus className="h-3 w-3" /> Add Range
                    </Button>
                </div>

                <div className="space-y-2">
                    {timings.map((time: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 border p-3 rounded-lg bg-muted/20">
                            <Input
                                placeholder="Days (e.g. Mon - Fri)"
                                value={time.days}
                                onChange={(e) => handleUpdateTiming(idx, "days", e.target.value)}
                                className="h-9 bg-background"
                            />
                            <div className="grid grid-cols-2 gap-2 w-full sm:w-64">
                                <Input
                                    placeholder="Open"
                                    value={time.open}
                                    onChange={(e) => handleUpdateTiming(idx, "open", e.target.value)}
                                    className="h-9 bg-background"
                                />
                                <Input
                                    placeholder="Close"
                                    value={time.close}
                                    onChange={(e) => handleUpdateTiming(idx, "close", e.target.value)}
                                    className="h-9 bg-background"
                                />
                            </div>
                            {timings.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimingRow(idx)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2 flex justify-end border-b pb-6">
                <Button size="sm" onClick={handleSaveProfile} disabled={isSaving} className="h-8 text-xs font-semibold">
                    {isSaving ? "Saving..." : "Save Profile Details"}
                </Button>
            </div>
        </div>
    );
}
