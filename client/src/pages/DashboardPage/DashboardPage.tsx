import { motion } from "framer-motion";
import { StatsCards } from "./components/stats-cards";
import { CategoryPieChart } from "./components/category-pie-chart";
import { SentimentTrendChart } from "./components/sentiment-trend-chart";
import { KeywordsCloud } from "./components/keywords-cloud";
import { UrgentFeedbackList } from "./components/urgent-feedback-list";
import { ProjectSelector } from "./components/project-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">数据看板</h1>
            <p className="text-sm text-muted-foreground mt-0.5">实时监控玩家反馈动态</p>
          </div>
          <ProjectSelector />
        </div>
      </header>

      {/* Main Content */}
      <motion.main 
        className="max-w-[1600px] mx-auto px-8 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <motion.div variants={itemVariants}>
          <StatsCards />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">反馈分类分布</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">情感趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentTrendChart />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Keywords & Urgent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">热门关键词</CardTitle>
              </CardHeader>
              <CardContent>
                <KeywordsCloud />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">紧急问题</CardTitle>
              </CardHeader>
              <CardContent>
                <UrgentFeedbackList />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
