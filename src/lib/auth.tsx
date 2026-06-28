import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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

const STATIC_ADMIN_EMAIL = "admin@syncwise.com";
const STATIC_ADMIN_PASSWORD = "SWadmin007";

const STATIC_ADMIN: AuthUser = {
  id: "admin-001",
  email: STATIC_ADMIN_EMAIL,
  full_name: "Dr. Sarah Ahmed",
  role: "admin",
  university_id: "uni-001",
  university_name: "FAST NUCES Islamabad",
  token: "static-admin-token-syncwise",
};

function loadStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function isStaticAdminSession(user: AuthUser | null): boolean {
  return user?.email.toLowerCase() === STATIC_ADMIN_EMAIL && user.token === STATIC_ADMIN.token;
}

function getRoleFromUser(user: User): Exclude<Role, null> {
  const appRole = user.app_metadata?.role;
  if (appRole === "admin" || appRole === "student" || appRole === "teacher") {
    return appRole;
  }
  if (user.email?.toLowerCase() === "admin@syncwise.com") {
    return "admin";
  }
  return "student";
}

function toAuthUser(user: User, session: Session): AuthUser {
  const role = getRoleFromUser(user);
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "User",
    role,
    university_id: "uni-001",
    university_name: "FAST NUCES Islamabad",
    token: session.access_token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const session = data.session;
        if (session?.user) {
          const mappedUser = toAuthUser(session.user, session);
          setUser(mappedUser);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
        } else {
          const stored = loadStoredUser();
          if (stored && isStaticAdminSession(stored)) {
            setUser(stored);
          } else {
            setUser(null);
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const mappedUser = toAuthUser(session.user, session);
        setUser(mappedUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
      } else {
        const stored = loadStoredUser();
        if (stored && isStaticAdminSession(stored)) {
          setUser(stored);
        } else {
          setUser(null);
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === STATIC_ADMIN_EMAIL && password === STATIC_ADMIN_PASSWORD) {
      await supabase.auth.signOut(); // Clear any lingering real sessions
      setUser(STATIC_ADMIN);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(STATIC_ADMIN));
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.session?.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }
    const mappedUser = toAuthUser(data.session.user, data.session);
    setUser(mappedUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
    return { ok: true };
  };

  const logout = () => {
    void supabase.auth.signOut();
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
