"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-white/5 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-sky-400" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                CrowdTestOS
              </p>
              <p className="text-xs text-slate-500">
                {user.role.toLowerCase()} workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
            <button
              className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 transition hover:border-rose-500/40 hover:text-rose-200 sm:inline-flex"
              onClick={logout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 sm:hidden"
              onClick={() => setNavOpen((prev) => !prev)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {navOpen ? (
          <div className="px-6 pb-4 text-sm text-slate-400 sm:hidden">
            <p>{user.email}</p>
            <button
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-wide text-slate-300"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        ) : null}
      </div>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
