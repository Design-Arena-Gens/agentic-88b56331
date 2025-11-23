"use client";

import clsx from "classnames";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  IN_PROGRESS: "bg-sky-500/15 text-sky-200 border border-sky-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  AWAITING_FEEDBACK: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
  OPEN: "bg-rose-500/10 text-rose-200 border border-rose-500/30",
  RESOLVED: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30",
  PENDING: "bg-sky-500/10 text-sky-200 border border-sky-500/30",
  PAID: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30",
  default: "bg-white/5 text-slate-200 border border-white/10",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const style =
    STATUS_STYLES[normalized as keyof typeof STATUS_STYLES] ??
    STATUS_STYLES.default;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        style,
      )}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}
