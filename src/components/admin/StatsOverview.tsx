import { useEffect, useState } from "react";
import { Users, GraduationCap, BookUser, BadgeCheck, Sparkles, Layers } from "lucide-react";
import StatCard from "./StatCard";
import { getStats, type AdminStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function StatsOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((s) => !cancelled && setStats(s))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.full_name}</span> — overview for{" "}
            <span className="text-gradient-brand font-semibold">{user?.university_name}</span>.
          </p>
        </div>
        <div className="hidden md:block rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">live</span> aggregates
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={stats?.total_users ?? 0} icon={Users} accent="primary" loading={loading} delay={0} />
        <StatCard label="Total Students" value={stats?.total_students ?? 0} icon={GraduationCap} accent="info" loading={loading} delay={60} />
        <StatCard label="Total Teachers" value={stats?.total_teachers ?? 0} icon={BookUser} accent="success" loading={loading} delay={120} />
        <StatCard label="Free Plan Students" value={stats?.free_plan_students ?? 0} icon={BadgeCheck} accent="warning" loading={loading} delay={180} />
        <StatCard label="Pro Plan Students" value={stats?.pro_plan_students ?? 0} icon={Sparkles} accent="pink" loading={loading} delay={240} />
        <StatCard label="Timetable Versions" value={stats?.total_versions ?? 0} icon={Layers} accent="primary" loading={loading} delay={300} />
      </div>

      <div className="rounded-2xl border bg-gradient-brand-soft p-6 animate-fade-in-up" style={{ animationDelay: "360ms" }}>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI parser is online</h3>
            <p className="text-sm text-muted-foreground">
              Mistral 7B is ready to ingest your next timetable PDF. Average parse time is ~60s.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
