import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(99,102,241,0.2),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-400/40">
            <Image
              src="/logo.svg"
              alt="CrowdTestOS"
              width={26}
              height={26}
              className="h-6 w-6"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              CrowdTestOS
            </p>
            <p className="text-xs text-slate-500">
              Distributed QA delivery for product teams
            </p>
          </div>
        </div>
        <div className="hidden gap-3 text-sm font-medium text-slate-400 md:flex">
          <span>Platform</span>
          <span>Solutions</span>
          <span>Insights</span>
          <span>Pricing</span>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 lg:flex-row lg:items-start lg:gap-24 lg:px-12">
        <div className="max-w-2xl space-y-10 lg:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-200 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live operations & reporter analytics
          </span>
          <h1 className="text-5xl font-semibold leading-tight text-white md:text-6xl">
            Build elite crowdtesting programs with one unified operating system.
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            Coordinate vetted testers, orchestrate release cycles, and surface
            real-time product feedback. CrowdTestOS brings the best of platforms
            like Testlio and uTest into a single experience teams actually love
            using.
          </p>
          <dl className="grid grid-cols-1 gap-6 text-slate-200 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Global testers
              </dt>
              <dd className="mt-3 text-3xl font-semibold text-white">18K+</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Issue SLA
              </dt>
              <dd className="mt-3 text-3xl font-semibold text-white">2.7h</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                NPS
              </dt>
              <dd className="mt-3 text-3xl font-semibold text-white">67</dd>
            </div>
          </dl>
        </div>
        <div className="w-full max-w-lg lg:sticky lg:top-24">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
