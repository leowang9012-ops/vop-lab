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
}

export function FeedbackFilters({ filters, onFilterChange, onReset }: FeedbackFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px] max-w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索反馈内容或关键词..."
          className="pl-9 bg-card border-border"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      {/* Category Filter */}
      <Select 
        value={filters.category}
        onValueChange={(value) => onFilterChange({ category: value })}
      >
        <SelectTrigger className="w-[140px] bg-card border-border">
          <SelectValue placeholder="分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          <SelectItem value="bug">Bug 反馈</SelectItem>
          <SelectItem value="feature">功能建议</SelectItem>
          <SelectItem value="balance">平衡调整</SelectItem>
          <SelectItem value="performance">性能问题</SelectItem>
          <SelectItem value="ui">UI/UX</SelectItem>
          <SelectItem value="audio">音频问题</SelectItem>
          <SelectItem value="story">剧情相关</SelectItem>
          <SelectItem value="other">其他</SelectItem>
        </SelectContent>
      </Select>

      {/* Sentiment Filter */}
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

      {/* Urgency Filter */}
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

      {/* Date Range */}
      <Select 
        value={filters.dateRange}
        onValueChange={(value) => onFilterChange({ dateRange: value })}
      >
        <SelectTrigger className="w-[140px] bg-card border-border">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">今天</SelectItem>
          <SelectItem value="7d">近7天</SelectItem>
          <SelectItem value="30d">近30天</SelectItem>
          <SelectItem value="90d">近90天</SelectItem>
          <SelectItem value="all">全部</SelectItem>
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
