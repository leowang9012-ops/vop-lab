import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockReport } from "@/data/mock";
import { Download, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ReportPage() {
  const report = mockReport;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">分析报告</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI 生成的玩家反馈分析报告</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="this-week">
              <SelectTrigger className="w-[160px] bg-card border-border gap-2">
                <Calendar className="w-4 h-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">本周报告</SelectItem>
                <SelectItem value="last-week">上周报告</SelectItem>
                <SelectItem value="this-month">本月报告</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Download className="w-4 h-4" />
              下载报告
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-6">
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    自动生成
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    生成时间: {format(new Date(report.createdAt), "yyyy-MM-dd HH:mm")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 p-3 bg-secondary/30 rounded-lg">
              {report.summary}
            </p>
          </CardHeader>
          <CardContent className="py-6">
            <div className="max-w-none">
              <ReportContent content={report.content} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// 简单的 Markdown 渲染组件
function ReportContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-lg font-bold text-foreground mt-6 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-base font-semibold text-foreground mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={index} className="text-sm text-foreground/80 ml-4 list-disc">
          {renderInlineFormat(line.slice(2))}
        </li>
      );
    } else if (line.match(/^\d+\./)) {
      elements.push(
        <li key={index} className="text-sm text-foreground/80 ml-4 list-decimal">
          {renderInlineFormat(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<br key={index} />);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={index} className="text-sm font-semibold text-foreground mt-2">
          {line.slice(2, -2)}
        </p>
      );
    } else {
      elements.push(
        <p key={index} className="text-sm text-foreground/80 my-1">
          {renderInlineFormat(line)}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

function renderInlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
