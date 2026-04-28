import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareWarning, TrendingUp, Frown, AlertTriangle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useGlobalFilter } from "@/contexts/FilterContext";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";

interface FeedbackItem {
  id: string;
  content: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  timestamp: string;
  keywords: string[];
  score: number;
  source?: string;
}

interface ReportData {
  totalFeedback: number;
  avgScore: number;
  negativeRatio: number;
  urgentIssues: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  topKeywords: { word: string; count: number }[];
  categoryAvgScores: { category: string; avgScore: number; count: number }[];
}

function computeStats(items: FeedbackItem[]): ReportData {
  const total = items.length;
  if (total === 0) {
    return { totalFeedback: 0, avgScore: 0, negativeRatio: 0, urgentIssues: 0,
      sentimentDistribution: {}, categoryDistribution: {}, sourceDistribution: {},
      topKeywords: [], categoryAvgScores: [] };
  }

  const sentimentDist: Record<string, number> = {};
  const categoryDist: Record<string, number> = {};
  const sourceDist: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};
  const categoryScores: Record<string, { total: number; count: number }> = {};
  let totalScore = 0;
  let negativeCount = 0;
  let urgentCount = 0;

  for (const item of items) {
    sentimentDist[item.sentiment] = (sentimentDist[item.sentiment] || 0) + 1;
    categoryDist[item.category] = (categoryDist[item.category] || 0) + 1;
    if (item.source) sourceDist[item.source] = (sourceDist[item.source] || 0) + 1;
    if (item.sentiment === "negative") negativeCount++;
    if (item.urgency === "critical" || item.urgency === "high") urgentCount++;
    totalScore += item.score;
    for (const kw of item.keywords) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
    if (item.category) {
      if (!categoryScores[item.category]) categoryScores[item.category] = { total: 0, count: 0 };
      categoryScores[item.category].total += item.score;
      categoryScores[item.category].count++;
    }
  }

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const categoryAvgScores = Object.entries(categoryScores)
    .map(([category, { total, count }]) => ({ category, avgScore: Math.round(total / count * 10) / 10, count }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return {
    totalFeedback: total,
    avgScore: Math.round(totalScore / total * 10) / 10,
    negativeRatio: Math.round(negativeCount / total * 100),
    urgentIssues: urgentCount,
    sentimentDistribution: sentimentDist,
    categoryDistribution: categoryDist,
    sourceDistribution: sourceDist,
    topKeywords,
    categoryAvgScores,
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const statsConfig = [
  { label: "总反馈数", key: "totalFeedback", icon: MessageSquareWarning, color: "text-primary", accentLine: "from-primary/60 to-primary/0", format: (v: number) => v.toLocaleString() },
  { label: "平均评分", key: "avgScore", icon: TrendingUp, color: "text-success", accentLine: "from-success/60 to-success/0", format: (v: number) => v.toFixed(1) },
  { label: "负面反馈占比", key: "negativeRatio", icon: Frown, color: "text-warning", accentLine: "from-warning/60 to-warning/0", format: (v: number) => `${v}%` },
  { label: "紧急问题", key: "urgentIssues", icon: AlertTriangle, color: "text-destructive", accentLine: "from-destructive/60 to-destructive/0", format: (v: number) => v.toString() },
];

export default function DashboardPage() {
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentProject, currentDataDir } = useProject();
  const { applyGlobalFilter, source, dateRange } = useGlobalFilter();

  useEffect(() => {
    if (!currentDataDir) return;
    setLoading(true);
    fetch(`/vop-lab/data/projects/${currentDataDir}/feedback_processed.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setAllFeedbacks(data); setLoading(false); })
      .catch(() => { setAllFeedbacks([]); setLoading(false); });
  }, [currentDataDir]);

  const report = useMemo(() => {
    const filtered = allFeedbacks.filter(applyGlobalFilter);
    return computeStats(filtered);
  }, [allFeedbacks, applyGlobalFilter, source, dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground font-display tracking-tight">数据看板</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {currentProject ? `${currentProject.name} · 实时监控玩家反馈动态` : "实时监控玩家反馈动态"}
            </p>
          </div>
          <GlobalFilterBar />
        </div>
      </header>

      <motion.main
        className="max-w-[1600px] mx-auto px-4 md:px-8 py-5 md:py-7 space-y-5 md:space-y-7"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat, index) => {
              const Icon = stat.icon;
              const value = stat.key === "negativeRatio"
                ? report.negativeRatio
                : (report as any)[stat.key] ?? 0;
              return (
                <motion.div
                  key={stat.label}
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <Card className="glow-card stat-card h-full">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${stat.accentLine} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xl md:text-2xl font-bold text-foreground font-display tracking-tight animate-count-up">{stat.format(value)}</p>
                          <p className="text-xs md:text-[13px] text-muted-foreground mt-0.5">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <Card className="glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">反馈分类分布</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(report.categoryDistribution).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">筛选条件下暂无数据</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(report.categoryDistribution).map(([cat, count]) => {
                    const pct = Math.round(count / report.totalFeedback * 100);
                    return (
                      <div key={cat} className="group p-3 md:p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/20 transition-all duration-300">
                        <p className="text-xl md:text-2xl font-bold text-foreground font-display tracking-tight">{count}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{cat}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] md:text-xs text-muted-foreground font-display">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Distribution */}
        {Object.keys(report.sourceDistribution).length > 0 && (
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="glow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">数据来源分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(report.sourceDistribution).map(([src, count]) => {
                    const label = src === 'questionnaire' ? '问卷反馈' : src === 'taptap' ? 'TapTap' : src === 'appstore' ? 'App Store' : src;
                    const pct = Math.round(count / report.totalFeedback * 100);
                    return (
                      <div key={src} className="p-3 md:p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${src === 'questionnaire' ? 'bg-chart-1' : src === 'taptap' ? 'bg-chart-2' : 'bg-chart-3'}`} />
                          <p className="text-lg md:text-xl font-bold text-foreground font-display">{count}</p>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1.5">{label}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${src === 'questionnaire' ? 'bg-chart-1/60' : src === 'taptap' ? 'bg-chart-2/60' : 'bg-chart-3/60'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-display">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Scores */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <Card className="glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">各维度平均评分</CardTitle>
            </CardHeader>
            <CardContent>
              {report.categoryAvgScores.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">筛选条件下暂无数据</p>
              ) : (
                <div className="space-y-4">
                  {report.categoryAvgScores
                    .sort((a, b) => a.avgScore - b.avgScore)
                    .map(({ category, avgScore, count }) => {
                      const pct = Math.round(avgScore / 100 * 100);
                      const barColor = avgScore >= 55 ? "bg-success" : avgScore >= 45 ? "bg-warning" : "bg-destructive";
                      const barGlow = avgScore >= 55 ? "shadow-[0_0_8px_hsl(152_69%_42%_/_0.3)]" : avgScore >= 45 ? "shadow-[0_0_8px_hsl(38_92%_50%_/_0.3)]" : "shadow-[0_0_8px_hsl(0_78%_57%_/_0.3)]";
                      return (
                        <div key={category} className="flex items-center gap-3 md:gap-4">
                          <span className="text-xs md:text-sm text-foreground w-16 md:w-24 truncate">{category}</span>
                          <div className="flex-1 h-2.5 bg-secondary/60 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full progress-bar-glow transition-all duration-700 ${barGlow}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs md:text-sm font-bold text-foreground font-display w-12 md:w-16 text-right tabular-nums">{avgScore.toFixed(1)}</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground w-10 md:w-12 text-right">({count})</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Keywords & Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="glow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">热门关键词 TOP10</CardTitle>
              </CardHeader>
              <CardContent>
                {report.topKeywords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">筛选条件下暂无数据</p>
                ) : (
                  <div className="space-y-2.5">
                    {report.topKeywords.slice(0, 10).map(({ word, count }, i) => {
                      const maxCount = report.topKeywords[0]?.count || 1;
                      const barWidth = (count / maxCount) * 100;
                      return (
                        <div key={word} className="flex items-center gap-3 group">
                          <span className={`text-[11px] font-display w-5 text-right ${i < 3 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{i + 1}</span>
                          <span className="text-sm text-foreground flex-1">{word}</span>
                          <div className="w-20 md:w-28 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${i < 3 ? 'bg-primary/70' : 'bg-muted-foreground/30'}`} style={{ width: `${barWidth}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-foreground font-display tabular-nums w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="glow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">情感分布</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(report.sentimentDistribution).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">筛选条件下暂无数据</p>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(report.sentimentDistribution).map(([sentiment, count]) => {
                      const label = sentiment === "positive" ? "正面" : sentiment === "negative" ? "负面" : "中性";
                      const color = sentiment === "positive" ? "bg-success" : sentiment === "negative" ? "bg-destructive" : "bg-info";
                      const textColor = sentiment === "positive" ? "text-success" : sentiment === "negative" ? "text-destructive" : "text-info";
                      const pct = Math.round(count / report.totalFeedback * 100);
                      return (
                        <div key={sentiment}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${sentiment === "positive" ? "bg-success" : sentiment === "negative" ? "bg-destructive" : "bg-info"}`} />
                              <span className="text-sm text-foreground">{label}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-sm font-bold font-display ${textColor}`}>{count}</span>
                              <span className="text-xs text-muted-foreground">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full progress-bar-glow transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
