import { useEffect, useState } from "react";
import { Eye, Search, ChevronLeft, ChevronRight, Users as UsersIcon, CheckCircle } from "lucide-react";
import { getUsers, updateUser, type AdminUser } from "@/lib/api";
import SkeletonLoader from "./SkeletonLoader";
import UserDetailModal, { PlanBadge, RoleBadge } from "./UserDetailModal";
import { formatPKT } from "@/lib/format";

const LIMIT = 20;

export default function UsersTable() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const t = setTimeout(() => {
      getUsers({ page, limit: LIMIT, search, role, plan })
        .then((r) => { if (cancel) return; setRows(r.users); setTotal(r.total); })
        .catch((e) => !cancel && setError(e.message))
        .finally(() => !cancel && setLoading(false));
    }, search ? 250 : 0);
    return () => { cancel = true; clearTimeout(t); };
  }, [page, search, role, plan]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage roles, plans, and view enrolled schedules.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        {loading ? (
          <div className="p-4"><SkeletonLoader rows={8} cols={6} /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-2xl bg-gradient-brand-soft p-4 text-primary"><UsersIcon className="h-8 w-8" /></div>
            <p className="font-medium">No users found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Full name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Pro Request</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u, i) => (
                  <tr key={u.id} className="border-t border-border/60 transition hover:bg-accent/30 animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                    <td className="px-4 py-3">
                      {u.pro_request_status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatPKT(u.created_at, { hour: undefined, minute: undefined })}</td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      {u.pro_request_status === 'pending' && (
                        <button 
                          onClick={() => {
                            updateUser(u.id, { plan: 'pro', pro_request_status: 'approved' })
                              .then((updated) => setRows(rs => rs.map(r => r.id === updated.id ? updated : r)))
                              .catch(() => alert("Failed to approve user"));
                          }} 
                          className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
                          title="Approve Pro Request"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => setOpen(u)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="View user">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of {totalPages} · {total} users
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border px-2 py-1 disabled:opacity-40 hover:bg-accent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-md border px-2 py-1 disabled:opacity-40 hover:bg-accent">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {open && <UserDetailModal user={open} onClose={() => setOpen(null)} onUpdated={(u) => setRows((rs) => rs.map((r) => (r.id === u.id ? u : r)))} />}
    </div>
  );
}
