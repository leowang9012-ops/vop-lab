import { useState, useMemo, useEffect } from "react";
import { FeedbackFilters } from "./components/feedback-filters";
import { FeedbackTable } from "./components/feedback-table";
import { Pagination } from "./components/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FeedbackItem = {
  id: string;
  content: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  timestamp: string;
  keywords: string[];
  score: number;
};

export type FilterState = {
  search: string;
  category: string;
  sentiment: string;
  urgency: string;
  dateRange: string;
};

const PAGE_SIZE = 15;

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sentiment: "all",
    urgency: "all",
    dateRange: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/feedback_processed.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 筛选反馈数据
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesContent = feedback.content.toLowerCase().includes(searchLower);
        const matchesKeywords = feedback.keywords.some(kw => kw.toLowerCase().includes(searchLower));
        if (!matchesContent && !matchesKeywords) return false;
      }
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
    setFilters({ search: "", category: "all", sentiment: "all", urgency: "all", dateRange: "all" });
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
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-lg md:text-xl font-bold text-foreground">反馈列表</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">查看和管理所有玩家反馈（{feedbacks.length} 条）</p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        <FeedbackFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          categories={[...new Set(feedbacks.map(f => f.category))]}
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
