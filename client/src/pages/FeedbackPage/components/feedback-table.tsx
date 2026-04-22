import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeedbackItem } from "../FeedbackPage";

const sentimentLabels: Record<string, { label: string; className: string }> = {
  positive: { label: "正面", className: "bg-success/10 text-success border-success/30" },
  neutral: { label: "中性", className: "bg-info/10 text-info border-info/30" },
  negative: { label: "负面", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const urgencyLabels: Record<string, { label: string; className: string }> = {
  low: { label: "低", className: "bg-muted text-muted-foreground" },
  medium: { label: "中", className: "bg-info text-info-foreground" },
  high: { label: "高", className: "bg-warning text-warning-foreground" },
  critical: { label: "紧急", className: "bg-destructive text-destructive-foreground" },
};

interface FeedbackTableProps {
  feedbacks: FeedbackItem[];
}

export function FeedbackTable({ feedbacks }: FeedbackTableProps) {
  return (
    <div className="overflow-x-auto">
    <Table className="min-w-[640px]">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground font-medium">反馈内容</TableHead>
          <TableHead className="text-muted-foreground font-medium w-[100px]">分类</TableHead>
          <TableHead className="text-muted-foreground font-medium w-[80px]">情感</TableHead>
          <TableHead className="text-muted-foreground font-medium w-[80px]">紧急度</TableHead>
          <TableHead className="text-muted-foreground font-medium w-[80px]">评分</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedbacks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
              没有匹配的反馈数据
            </TableCell>
          </TableRow>
        ) : (
          feedbacks.map((feedback) => (
            <TableRow
              key={feedback.id}
              className="border-border hover:bg-secondary/30 transition-colors"
            >
              <TableCell>
                <div className="max-w-[500px]">
                  <p className="text-sm text-foreground line-clamp-2">{feedback.content}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {feedback.keywords.slice(0, 3).map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs text-muted-foreground">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {feedback.category}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", sentimentLabels[feedback.sentiment]?.className)}>
                  {sentimentLabels[feedback.sentiment]?.label || feedback.sentiment}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn("text-xs", urgencyLabels[feedback.urgency]?.className)}>
                  {urgencyLabels[feedback.urgency]?.label || feedback.urgency}
                </Badge>
              </TableCell>
              <TableCell className="text-sm font-semibold text-foreground">
                {feedback.score?.toFixed(0) || '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
    </div>
  );
}
