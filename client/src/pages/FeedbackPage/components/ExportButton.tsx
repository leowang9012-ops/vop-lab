import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, X } from "lucide-react";

interface ExportButtonProps {
  feedbacks: any[];
  currentFilters: {
    search: string;
    category: string;
    sentiment: string;
    urgency: string;
    dateRange: string;
  };
}

export function ExportButton({ feedbacks, currentFilters }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 关 dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const XLSX = (await import("xlsx")).default;

      // 按筛选器过滤
      let data = feedbacks;
      if (source !== "all") data = data.filter(f => f.source === source);
      if (sentiment !== "all") data = data.filter(f => f.sentiment === sentiment);
      if (currentFilters.category !== "all") data = data.filter(f => f.category === currentFilters.category);
      if (currentFilters.sentiment !== "all" && sentiment === "all") data = data.filter(f => f.sentiment === currentFilters.sentiment);
      if (currentFilters.search) {
        const q = currentFilters.search.toLowerCase();
        data = data.filter(f =>
          f.content.toLowerCase().includes(q) ||
          (f.keywords || []).some((k: string) => k.toLowerCase().includes(q))
        );
      }

      // 映射为 Excel 行
      const rows = data.map((f, i) => ({
        "序号": i + 1,
        "来源": f.source === "questionnaire" ? "问卷" : f.source === "taptap" ? "TapTap" : f.source === "appstore" ? "App Store" : f.source,
        "分类": f.category || "",
        "情感": f.sentiment === "positive" ? "正面" : f.sentiment === "negative" ? "负面" : "中性",
        "紧急度": f.urgency === "critical" ? "紧急" : f.urgency === "high" ? "高" : f.urgency === "medium" ? "中" : "低",
        "评分": f.score ?? "",
        "关键词": (f.keywords || []).join("、"),
        "内容": f.content || "",
        "时间": f.timestamp ? new Date(f.timestamp).toLocaleString("zh-CN") : "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "反馈数据");

      // 列宽自适应
      const colWidths = [
        { wch: 6 },  // 序号
        { wch: 10 }, // 来源
        { wch: 12 }, // 分类
        { wch: 8 },  // 情感
        { wch: 8 },  // 紧急度
        { wch: 8 },  // 评分
        { wch: 20 }, // 关键词
        { wch: 60 }, // 内容
        { wch: 20 }, // 时间
      ];
      ws["!cols"] = colWidths;

      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `街篮2反馈数据_${date}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  const filteredCount = (() => {
    let d = feedbacks;
    if (source !== "all") d = d.filter(f => f.source === source);
    if (sentiment !== "all") d = d.filter(f => f.sentiment === sentiment);
    if (currentFilters.category !== "all") d = d.filter(f => f.category === currentFilters.category);
    return d.length;
  })();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        导出 Excel
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">导出筛选条件</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">按来源</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
            >
              <option value="all">全部来源</option>
              <option value="questionnaire">问卷</option>
              <option value="taptap">TapTap</option>
              <option value="appstore">App Store</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">按情感</label>
            <select
              value={sentiment}
              onChange={e => setSentiment(e.target.value)}
              className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
            >
              <option value="all">全部情感</option>
              <option value="positive">正面</option>
              <option value="neutral">中性</option>
              <option value="negative">负面</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground text-center py-1">
            将导出 <span className="font-medium text-foreground">{filteredCount}</span> 条数据
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || filteredCount === 0}
            className="w-full py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {exporting ? "生成中..." : `下载 Excel (${filteredCount} 条)`}
          </button>
        </div>
      )}
    </div>
  );
}
