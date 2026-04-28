import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquareWarning,
  FileBarChart,
  Radar,
  Upload,
  TrendingUp,
  Calendar,
  Gamepad2,
  Network,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";

const navItems = [
  { label: "数据看板", path: "/", icon: LayoutDashboard },
  { label: "项目管理", path: "/projects", icon: FolderKanban },
  { label: "反馈列表", path: "/feedback", icon: MessageSquareWarning },
  { label: "分析报告", path: "/report", icon: FileBarChart },
  { label: "趋势对比", path: "/trend", icon: TrendingUp },
  { label: "周报生成", path: "/weekly", icon: Calendar },
  { label: "数据导入", path: "/import", icon: Upload },
  { label: "语义聚类", path: "/clusters", icon: Network },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { projects, currentProject, selectProject } = useProject();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("vop-theme");
    return saved !== "light";
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("vop-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("vop-theme", "light");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border/60 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <Radar className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-sidebar-foreground tracking-tight font-display">
            VoP Lab
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">
            玩家反馈智能分析
          </p>
        </div>
      </div>

      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="px-3 py-3 border-b border-sidebar-border/60">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-border/40 transition-all duration-200 text-left"
            >
              <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {currentProject?.name || "选择项目"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {currentProject?.genre || ""}
                </p>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", showDropdown && "rotate-180")} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { selectProject(p.id); setShowDropdown(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-secondary/50 transition-colors",
                        currentProject?.id === p.id && "bg-primary/5"
                      )}
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.platform}</p>
                      </div>
                      {currentProject?.id === p.id && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-secondary/40"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px]", active ? "text-sidebar-primary" : "text-current opacity-70")} />
              {item.label}
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border/60 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-secondary/40 transition-all duration-200"
          title={isDark ? "切换到亮色模式" : "切换到深色模式"}
        >
          {isDark ? <Sun className="w-[18px] h-[18px] shrink-0 opacity-70" /> : <Moon className="w-[18px] h-[18px] shrink-0 opacity-70" />}
          <span>{isDark ? "亮色模式" : "深色模式"}</span>
        </button>

        <div className="flex items-center gap-2.5 px-2 pt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground text-xs font-bold font-display">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">管理员</p>
            <p className="text-[11px] text-muted-foreground truncate">admin@voplab.dev</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
