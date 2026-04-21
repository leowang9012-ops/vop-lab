import { useState, useMemo } from "react";
import { FeedbackFilters } from "./components/feedback-filters";
import { FeedbackTable } from "./components/feedback-table";
import { Pagination } from "./components/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFeedbacks } from "@/data/mock";

export type FilterState = {
  search: string;
  category: string;
  sentiment: string;
  urgency: string;
  dateRange: string;
};

const PAGE_SIZE = 10;

export default function FeedbackPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sentiment: "all",
    urgency: "all",
    dateRange: "7d",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选反馈数据
  const filteredFeedbacks = useMemo(() => {
    return mockFeedbacks.filter((feedback) => {
      // 搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesContent = feedback.content.toLowerCase().includes(searchLower);
        const matchesKeywords = feedback.keywords.some(kw => kw.toLowerCase().includes(searchLower));
        if (!matchesContent && !matchesKeywords) return false;
      }
      
      // 分类筛选
      if (filters.category !== "all" && feedback.category !== filters.category) return false;
      
      // 情感筛选
      if (filters.sentiment !== "all" && feedback.sentiment !== filters.sentiment) return false;
      
      // 紧急度筛选
      if (filters.urgency !== "all" && feedback.urgency !== filters.urgency) return false;
      
      // 时间范围筛选
      if (filters.dateRange !== "all") {
        const feedbackDate = new Date(feedback.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - feedbackDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case "today":
            if (diffDays > 0) return false;
            break;
          case "7d":
            if (diffDays > 7) return false;
            break;
          case "30d":
            if (diffDays > 30) return false;
            break;
          case "90d":
            if (diffDays > 90) return false;
            break;
        }
      }
      
      return true;
    });
  }, [filters]);

  // 分页数据
  const totalPages = Math.ceil(filteredFeedbacks.length / PAGE_SIZE);
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFeedbacks.slice(start, start + PAGE_SIZE);
  }, [filteredFeedbacks, currentPage]);

  // 处理筛选变化
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // 重置到第一页
  };

  // 重置筛选
  const handleReset = () => {
    setFilters({
      search: "",
      category: "all",
      sentiment: "all",
      urgency: "all",
      dateRange: "7d",
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <h1 className="text-xl font-bold text-foreground">反馈列表</h1>
          <p className="text-sm text-muted-foreground mt-0.5">查看和管理所有玩家反馈</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-6 space-y-6">
        {/* Filters */}
        <FeedbackFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
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

        {/* Feedback Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <FeedbackTable feedbacks={paginatedFeedbacks} />
          </CardContent>
        </Card>

        {/* Pagination */}
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
