"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import type { WorkAssignment } from "@/lib/types/crew";

function WorkAssignmentsIcon({ className }: { className?: string }) {
  return (
    <img src="/empty-icon-work.svg" alt="Work Assignments" className={className} />
  );
}

const initialAssignments: WorkAssignment[] = [];

const statusStyles: Record<WorkAssignment["status"], string> = {
  pending: "bg-brand-orange/10 text-brand-orange",
  "in-progress": "bg-brand-teal/10 text-brand-teal",
  submitted: "bg-brand-blue/10 text-brand-blue",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels: Record<WorkAssignment["status"], string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export default function WorkAssignments() {
  const [assignments, setAssignments] = useState<WorkAssignment[]>(
    initialAssignments
  );
  const [iconHovered, setIconHovered] = useState(false);

  const updateStatus = (id: string, newStatus: WorkAssignment["status"]) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const renderAction = (a: WorkAssignment) => {
    switch (a.status) {
      case "pending":
        return (
          <button
            onClick={() => updateStatus(a.id, "in-progress")}
            className="rounded-lg border border-brand-teal px-4 py-1.5 text-xs font-semibold text-brand-teal transition hover:bg-brand-teal/5 cursor-pointer"
          >
            Mark In Progress
          </button>
        );
      case "in-progress":
        return (
          <button
            onClick={() => updateStatus(a.id, "submitted")}
            className="rounded-lg bg-brand-orange px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 cursor-pointer"
          >
            Submit Work
          </button>
        );
      case "submitted":
        return (
          <button
            disabled
            className="rounded-lg bg-black/5 px-4 py-1.5 text-xs font-semibold text-foreground/40"
          >
            Awaiting Review
          </button>
        );
      case "approved":
        return (
          <button
            disabled
            className="rounded-lg bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700"
          >
            ✓ Approved
          </button>
        );
      case "rejected":
        return (
          <button
            onClick={() => updateStatus(a.id, "pending")}
            className="rounded-lg bg-brand-orange px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 cursor-pointer"
          >
            Resubmit
          </button>
        );
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-display text-foreground">
          My Work Assignments
        </h2>
        <div className="relative" onMouseEnter={() => setIconHovered(true)} onMouseLeave={() => setIconHovered(false)}>
          <WorkAssignmentsIcon className={`w-21 h-21 transition-transform duration-200 ${iconHovered ? "scale-110" : ""}`} />
          {iconHovered && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-extrabold rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none tracking-wider uppercase z-30">
              Work Assignments
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 max-h-[380px] space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="rounded-xl bg-white/30 backdrop-blur-sm p-3 border border-white/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="mt-0.5 text-xs text-foreground/50">
                  Assigned by: {a.assignedBy}
                </p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-foreground/50">
                  <Clock className="h-3 w-3" />
                  <span>Due: {a.deadline}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusStyles[a.status]}`}
              >
                {statusLabels[a.status]}
              </span>
            </div>

            {a.status === "rejected" && a.rejectionReason && (
              <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600">
                {a.rejectionReason}
              </div>
            )}

            <div className="mt-2 flex justify-end">{renderAction(a)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
