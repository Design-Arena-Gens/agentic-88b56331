"use client";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
