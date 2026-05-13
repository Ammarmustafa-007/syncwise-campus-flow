import { useEffect, useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { getUserSchedule, getUserSections, updateUser, type AdminUser, type UserSchedule, type UserSections } from "@/lib/api";
import { formatPKT } from "@/lib/format";

interface Props {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (u: AdminUser) => void;
}

export default function UserDetailModal({ user, onClose, onUpdated }: Props) {
  const [role, setRole] = useState<AdminUser["role"]>(user.role);
  const [plan, setPlan] = useState<AdminUser["plan"]>(user.plan);
  const [schedule, setSchedule] = useState<UserSchedule | null>(null);
  const [sections, setSections] = useState<UserSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const fetcher = user.role === "student" ? getUserSchedule(user.id) : user.role === "teacher" ? getUserSections(user.id) : Promise.resolve(null);
    fetcher
      .then((data) => {
        if (!active) return;
        if (user.role === "student") setSchedule(data as UserSchedule);
        if (user.role === "teacher") setSections(data as UserSections);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id, user.role]);

  const save = async () => {
    setSaving(true);
    try {
      const u = await updateUser(user.id, { role, plan });
      onUpdated(u);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in-up" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Info label="Role"><RoleBadge role={user.role} /></Info>
            <Info label="Plan"><PlanBadge plan={user.plan} /></Info>
            <Info label="Joined">{formatPKT(user.created_at)} PKT</Info>
            <Info label="User ID"><code className="text-xs">{user.id}</code></Info>
          </div>

          {/* Role-specific data */}
          <div className="border-t bg-muted/30 px-5 py-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : user.role === "student" && schedule ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Locked schedule ({schedule.total_slots} slots)</p>
                <div className="space-y-1.5">
                  {schedule.enrolled_slots.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border bg-background px-3 py-1.5 text-sm">
                      <span className="font-medium">{s.subject}</span>
                      <span className="text-xs text-muted-foreground">{s.section} · {s.day} {s.start_time}–{s.end_time} · {s.room_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : user.role === "teacher" && sections ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Teaches sections</p>
                <div className="flex flex-wrap gap-1.5">
                  {sections.sections.map((s) => (
                    <span key={s.section_id} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.section_name}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No additional data for admin users.</p>
            )}
          </div>

          {/* Edit */}
          <div className="grid gap-4 border-t p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Change role</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as AdminUser["role"])}>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Change plan</label>
              <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
                {(["free", "pro"] as const).map((p) => (
                  <button key={p} onClick={() => setPlan(p)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${plan === p ? "bg-gradient-brand text-primary-foreground shadow-brand" : "text-muted-foreground hover:text-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Cancel</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-95 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}
export function RoleBadge({ role }: { role: AdminUser["role"] }) {
  const map = {
    admin: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    student: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    teacher: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  } as const;
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${map[role]}`}>{role}</span>;
}
export function PlanBadge({ plan }: { plan: AdminUser["plan"] }) {
  return plan === "pro" ? (
    <span className="inline-block rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-400/20 to-yellow-300/10 px-2 py-0.5 text-xs font-semibold text-amber-300">Pro</span>
  ) : (
    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Free</span>
  );
}
