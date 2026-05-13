import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/syncwise-logo.png";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SyncWise Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@syncwise.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && user?.role === "admin") navigate({ to: "/admin" }); }, [user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) navigate({ to: "/admin" });
    else setError(r.error ?? "Login failed");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border bg-card/80 p-8 shadow-2xl backdrop-blur animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="SyncWise" className="h-16 w-16 rounded-xl shadow-brand" />
          <h1 className="mt-4 text-2xl font-bold">Welcome to <span className="text-gradient-brand">SyncWise</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-95 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo credentials</p>
          <p className="mt-0.5">admin@syncwise.com · <code className="text-primary">SWadmin007</code></p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
