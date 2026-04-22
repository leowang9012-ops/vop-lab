import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface TrendData {
  period1: PeriodData;
  period2: PeriodData;
}

interface PeriodData {
  label: string;
  dateRange: string;
  totalFeedback: number;
  avgScore: number;
  positiveRate: number;
  negativeRate: number;
  categoryDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  topKeywords: { keyword: string; count: number }[];
  topIssues: { issue: string; count: number; severity: string }[];
}

export default function TrendPage() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/trend_comparison.json`)
      .then(res => {
        if (!res.ok) throw new Error('Trend data not found');
        return res.json();
      })
      .then(data => {
        setTrendData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载趋势数据中...</p>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">暂无趋势数据，请先构建项目</p>
      </div>
    );
  }

  const { period1, period2 } = trendData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-lg md:text-xl font-bold text-foreground">趋势对比</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">不同时间段反馈数据对比分析</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Period Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {period1.label}
              </CardTitle>
              <CardDescription>{period1.dateRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <MetricCard label="反馈数" value={period1.totalFeedback} />
                <MetricCard label="平均分" value={period1.avgScore} />
                <MetricCard label="正面率" value={`${period1.positiveRate}%`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {period2.label}
              </CardTitle>
              <CardDescription>{period2.dateRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <MetricCard label="反馈数" value={period2.totalFeedback} />
                <MetricCard label="平均分" value={period2.avgScore} />
                <MetricCard label="正面率" value={`${period2.positiveRate}%`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Changes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">关键变化</CardTitle>
            <CardDescription>核心指标对比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <ChangeCard
                label="反馈量"
                before={period1.totalFeedback}
                after={period2.totalFeedback}
                higher="neutral"
              />
              <ChangeCard
                label="平均评分"
                before={period1.avgScore}
                after={period2.avgScore}
                higher="good"
              />
              <ChangeCard
                label="正面评价率"
                before={period1.positiveRate}
                after={period2.positiveRate}
                suffix="%"
                higher="good"
              />
              <ChangeCard
                label="负面评价率"
                before={period1.negativeRate}
                after={period2.negativeRate}
                suffix="%"
                higher="bad"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">问题分类对比</CardTitle>
              <CardDescription>各分类反馈数量变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.keys({ ...period1.categoryDistribution, ...period2.categoryDistribution })
                  .sort((a, b) => (period2.categoryDistribution[b] || 0) - (period2.categoryDistribution[a] || 0))
                  .map(cat => {
                    const before = period1.categoryDistribution[cat] || 0;
                    const after = period2.categoryDistribution[cat] || 0;
                    const change = after - before;
                    const changePercent = before > 0 ? Math.round((change / before) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm text-foreground">{cat}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground w-12 text-right">{before}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-foreground w-12 text-right font-medium">{after}</span>
                          <ChangeBadge change={change} percent={changePercent} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">情感分布对比</CardTitle>
              <CardDescription>正面/中性/负面占比变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['positive', 'neutral', 'negative'].map(sentiment => {
                  const label = sentiment === 'positive' ? '正面' : sentiment === 'negative' ? '负面' : '中性';
                  const color = sentiment === 'positive' ? 'text-success' : sentiment === 'negative' ? 'text-destructive' : 'text-muted-foreground';
                  const before = period1.sentimentDistribution[sentiment] || 0;
                  const after = period2.sentimentDistribution[sentiment] || 0;
                  const change = after - before;
                  return (
                    <div key={sentiment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${color}`}>{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{before}%</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-sm font-medium ${color}`}>{after}%</span>
                          <ChangeBadge change={change} />
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sentiment === 'positive' ? 'bg-success' : sentiment === 'negative' ? 'bg-destructive' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${after}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Keywords */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">热门关键词变化</CardTitle>
            <CardDescription>两个时间段被提及最多的关键词</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{period1.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {period1.topKeywords.map(kw => (
                    <Badge key={kw.keyword} variant="secondary" className="text-xs">
                      {kw.keyword} ×{kw.count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{period2.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {period2.topKeywords.map(kw => (
                    <Badge key={kw.keyword} variant="secondary" className="text-xs">
                      {kw.keyword} ×{kw.count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">紧急问题追踪</CardTitle>
            <CardDescription>需要持续关注的高优先级问题</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-semibold text-foreground">问题</th>
                    <th className="px-4 py-2 text-center font-semibold text-foreground">{period1.label}</th>
                    <th className="px-4 py-2 text-center font-semibold text-foreground">{period2.label}</th>
                    <th className="px-4 py-2 text-center font-semibold text-foreground">变化</th>
                    <th className="px-4 py-2 text-center font-semibold text-foreground">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {period2.topIssues.map(issue => {
                    const beforeIssue = period1.topIssues.find(i => i.issue === issue.issue);
                    const before = beforeIssue?.count || 0;
                    const after = issue.count;
                    const change = after - before;
                    return (
                      <tr key={issue.issue} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="px-4 py-3 text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{issue.issue}</span>
                            <Badge variant={issue.severity === 'critical' ? 'destructive' : issue.severity === 'high' ? 'default' : 'secondary'} className="text-[10px]">
                              {issue.severity}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{before}</td>
                        <td className="px-4 py-3 text-center text-foreground font-medium">{after}</td>
                        <td className="px-4 py-3 text-center">
                          <ChangeBadge change={change} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {change > 0 ? <TrendingUp className="w-4 h-4 text-destructive inline" /> : change < 0 ? <TrendingDown className="w-4 h-4 text-success inline" /> : <Minus className="w-4 h-4 text-muted-foreground inline" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ChangeCard({ label, before, after, suffix = "", higher = "neutral" }: {
  label: string;
  before: number;
  after: number;
  suffix?: string;
  higher?: "good" | "bad" | "neutral";
}) {
  const change = after - before;
  const changePercent = before !== 0 ? Math.round((change / Math.abs(before)) * 100) : 0;
  const isPositive = higher === "good" ? change > 0 : higher === "bad" ? change < 0 : false;
  const isNegative = higher === "good" ? change < 0 : higher === "bad" ? change > 0 : false;

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-muted-foreground">{before}{suffix}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-xl font-bold text-foreground">{after}{suffix}</span>
      </div>
      <div className="mt-2">
        {change === 0 ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Minus className="w-3 h-3" /> 无变化
          </span>
        ) : isPositive ? (
          <span className="text-xs text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{changePercent}%
          </span>
        ) : isNegative ? (
          <span className="text-xs text-destructive flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> {changePercent}%
          </span>
        ) : (
          <span className={`text-xs flex items-center gap-1 ${change > 0 ? 'text-destructive' : 'text-success'}`}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{changePercent}%
          </span>
        )}
      </div>
    </div>
  );
}

function ChangeBadge({ change, percent }: { change: number; percent?: number }) {
  if (change === 0) {
    return <Badge variant="secondary" className="text-xs">—</Badge>;
  }
  const displayPercent = percent !== undefined ? `${change > 0 ? '+' : ''}${percent}%` : `${change > 0 ? '+' : ''}${change}`;
  return (
    <Badge
      variant={change > 0 ? 'destructive' : 'default'}
      className="text-xs w-16 justify-center"
    >
      {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
      {displayPercent}
    </Badge>
  );
}
