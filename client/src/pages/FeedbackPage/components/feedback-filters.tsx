import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { FilterState } from "../FeedbackPage";

interface FeedbackFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories?: string[];
}

export function FeedbackFilters({ filters, onFilterChange, onReset, categories = [] }: FeedbackFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[240px] max-w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索反馈内容或关键词..."
          className="pl-9 bg-card border-border"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange({ category: value })}
      >
        <SelectTrigger className="w-[140px] bg-card border-border">
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
        <SelectTrigger className="w-[120px] bg-card border-border">
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
        <SelectTrigger className="w-[120px] bg-card border-border">
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
        className="ml-auto gap-2"
        onClick={onReset}
      >
        <RotateCcw className="w-4 h-4" />
        重置筛选
      </Button>
    </div>
  );
}
