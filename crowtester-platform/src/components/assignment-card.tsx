"use client";

import { StatusBadge } from "./status-badge";
import { TestAssignment } from "@/types";
import { CalendarClock, ClipboardList } from "lucide-react";
import { format } from "date-fns";

export function AssignmentCard({ assignment }: { assignment: TestAssignment }) {
  const cycle = assignment.testCycle;
  const project = cycle?.project;

  return (
    <div className="group rounded-2xl border border-white/5 bg-slate-900/50 p-5 transition hover:border-sky-400/40 hover:bg-slate-900/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {cycle?.name ?? "Unassigned Cycle"}
          </p>
          {project ? (
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              {project.name}
            </p>
          ) : null}
        </div>
        <StatusBadge status={assignment.status} />
      </div>
      <dl className="mt-5 space-y-3 text-sm text-slate-300">
        <div className="flex items-center gap-2 text-slate-400">
          <CalendarClock className="h-4 w-4 text-sky-300" />
          <span>
            {cycle?.startDate
              ? format(new Date(cycle.startDate), "MMM d, yyyy")
              : "TBD"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{cycle?.status ?? "Planning"}</span>
        </div>
        {assignment.notes ? (
          <div className="flex gap-2 text-slate-300">
            <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
            <p className="text-sm leading-relaxed text-slate-200">
              {assignment.notes}
            </p>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
