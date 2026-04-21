import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUrgentFeedbacks } from "@/data/mock";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const urgencyColors = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-info text-info-foreground",
  low: "bg-muted text-muted-foreground",
};

const urgencyLabels = {
  critical: "紧急",
  high: "高",
  medium: "中",
  low: "低",
};

const categoryLabels: Record<string, string> = {
  bug: "Bug",
  feature: "功能",
  balance: "平衡",
  performance: "性能",
  ui: "UI",
  audio: "音频",
  story: "剧情",
  other: "其他",
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.08,
      ease: "easeOut" as const,
    },
  }),
};

export function UrgentFeedbackList() {
  const urgentItems = mockUrgentFeedbacks.slice(0, 5);

  return (
    <ScrollArea className="h-[240px]">
      <div className="space-y-3 pr-2">
        {urgentItems.map((feedback, index) => (
          <motion.div
            key={feedback.id}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ 
              x: 4,
              transition: { duration: 0.2 }
            }}
            className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{feedback.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[feedback.category] || feedback.category}
                  </Badge>
                  <Badge className={cn("text-xs", urgencyColors[feedback.urgency])}>
                    {urgencyLabels[feedback.urgency]}
                  </Badge>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(feedback.createdAt), "MM-dd")}
              </span>
            </div>
          </motion.div>
        ))}
        
        {urgentItems.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            暂无紧急问题
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
