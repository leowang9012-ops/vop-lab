import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, FileDown } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { ShareDialog } from "@/components/ShareDialog";

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
      // 1. 加载 html2canvas + jsPDF
      const loadScript = (url: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${url}"]`);
          if (existing) { resolve(); return; }
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`CDN 加载失败: ${url}`));
          document.head.appendChild(script);
        });

      const cdnUrls = [
        {
          html2canvas: 'https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          jspdf: 'https://cdn.bootcdn.net/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        },
        {
          html2canvas: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
          jspdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
        },
      ];

      let loaded = false;
      for (const urls of cdnUrls) {
        try {
          if (!(window as any).html2canvas) await loadScript(urls.html2canvas);
          if (!(window as any).jspdf) await loadScript(urls.jspdf);
          loaded = true;
          break;
        } catch {
          continue;
        }
      }

      if (!loaded) {
        throw new Error('无法加载 PDF 生成库，请检查网络');
      }

      // 2. 创建干净的渲染容器（不用 Tailwind，用内联样式）
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        left: 0;
        top: -10000px;
        width: 800px;
        background: #ffffff;
        color: #1a1a1a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.8;
        padding: 40px;
      `;

      // 3. 构建报告 HTML
      const contentHtml = renderMarkdownToHtml(report.content);

      container.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0;">${report.title}</h1>
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 12px; color: #666; padding: 4px 12px; background: #f0f0f0; border-radius: 4px;">${report.totalFeedback} 份样本</span>
          <span style="font-size: 12px; color: #666; padding: 4px 12px; background: #f0f0f0; border-radius: 4px;">平均分 ${report.avgScore}</span>
        </div>
        <div style="padding: 12px 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 24px; font-size: 13px; color: #555;">
          ${report.summary}
        </div>
        <hr style="border: none; border-top: 2px solid #6c5ce7; margin: 0 0 24px 0;" />
        <div style="white-space: pre-wrap;">
          ${contentHtml}
        </div>
      `;

      document.body.appendChild(container);

      // 4. 截图
      const canvas = await (window as any).html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
      });

      document.body.removeChild(container);

      // 5. 生成 PDF
      const { jsPDF } = (window as any).jspdf;
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > -0.5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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
            <ShareDialog
              reportTitle={report.title}
              totalFeedback={report.totalFeedback}
              avgScore={report.avgScore}
              positiveRate={0}
              summary={report.summary}
            />
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

// Markdown → HTML（用于 PDF 导出，纯内联样式）
function renderMarkdownToHtml(content: string): string {
  return content
    .split('\n')
    .map(line => {
      if (line.startsWith('## ')) {
        return `<h2 style="font-size:18px;font-weight:bold;margin:24px 0 8px 0;padding-bottom:6px;border-bottom:2px solid #6c5ce7;color:#1a1a1a;">${escapeHtml(line.slice(3))}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 style="font-size:15px;font-weight:bold;margin:16px 0 6px 0;color:#1a1a1a;">${escapeHtml(line.slice(4))}</h3>`;
      }
      if (line.startsWith('- ')) {
        return `<div style="margin-left:20px;margin-bottom:4px;">• ${processInline(line.slice(2))}</div>`;
      }
      if (line.startsWith('> ')) {
        return `<div style="border-left:4px solid #6c5ce7;padding:8px 12px;margin:8px 0;background:#f5f5f5;color:#555;">${processInline(line.slice(2))}</div>`;
      }
      if (line.startsWith('|') && !line.includes('---')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        return `<div style="padding:4px 0;font-size:13px;">${cells.map(c => `<span style="display:inline-block;min-width:120px;padding:2px 8px;">${escapeHtml(c.trim())}</span>`).join('')}</div>`;
      }
      if (line.startsWith('|') && line.includes('---')) {
        return ''; // separator
      }
      if (line.trim() === '') {
        return '<div style="height:8px;"></div>';
      }
      return `<p style="margin:4px 0;">${processInline(line)}</p>`;
    })
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function processInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:bold;">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>');
}

// 页面内 Markdown 渲染组件
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
