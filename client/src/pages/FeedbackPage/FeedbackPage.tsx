import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FeedbackFilters } from "./components/feedback-filters";
import { FeedbackTable } from "./components/feedback-table";
import { Pagination } from "./components/pagination";
import { ExportButton } from "./components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/contexts/ProjectContext";

export type FeedbackItem = {
  id: string;
  content: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  timestamp: string;
  keywords: string[];
  score: number;
  source?: string;
};

export type FilterState = {
  search: string;
  source: string;
  category: string;
  sentiment: string;
  urgency: string;
  dateRange: string;
};

const PAGE_SIZE = 15;

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    source: searchParams.get("source") || "all",
    category: searchParams.get("category") || "all",
    sentiment: searchParams.get("sentiment") || "all",
    urgency: searchParams.get("urgency") || "all",
    dateRange: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { currentDataDir } = useProject();

  useEffect(() => {
    if (!currentDataDir) return;
    fetch(`/vop-lab/data/projects/${currentDataDir}/feedback_processed.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setFeedbacks(data); setLoading(false); })
      .catch(() => { setFeedbacks([]); setLoading(false); });
  }, [currentDataDir]);

  // 筛选反馈数据
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesContent = feedback.content.toLowerCase().includes(searchLower);
        const matchesKeywords = feedback.keywords.some(kw => kw.toLowerCase().includes(searchLower));
        if (!matchesContent && !matchesKeywords) return false;
      }
      if (filters.source !== "all" && feedback.source !== filters.source) return false;
      if (filters.category !== "all" && feedback.category !== filters.category) return false;
      if (filters.sentiment !== "all" && feedback.sentiment !== filters.sentiment) return false;
      if (filters.urgency !== "all" && feedback.urgency !== filters.urgency) return false;
      return true;
    });
  }, [feedbacks, filters]);

  const totalPages = Math.ceil(filteredFeedbacks.length / PAGE_SIZE);
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFeedbacks.slice(start, start + PAGE_SIZE);
  }, [filteredFeedbacks, currentPage]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ search: "", source: "all", category: "all", sentiment: "all", urgency: "all", dateRange: "all" });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载反馈数据中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">反馈列表</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">查看和管理所有玩家反馈（{feedbacks.length} 条）</p>
          </div>
          <ExportButton feedbacks={feedbacks} currentFilters={filters} />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        <FeedbackFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          categories={[...new Set(feedbacks.map(f => f.category))].filter(Boolean)}
          sources={[...new Set(feedbacks.map(f => f.source).filter(Boolean) as string[])]}
        />

        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
          <Card className="bg-card border-border flex-1">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">筛选结果</span>
                <span className="font-semibold text-foreground">{filteredFeedbacks.length} 条</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border flex-1">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">负面反馈</span>
                <span className="font-semibold text-destructive">
                  {filteredFeedbacks.filter(f => f.sentiment === "negative").length} 条
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border flex-1">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">紧急问题</span>
                <span className="font-semibold text-warning">
                  {filteredFeedbacks.filter(f => f.urgency === "critical" || f.urgency === "high").length} 条
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <FeedbackTable feedbacks={paginatedFeedbacks} />
          </CardContent>
        </Card>

        <Pagination
          total={filteredFeedbacks.length}
          pageSize={PAGE_SIZE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}
