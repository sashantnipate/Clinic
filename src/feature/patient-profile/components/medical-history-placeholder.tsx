"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Maximize2, Minimize2, GitBranchPlus, Loader2, Plus, User, FileText, CalendarRange, FileDown, Edit } from "lucide-react";
import { getPatientClinicalTimeline } from "@/lib/actions/medical-history.actions";
import { LogEncounterModal } from "./log-encounter-modal";
import { PrescriptionExportDialog } from "@/feature/prescription-pdf/components/prescription-export-dialog";
import { toast } from "sonner";

interface TimelineNode {
  _id?: string;
  id: string;
  nodeId: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  complaint: string;
  notes: string;
  type: "one-time" | "followup" | "merge";
  lane: "center-trunk" | "left-branch" | "right-branch";
  branchName?: string;
  followupDate?: string;
  parents: string[];
}

interface ConnectionLine {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isTrunk?: boolean;
  isMerge?: boolean;
  isStart?: boolean;
}

export function MedicalHistoryPlaceholder() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedExportEncounterId, setSelectedExportEncounterId] = useState<string>("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [initialSpecialty, setInitialSpecialty] = useState("General");
  const [initialType, setInitialType] = useState<TimelineNode["type"]>("one-time");
  const [editableEncounter, setEditableEncounter] = useState<TimelineNode | null>(null);

  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const [horizontalLines, setHorizontalLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const metadataRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadTimelineRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("clinic_jwt") || "";
      const res = await getPatientClinicalTimeline(token, patientId);
      if (res.success && res.data) {
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
    setInitialSpecialty(node.specialty);
    setInitialType("followup");
    setEditableEncounter(null);
    setModalOpen(true);
  };

  const handleEditEncounter = (node: TimelineNode) => {
    setEditableEncounter(node);
    setSelectedParentId("");
    setModalOpen(true);
  };

  const handleExportPrescription = (node: TimelineNode) => {
    const encounterId = node._id || node.id;
    if (!encounterId) {
      toast.error("Encounter ID missing. Could not prepare PDF export.");
      return;
    }

    setSelectedExportEncounterId(encounterId);
    setExportDialogOpen(true);
  };

  const calculatePaths = useCallback(() => {
    if (!contentRef.current || timeline.length === 0) return;
    const contentRect = contentRef.current.getBoundingClientRect();

    const newConnections: ConnectionLine[] = [];
    const newHorizontalLines: typeof horizontalLines = [];
    const coordsMap: Record<string, { x: number; y: number; lane: string }> = {};
    const metadataMap: Record<string, { x: number; y: number }> = {};

    let minY = Infinity;
    let maxY = -Infinity;

    timeline.forEach((node) => {
      const el = nodeRefs.current[node.nodeId];
      if (el) {
        const rect = el.getBoundingClientRect();
        const y = rect.top - contentRect.top + rect.height / 2;
        coordsMap[node.nodeId] = {
          x: rect.left - contentRect.left + rect.width / 2,
          y: y,
          lane: node.lane
        };
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
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

    const centerTrunkX = contentRect.width / 2;

    if (minY !== Infinity && maxY !== -Infinity) {
      newConnections.push({
        from: { x: centerTrunkX, y: minY - 30 },
        to: { x: centerTrunkX, y: maxY + 30 },
        isTrunk: true
      });
    }

    timeline.forEach((node) => {
      const childCoord = coordsMap[node.nodeId];
      if (!childCoord) return;

      if (node.lane !== "center-trunk") {
        const parentId = node.parents?.[0];
        let connectedToBranchParent = false;

        if (parentId) {
          const parentCoord = coordsMap[parentId];
          if (parentCoord && parentCoord.lane !== "center-trunk") {
            newConnections.push({
              from: parentCoord,
              to: childCoord
            });
            connectedToBranchParent = true;
          }
        }

        if (!connectedToBranchParent) {
          newConnections.push({
            from: { x: centerTrunkX, y: childCoord.y },
            to: childCoord,
            isStart: true
          });
        }

        if (node.type === "merge") {
          newConnections.push({
            from: childCoord,
            to: { x: centerTrunkX, y: childCoord.y },
            isMerge: true
          });
        }
      }

      if (metadataMap[node.nodeId]) {
        newHorizontalLines.push({
          x1: childCoord.x + 10,
          y1: childCoord.y,
          x2: metadataMap[node.nodeId].x - 10,
          y2: metadataMap[node.nodeId].y
        });
      }
    });

    setConnections(newConnections);
    setHorizontalLines(newHorizontalLines);
  }, [timeline]);

  useEffect(() => {
    calculatePaths();
    const timer = setTimeout(calculatePaths, 250);
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
          <p className="text-xs text-muted-foreground mt-0.5">Click side-branch nodes to trigger secondary timeline offshoots.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 text-xs gap-1.5">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>

          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
            setSelectedParentId("");
            setInitialSpecialty("General");
            setInitialType("one-time");
            setModalOpen(true);
          }}>
            <Plus className="h-3.5 w-3.5" /> Log Encounter
          </Button>
        </div>
      </div>

      <div className="w-full overflow-y-auto pr-2 flex-1 min-h-0 border rounded-xl bg-card/30 relative z-10" onScroll={calculatePaths}>
        <div ref={contentRef} className="relative w-full max-w-3xl mx-auto py-8 min-h-full">

          {timeline.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {connections.map((line, idx) => {
                let strokeColor = "#cbd5e1";
                let strokeWidth = "2";

                if (line.isTrunk) {
                  strokeColor = "#22c55e";
                  strokeWidth = "3";
                } else if (line.isStart || line.isMerge) {
                  strokeColor = "#3b82f6";
                }

                return (
                  <path
                    key={`track-link-${idx}`}
                    d={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={line.isMerge || line.isStart ? "6 4" : undefined}
                    className="opacity-70 transition-all duration-300 ease-in-out"
                  />
                );
              })}

              {horizontalLines.map((line, idx) => (
                <line
                  key={`horiz-hint-${idx}`}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="#cbd5e1"
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
                    {isLeft && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} onExportClick={handleExportPrescription} onEditClick={handleEditEncounter} /></div>}
                  </div>

                  <div className="col-span-4 flex justify-center">
                    {!isLeft && !isRight && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} onExportClick={handleExportPrescription} onEditClick={handleEditEncounter} /></div>}
                  </div>

                  <div className="col-span-4 flex justify-center">
                    {isRight && <div ref={(el) => { nodeRefs.current[node.nodeId] = el; }}><TimelineNodeDot node={node} onBranchClick={handleBranchFromNode} onExportClick={handleExportPrescription} onEditClick={handleEditEncounter} /></div>}
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

      <LogEncounterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        patientId={patientId}
        selectedParentId={selectedParentId}
        initialSpecialty={initialSpecialty}
        initialType={initialType}
        latestTimelineNodes={timeline}
        editableEncounter={editableEncounter}
        onSuccess={loadTimelineRecords}
        containerRef={panelRef.current}
      />

      <PrescriptionExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        patientId={patientId}
        encounterId={selectedExportEncounterId}
      />
    </div>
  );
}

function TimelineNodeDot({
  node,
  onBranchClick,
  onExportClick,
  onEditClick,
}: {
  node: TimelineNode;
  onBranchClick: (node: TimelineNode) => void;
  onExportClick: (node: TimelineNode) => void;
  onEditClick: (node: TimelineNode) => void;
}) {
  const ringColor = node.lane === "center-trunk" ? "ring-green-500/30 border-green-500 text-green-500" :
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

          {node.branchName && (
            <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-400/5 px-2 py-0.5 rounded border border-blue-200/40 inline-block truncate max-w-full mt-1">
              Track: {node.branchName}
            </div>
          )}

          <h4 className="text-sm font-bold tracking-tight text-foreground pt-1">{node.complaint || "Routine Evaluation Check"}</h4>

          {node.followupDate && (
            <div className="text-[10px] flex items-center gap-1 font-semibold text-emerald-600 pt-0.5">
              <CalendarRange className="h-3 w-3" /> Scheduled Followup: {new Date(node.followupDate).toLocaleDateString("en-GB")}
            </div>
          )}
        </div>

        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">{node.doctor} <span className="text-muted-foreground font-normal">({node.specialty})</span></span>
          </div>

          {node.notes && (
            <div className="flex items-start gap-2 pt-1 border-t border-dashed">
              <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground leading-normal">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">Notes:</span>
                <p className="mt-0.5 whitespace-pre-wrap">{node.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold gap-1.5" onClick={() => onEditClick(node)}>
            <Edit className="h-3.5 w-3.5" /> Edit Encounter Details
          </Button>
          <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold gap-1.5" onClick={() => onExportClick(node)}>
            <FileDown className="h-3.5 w-3.5" /> Export Prescription PDF
          </Button>

          {/* Core conditional strict branch filter parameter constraint layout block */}
          {node.type !== "merge" && node.lane !== "center-trunk" ? (
            <Button size="sm" variant="secondary" className="w-full h-8 text-xs font-semibold gap-1.5" onClick={() => onBranchClick(node)}>
              <GitBranchPlus className="h-3.5 w-3.5" /> Log Follow-up Here
            </Button>
          ) : (
            <div className="text-center text-[10px] font-medium text-muted-foreground bg-muted/40 py-1.5 rounded-lg border border-dashed select-none">
              {node.type === "merge" ? "Treatment Closed (Merged)" : "Trunk consultation event - followup restricted"}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
