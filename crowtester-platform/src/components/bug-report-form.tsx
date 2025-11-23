"use client";

import { createBugReport, fetchTestCycles } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Upload } from "lucide-react";

const bugSchema = z.object({
  title: z.string().min(3),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  testCycleId: z.string().min(1),
  environment: z.string().min(5),
  expectedResult: z.string().min(5),
  actualResult: z.string().min(5),
  stepsToReproduce: z.string().min(10),
  attachment: z.string().url().optional(),
});

type BugFormData = z.infer<typeof bugSchema>;

interface BugReportFormProps {
  onCreated: () => void;
}

export function BugReportForm({ onCreated }: BugReportFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BugFormData>({
    resolver: zodResolver(bugSchema),
    defaultValues: {
      severity: "HIGH",
    },
  });

  const { data: cycles, isLoading } = useQuery({
    queryKey: ["test-cycles", user?.id],
    queryFn: () => fetchTestCycles(user!.id),
    enabled: Boolean(user?.id),
  });

  if (!user) return null;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await createBugReport(user.id, {
        title: values.title,
        severity: values.severity,
        testCycleId: values.testCycleId,
        environment: values.environment,
        expectedResult: values.expectedResult,
        actualResult: values.actualResult,
        stepsToReproduce: values.stepsToReproduce,
        attachments: values.attachment ? [values.attachment] : [],
      });
      reset({
        severity: values.severity,
      });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Log a new issue</h2>
        <p className="text-sm text-slate-400">
          Capture regressions with consistent reproduction detail for engineers.
        </p>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Cycle
        </label>
        <select
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("testCycleId")}
        >
          <option value="">Select a test cycle</option>
          {cycles?.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.project.name} · {cycle.name}
            </option>
          ))}
        </select>
        {isLoading ? (
          <p className="text-xs text-slate-400">Loading cycles…</p>
        ) : null}
        {errors.testCycleId ? (
          <span className="text-xs text-rose-400">
            {errors.testCycleId.message}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Title
        </label>
        <input
          type="text"
          placeholder="Transfer confirmation screen freezes"
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("title")}
        />
        {errors.title ? (
          <span className="text-xs text-rose-400">{errors.title.message}</span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Severity
          </label>
          <select
            className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
            {...register("severity")}
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Attachment link
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/15 bg-slate-950/30 px-4 py-2.5 text-sm text-slate-300">
            <Upload className="h-4 w-4 text-slate-500" />
            <input
              type="url"
              placeholder="https://loom.com/share/bug-session"
              className="w-full bg-transparent text-sm text-slate-200 outline-none"
              {...register("attachment")}
            />
          </div>
          {errors.attachment ? (
            <span className="text-xs text-rose-400">
              {errors.attachment.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Environment
        </label>
        <input
          type="text"
          placeholder="iPhone 14 Pro · iOS 17.2 · WiFi"
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("environment")}
        />
        {errors.environment ? (
          <span className="text-xs text-rose-400">
            {errors.environment.message}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Expected result
        </label>
        <textarea
          rows={2}
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("expectedResult")}
        />
        {errors.expectedResult ? (
          <span className="text-xs text-rose-400">
            {errors.expectedResult.message}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Actual result
        </label>
        <textarea
          rows={2}
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("actualResult")}
        />
        {errors.actualResult ? (
          <span className="text-xs text-rose-400">
            {errors.actualResult.message}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Steps to reproduce
        </label>
        <textarea
          rows={4}
          className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
          {...register("stepsToReproduce")}
        />
        {errors.stepsToReproduce ? (
          <span className="text-xs text-rose-400">
            {errors.stepsToReproduce.message}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging issue…
          </>
        ) : (
          "Submit issue"
        )}
      </button>
    </form>
  );
}
