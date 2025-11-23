"use client";

import { BugReport } from "@/types";
import { StatusBadge } from "./status-badge";
import { AlertTriangle, Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function BugReportCard({ bug }: { bug: BugReport }) {
  const cycle = bug.testCycle;
  const project = cycle?.project;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/50 p-5 transition hover:border-rose-400/40 hover:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{bug.title}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {project?.name ?? "General"} · {cycle?.name}
          </p>
        </div>
        <StatusBadge status={bug.status} />
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-rose-300">
        <AlertTriangle className="h-3.5 w-3.5" />
        {bug.severity}
      </div>
      <p className="line-clamp-2 text-sm text-slate-200">
        {bug.actualResult}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          reported{" "}
          {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
        </span>
        {bug.attachments && bug.attachments.length > 0 ? (
          <a
            href={bug.attachments[0]}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
          >
            <Link2 className="h-3.5 w-3.5" />
            Attachment
          </a>
        ) : null}
      </div>
    </article>
  );
}
