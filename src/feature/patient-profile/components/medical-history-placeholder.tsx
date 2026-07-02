"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, FileText, Maximize2, Minimize2, GitBranchPlus } from "lucide-react";

interface TimelineNode {
  id: string;
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

const INITIAL_TIMELINE: TimelineNode[] = [
  { id: "n-30", date: "28/06/2026", time: "09:00 AM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Cardiac Clearance", notes: "Final echo is clear. Merging cardiology track.", type: "merge", lane: "center-trunk", parents: ["n-28", "n-29"] },
  { id: "n-29", date: "25/06/2026", time: "11:30 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Seasonal Allergies", notes: "Prescribed antihistamines.", type: "one-time", lane: "center-trunk", parents: ["n-25"] },
  { id: "n-28", date: "22/06/2026", time: "02:15 PM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Arrhythmia Check", notes: "Holter monitor results normal.", type: "followup", lane: "left-branch", parents: ["n-26"] },
  { id: "n-27", date: "20/06/2026", time: "10:00 AM", doctor: "Dr. Robert Chen", specialty: "Orthopedics", complaint: "Knee Pain Cleared", notes: "Therapy complete. Closing ortho track.", type: "merge", lane: "center-trunk", parents: ["n-24", "n-25"] },
  { id: "n-26", date: "18/06/2026", time: "03:45 PM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Medication Adjustment", notes: "Lowered beta-blocker dose.", type: "followup", lane: "left-branch", parents: ["n-23"] },
  { id: "n-25", date: "15/06/2026", time: "01:20 PM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Routine Bloodwork", notes: "Annual CBC and metabolic panel drawn.", type: "one-time", lane: "center-trunk", parents: ["n-20"] },
  { id: "n-24", date: "12/06/2026", time: "09:30 AM", doctor: "Dr. Robert Chen", specialty: "Orthopedics", complaint: "Physical Therapy Review", notes: "ROM improved by 40%.", type: "followup", lane: "right-branch", parents: ["n-21"] },
  { id: "n-23", date: "10/06/2026", time: "11:00 AM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Palpitations Follow-up", notes: "Patient reports fewer episodes.", type: "followup", lane: "left-branch", parents: ["n-18"] },
  { id: "n-22", date: "08/06/2026", time: "04:00 PM", doctor: "Dr. Lisa Wong", specialty: "Dermatology", complaint: "Rash Resolved", notes: "Contact dermatitis cleared. Merging.", type: "merge", lane: "center-trunk", parents: ["n-19", "n-20"] },
  { id: "n-21", date: "05/06/2026", time: "10:15 AM", doctor: "Dr. Robert Chen", specialty: "Orthopedics", complaint: "Right Knee Pain", notes: "Suspected meniscus strain. MRI ordered.", type: "followup", lane: "right-branch", parents: ["n-20"] }, // Branching from trunk
  { id: "n-20", date: "01/06/2026", time: "02:30 PM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Migraine Relief", notes: "Triptans effective.", type: "one-time", lane: "center-trunk", parents: ["n-17"] },
  { id: "n-19", date: "28/05/2026", time: "11:45 AM", doctor: "Dr. Lisa Wong", specialty: "Dermatology", complaint: "Contact Dermatitis", notes: "Prescribed topical steroids.", type: "followup", lane: "left-branch", parents: ["n-17"] }, // Branching from trunk
  { id: "n-18", date: "25/05/2026", time: "09:00 AM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Echocardiogram", notes: "Structural function normal.", type: "followup", lane: "left-branch", parents: ["n-14"] },
  { id: "n-17", date: "22/05/2026", time: "03:15 PM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Acute Migraine", notes: "Administered IV fluids and Toradol.", type: "one-time", lane: "center-trunk", parents: ["n-15"] },
  { id: "n-16", date: "20/05/2026", time: "10:30 AM", doctor: "Dr. Emily Stone", specialty: "Neurology", complaint: "Headache Cleared", notes: "Neurological exam normal. Merging.", type: "merge", lane: "center-trunk", parents: ["n-12", "n-15"] },
  { id: "n-15", date: "18/05/2026", time: "01:45 PM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Vaccine Booster", notes: "Tdap administered.", type: "one-time", lane: "center-trunk", parents: ["n-13"] },
  { id: "n-14", date: "15/05/2026", time: "11:00 AM", doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", complaint: "Initial Cardio Consult", notes: "EKG shows PACs. Starting branch.", type: "followup", lane: "left-branch", parents: ["n-13"] }, // Branching from trunk
  { id: "n-13", date: "12/05/2026", time: "09:20 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Palpitations Reported", notes: "Referred to cardiology.", type: "one-time", lane: "center-trunk", parents: ["n-10"] },
  { id: "n-12", date: "10/05/2026", time: "04:00 PM", doctor: "Dr. Emily Stone", specialty: "Neurology", complaint: "Tension Headaches", notes: "Started amitriptyline.", type: "followup", lane: "right-branch", parents: ["n-10"] }, // Branching from trunk
  { id: "n-11", date: "08/05/2026", time: "02:30 PM", doctor: "Dr. Alan Turing", specialty: "Podiatry", complaint: "Ingrown Toenail", notes: "Removed. Merging track.", type: "merge", lane: "center-trunk", parents: ["n-8", "n-10"] },
  { id: "n-10", date: "05/05/2026", time: "10:15 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Annual Physical", notes: "Overall health stable.", type: "one-time", lane: "center-trunk", parents: ["n-7"] },
  { id: "n-9", date: "02/05/2026", time: "11:00 AM", doctor: "Dr. Marcus Cole", specialty: "Ophthalmology", complaint: "Eye Exam", notes: "20/20 vision. Merging.", type: "merge", lane: "center-trunk", parents: ["n-6", "n-7"] },
  { id: "n-8", date: "28/04/2026", time: "03:45 PM", doctor: "Dr. Alan Turing", specialty: "Podiatry", complaint: "Toe Pain", notes: "Scheduled for removal.", type: "followup", lane: "right-branch", parents: ["n-7"] }, // Branching
  { id: "n-7", date: "25/04/2026", time: "09:30 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Prescription Refill", notes: "Refilled standard meds.", type: "one-time", lane: "center-trunk", parents: ["n-4"] },
  { id: "n-6", date: "20/04/2026", time: "01:15 PM", doctor: "Dr. Marcus Cole", specialty: "Ophthalmology", complaint: "Blurry Vision", notes: "Drops prescribed.", type: "followup", lane: "left-branch", parents: ["n-4"] }, // Branching
  { id: "n-5", date: "18/04/2026", time: "10:00 AM", doctor: "Dr. Grace Hopper", specialty: "Nutrition", complaint: "Diet Plan Complete", notes: "Target weight reached. Merging.", type: "merge", lane: "center-trunk", parents: ["n-3", "n-4"] },
  { id: "n-4", date: "15/04/2026", time: "11:45 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "URI Symptoms", notes: "Viral protocol advised.", type: "one-time", lane: "center-trunk", parents: ["n-2"] },
  { id: "n-3", date: "10/04/2026", time: "02:00 PM", doctor: "Dr. Grace Hopper", specialty: "Nutrition", complaint: "Diet Consultation", notes: "High protein plan started.", type: "followup", lane: "right-branch", parents: ["n-2"] }, // Branching
  { id: "n-2", date: "05/04/2026", time: "09:30 AM", doctor: "Dr. Alex Newman", specialty: "General", complaint: "Baseline Labs Review", notes: "All metabolic markers normal.", type: "one-time", lane: "center-trunk", parents: ["n-1"] },
  { id: "n-1", date: "01/04/2026", time: "08:00 AM", doctor: "System Registry", specialty: "General", complaint: "Patient Registered", notes: "Initial intake complete.", type: "registration", lane: "center-trunk", parents: [] }
];

export function MedicalHistoryPlaceholder() {
  const [timeline, setTimeline] = useState<TimelineNode[]>(INITIAL_TIMELINE);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // SVG Connection states
  const [connections, setConnections] = useState<Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>>([]);
  const [horizontalLines, setHorizontalLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const metadataRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Form Field States
  const [selectedParentId, setSelectedParentId] = useState<string>("n-1");
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("General");
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TimelineNode["type"]>("one-time");

  const handleBranchFromNode = (node: TimelineNode) => {
    setSelectedParentId(node.id);
    setSpecialty(node.specialty);
    setType("followup"); // Default to branching follow-up when clicking a node
    setModalOpen(true);
  };

  // TRUE GRAPH POSITION CALCULATOR (Scroll Agnostic)
  const calculatePaths = useCallback(() => {
    if (!contentRef.current) return;
    const contentRect = contentRef.current.getBoundingClientRect();

    const newConnections: typeof connections = [];
    const newHorizontalLines: typeof horizontalLines = [];
    const coordsMap: Record<string, { x: number; y: number }> = {};
    const metadataMap: Record<string, { x: number; y: number }> = {};

    // Get coordinates relative to the inner content container
    timeline.forEach((node) => {
      const el = nodeRefs.current[node.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        coordsMap[node.id] = {
          x: rect.left - contentRect.left + rect.width / 2,
          y: rect.top - contentRect.top + rect.height / 2 
        };
      }
      
      const metaEl = metadataRefs.current[node.id];
      if (metaEl) {
        const metaRect = metaEl.getBoundingClientRect();
        metadataMap[node.id] = {
          x: metaRect.left - contentRect.left, // Point to the left edge of the text block
          y: metaRect.top - contentRect.top + metaRect.height / 2
        };
      }
    });

    timeline.forEach((node) => {
      const childCoord = coordsMap[node.id];
      if (!childCoord) return;

      // 1. Draw Parent-to-Child curved connection branches
      if (node.parents) {
        node.parents.forEach((parentId) => {
          const parentCoord = coordsMap[parentId];
          if (parentCoord) {
            newConnections.push({ from: parentCoord, to: childCoord });
          }
        });
      }

      // 2. Draw Horizontal Dotted Line for One-Time Visits (Center to Metadata Right)
      if (node.type === "one-time" && metadataMap[node.id]) {
        newHorizontalLines.push({
          x1: childCoord.x + 10, // Start slightly right of the node
          y1: childCoord.y,
          x2: metadataMap[node.id].x - 10, // End slightly left of the text
          y2: metadataMap[node.id].y
        });
      }
    });

    setConnections(newConnections);
    setHorizontalLines(newHorizontalLines);
  }, [timeline]);

  useEffect(() => {
    calculatePaths();
    const timer = setTimeout(calculatePaths, 150);
    window.addEventListener("resize", calculatePaths);
    return () => {
      window.removeEventListener("resize", calculatePaths);
      clearTimeout(timer);
    };
  }, [timeline.length, isFullscreen, calculatePaths]);

  const toggleFullscreen = () => {
    if (!panelRef.current) return;
    if (!document.fullscreenElement) {
      panelRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !complaint) return;

    const now = new Date();
    const newId = `n-${Math.random().toString(36).substring(2, 9)}`;
    
    // Strict Lane Logic
    let calculatedLane: TimelineNode["lane"] = "center-trunk";
    if (type === "followup") {
      calculatedLane = specialty === "General" || specialty === "Cardiology" || specialty === "Dermatology" ? "left-branch" : "right-branch";
    }

    // Parents Array Logic
    let parents = [selectedParentId];
    if (type === "merge") {
      // Connect to the branch being closed AND the latest center trunk node
      const lastTrunkNode = timeline.find(n => n.lane === "center-trunk")?.id;
      if (lastTrunkNode && lastTrunkNode !== selectedParentId) {
        parents.push(lastTrunkNode);
      }
    }

    const newRecord: TimelineNode = {
      id: newId,
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      doctor,
      specialty,
      complaint,
      notes,
      type,
      lane: calculatedLane,
      parents
    };

    setTimeline([newRecord, ...timeline]);
    setModalOpen(false);

    setDoctor("");
    setComplaint("");
    setNotes("");
  };

  return (
    <div ref={panelRef} className={`w-full text-foreground antialiased flex flex-col ${isFullscreen ? "bg-background p-6 h-screen w-screen fixed inset-0 z-50" : "h-[calc(100vh-240px)] relative"} space-y-4`}>
      
      {/* Action Header */}
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
                setSelectedParentId(timeline[0]?.id);
                setType("one-time");
              }}>
                <Plus className="h-3.5 w-3.5" /> Log Encounter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" container={panelRef.current || undefined}>
              <DialogHeader>
                <DialogTitle>Append Medical Note</DialogTitle>
                <DialogDescription>Originating from node: <span className="font-mono font-bold text-primary">{selectedParentId}</span></DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Doctor Name</Label>
                    <Input required placeholder="Dr. Name" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
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
                  <Label>Encounter Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One Time Visit (Trunk)</SelectItem>
                      <SelectItem value="followup">Follow-up Needed (Branch)</SelectItem>
                      <SelectItem value="merge">Complete Treatment (Merge)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>Diagnosis / Complaint</Label>
                  <Input required placeholder="Evaluation..." value={complaint} onChange={(e) => setComplaint(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={2} placeholder="Observations..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full text-xs font-semibold h-9">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* INDEPENDENTLY SCROLLABLE TIMELINE VIEWPORT */}
      <div className="w-full overflow-y-auto pr-2 flex-1 min-h-0 border rounded-xl bg-card/30 relative z-10" onScroll={calculatePaths}>
        <div ref={contentRef} className="relative w-full max-w-3xl mx-auto py-8 min-h-full">
          
          {/* SVG CANVAS LAYER */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {/* Curved Branch/Merge Connectors */}
            {connections.map((line, idx) => (
              <path
                key={`curve-${idx}`}
                d={`M ${line.from.x} ${line.from.y} C ${line.from.x} ${(line.from.y + line.to.y) / 2}, ${line.to.x} ${(line.from.y + line.to.y) / 2}, ${line.to.x} ${line.to.y}`}
                fill="none"
                stroke="var(--color-muted-foreground)"
                strokeWidth="1.5"
                className="opacity-40 transition-all duration-300 ease-in-out"
              />
            ))}
            {/* Horizontal Dotted Lines for One-Time Visits */}
            {horizontalLines.map((line, idx) => (
              <line 
                key={`horiz-${idx}`}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="var(--color-muted-foreground)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-40 transition-all duration-300 ease-in-out"
              />
            ))}
          </svg>

          {/* TIMELINE NODES */}
          <div className="space-y-16 relative z-10">
            {timeline.map((node) => {
              const isLeft = node.lane === "left-branch";
              const isRight = node.lane === "right-branch";

              return (
                <div key={node.id} className="grid grid-cols-12 items-center relative min-h-[28px]">
                  
                  {/* LEFT SWIMLANE */}
                  <div className="col-span-4 flex justify-center">
                    {isLeft && <div ref={(el) => { nodeRefs.current[node.id] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  {/* CENTER TRUNK */}
                  <div className="col-span-4 flex justify-center">
                    {!isLeft && !isRight && <div ref={(el) => { nodeRefs.current[node.id] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  {/* RIGHT SWIMLANE */}
                  <div className="col-span-4 flex justify-center">
                    {isRight && <div ref={(el) => { nodeRefs.current[node.id] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} /></div>}
                  </div>

                  {/* TIMESTAMP TAGS (Anchored explicitly for horizontal line targeting) */}
                  <div 
                    ref={(el) => { metadataRefs.current[node.id] = el; }}
                    className="absolute right-4 hidden md:flex flex-col text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none bg-background px-2 py-0.5 rounded shadow-3xs border border-muted/50 z-10"
                  >
                    <span>{node.date}</span>
                    <span className="font-normal text-muted-foreground/50 lowercase text-[9px]">{node.time}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * Clean, Simple Node Element
 */
function TimelineNodeDot({ node, onBranchClick }: { node: TimelineNode, onBranchClick: (node: TimelineNode) => void }) {
  // Unified simple styling: No green dots. Just clean colored rings based on lane.
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