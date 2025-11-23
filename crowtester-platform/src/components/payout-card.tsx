"use client";

import { Payout } from "@/types";
import { StatusBadge } from "./status-badge";
import { format } from "date-fns";

export function PayoutCard({ payout }: { payout: Payout }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/50 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">
          {payout.currency} {payout.amount.toFixed(2)}
        </p>
        <p className="text-xs text-slate-400">
          {payout.paidAt
            ? `Paid ${format(new Date(payout.paidAt), "MMM d, yyyy")}`
            : `Created ${format(new Date(payout.createdAt), "MMM d, yyyy")}`}
        </p>
      </div>
      <StatusBadge status={payout.status} />
    </div>
  );
}
