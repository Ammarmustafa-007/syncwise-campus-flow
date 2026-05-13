import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";
import logo from "@/assets/syncwise-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyncWise — Turn PDFs into Structured Timetables" },
      { name: "description", content: "AI-powered multi-university timetable platform. Parse PDFs into clean, clash-free schedules instantly." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -right-20 top-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="SyncWise" className="h-9 w-9 rounded-lg shadow-brand" />
          <span className="text-lg font-bold">SyncWise</span>
        </div>
        <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-95">
          Admin Login <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary animate-fade-in-up">
          <Sparkles className="h-3 w-3" /> Powered by Mistral 7B
        </div>
        <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          Turn PDFs into <span className="text-gradient-brand">Structured</span> Timetables
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          SyncWise intelligently parses university timetable PDFs and converts them into clean, structured schedules. Generate clash-free, personalized timetables instantly.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-95">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-accent">
            <FileText className="h-4 w-4" /> Sign in
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
          {[
            { v: "99.9%", l: "Accuracy" },
            { v: "10x", l: "Faster" },
            { v: "500K+", l: "PDFs Parsed" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card/60 p-5 shadow-card backdrop-blur">
              <p className="text-3xl font-bold text-gradient-brand">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" /> Multi-university · Multi-department · RLS-enforced
        </div>
      </section>
    </div>
  );
}
