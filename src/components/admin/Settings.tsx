import { useEffect, useState } from "react";
import { Check, Edit3, Plus, Building2, Layers, Loader2, X } from "lucide-react";
import { createDepartment, createUniversity, getDepartments, getUniversities, updateDepartment, updateUniversity, type Department, type University } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Settings() {
  const { user } = useAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [deps, setDeps] = useState<Department[]>([]);
  const [savingUni, setSavingUni] = useState(false);
  const [savingDep, setSavingDep] = useState(false);
  const [editingUniId, setEditingUniId] = useState<string | null>(null);
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [updatingUniId, setUpdatingUniId] = useState<string | null>(null);
  const [updatingDepId, setUpdatingDepId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uniName, setUniName] = useState("");
  const [uniCity, setUniCity] = useState("");
  const [uniCountry, setUniCountry] = useState("Pakistan");

  const [depName, setDepName] = useState("");
  const [depCode, setDepCode] = useState("");
  const [editUniForm, setEditUniForm] = useState({ name: "", city: "", country: "" });
  const [editDepForm, setEditDepForm] = useState({ name: "", code: "" });

  useEffect(() => {
    getUniversities().then((u) => {
      setUnis(u);
      const matched = u.find(x => x.id === user?.university_id);
      setSelectedUni(matched?.id ?? u[0]?.id ?? "");
    });
  }, [user?.university_id]);

  useEffect(() => {
    if (!selectedUni) return;
    getDepartments(selectedUni).then(setDeps);
  }, [selectedUni]);

  const addUni = async () => {
    if (!uniName.trim() || !uniCity.trim()) { setError("University name and city are required."); return; }
    setSavingUni(true); setError(null);
    try {
      const u = await createUniversity({ name: uniName.trim(), city: uniCity.trim(), country: uniCountry.trim() });
      setUnis((s) => [...s, u]);
      setUniName(""); setUniCity("");
    } catch (e) { setError((e as Error).message); }
    finally { setSavingUni(false); }
  };

  const addDep = async () => {
    if (!selectedUni || !depName.trim() || !depCode.trim()) { setError("Select a university and provide name + code."); return; }
    setSavingDep(true); setError(null);
    try {
      const d = await createDepartment({ name: depName.trim(), code: depCode.trim().toUpperCase(), university_id: selectedUni });
      setDeps((s) => [...s, d]);
      setDepName(""); setDepCode("");
    } catch (e) { setError((e as Error).message); }
    finally { setSavingDep(false); }
  };

  const startEditUni = (u: University) => {
    setError(null);
    setEditingDepId(null);
    setEditingUniId(u.id);
    setEditUniForm({ name: u.name, city: u.city || "", country: u.country || "" });
  };

  const startEditDep = (d: Department) => {
    setError(null);
    setEditingUniId(null);
    setEditingDepId(d.id);
    setEditDepForm({ name: d.name, code: d.code || "" });
  };

  const saveUni = async (id: string) => {
    if (!editUniForm.name.trim()) { setError("University name is required."); return; }
    setUpdatingUniId(id); setError(null);
    try {
      const updated = await updateUniversity(id, {
        name: editUniForm.name.trim(),
        city: editUniForm.city.trim(),
        country: editUniForm.country.trim() || "Pakistan",
      });
      setUnis((prev) => prev.map((u) => u.id === id ? updated : u));
      setEditingUniId(null);
    } catch (e) { setError((e as Error).message); }
    finally { setUpdatingUniId(null); }
  };

  const saveDep = async (id: string) => {
    if (!editDepForm.name.trim() || !editDepForm.code.trim()) { setError("Department name and code are required."); return; }
    setUpdatingDepId(id); setError(null);
    try {
      const updated = await updateDepartment(id, {
        name: editDepForm.name.trim(),
        code: editDepForm.code.trim().toUpperCase(),
      });
      setDeps((prev) => prev.map((d) => d.id === id ? updated : d));
      setEditingDepId(null);
    } catch (e) { setError((e as Error).message); }
    finally { setUpdatingDepId(null); }
  };

  const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  const myUni = unis.find((u) => u.id === user?.university_id);

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure universities and departments before uploading timetables.</p>
      </header>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {/* Current uni */}
      {myUni && (
        <div className="rounded-2xl border bg-gradient-brand-soft p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your university</p>
          <p className="mt-1 text-xl font-bold text-gradient-brand">{myUni.name}</p>
          <p className="text-sm text-muted-foreground">{myUni.city}, {myUni.country}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Universities */}
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">University Management</h2>
          </div>

          <div className="space-y-2">
            <input className={inputCls} placeholder="University name" value={uniName} onChange={(e) => setUniName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="City" value={uniCity} onChange={(e) => setUniCity(e.target.value)} />
              <input className={inputCls} placeholder="Country" value={uniCountry} onChange={(e) => setUniCountry(e.target.value)} />
            </div>
            <button onClick={addUni} disabled={savingUni} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-brand disabled:opacity-50">
              {savingUni ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add university
            </button>
          </div>

          <ul className="mt-5 space-y-1.5">
            {unis.map((u) => (
              <li key={u.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
                {editingUniId === u.id ? (
                  <div className="flex w-full flex-col gap-2">
                    <input className={inputCls} value={editUniForm.name} onChange={(e) => setEditUniForm((p) => ({ ...p, name: e.target.value }))} placeholder="University name" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} value={editUniForm.city} onChange={(e) => setEditUniForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                      <input className={inputCls} value={editUniForm.country} onChange={(e) => setEditUniForm((p) => ({ ...p, country: e.target.value }))} placeholder="Country" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingUniId(null)} disabled={updatingUniId === u.id} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button onClick={() => saveUni(u.id)} disabled={updatingUniId === u.id} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                        {updatingUniId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.city}, {u.country}</p>
                    </div>
                    <button onClick={() => startEditUni(u)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Departments */}
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Department Management</h2>
          </div>

          <select className={inputCls + " mb-3"} value={selectedUni} onChange={(e) => setSelectedUni(e.target.value)}>
            {unis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <div className="space-y-2">
            <input className={inputCls} placeholder="Department name (e.g. Computer Science)" value={depName} onChange={(e) => setDepName(e.target.value)} />
            <input className={inputCls} placeholder="Code (e.g. CS, SE, EE)" value={depCode} onChange={(e) => setDepCode(e.target.value.toUpperCase())} />
            <button onClick={addDep} disabled={savingDep} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-brand disabled:opacity-50">
              {savingDep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add department
            </button>
          </div>

          <ul className="mt-5 space-y-1.5">
            {deps.length === 0 && <li className="text-sm text-muted-foreground">No departments yet.</li>}
            {deps.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
                {editingDepId === d.id ? (
                  <div className="flex w-full flex-col gap-2">
                    <input className={inputCls} value={editDepForm.name} onChange={(e) => setEditDepForm((p) => ({ ...p, name: e.target.value }))} placeholder="Department name" />
                    <input className={inputCls} value={editDepForm.code} onChange={(e) => setEditDepForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Code" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingDepId(null)} disabled={updatingDepId === d.id} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button onClick={() => saveDep(d.id)} disabled={updatingDepId === d.id} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                        {updatingDepId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">Code: {d.code}</p>
                    </div>
                    <button onClick={() => startEditDep(d)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
