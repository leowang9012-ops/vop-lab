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

// 把反馈数据转成 CSV 字符串（带 BOM，便于 Excel 正确识别中文）
function toCSV(rows: Record<string, string>[]): string {
  const header = Object.keys(rows[0] || {});
  const lines = [
    header.map(h => `"${h}"`).join(","),
    ...rows.map(row =>
      header.map(h => {
        const val = String(row[h] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    ),
  ];
  return "\ufeff" + lines.join("\r\n");
}

export function ExportButton({ feedbacks, currentFilters }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<"csv" | "xlsx">("csv");
  const menuRef = useRef<HTMLDivElement>(null);

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
      let data = feedbacks;
      if (source !== "all") data = data.filter(f => f.source === source);
      if (sentiment !== "all") data = data.filter(f => f.sentiment === sentiment);
      if (currentFilters.category !== "all") data = data.filter(f => f.category === currentFilters.category);
      if (currentFilters.sentiment !== "all" && sentiment === "all") {
        data = data.filter(f => f.sentiment === currentFilters.sentiment);
      }
      if (currentFilters.search) {
        const q = currentFilters.search.toLowerCase();
        data = data.filter(f =>
          (f.content || "").toLowerCase().includes(q) ||
          (f.keywords || []).some((k: string) => k.toLowerCase().includes(q))
        );
      }

      const date = new Date().toISOString().slice(0, 10);

      if (exportType === "csv") {
        // 纯 CSV 导出，不依赖任何库
        const rows = data.map((f, i) => ({
          "序号": String(i + 1),
          "来源": f.source === "questionnaire" ? "问卷" : f.source === "taptap" ? "TapTap" : f.source === "appstore" ? "App Store" : f.source || "",
          "分类": f.category || "",
          "情感": f.sentiment === "positive" ? "正面" : f.sentiment === "negative" ? "负面" : "中性",
          "紧急度": f.urgency === "critical" ? "紧急" : f.urgency === "high" ? "高" : f.urgency === "medium" ? "中" : "低",
          "评分": f.score ?? "",
          "关键词": (f.keywords || []).join("、"),
          "内容": f.content || "",
          "时间": f.timestamp ? new Date(f.timestamp).toLocaleString("zh-CN") : "",
        }));

        const csv = toCSV(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        triggerDownload(blob, `街篮2反馈数据_${date}.csv`);
      } else {
        // Excel 导出，动态加载 xlsx
        const XLSX = (await import("xlsx")).default;
        const rows = data.map((f, i) => ({
          "序号": i + 1,
          "来源": f.source === "questionnaire" ? "问卷" : f.source === "taptap" ? "TapTap" : f.source === "appstore" ? "App Store" : f.source || "",
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
        ws["!cols"] = [
          { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 8 },
          { wch: 8 }, { wch: 20 }, { wch: 60 }, { wch: 20 },
        ];

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        triggerDownload(blob, `街篮2反馈数据_${date}.xlsx`);
      }
    } catch (err) {
      console.error("导出失败:", err);
      alert("导出失败，请稍后重试。错误信息：" + String(err));
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 延迟释放 URL，确保下载完成
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const getFilteredCount = () => {
    let d = feedbacks;
    if (source !== "all") d = d.filter(f => f.source === source);
    if (sentiment !== "all") d = d.filter(f => f.sentiment === sentiment);
    if (currentFilters.category !== "all") d = d.filter(f => f.category === currentFilters.category);
    return d.length;
  };

  const count = getFilteredCount();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        导出
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 p-3 space-y-3">
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

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">导出格式</label>
            <select
              value={exportType}
              onChange={e => setExportType(e.target.value as "csv" | "xlsx")}
              className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
            >
              <option value="csv">CSV（Excel 可直接打开）</option>
              <option value="xlsx">Excel（.xlsx 格式）</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground text-center py-1">
            将导出 <span className="font-medium text-foreground">{count}</span> 条数据
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || count === 0}
            className="w-full py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {exporting ? "生成中..." : `下载${exportType === "csv" ? " CSV" : " Excel"} (${count} 条)`}
          </button>
        </div>
      )}
    </div>
  );
}
