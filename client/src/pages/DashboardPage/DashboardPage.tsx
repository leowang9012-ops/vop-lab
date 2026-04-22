import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareWarning, TrendingUp, Frown, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";

interface ReportData {
  totalFeedback: number;
  avgScore: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  urgencyDistribution: Record<string, number>;
  sourceDistribution?: Record<string, number>;
  topKeywords: { word: string; count: number }[];
  categoryAvgScores: { category: string; avgScore: number; count: number }[];
  urgentIssues: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const statsConfig = [
  { label: "总反馈数", key: "totalFeedback", icon: MessageSquareWarning, color: "text-primary", bgColor: "bg-primary/10", format: (v: number) => v.toLocaleString() },
  { label: "平均评分", key: "avgScore", icon: TrendingUp, color: "text-success", bgColor: "bg-success/10", format: (v: number) => v.toFixed(1) },
  { label: "负面反馈占比", key: "negativeRatio", icon: Frown, color: "text-warning", bgColor: "bg-warning/10", format: (v: number) => `${v}%` },
  { label: "紧急问题", key: "urgentIssues", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10", format: (v: number) => v.toString() },
];

export default function DashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentProject } = useProject();

  useEffect(() => {
    fetch(`/vop-lab/data/report_latest.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const total = data.totalFeedback || 1;
        const negativeCount = data.sentimentDistribution?.negative || 0;
        // 兼容 topKeywords 格式：可能是 string[] 或 {word, count}[]
        const topKeywords = Array.isArray(data.topKeywords)
          ? data.topKeywords.map((item: any) => typeof item === 'string' ? { word: item, count: 0 } : item)
          : [];
        setReport({
          ...data,
          topKeywords,
          negativeRatio: Math.round(negativeCount / total * 100),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载数据中...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">暂无数据，请先构建项目</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">数据看板</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {currentProject ? `${currentProject.name} · 实时监控玩家反馈动态` : "实时监控玩家反馈动态"}
            </p>
          </div>
        </div>
      </header>

      <motion.main
        className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <motion.div variants={itemVariants}>
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
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.1, ease: "easeOut" } },
                  }}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-card border-border h-full">
                    <CardContent className="p-3 md:p-5">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-lg md:text-2xl font-bold text-foreground">{stat.format(value)}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
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
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">反馈分类分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(report.categoryDistribution).map(([cat, count]) => {
                  const pct = Math.round(count / report.totalFeedback * 100);
                  return (
                    <div key={cat} className="p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <p className="text-xl md:text-2xl font-bold text-foreground">{count}</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{cat}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Distribution */}
        {report.sourceDistribution && Object.keys(report.sourceDistribution).length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">数据来源分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(report.sourceDistribution).map(([source, count]) => {
                    const label = source === 'questionnaire' ? '问卷反馈' : source === 'taptap' ? 'TapTap' : source === 'appstore' ? 'App Store' : source;
                    const pct = Math.round(count / report.totalFeedback * 100);
                    const icon = source === 'questionnaire' ? '📋' : source === 'taptap' ? '🎮' : source === 'appstore' ? '🍎' : '📊';
                    return (
                      <div key={source} className="p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/50">
                        <p className="text-lg md:text-2xl font-bold text-foreground">{icon} {count}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Scores */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">各维度平均评分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.categoryAvgScores
                  .sort((a, b) => a.avgScore - b.avgScore)
                  .map(({ category, avgScore, count }) => {
                    const pct = Math.round(avgScore / 100 * 100);
                    const color = avgScore >= 55 ? "bg-success" : avgScore >= 45 ? "bg-warning" : "bg-destructive";
                    return (
                      <div key={category} className="flex items-center gap-2 md:gap-4">
                        <span className="text-xs md:text-sm text-foreground w-16 md:w-24 truncate">{category}</span>
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-foreground w-12 md:w-16 text-right">{avgScore.toFixed(1)}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground w-10 md:w-12 text-right">({count}条)</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Keywords & Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">热门关键词 TOP10</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.topKeywords.slice(0, 10).map(({ word, count }, i) => (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6 text-right">{i + 1}</span>
                      <span className="text-sm text-foreground flex-1">{word}</span>
                      <span className="text-sm font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">情感分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(report.sentimentDistribution).map(([sentiment, count]) => {
                    const label = sentiment === "positive" ? "正面" : sentiment === "negative" ? "负面" : "中性";
                    const color = sentiment === "positive" ? "bg-success" : sentiment === "negative" ? "bg-destructive" : "bg-muted";
                    const pct = Math.round(count / report.totalFeedback * 100);
                    return (
                      <div key={sentiment}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{label}</span>
                          <span className="text-sm font-semibold text-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
