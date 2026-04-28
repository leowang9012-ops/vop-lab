import { useGlobalFilter, DATE_RANGE_LABELS, type DateRange } from "@/contexts/FilterContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCE_OPTIONS = [
  { value: "all", label: "全部渠道" },
  { value: "questionnaire", label: "问卷反馈" },
  { value: "taptap", label: "TapTap" },
  { value: "appstore", label: "App Store" },
];

export function GlobalFilterBar() {
  const { source, dateRange, setSource, setDateRange, resetFilters } = useGlobalFilter();
  const hasActive = source !== "all" || dateRange !== "all";

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 hidden md:block" />

      <Select value={source} onValueChange={setSource}>
        <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary/40 border-border/60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
        <SelectTrigger className="w-[120px] h-8 text-xs bg-secondary/40 border-border/60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(DATE_RANGE_LABELS) as [DateRange, string][]).map(([key, label]) => (
            <SelectItem key={key} value={key} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          onClick={resetFilters}
        >
          <RotateCcw className="w-3 h-3" />
          清除
        </Button>
      )}
    </div>
  );
}
