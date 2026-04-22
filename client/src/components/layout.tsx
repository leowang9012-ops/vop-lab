import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar/95 backdrop-blur border-b border-sidebar-border flex items-center justify-between px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">VoP Lab</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - desktop: fixed left, mobile: slide-in overlay */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
