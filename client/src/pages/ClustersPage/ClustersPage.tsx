import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareWarning, TrendingUp, Frown, AlertTriangle, ArrowLeft } from "lucide-react";

interface ClusterKeyword {
  word: string;
  count: number;
}

interface RepresentativeFeedback {
  id: string;
  content: string;
  sentiment: string;
  urgency: string;
  source: string;
  score: number;
  keywords: string[];
}

interface Cluster {
  id: string;
  rank: number;
  themeName: string;
  themeEmoji: string;
  description: string;
  keywords: ClusterKeyword[];
  primaryCategory: string;
  feedbackCount: number;
  criticalCount: number;
  sampleCount: number;
  representatives: RepresentativeFeedback[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryBreakdown: { name: string; count: number; pct: number }[];
}

interface ClusterData {
  generatedAt: string;
  totalFeedback: number;
  analyzedFeedback: number;
  clusterCount: number;
  method: string;
  clusters: Cluster[];
}

const sentimentColor = (sent: string) => {
  if (sent === "positive") return "text-success";
  if (sent === "negative") return "text-destructive";
  return "text-muted-foreground";
};

const urgencyBadge = (urgency: string) => {
  if (urgency === "critical") return "🔴 紧急";
  if (urgency === "high") return "🟠 高";
  if (urgency === "medium") return "🟡 中";
  return "⚪ 低";
};

const sourceLabel = (source: string) => {
  if (source === "questionnaire") return "📋 问卷";
  if (source === "taptap") return "🎮 TapTap";
  if (source === "appstore") return "🍎 App Store";
  return source;
};

export default function ClustersPage() {
  const [data, setData] = useState<ClusterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    fetch("/vop-lab/data/clusters.json")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: ClusterData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载聚类数据中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">暂无聚类数据</p>
      </div>
    );
  }

  if (selectedCluster) {
    return <ClusterDetail cluster={selectedCluster} onBack={() => setSelectedCluster(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-lg md:text-xl font-bold text-foreground">语义聚类</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            基于 {data.analyzedFeedback.toLocaleString()} 条反馈 AI 发现 {data.clusterCount} 个问题主题
          </p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-6">
        {/* 概览卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{data.totalFeedback.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">总反馈数</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{data.clusterCount}</p>
            <p className="text-xs text-muted-foreground mt-1">发现问题主题</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{data.clusters.reduce((s, c) => s + c.criticalCount, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">紧急问题条数</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{data.clusters.filter(c => c.sentiment.negative > 40).length}</p>
            <p className="text-xs text-muted-foreground mt-1">高负面主题数</p>
          </CardContent></Card>
        </div>

        {/* 主题网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.clusters.map((cluster) => (
            <motion.div
              key={cluster.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedCluster(cluster)}
              className="cursor-pointer"
            >
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cluster.themeEmoji}</span>
                      <CardTitle className="text-base">{cluster.themeName}</CardTitle>
                    </div>
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                      #{cluster.rank}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cluster.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 关键数据 */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">反馈数</span>
                    <span className="font-bold text-foreground">{cluster.feedbackCount.toLocaleString()} 条</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">紧急问题</span>
                    <span className="font-bold text-destructive">{cluster.criticalCount} 条</span>
                  </div>

                  {/* 情感分布条 */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">情感分布</p>
                    <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                      {cluster.sentiment.positive > 0 && (
                        <div className="bg-success" style={{ width: cluster.sentiment.positive + "%" }} />
                      )}
                      {cluster.sentiment.neutral > 0 && (
                        <div className="bg-muted-foreground/50" style={{ width: cluster.sentiment.neutral + "%" }} />
                      )}
                      {cluster.sentiment.negative > 0 && (
                        <div className="bg-destructive" style={{ width: cluster.sentiment.negative + "%" }} />
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>🟢 {cluster.sentiment.positive}%</span>
                      <span>⚪ {cluster.sentiment.neutral}%</span>
                      <span>🔴 {cluster.sentiment.negative}%</span>
                    </div>
                  </div>

                  {/* 关键词 */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">关键词</p>
                    <div className="flex flex-wrap gap-1">
                      {cluster.keywords.slice(0, 6).map((kw) => (
                        <span key={kw.word} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {kw.word} ({kw.count})
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          生成时间: {new Date(data.generatedAt).toLocaleString("zh-CN")} · {data.method}
        </p>
      </main>
    </div>
  );
}

function ClusterDetail({ cluster, onBack }: { cluster: Cluster; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cluster.themeEmoji}</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">{cluster.themeName}</h1>
              <p className="text-xs text-muted-foreground">{cluster.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-6">
        {/* 数据概览 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{cluster.feedbackCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">反馈总数</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{cluster.criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">紧急问题</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{cluster.sentiment.negative}%</p>
            <p className="text-xs text-muted-foreground mt-1">负面率</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{cluster.primaryCategory}</p>
            <p className="text-xs text-muted-foreground mt-1">主要分类</p>
          </CardContent></Card>
        </div>

        {/* 关键词 */}
        <Card>
          <CardHeader><CardTitle className="text-base">🔑 关键词权重</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cluster.keywords.map((kw) => (
                <span key={kw.word} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                  {kw.word} <span className="text-primary/60">×{kw.count}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 代表反馈 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">📋 代表反馈样本（{cluster.representatives.length} 条）</h2>
          <div className="space-y-3">
            {cluster.representatives.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-xs font-medium ${sentimentColor(item.sentiment)}`}>
                      {item.sentiment === "positive" ? "🟢 正面" : item.sentiment === "negative" ? "🔴 负面" : "⚪ 中性"}
                    </span>
                    <span className="text-xs text-muted-foreground">{urgencyBadge(item.urgency)}</span>
                    <span className="text-xs text-muted-foreground">{sourceLabel(item.source)}</span>
                    {item.keywords && item.keywords.length > 0 && (
                      <span className="text-xs text-muted-foreground">关键词: {item.keywords.slice(0, 4).join(", ")}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 分类分布 */}
        {cluster.categoryBreakdown && cluster.categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">📊 原始分类分布</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cluster.categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-24 truncate">{cat.name}</span>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: cat.pct + "%" }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">{cat.count} 条 ({cat.pct}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
