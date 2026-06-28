import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { getDepartments, getUniversities, uploadTimetable, type Department, type University, type UploadResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatBytes, formatPKT } from "@/lib/format";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function UploadTimetable() {
  const { user } = useAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [deps, setDeps] = useState<Department[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [version, setVersion] = useState("");
  const [uploader, setUploader] = useState(user?.full_name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUniversities().then((u) => {
      setUnis(u);
      if (user?.university_id && u.find((x) => x.id === user.university_id)) {
        setUniversityId(user.university_id);
      }
    });
  }, [user?.university_id]);

  useEffect(() => {
    if (!universityId) { setDeps([]); setDepartmentId(""); return; }
    getDepartments(universityId).then(setDeps);
    setDepartmentId("");
  }, [universityId]);

  const stepReady = !!universityId && !!departmentId;
  const canSubmit = stepReady && semester.trim() && version.trim() && uploader.trim() && file && !submitting;

  const onPickFile = (f: File | null) => {
    setFileError(null);
    if (!f) return setFile(null);
    if (!f.name.toLowerCase().endsWith(".pdf") || f.type !== "application/pdf") {
      setFileError("Only PDF files accepted");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !file) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await uploadTimetable({
        pdf: file,
        semester_label: semester.trim(),
        version_label: version.trim(),
        uploader_name: uploader.trim(),
        university_id: universityId,
        department_id: departmentId,
      });
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSemester(""); setVersion(""); setFile(null); setResult(null); setError(null);
  };

  const inputCls = "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

  const successResult = result?.status === "success" ? result : null;
  const dupResult = result?.status === "already_parsed" ? result : null;

  const selectedUni = useMemo(() => unis.find((u) => u.id === universityId), [unis, universityId]);
  const selectedDep = useMemo(() => deps.find((d) => d.id === departmentId), [deps, departmentId]);

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Upload Timetable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Parse a university timetable PDF into structured slots powered by SyncWise AI.
        </p>
      </header>

      {/* Step 1 */}
      <section className="rounded-2xl border bg-card p-6 shadow-card animate-fade-in-up">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
          <h2 className="font-semibold">Select university and department</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative z-30">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">University *</label>
            <CustomSelect 
              value={universityId} 
              onChange={(val) => setUniversityId(String(val))}
              placeholder="Choose a university…"
              options={unis.map((u) => ({ label: u.name, value: u.id }))}
            />
          </div>
          <div className="relative z-20">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Department *</label>
            <CustomSelect 
              value={departmentId} 
              onChange={(val) => setDepartmentId(String(val))}
              placeholder={universityId ? "Choose a department…" : "Select university first"}
              disabled={!universityId}
              options={deps.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id }))}
            />
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className={`rounded-2xl border bg-card p-6 shadow-card transition ${stepReady ? "" : "opacity-60"}`} title={!stepReady ? "Please select university and department first" : undefined}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/80 text-xs font-bold text-primary-foreground">2</div>
          <h2 className="font-semibold">Timetable details</h2>
        </div>

        <fieldset disabled={!stepReady || submitting} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Semester *</label>
              <input className={inputCls} value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. Fall 2025" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Version label *</label>
              <input className={inputCls} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. v1, Revised, Final" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Uploader name *</label>
              <input className={inputCls} value={uploader} onChange={(e) => setUploader(e.target.value)} placeholder="e.g. Dr. Sarah Ahmed" />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files?.[0]; if (f) onPickFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-accent/30"
            }`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <div className="flex w-full max-w-md items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-left">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand-soft text-primary transition group-hover:scale-105">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drag PDF here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">Only .pdf files — max ~20 MB</p>
                </div>
              </>
            )}
          </div>
          {fileError && <p className="text-sm text-destructive">{fileError}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            {result && (
              <button type="button" onClick={reset} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Upload another
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition-all hover:opacity-95 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Parsing timetable… ~60s</>) : (<><Upload className="h-4 w-4" /> Upload & Parse</>)}
            </button>
          </div>
        </fieldset>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {/* Step 3 — result */}
      {dupResult && (
        <section className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-5 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <p className="font-semibold">This PDF was already uploaded.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing existing version {dupResult.version_label} — {dupResult.semester_label}.
              </p>
            </div>
          </div>
        </section>
      )}

      {successResult && (
        <section className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/5 animate-fade-in-up">
          <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="font-semibold">Timetable parsed successfully</p>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="University">{successResult.university_name}</Field>
            <Field label="Department">{successResult.department_name}</Field>
            <Field label="Semester">{successResult.semester_label}</Field>
            <Field label="Version">{successResult.version_label}</Field>
            <Field label="Uploader">{successResult.uploader_name}</Field>
            <Field label="Uploaded at">{formatPKT(successResult.uploaded_at)} PKT</Field>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slots found</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400 tabular-nums">{successResult.slots_count}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sections found</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {successResult.sections_found.map((s) => (
                  <span key={s.name} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {successResult.needs_review_count > 0 && (
            <div className="m-5 mt-0 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
              <div className="flex items-center gap-2 mb-3 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {successResult.needs_review_count} slots flagged for review
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {successResult.needs_review_slots?.map((slot: any, i: number) => (
                  <div key={i} className="bg-black/20 p-3 rounded border border-amber-500/20 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-semibold text-amber-200">{slot.subject || "Unknown Subject"}</span>
                      <span className="shrink-0 text-amber-400/80">{slot.day} {slot.start_time}-{slot.end_time}</span>
                    </div>
                    <div className="text-amber-200/70">
                      Section: {slot.section || "?"} | Teacher: {slot.teacher || "?"} | Room: {slot.room || "?"}
                    </div>
                    <div className="mt-1 font-mono text-[10px] bg-black/40 p-1.5 rounded text-amber-100/60 overflow-x-auto whitespace-pre">
                      {slot.raw_cell_text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Selection echo (subtle) */}
      {(selectedUni || selectedDep) && !result && (
        <p className="text-xs text-muted-foreground">
          Uploading to <span className="text-foreground font-medium">{selectedUni?.name}</span>
          {selectedDep && <> · <span className="text-foreground font-medium">{selectedDep.name}</span></>}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  );
}
