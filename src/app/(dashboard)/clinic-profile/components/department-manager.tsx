"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addDepartmentAction } from "@/lib/actions/department.actions";
import { Layers, FolderPlus, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

interface DepartmentData {
    _id?: string;
    name: string;
    treatments: string[];
}

export function DepartmentManager({ initialDepts }: { initialDepts: DepartmentData[] }) {
    const [depts, setDepts] = useState<DepartmentData[]>(initialDepts || []);

    const [newDeptName, setNewDeptName] = useState("");
    const [newTreatmentsRaw, setNewTreatmentsRaw] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (initialDepts) {
            setDepts(initialDepts);
        }
    }, [initialDepts]);

    const handleOpenCreateModal = () => {
        setEditingIndex(null);
        setNewDeptName("");
        setNewTreatmentsRaw("");
        setModalOpen(true);
    };

    const handleOpenEditModal = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingIndex(index);
        setNewDeptName(depts[index].name);
        setNewTreatmentsRaw(depts[index].treatments.join(", "));
        setModalOpen(true);
    };

    const handleProcessDepartmentForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        const parsedTreatments = newTreatmentsRaw
            .split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0);

        try {
            setIsSaving(true);
            const token = localStorage.getItem("clinic_jwt") || "";

            const targetId = editingIndex !== null ? depts[editingIndex]._id : undefined;

            const res = await addDepartmentAction(token, {
                id: targetId,
                name: newDeptName.trim(),
                treatments: parsedTreatments
            });

            if (res.success && res.data) {
                if (editingIndex !== null) {
                    setDepts(prev => prev.map((item, i) => i === editingIndex ? res.data : item));
                    toast.success("Department modified successfully.");
                } else {
                    setDepts([...depts, res.data]);
                    toast.success("Department added successfully.");
                }
                setNewDeptName("");
                setNewTreatmentsRaw("");
                setModalOpen(false);
            } else {
                toast.error(res.error || "Failed to update database record.");
            }
        } catch (err) {
            toast.error("Network communication fault detected.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                        <Layers className="h-5 w-5" /> Master Departments & Treatments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Provision clinic functional units and view their respective procedure menus.
                    </p>
                </div>

                <Button size="sm" onClick={handleOpenCreateModal} className="h-8 text-xs gap-1">
                    <FolderPlus className="h-4 w-4" /> Add Department
                </Button>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingIndex !== null ? "Edit Department Scope" : "Provision Department"}</DialogTitle>
                        <DialogDescription>
                            {editingIndex !== null ? "Modify this structural cluster and scale internal workflow treatments definitions safely." : "Add a new clinic department unit alongside its treatments."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProcessDepartmentForm} className="space-y-4 pt-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dept-name-input" className="text-xs font-semibold">Department Name</Label>
                            <Input
                                id="dept-name-input"
                                placeholder="e.g., Neurology"
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="treatments-input" className="text-xs font-semibold">Initial Treatment Procedures Menu</Label>
                            <Textarea
                                id="treatments-input"
                                placeholder="Separate items with commas (e.g. EEG Test, Nerve Block)"
                                rows={4}
                                value={newTreatmentsRaw}
                                onChange={(e) => setNewTreatmentsRaw(e.target.value)}
                                className="text-xs resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold" disabled={isSaving || !newDeptName.trim()}>
                                {editingIndex !== null ? "Update Scope Configurations" : "Create Department"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {depts.map((d, index) => (
                    <AccordionItem key={d._id || d.name} value={`item-${index}`} className="border rounded-lg px-4 bg-background">
                        <div className="flex items-center justify-between w-full">
                            <AccordionTrigger className="text-sm font-semibold hover:no-underline text-foreground py-3.5 flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>{d.name}</span>
                                </div>
                            </AccordionTrigger>

                            <div className="flex items-center gap-1.5 pr-2 z-10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleOpenEditModal(index, e)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <AccordionContent className="pb-4 pt-1 border-t border-dashed">
                            <div className="flex flex-wrap gap-1.5 pt-3">
                                {d.treatments.map((t) => (
                                    <Badge key={t} variant="secondary" className="px-2.5 py-0.5 text-[11px] font-medium border bg-muted/40">
                                        {t}
                                    </Badge>
                                ))}
                                {d.treatments.length === 0 && (
                                    <span className="text-xs text-muted-foreground/60 italic block pt-1">
                                        No active treatment protocols registered under this department.
                                    </span>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
                {depts.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-6 border border-dashed rounded-lg">
                        No clinical units provisioned yet.
                    </p>
                )}
            </Accordion>
        </div>
    );
}
