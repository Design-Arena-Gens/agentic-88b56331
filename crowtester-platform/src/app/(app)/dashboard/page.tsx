"use client";

import { AssignmentCard } from "@/components/assignment-card";
import { BugReportCard } from "@/components/bug-report-card";
import { BugReportForm } from "@/components/bug-report-form";
import { MetricCard } from "@/components/metric-card";
import { PayoutCard } from "@/components/payout-card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/context/auth-context";
import { fetchDashboard } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, PieChart, RefreshCw, UsersRound } from "lucide-react";
import { useMemo } from "react";

const ROLE_HEADLINES: Record<
  string,
  { title: string; subtitle: string }
> = {
  TESTER: {
    title: "Execution cockpit",
    subtitle:
      "Track your assigned missions, log new issues, and monitor payouts in one streamlined workspace.",
  },
  CLIENT: {
    title: "Product quality overview",
    subtitle:
      "Monitor release readiness, triage critical issues, and collaborate with distributed testers.",
  },
  MANAGER: {
    title: "Program orchestration",
    subtitle:
      "Manage global testing throughput, align stakeholders, and keep quality signals flowing.",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(user!.id),
    enabled: Boolean(user?.id),
  });

  const headline = useMemo(() => {
    if (!user) {
      return ROLE_HEADLINES.TESTER;
    }
    return ROLE_HEADLINES[user.role] ?? ROLE_HEADLINES.TESTER;
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
        Loading dashboard…
      </div>
    );
  }

  const statsEntries = Object.entries(data.stats ?? {});

  const focusProjects = data.focusProjects ?? [];
  const recentIssues = data.recentIssues ?? [];
  const assignments = data.activeAssignments ?? [];
  const payouts = data.payouts ?? [];

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest text-slate-300">
            <PieChart className="h-3.5 w-3.5 text-sky-300" />
            {user.role === "TESTER"
              ? "Tester mission control"
              : user.role === "CLIENT"
                ? "Client vantage point"
                : "Manager HQ"}
          </span>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {headline.title}
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            {headline.subtitle}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-sky-100"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh data
        </button>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {statsEntries.map(([label, value]) => (
          <MetricCard
            key={label}
            label={label.replace(/([A-Z])/g, " $1").toUpperCase()}
            value={
              typeof value === "number"
                ? value >= 1000
                  ? `${Math.round(value).toLocaleString()}`
                  : value.toString()
                : String(value)
            }
          />
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Priority initiatives
              </h2>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Release cadence
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {focusProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-white/5 bg-slate-900/50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {project.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {project.status}
                      </p>
                    </div>
                    <StatusBadge status={project.cycleStatus} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                    {project.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{project.openIssues} open issues</span>
                    {project.nextMilestone ? (
                      <span>Milestone · {project.nextMilestone.slice(0, 10)}</span>
                    ) : (
                      <span>No milestone set</span>
                    )}
                  </div>
                </div>
              ))}
              {focusProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
                  Nothing active yet. Once a cycle kicks off it will appear here
                  with real-time status.
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Latest quality signals
              </h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {recentIssues.length} records
              </span>
            </div>
            <div className="grid gap-4">
              {recentIssues.map((bug) => (
                <BugReportCard key={bug.id} bug={bug} />
              ))}
              {recentIssues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
                  No issues filed recently. Your cycle updates will land here to
                  keep stakeholders aligned.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {user.role === "TESTER" ? (
            <>
              <BugReportForm onCreated={() => refetch()} />
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Assigned missions
                </h2>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                    />
                  ))}
                  {assignments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
                      You are currently not assigned to any cycles. Expect an
                      invite soon!
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Payout timeline
                </h2>
                <div className="space-y-3">
                  {payouts.map((payout) => (
                    <PayoutCard key={payout.id} payout={payout} />
                  ))}
                  {payouts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
                      Payouts will be displayed here once you start reporting
                      issues for active cycles.
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white">
                Team snapshot
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Track tester throughput, responsiveness, and payout velocity to
                keep quality coverage predictable.
              </p>
              <div className="mt-6 space-y-4 text-sm text-slate-200">
                {statsEntries.map(([label, value]) => (
                  <div
                    key={`team-${label}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <span className="uppercase tracking-[0.3em] text-slate-400">
                      {label.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-white">
                      {typeof value === "number"
                        ? value.toLocaleString()
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                <UsersRound className="h-5 w-5" />
                <p>
                  Activate additional tester pools to expand regional coverage
                  without compromising cycle speed.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
