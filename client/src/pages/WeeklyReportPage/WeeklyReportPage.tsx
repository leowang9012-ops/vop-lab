import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, MessageSquare } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { ShareDialog } from "@/components/ShareDialog";

interface Feedback {
  content: string;
  score?: number;
  category?: string;
  sentiment?: string;
  keywords?: string[];
  urgency?: string;
  source?: string;
  created_at?: number;
  timestamp?: number;
  date?: number;
}

interface WeeklyStats {
  totalFeedback: number;
  avgScore: number;
  positiveRate: number;
  negativeRate: number;
  categoryDistribution: Record<string, number>;
  topKeywords: { keyword: string; count: number }[];
  topIssues: { issue: string; count: number; severity: string }[];
  sampleFeedback: { content: string; sentiment: string; score: number }[];
}

export default function WeeklyReportPage() {
  const [allData, setAllData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<WeeklyStats | null>(null);
  const [dateRange, setDateRange] = useState<"week" | "twoweeks" | "month">("week");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`\/vop-lab\/data\/feedback_processed.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setAllData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const generateReport = useCallback(() => {
    if (allData.length === 0) return;
    setGenerating(true);

    // 根据时间范围筛选数据
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      twoweeks: 14 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[dateRange];

    // 筛选有时间的数据，如果没有时间字段则用全部数据
    const timeData = allData.filter(d => {
      const t = d.created_at || d.timestamp || d.date || 0;
      return t > 0;
    });

    const filtered = timeData.length > 0
      ? timeData.filter(d => (d.created_at || d.timestamp || d.date || 0) > cutoff)
      : allData;

    // 如果筛选后数据太少，用全部数据
    const data = filtered.length >= 10 ? filtered : allData;

    const total = data.length;
    const scores = data.map(d => d.score || 0).filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0;

    const sentiments = data.map(d => d.sentiment || 'neutral');
    const sentimentCounts: Record<string, number> = {};
    sentiments.forEach(s => { sentimentCounts[s] = (sentimentCounts[s] || 0) + 1; });
    const positiveRate = Math.round((sentimentCounts['positive'] || 0) / total * 100);
    const negativeRate = Math.round((sentimentCounts['negative'] || 0) / total * 100);

    const categories = data.map(d => d.category || '其他');
    const catCounts: Record<string, number> = {};
    categories.forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1; });
    const categoryDistribution = Object.fromEntries(
      Object.entries(catCounts).sort((a, b) => b[1] - a[1])
    );

    const keywordCounts: Record<string, number> = {};
    data.forEach(d => {
      (d.keywords || []).forEach((kw: string) => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    const negativeData = data.filter(d => d.sentiment === 'negative');
    const issueCounts: Record<string, number> = {};
    negativeData.forEach(d => {
      const key = d.category || '其他';
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    });
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([issue, count]) => ({
        issue,
        count,
        severity: count > total * 0.1 ? 'critical' : count > total * 0.05 ? 'high' : 'medium',
      }));

    const sampleFeedback = data
      .filter(d => d.sentiment === 'negative')
      .slice(0, 5)
      .map(d => ({
        content: (d.content || '').slice(0, 100),
        sentiment: d.sentiment || 'neutral',
        score: d.score || 0,
      }));

    setReport({
      totalFeedback: total,
      avgScore,
      positiveRate,
      negativeRate,
      categoryDistribution,
      topKeywords,
      topIssues,
      sampleFeedback,
    });
    setGenerating(false);
  }, [allData, dateRange]);

  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current || !report) return;
    
    try {
      const loadScript = (url: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${url}"]`);
          if (existing) { resolve(); return; }
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`CDN 加载失败: ${url}`));
          document.head.appendChild(script);
        });

      const cdnUrls = [
        {
          html2canvas: 'https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          jspdf: 'https://cdn.bootcdn.net/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        },
        {
          html2canvas: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
          jspdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
        },
      ];

      let loaded = false;
      for (const urls of cdnUrls) {
        try {
          if (!(window as any).html2canvas) await loadScript(urls.html2canvas);
          if (!(window as any).jspdf) await loadScript(urls.jspdf);
          loaded = true;
          break;
        } catch { continue; }
      }

      if (!loaded) throw new Error('无法加载 PDF 生成库');

      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: 0; top: -10000px; width: 800px;
        background: #ffffff; color: #1a1a1a;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 14px; line-height: 1.8; padding: 40px;
      `;

      const rangeLabel = dateRange === 'week' ? '本周' : dateRange === 'twoweeks' ? '近两周' : '本月';
      container.innerHTML = `
        <h1 style="font-size:24px;font-weight:bold;margin:0 0 8px 0;">《街篮2》玩家反馈${rangeLabel}周报</h1>
        <p style="color:#666;font-size:12px;margin-bottom:20px;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        <hr style="border:none;border-top:2px solid #6c5ce7;margin:0 0 24px 0;" />
        <div style="display:flex;gap:16px;margin-bottom:24px;">
          <div style="flex:1;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;">${report.totalFeedback}</div>
            <div style="font-size:12px;color:#666;">反馈总数</div>
          </div>
          <div style="flex:1;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;">${report.avgScore}</div>
            <div style="font-size:12px;color:#666;">平均评分</div>
          </div>
          <div style="flex:1;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;">${report.positiveRate}%</div>
            <div style="font-size:12px;color:#666;">正面率</div>
          </div>
        </div>
        <h2 style="font-size:16px;font-weight:bold;margin:16px 0 8px 0;">问题分类</h2>
        ${Object.entries(report.categoryDistribution).map(([cat, count]) => 
          `<div style="padding:4px 0;">${cat}: ${count} 条</div>`
        ).join('')}
        <h2 style="font-size:16px;font-weight:bold;margin:16px 0 8px 0;">热门关键词</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${report.topKeywords.map(kw => `<span style="padding:4px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;">${kw.keyword} ×${kw.count}</span>`).join('')}
        </div>
      `;

      document.body.appendChild(container);
      const canvas = await (window as any).html2canvas(container, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      });
      document.body.removeChild(container);

      const { jsPDF } = (window as any).jspdf;
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > -0.5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`街篮2_${rangeLabel}周报_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF 导出失败:', err);
    }
  }, [report, dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载数据中...</p>
      </div>
    );
  }

  const rangeLabel = dateRange === 'week' ? '本周' : dateRange === 'twoweeks' ? '近两周' : '本月';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">周报生成</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">自动生成玩家反馈周报</p>
            </div>
            {report && (
              <div className="flex items-center gap-2 shrink-0">
                <ShareDialog
                  reportTitle={`${rangeLabel}玩家反馈周报`}
                  totalFeedback={report.totalFeedback}
                  avgScore={report.avgScore}
                  positiveRate={report.positiveRate}
                  summary={`本周共收到${report.totalFeedback}条玩家反馈，平均评分${report.avgScore}，正面率${report.positiveRate}%`}
                />
                <Button onClick={handleExportPDF} size="sm" className="bg-primary hover:bg-primary/90 gap-1.5 text-xs md:text-sm">
                  <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">导出周报 PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Controls */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">生成设置</CardTitle>
            <CardDescription>选择时间范围后生成周报</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {([["week", "本周"], ["twoweeks", "近两周"], ["month", "本月"]] as const).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={dateRange === key ? "default" : "outline"}
                    onClick={() => setDateRange(key)}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
              <Button onClick={generateReport} disabled={generating || allData.length === 0} className="gap-2">
                <BarChart3 className="w-4 h-4" />
                {generating ? '生成中...' : '生成周报'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              当前数据总量: {allData.length} 条
              {allData.length > 0 && ` · 有时间的数据: ${allData.filter(d => (d.created_at || d.timestamp || d.date || 0) > 0).length} 条`}
            </p>
          </CardContent>
        </Card>

        {/* Report */}
        {report && (
          <div ref={reportRef}>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{report.totalFeedback}</div>
                  <p className="text-sm text-muted-foreground mt-1">反馈总数</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{report.avgScore}</div>
                  <p className="text-sm text-muted-foreground mt-1">平均评分</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-success">{report.positiveRate}%</div>
                  <p className="text-sm text-muted-foreground mt-1">正面率</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-destructive">{report.negativeRate}%</div>
                  <p className="text-sm text-muted-foreground mt-1">负面率</p>
                </CardContent>
              </Card>
            </div>

            {/* Category & Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">问题分类分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(report.categoryDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm text-foreground">{cat}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">{count}</span>
                            <span className="text-xs text-muted-foreground">({Math.round(count / report.totalFeedback * 100)}%)</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">热门关键词</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.topKeywords.map(kw => (
                      <Badge key={kw.keyword} variant="secondary" className="text-xs">
                        {kw.keyword} ×{kw.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Issues */}
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  紧急问题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topIssues.map(issue => (
                    <div key={issue.issue} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Badge variant={issue.severity === 'critical' ? 'destructive' : issue.severity === 'high' ? 'default' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                        <span className="text-sm text-foreground">{issue.issue}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{issue.count} 条</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Feedback */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  典型负面反馈
                </CardTitle>
                <CardDescription>需要重点关注的玩家声音</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.sampleFeedback.map((fb, i) => (
                    <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="text-xs">负面</Badge>
                        {fb.score > 0 && <span className="text-xs text-muted-foreground">评分: {fb.score}</span>}
                      </div>
                      <p className="text-sm text-foreground/80">{fb.content}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!report && !generating && (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">选择时间范围后点击"生成周报"</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
