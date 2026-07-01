import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Edit3, Loader2, Save, X } from "lucide-react";
import { reviewFlaggedSlot, type FlaggedSlot, type ReviewSlotPayload } from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOT_TYPES = ["lecture", "lab", "extended", "free"];

type Props = {
  slots: FlaggedSlot[];
  count?: number;
  onReviewed: (slot: FlaggedSlot) => void;
};

export default function FlaggedSlotReviewList({ slots, count = slots.length, onReviewed }: Props) {
  const [editing, setEditing] = useState<FlaggedSlot | null>(null);
  const [busySlotId, setBusySlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markCorrect = async (slot: FlaggedSlot) => {
    if (!slot.id) {
      setError("This slot is missing its database ID. Reopen it from Version History and try again.");
      return;
    }

    setBusySlotId(slot.id);
    setError(null);
    try {
      const updated = await reviewFlaggedSlot(slot.id, { mark_reviewed: true });
      onReviewed(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusySlotId(null);
    }
  };

  if (count <= 0) {
    return (
      <div className="rounded-lg border border-emerald-700 bg-emerald-600 p-4 text-sm text-white shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          All flagged slots reviewed. This timetable is ready for students.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-slate-900 shadow-sm dark:border-amber-700 dark:bg-amber-900/80 dark:text-amber-50">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        {count} slots flagged for review
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-700 bg-red-600 px-3 py-2 text-xs font-semibold text-white">
          {error}
        </div>
      )}

      <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
        {slots.length === 0 ? (
          <span className="text-xs font-semibold text-slate-600 italic dark:text-amber-100/80">Loading slots...</span>
        ) : (
          slots.map((slot) => (
            <div key={slot.id} className="rounded-lg border border-slate-500 bg-slate-700 p-3 text-xs text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold text-amber-200">{slot.subject || "Unknown Subject"}</span>
                  <div className="mt-1 font-semibold text-slate-100">
                    Section: {slot.section || "?"} | Teacher: {slot.teacher || "?"} | Room: {slot.room || "?"}
                  </div>
                </div>
                <span className="shrink-0 font-bold text-amber-300">
                  {slot.day} {slot.start_time}-{slot.end_time}
                </span>
              </div>

              <div className="mt-2 rounded bg-slate-900 p-2 font-mono text-[10px] font-semibold text-slate-200 overflow-x-auto whitespace-pre">
                {slot.raw_cell_text || "No raw parser text captured."}
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => markCorrect(slot)}
                  disabled={busySlotId === slot.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busySlotId === slot.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Mark Correct
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(slot)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500 bg-amber-300 px-3 py-1.5 text-[11px] font-bold text-slate-950 transition hover:bg-amber-200"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit & Clear
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <SlotEditModal
          slot={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEditing(null);
            onReviewed(updated);
          }}
        />
      )}
    </div>
  );
}

function SlotEditModal({
  slot,
  onClose,
  onSaved,
}: {
  slot: FlaggedSlot;
  onClose: () => void;
  onSaved: (slot: FlaggedSlot) => void;
}) {
  const [form, setForm] = useState({
    subject: slot.subject || "",
    section: slot.section || "",
    teacher: slot.teacher || "",
    room: slot.room || "",
    day: slot.day || "Monday",
    start_time: toTimeInput(slot.start_time),
    end_time: toTimeInput(slot.end_time),
    slot_type: slot.slot_type || "lecture",
    col_span: String(slot.col_span || 1),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: ReviewSlotPayload = {
        subject: form.subject.trim(),
        section: form.section.trim(),
        teacher: form.teacher.trim() || null,
        room: form.room.trim() || null,
        day: form.day,
        start_time: toDbTime(form.start_time),
        end_time: toDbTime(form.end_time),
        slot_type: form.slot_type,
        col_span: Math.max(1, Number(form.col_span) || 1),
        mark_reviewed: true,
      };
      const updated = await reviewFlaggedSlot(slot.id, payload);
      onSaved(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <>
      <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[160] flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit flagged slot</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Correct parser output, then clear the review flag.</p>
            </div>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Subject">
              <input className={inputClass} value={form.subject} onChange={(e) => update("subject", e.target.value)} />
            </Field>
            <Field label="Section">
              <input className={inputClass} value={form.section} onChange={(e) => update("section", e.target.value)} />
            </Field>
            <Field label="Teacher">
              <input className={inputClass} value={form.teacher} onChange={(e) => update("teacher", e.target.value)} placeholder="Leave blank if unknown" />
            </Field>
            <Field label="Room">
              <input className={inputClass} value={form.room} onChange={(e) => update("room", e.target.value)} placeholder="Leave blank if unknown" />
            </Field>
            <Field label="Day">
              <select className={inputClass} value={form.day} onChange={(e) => update("day", e.target.value)}>
                {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </Field>
            <Field label="Slot type">
              <select className={inputClass} value={form.slot_type} onChange={(e) => update("slot_type", e.target.value)}>
                {SLOT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Start time">
              <input type="time" className={inputClass} value={form.start_time} onChange={(e) => update("start_time", e.target.value)} />
            </Field>
            <Field label="End time">
              <input type="time" className={inputClass} value={form.end_time} onChange={(e) => update("end_time", e.target.value)} />
            </Field>
            <Field label="Column span">
              <input type="number" min={1} className={inputClass} value={form.col_span} onChange={(e) => update("col_span", e.target.value)} />
            </Field>
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Raw parser text</p>
            <pre className="mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap rounded bg-black/30 p-3 text-xs text-amber-100/70">
              {slot.raw_cell_text || "No raw parser text captured."}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-card px-5 py-4">
          <button onClick={onClose} disabled={saving} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Clear Flag
          </button>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function toTimeInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function toDbTime(value: string) {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
}
