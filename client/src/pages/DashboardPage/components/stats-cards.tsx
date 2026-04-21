import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardStats } from "@/data/mock";
import { MessageSquareWarning, TrendingUp, Frown, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "总反馈数",
    value: mockDashboardStats.totalFeedback.toLocaleString(),
    icon: MessageSquareWarning,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "本周新增",
    value: `+${mockDashboardStats.weeklyNew}`,
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "负面反馈占比",
    value: `${mockDashboardStats.negativeRatio}%`,
    icon: Frown,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    label: "紧急问题",
    value: mockDashboardStats.urgentIssues.toString(),
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
      ease: "easeOut" as const,
    },
  }),
};

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="bg-card border-border h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
