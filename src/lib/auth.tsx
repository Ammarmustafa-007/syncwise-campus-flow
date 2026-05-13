import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// TODO: BACKEND — replace this mock auth with real Supabase Auth integration.
// Hook signature `useAuth() => { user, role, loading, login, logout }` is preserved.

export type Role = "admin" | "student" | "teacher" | null;

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: Exclude<Role, null>;
  university_id: string;
  university_name: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "syncwise_auth_user";

// TODO: BACKEND — remove these mock credentials when wiring real auth.
const MOCK_ADMIN: AuthUser = {
  id: "admin-001",
  email: "admin@syncwise.com",
  full_name: "Dr. Sarah Ahmed",
  role: "admin",
  university_id: "uni-001",
  university_name: "FAST NUCES Islamabad",
  token: "mock-admin-token-syncwise-007",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: BACKEND — call Supabase auth.signInWithPassword here.
    await new Promise((r) => setTimeout(r, 500));
    if (email.trim().toLowerCase() === "admin@syncwise.com" && password === "SWadmin007") {
      setUser(MOCK_ADMIN);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADMIN));
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
