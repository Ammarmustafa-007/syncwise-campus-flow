import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "info" | "pink";
  loading?: boolean;
  delay?: number;
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/30 to-primary-glow/20 text-primary",
  success: "from-emerald-500/30 to-emerald-400/10 text-emerald-400",
  warning: "from-amber-500/30 to-amber-400/10 text-amber-400",
  info: "from-sky-500/30 to-sky-400/10 text-sky-400",
  pink: "from-fuchsia-500/30 to-pink-400/10 text-fuchsia-400",
};

export default function StatCard({ label, value, icon: Icon, accent = "primary", loading, delay = 0 }: Props) {
  return (
    <div
      className="group relative rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-brand animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          {loading ? (
            <div className="skeleton h-9 w-24 rounded-md" />
          ) : (
            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
