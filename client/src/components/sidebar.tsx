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
  ChevronDown,
  Gamepad2,
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
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { projects, currentProject, selectProject } = useProject();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
          <Radar className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
            VoP Lab
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight">
            玩家反馈智能分析
          </p>
        </div>
      </div>

      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-left"
            >
              <Gamepad2 className="w-4 h-4 text-sidebar-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {currentProject?.name || "选择项目"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {currentProject?.genre || ""}
                </p>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { selectProject(p.id); setShowDropdown(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 transition-colors",
                        currentProject?.id === p.id && "bg-secondary/30"
                      )}
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.platform}</p>
                      </div>
                      {currentProject?.id === p.id && (
                        <span className="ml-auto text-xs text-primary">●</span>
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
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", active && "text-sidebar-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
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
