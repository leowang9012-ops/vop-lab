import { createContext, useContext, useState, ReactNode } from "react";

export type DateRange = "all" | "7d" | "30d" | "90d";

interface FilterContextType {
  source: string;           // "all" | "questionnaire" | "taptap" | "appstore"
  dateRange: DateRange;
  setSource: (source: string) => void;
  setDateRange: (range: DateRange) => void;
  resetFilters: () => void;
  /** 对单条反馈应用全局筛选 */
  applyGlobalFilter: (item: { source?: string; timestamp?: string }) => boolean;
}

const FilterContext = createContext<FilterContextType | null>(null);

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  all: "全部时间",
  "7d": "最近 7 天",
  "30d": "最近 30 天",
  "90d": "最近 90 天",
};

function getDateThreshold(range: DateRange): number {
  if (range === "all") return 0;
  const now = Date.now();
  const ms: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  return now - (ms[range] || 0) * 24 * 60 * 60 * 1000;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const resetFilters = () => {
    setSource("all");
    setDateRange("all");
  };

  const applyGlobalFilter = (item: { source?: string; timestamp?: string }): boolean => {
    if (source !== "all" && item.source !== source) return false;
    if (dateRange !== "all" && item.timestamp) {
      const threshold = getDateThreshold(dateRange);
      const itemTime = new Date(item.timestamp).getTime();
      if (!isNaN(itemTime) && itemTime < threshold) return false;
    }
    return true;
  };

  return (
    <FilterContext.Provider value={{ source, dateRange, setSource, setDateRange, resetFilters, applyGlobalFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useGlobalFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useGlobalFilter must be used within FilterProvider");
  return ctx;
}

export { DATE_RANGE_LABELS };
