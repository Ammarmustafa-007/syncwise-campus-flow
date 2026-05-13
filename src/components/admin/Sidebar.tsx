import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Upload, History, Users, Settings, LogOut, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/assets/syncwise-logo.png";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export type AdminSection = "dashboard" | "upload" | "versions" | "users" | "settings";

interface Props {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const items: { key: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "upload", label: "Upload Timetable", icon: Upload },
  { key: "versions", label: "Version History", icon: History },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ active, onChange, collapsed, onToggleCollapsed }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand */}
      <Link to="/admin" className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <img src={logo} alt="SyncWise logo" className="h-9 w-9 shrink-0 rounded-lg shadow-brand" />
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-gradient-brand">SyncWise</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              title={collapsed ? item.label : undefined}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-foreground border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent/60 hover:text-foreground"
          title={collapsed ? "Toggle theme" : undefined}
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        {!collapsed && user && (
          <div className="rounded-lg bg-sidebar-accent/40 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-primary">{user.university_name}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={onToggleCollapsed}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-sidebar-accent/60 hover:text-foreground"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
