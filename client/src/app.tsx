import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage/ProjectsPage";
import FeedbackPage from "@/pages/FeedbackPage/FeedbackPage";
import ReportPage from "@/pages/ReportPage/ReportPage";
import ImportPage from "@/pages/ImportPage/ImportPage";
import TrendPage from "@/pages/TrendPage/TrendPage";
import WeeklyReportPage from "@/pages/WeeklyReportPage/WeeklyReportPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="trend" element={<TrendPage />} />
        <Route path="weekly" element={<WeeklyReportPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
