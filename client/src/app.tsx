import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage/ProjectsPage";
import FeedbackPage from "@/pages/FeedbackPage/FeedbackPage";
import ReportPage from "@/pages/ReportPage/ReportPage";
import ImportPage from "@/pages/ImportPage/ImportPage";
import TrendPage from "@/pages/TrendPage/TrendPage";
import WeeklyReportPage from "@/pages/WeeklyReportPage/WeeklyReportPage";
import ClustersPage from "@/pages/ClustersPage/ClustersPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import { FilterProvider } from "@/contexts/FilterContext";

const AUTH_TOKEN = "vop-lab-logged-in";

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("vop-theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
    }
  }, []);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem(AUTH_TOKEN) === "1";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function LoginRoute() {
  const isLoggedIn = localStorage.getItem(AUTH_TOKEN) === "1";
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <FilterProvider>
      <ThemeInit />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="trend" element={<TrendPage />} />
          <Route path="weekly" element={<WeeklyReportPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="clusters" element={<ClustersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </FilterProvider>
  );
}
