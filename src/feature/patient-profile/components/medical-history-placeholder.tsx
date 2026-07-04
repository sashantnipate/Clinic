// FILE: src/feature/patient-profile/components/medical-history-placeholder.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, FileText, Maximize2, Minimize2, GitBranchPlus, Loader2, Pill, Trash2 } from "lucide-react";
import { getPatientClinicalTimeline, createClinicalEncounterAction } from "@/lib/actions/medical-history.actions";
import { toast } from "sonner";

interface TimelineNode {
  id: string;
  nodeId: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  complaint: string;
  notes: string;
  type: "registration" | "one-time" | "followup" | "merge";
  lane: "center-trunk" | "left-branch" | "right-branch";
  parents: string[];
}

interface MedicationFormInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function MedicalHistoryPlaceholder() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [connections, setConnections] = useState<Array<{ from: { x: number; y: number }; to: { x: number; y: number }; isCurve: boolean }>>([]);
  const [horizontalLines, setHorizontalLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const metadataRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("General");
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TimelineNode["type"]>("one-time");
  const [medications, setMedications] = useState<MedicationFormInput[]>([]);

  const loadTimelineRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await getPatientClinicalTimeline(token, patientId);
      if (res.success && res.data) {
        // Chronological order (oldest first) simplifies tree generation paths
        const sorted = [...res.data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setTimeline(sorted);
      }
    } catch (err) {
      toast.error("Could not pull down clinical timeline matrices.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadTimelineRecords();
  }, [loadTimelineRecords]);

  const handleBranchFromNode = (node: TimelineNode) => {
    setSelectedParentId(node.nodeId);
    setSpecialty(node.specialty);
    setType("followup");
    setMedications([]);
    setModalOpen(true);
  };

  const calculatePaths = useCallback(() => {
    if (!contentRef.current || timeline.length === 0) return;
    const contentRect = contentRef.current.getBoundingClientRect();

    const newConnections: typeof connections = [];
    const newHorizontalLines: typeof horizontalLines = [];
    const coordsMap: Record<string, { x: number; y: number; lane: string }> = {};
    const metadataMap: Record<string, { x: number; y: number }> = {};

    // Map screen locations to coordinates relative to viewport canvas
    timeline.forEach((node) => {
      const el = nodeRefs.current[node.nodeId];
      if (el) {
        const rect = el.getBoundingClientRect();
        coordsMap[node.nodeId] = {
          x: rect.left - contentRect.left + rect.width / 2,
          y: rect.top - contentRect.top + rect.height / 2,
          lane: node.lane
        };
      }
      
      const metaEl = metadataRefs.current[node.nodeId];
      if (metaEl) {
        const metaRect = metaEl.getBoundingClientRect();
        metadataMap[node.nodeId] = {
          x: metaRect.left - contentRect.left,
          y: metaRect.top - contentRect.top + metaRect.height / 2
        };
      }
    });

    // Track the last discovered node in each swimming lane array sequence
    const laneLastNodeId: Record<string, string> = { "center-trunk": "", "left-branch": "", "right-branch": "" };

    timeline.forEach((node) => {
      const childCoord = coordsMap[node.nodeId];
      if (!childCoord) return;

      const previousSameLaneId = laneLastNodeId[node.lane];

      if (previousSameLaneId) {
        // Enforce straight track continuation within the same lane
        const parentCoord = coordsMap[previousSameLaneId];
        if (parentCoord) {
          newConnections.push({ from: parentCoord, to: childCoord, isCurve: false });
        }
      } else {
        // If this is the FIRST entry of a branch track, elegantly curve outward from its registered parent node
        if (node.parents && node.parents.length > 0) {
          const parentCoord = coordsMap[node.parents[0]];
          if (parentCoord) {
            newConnections.push({ from: parentCoord, to: childCoord, isCurve: true });
          }
        }
      }

      // Handle Merge Actions: Only connect back to trunk line upon explicit track resolution
      if (node.type === "merge" && node.parents && node.parents.length > 1) {
        const structuralTrunkParent = coordsMap[node.parents[1]];
        if (structuralTrunkParent) {
          newConnections.push({ from: structuralTrunkParent, to: childCoord, isCurve: true });
        }
      }

      // Map dotted baseline text tags for single standard consultations
      if (node.type === "one-time" && metadataMap[node.nodeId]) {
        newHorizontalLines.push({
          x1: childCoord.x + 10,
          y1: childCoord.y,
          x2: metadataMap[node.nodeId].x - 10,
          y2: metadataMap[node.nodeId].y
        });
      }

      // Update lane pointer state cache
      laneLastNodeId[node.lane] = node.nodeId;
    });

    setConnections(newConnections);
    setHorizontalLines(newHorizontalLines);
  }, [timeline]);

  useEffect(() => {
    calculatePaths();
    const timer = setTimeout(calculatePaths, 200);
    window.addEventListener("resize", calculatePaths);
    return () => {
      window.removeEventListener("resize", calculatePaths);
      clearTimeout(timer);
    };
  }, [timeline, isFullscreen, calculatePaths]);

  const toggleFullscreen = () => {
    if (!panelRef.current) return;
    if (!document.fullscreenElement) {
      panelRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !complaint || isSaving) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      
      let calculatedLane: TimelineNode["lane"] = "center-trunk";
      if (type === "followup") {
        calculatedLane = specialty === "General" || specialty === "Cardiology" || specialty === "Dermatology" ? "left-branch" : "right-branch";
      }

      let parents = selectedParentId ? [selectedParentId] : [];
      if (type === "merge") {
        const lastTrunkNode = [...timeline].reverse().find(n => n.lane === "center-trunk")?.nodeId;
        if (lastTrunkNode && lastTrunkNode !== selectedParentId) {
          parents.push(lastTrunkNode);
        }
      }

      const res = await createClinicalEncounterAction(token, {
        patientId, doctor, specialty, complaint, notes, type, lane: calculatedLane, parents,
        prescriptionRx: medications.filter(m => m.name.trim().length > 0)
      });

      if (res.success) {
        toast.success("Encounter file saved securely.");
        setModalOpen(false);
        setDoctor("");
        setComplaint("");
        setNotes("");
        setMedications([]);
        await loadTimelineRecords();
      } else {
        toast.error(res.error || "Failed to commit record updates.");
      }
    } catch {
      toast.error("Network interface connection failure.");
    } finally {
      setIsSaving(false);
    }
  };

  // Render template lists in standard reverse presentation timeline (newest on top)
  const displayTimeline = [...timeline].reverse();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Extracting complete clinical timeline ledgers...</p>
      </div>
    );
  }

  return (
    <div ref={panelRef} className={`w-full text-foreground antialiased flex flex-col ${isFullscreen ? "bg-background p-6 h-screen w-screen fixed inset-0 z-50" : "h-[calc(100vh-240px)] relative"} space-y-4`}>
      
      <div className="flex flex-row items-center justify-between border-b pb-3 shrink-0 bg-background relative z-20">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">Clinical Timeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Click any node to spawn a follow-up branch or view details.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 text-xs gap-1.5">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} 
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
                setSelectedParentId(timeline[timeline.length - 1]?.nodeId || "");
                setType("one-time");
                setMedications([]);
              }}>
                <Plus className="h-3.5 w-3.5" /> Log Encounter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" container={panelRef.current || undefined}>
              <DialogHeader>
                <DialogTitle>Append Medical Note & Script</DialogTitle>
                <DialogDescription>Originating baseline parent context node link ID: <span className="font-mono font-bold text-primary">{selectedParentId || "None"}</span></DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Doctor Name</Label>
                    <Input required placeholder="Dr. Name" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs">Encounter Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One Time Visit (Trunk)</SelectItem>
                      <SelectItem value="followup">Follow-up Needed (Branch)</SelectItem>
                      <SelectItem value="merge">Complete Treatment (Merge)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs">Diagnosis / Complaint</Label>
                  <Input required placeholder="Evaluation parameters..." value={complaint} onChange={(e) => setComplaint(e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea rows={2} placeholder="Observations description context..." value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs resize-none" />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" disabled={isSaving} className="w-full text-xs font-semibold h-9">
                    {isSaving ? "Persisting Assets..." : "Save Clinical Record"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full overflow-y-auto pr-2 flex-1 min-h-0 border rounded-xl bg-card/30 relative z-10" onScroll={calculatePaths}>
        <div ref={contentRef} className="relative w-full max-w-3xl mx-auto py-8 min-h-full">
          
          {timeline.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {connections.map((line, idx) => (
                <path
                  key={`track-link-${idx}`}
                  d={line.isCurve 
                    ? `M ${line.from.x} ${line.from.y} C ${line.from.x} ${(line.from.y + line.to.y) / 2}, ${line.to.x} ${(line.from.y + line.to.y) / 2}, ${line.to.x} ${line.to.y}`
                    : `M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`
                  }
                  fill="none"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth="1.5"
                  className="opacity-40 transition-all duration-300 ease-in-out"
                />
              ))}
              {horizontalLines.map((line, idx) => (
                <line 
                  key={`horiz-hint-${idx}`}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="var(--color-muted-foreground)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="opacity-40 transition-all duration-300 ease-in-out"
                />
              ))}
            </svg>
          )}

          <div className="space-y-16 relative z-10">
            {displayTimeline.map((node) => {
              const isLeft = node.lane === "left-branch";
              const isRight = node.lane === "right-branch";

              return (
                <div key={node.nodeId} className="grid grid-cols-12 items-center relative min-h-[28px]">
                  
                  <div className="col-span-4 flex justify-center">
                    {isLeft && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  <div className="col-span-4 flex justify-center">
                    {!isLeft && !isRight && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  <div className="col-span-4 flex justify-center">
                    {isRight && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  <div 
                    ref={(el) => { metadataRefs.current[node.nodeId] = el; }}
                    className="absolute right-4 hidden md:flex flex-col text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none bg-background px-2 py-0.5 rounded shadow-3xs border border-muted/50 z-10"
                  >
                    <span>{node.date}</span>
                    <span className="font-normal text-muted-foreground/50 lowercase text-[9px]">{node.time}</span>
                  </div>

                </div>
              );
            })}

            {timeline.length === 0 && (
              <p className="text-center text-xs italic text-muted-foreground py-12">No medical timeline notes registered under this file.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function TimelineNodeDot({ node, onBranchClick }: { node: TimelineNode, onBranchClick: (node: TimelineNode) => void }) {
  const ringColor = node.lane === "center-trunk" ? "ring-muted-foreground/30 border-muted-foreground text-muted-foreground" :
                    node.lane === "left-branch" ? "ring-blue-500/20 border-blue-500 text-blue-500" :
                    "ring-orange-500/20 border-orange-500 text-orange-500";

  return (
    <HoverCard openDelay={50} closeDelay={150}>
      <HoverCardTrigger asChild>
        <div className={`h-4 w-4 rounded-full bg-background border-2 ring-4 flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-10 ${ringColor}`} />
      </HoverCardTrigger>
      
      <HoverCardContent className="w-72 p-4 space-y-4 shadow-xl z-50 bg-popover text-popover-foreground rounded-xl border-muted/60" align="center" side="top">
        <div className="space-y-1 border-b pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {node.type.replace("-", " ")}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{node.date}</span>
          </div>
          <h4 className="text-sm font-bold tracking-tight text-foreground pt-1">{node.complaint}</h4>
        </div>
        
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary shrink-0" /> 
            <span className="font-medium text-foreground">{node.doctor} <span className="text-muted-foreground font-normal">({node.specialty})</span></span>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-dashed">
            <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground leading-normal">
              <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">Notes:</span>
              <p className="mt-0.5 whitespace-pre-wrap">{node.notes}</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button size="sm" variant="secondary" className="w-full h-8 text-xs font-semibold gap-1.5" onClick={() => onBranchClick(node)}>
            <GitBranchPlus className="h-3.5 w-3.5" /> Log Follow-up Here
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}