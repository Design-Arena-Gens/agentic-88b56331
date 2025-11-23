"use client";

import { loginRequest } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await loginRequest(values.email, values.password);
      login(user);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
      setFieldError("password", { message: " " });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-8 shadow-xl shadow-black/50 backdrop-blur"
    >
      <div>
        <h2 className="text-xl font-semibold text-white">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Use one of the sample accounts to explore the platform.
        </p>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="ava.dawson@testers.io"
          className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          {...register("email")}
        />
        {errors.email ? (
          <span className="text-xs text-rose-400">{errors.email.message}</span>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="password123"
          className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-xs text-rose-400">
            {errors.password.message}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Tester: <span className="font-medium text-slate-100">ava.dawson@testers.io</span> · Client:{" "}
          <span className="font-medium text-slate-100">product@finpulse.io</span> · Manager:{" "}
          <span className="font-medium text-slate-100">manager@crowdtest.io</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          "Continue"
        )}
      </button>
    </form>
  );
}
