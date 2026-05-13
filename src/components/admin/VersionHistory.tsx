import { useEffect, useMemo, useState } from "react";
import { Eye, History, X, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { getVersions, setLatestVersion, type VersionRow } from "@/lib/api";
import SkeletonLoader from "./SkeletonLoader";
import { formatPKT } from "@/lib/format";

export default function VersionHistory() {
  const [rows, setRows] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<VersionRow | null>(null);
  const [deptFilter, setDeptFilter] = useState("");
  const [semSearch, setSemSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getVersions().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const departments = useMemo(() => Array.from(new Set(rows.map((r) => r.department.name))), [rows]);
  const filtered = useMemo(() => rows.filter((r) =>
    (!deptFilter || r.department.name === deptFilter) &&
    (!semSearch || r.semester_label.toLowerCase().includes(semSearch.toLowerCase()))
  ), [rows, deptFilter, semSearch]);

  const promote = async (id: string) => {
    setBusy(id);
    try { await setLatestVersion(id); load(); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Version History</h1>
          <p className="mt-1 text-sm text-muted-foreground">All timetable versions parsed for your university.</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-3">
        <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Search semester (e.g. Fall 2025)" value={semSearch} onChange={(e) => setSemSearch(e.target.value)} />
      </div>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        {loading ? (
          <div className="p-4"><SkeletonLoader rows={6} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <Th>University</Th><Th>Department</Th><Th>Semester</Th><Th>Version</Th>
                  <Th>Uploader</Th><Th>Uploaded</Th><Th className="text-right">Slots</Th><Th>Sections</Th><Th>Status</Th><Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-t border-border/60 transition hover:bg-accent/30 animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <Td>{r.university.name}</Td>
                    <Td><span className="font-medium">{r.department.name}</span> <span className="text-xs text-muted-foreground">({r.department.code})</span></Td>
                    <Td>{r.semester_label}</Td>
                    <Td><span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.version_label}</span></Td>
                    <Td className="text-muted-foreground">{r.uploader_name}</Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{formatPKT(r.uploaded_at)}</Td>
                    <Td className="text-right tabular-nums font-medium">{r.slots_count}</Td>
                    <Td className="tabular-nums text-muted-foreground">{r.sections_found.length}</Td>
                    <Td>
                      {r.is_latest ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Latest
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Archived</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-right">
                      {!r.is_latest && (
                        <button onClick={() => promote(r.id)} disabled={busy === r.id} className="mr-2 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50">
                          {busy === r.id ? "Setting…" : "Set as Latest"}
                        </button>
                      )}
                      <button onClick={() => setOpen(r)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="View details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in-up" onClick={() => setOpen(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-96 max-w-full overflow-y-auto border-l bg-card p-5 shadow-2xl animate-fade-in-up">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Version details</h3>
                <p className="text-xs text-muted-foreground">{open.university.name}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-md p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <dl className="space-y-3 text-sm">
              <Row label="Department">{open.department.name} ({open.department.code})</Row>
              <Row label="Semester">{open.semester_label}</Row>
              <Row label="Version">{open.version_label}</Row>
              <Row label="Uploader">{open.uploader_name}</Row>
              <Row label="Uploaded at">{formatPKT(open.uploaded_at)} PKT</Row>
              <Row label="Slots count">{open.slots_count}</Row>
              <Row label="Status">
                {open.is_latest ? <span className="text-emerald-400 font-medium">Latest</span> : <span className="text-muted-foreground">Archived</span>}
              </Row>
            </dl>
            {open.needs_review_count > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                <AlertTriangle className="h-4 w-4" /> {open.needs_review_count} slots flagged for review
              </div>
            )}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sections found</p>
              <div className="flex flex-wrap gap-1.5">
                {open.sections_found.map((s) => (
                  <span key={s} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-gradient-brand-soft p-4 text-primary"><FileText className="h-8 w-8" /></div>
      <p className="text-base font-medium">No timetables uploaded yet</p>
      <p className="text-sm text-muted-foreground">Head to Upload Timetable to ingest your first PDF.</p>
      <History className="hidden" />
    </div>
  );
}
