import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, FileDown } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";

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
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string>("");

  useEffect(() => {
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
        setLoading(false);
      });
  }, []);

  const reportRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = useCallback(async () => {
    if (!report) return;
    setExporting(true);
    setExportError("");

    try {
      // 动态加载 jsPDF（不依赖 html2canvas，避免 oklab 颜色问题）
      const loadScript = (url: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`CDN ${url} 加载失败`));
          document.head.appendChild(script);
        });

      if (!(window as any).jspdf) {
        await loadScript('https://cdn.bootcdn.net/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // 中文字体支持：使用 jsPDF 内置字体，中文用 fallback
      pdf.setFont('helvetica', 'normal');
      
      // 标题
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 26);
      pdf.text(report.title, margin, y);
      y += 10;

      // 摘要
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(102, 102, 102);
      const summaryLines = pdf.splitTextToSize(report.summary, contentWidth);
      pdf.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 5;

      // 分隔线
      pdf.setDrawColor(108, 92, 231);
      pdf.setLineWidth(0.8);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      // 报告正文
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(26, 26, 26);

      const lines = report.content.split('\n');
      for (const line of lines) {
        // 检查是否需要新页
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = margin;
        }

        if (line.startsWith('## ')) {
          y += 4;
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(26, 26, 26);
          const titleText = line.slice(3);
          pdf.text(titleText, margin, y);
          y += 7;
          // 下划线
          pdf.setDrawColor(108, 92, 231);
          pdf.setLineWidth(0.5);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 5;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
        } else if (line.startsWith('### ')) {
          y += 3;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(line.slice(4), margin, y);
          y += 6;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
        } else if (line.startsWith('- ')) {
          const text = line.slice(2);
          const bulletLines = pdf.splitTextToSize(`• ${text}`, contentWidth - 5);
          for (const bl of bulletLines) {
            if (y > pageHeight - 15) { pdf.addPage(); y = margin; }
            pdf.text(bl, margin + 5, y);
            y += 5;
          }
        } else if (line.startsWith('> ')) {
          y += 2;
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 100, 100);
          const quoteLines = pdf.splitTextToSize(line.slice(2), contentWidth - 5);
          for (const ql of quoteLines) {
            if (y > pageHeight - 15) { pdf.addPage(); y = margin; }
            pdf.text(ql, margin + 5, y);
            y += 5;
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(26, 26, 26);
          y += 2;
        } else if (line.startsWith('|')) {
          // 跳过表格分隔行
          if (!line.includes('---')) {
            const cells = line.split('|').filter(c => c.trim() !== '');
            const tableText = cells.map(c => c.trim()).join('  |  ');
            const tableLines = pdf.splitTextToSize(tableText, contentWidth);
            for (const tl of tableLines) {
              if (y > pageHeight - 15) { pdf.addPage(); y = margin; }
              pdf.setFontSize(9);
              pdf.text(tl, margin, y);
              y += 4;
            }
            pdf.setFontSize(11);
          }
        } else if (line.trim() === '') {
          y += 3;
        } else {
          // 普通段落
          const text = line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
          const paraLines = pdf.splitTextToSize(text, contentWidth);
          for (const pl of paraLines) {
            if (y > pageHeight - 15) { pdf.addPage(); y = margin; }
            pdf.text(pl, margin, y);
            y += 5;
          }
        }
      }

      const filename = `${report.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setExportError(`导出失败: ${msg}`);
      console.error('PDF 导出失败:', err);
    } finally {
      setExporting(false);
    }
  }, [report]);

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
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border relative">
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
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              下载 Markdown
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={exporting}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <FileDown className="w-4 h-4" />
              {exporting ? '导出中...' : '导出 PDF'}
            </Button>
          </div>
          {exportError && (
            <div className="absolute top-20 right-8 z-50 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {exportError}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-6">
        <Card className="bg-card border-border" ref={reportRef}>
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

// Markdown 渲染组件
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
