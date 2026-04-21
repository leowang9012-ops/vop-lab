import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { mockTopKeywords } from "@/data/mock";
import { cn } from "@/lib/utils";

export function KeywordsCloud() {
  return (
    <div className="flex flex-wrap gap-2">
      {mockTopKeywords.map((keyword, index) => {
        const size = Math.max(12, Math.min(18, 12 + keyword.count / 10));
        return (
          <motion.div
            key={keyword.word}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.08,
              transition: { duration: 0.2 }
            }}
          >
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1.5 cursor-pointer transition-colors",
                keyword.sentiment === "positive" && "border-success/50 text-success hover:bg-success/10",
                keyword.sentiment === "negative" && "border-destructive/50 text-destructive hover:bg-destructive/10",
                keyword.sentiment === "neutral" && "border-info/50 text-info hover:bg-info/10"
              )}
              style={{ fontSize: `${size}px` }}
            >
              {keyword.word}
              <span className="ml-1.5 opacity-60 text-xs">{keyword.count}</span>
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}
