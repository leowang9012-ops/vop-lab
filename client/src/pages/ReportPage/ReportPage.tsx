import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface Report {
  id: number;
  title: string;
  periodStart: string;
  periodEnd: string;
  totalFeedback: number;
  avgScore: number;
  content: string;
  summary: string;
  createdAt: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 尝试加载真实报告
    fetch(`${import.meta.env.BASE_URL}data/report_latest.json`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        // 回退到空状态
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载报告中...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">暂无报告数据，请先构建项目</p>
      </div>
    );
  }

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
            <Badge variant="outline" className="text-xs">
              {report.totalFeedback} 份样本
            </Badge>
            <Button
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
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

// 改进的 Markdown 渲染组件
function ReportContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              {parseTableRow(tableRows[0], true)}
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                  {parseTableRowCells(row)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    // 表格行
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line);
      return;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-lg font-bold text-foreground mt-8 mb-3 pb-2 border-b border-border">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-base font-semibold text-foreground mt-5 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={index} className="text-sm text-muted-foreground border-l-4 border-primary/30 pl-4 py-2 my-3 bg-secondary/10 rounded-r">
          {renderInlineFormat(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={index} className="text-sm text-foreground/80 ml-4 list-disc leading-relaxed">
          {renderInlineFormat(line.slice(2))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={index} className="text-sm text-foreground/80 ml-4 list-decimal leading-relaxed">
          {renderInlineFormat(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={index} className="h-2" />);
    } else {
      elements.push(
        <p key={index} className="text-sm text-foreground/80 my-1.5 leading-relaxed">
          {renderInlineFormat(line)}
        </p>
      );
    }
  });

  if (inTable) flushTable();

  return <div>{elements}</div>;
}

function parseTableRow(line: string, isHeader: boolean) {
  const cells = line.split("|").filter(c => c.trim() !== "");
  const Tag = isHeader ? "th" : "td";
  return (
    <tr className={isHeader ? "bg-secondary/50" : ""}>
      {cells.map((cell, i) => (
        <Tag key={i} className={`px-4 py-2 text-left ${isHeader ? "font-semibold text-foreground border-b border-border" : "text-foreground/80 border-b border-border/50"}`}>
          {renderInlineFormat(cell.trim())}
        </Tag>
      ))}
    </tr>
  );
}

function parseTableRowCells(line: string) {
  const cells = line.split("|").filter(c => c.trim() !== "");
  return cells.map((cell, i) => (
    <td key={i} className="px-4 py-2 text-sm text-foreground/80 border-b border-border/50">
      {renderInlineFormat(cell.trim())}
    </td>
  ));
}

function renderInlineFormat(text: string): React.ReactNode {
  // 处理 **bold** 和内联代码
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-secondary/50 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
