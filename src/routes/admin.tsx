import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Sidebar, { type AdminSection } from "@/components/admin/Sidebar";
import StatsOverview from "@/components/admin/StatsOverview";
import UploadTimetable from "@/components/admin/UploadTimetable";
import VersionHistory from "@/components/admin/VersionHistory";
import UsersTable from "@/components/admin/UsersTable";
import Settings from "@/components/admin/Settings";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SyncWise" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("syncwise_admin_section");
      if (stored) return stored as AdminSection;
    }
    return "dashboard";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("syncwise_admin_section", section);
    }
  }, [section]);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse below 1280
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1280) setCollapsed(true); else setCollapsed(false); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role !== "admin") navigate({ to: "/unauthorized" });
  }, [user, role, loading, navigate]);

  if (loading || !user || role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={section} onChange={setSection} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <main className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "pl-16" : "pl-64"}`}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div key={section} className="animate-fade-in-up">
            {section === "dashboard" && <StatsOverview />}
            {section === "upload" && <UploadTimetable />}
            {section === "versions" && <VersionHistory />}
            {section === "users" && <UsersTable />}
            {section === "settings" && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
}
