import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { FilterState } from "../FeedbackPage";

interface FeedbackFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories?: string[];
  sources?: string[];
}

export function FeedbackFilters({ filters, onFilterChange, onReset, categories = [], sources = [] }: FeedbackFiltersProps) {
  const [collapsed, setCollapsed] = useState(true);
  const hasActiveFilters = filters.source !== "all" || filters.category !== "all" || filters.sentiment !== "all" || filters.urgency !== "all" || filters.search !== "";

  return (
    <div className="space-y-3">
      {/* Top row: search + filter toggle + reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索反馈内容或关键词..."
            className="pl-9 bg-card border-border text-sm"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0 md:hidden relative"
          onClick={() => setCollapsed(!collapsed)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          筛选
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-white flex items-center justify-center" />
          )}
        </Button>

        {/* Desktop: always show filters inline */}
      </div>

      {/* Filter row - hidden on mobile unless expanded, always visible on desktop */}
      <div className={`flex flex-wrap items-center gap-3 md:flex ${collapsed ? 'hidden md:flex' : 'flex'}`}>
        <Select
          value={filters.source}
          onValueChange={(value) => onFilterChange({ source: value })}
        >
          <SelectTrigger className="w-full md:w-[140px] bg-card border-border text-sm">
            <SelectValue placeholder="渠道" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部渠道</SelectItem>
            {sources.map(src => (
              <SelectItem key={src} value={src}>{src}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-full md:w-[140px] bg-card border-border text-sm">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sentiment}
          onValueChange={(value) => onFilterChange({ sentiment: value })}
        >
          <SelectTrigger className="w-full md:w-[120px] bg-card border-border text-sm">
            <SelectValue placeholder="情感" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部情感</SelectItem>
            <SelectItem value="positive">正面</SelectItem>
            <SelectItem value="neutral">中性</SelectItem>
            <SelectItem value="negative">负面</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.urgency}
          onValueChange={(value) => onFilterChange({ urgency: value })}
        >
          <SelectTrigger className="w-full md:w-[120px] bg-card border-border text-sm">
            <SelectValue placeholder="紧急度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部紧急度</SelectItem>
            <SelectItem value="critical">紧急</SelectItem>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-2 shrink-0"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </Button>
      </div>
    </div>
  );
}
