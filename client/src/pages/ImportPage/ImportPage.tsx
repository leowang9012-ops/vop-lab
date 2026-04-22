import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Info } from "lucide-react";
import { useState, useCallback, useRef } from "react";

interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
  preview: Record<string, unknown>[];
}

export default function ImportPage() {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const isCSV = file.name.endsWith('.csv');
      const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      let rows: Record<string, unknown>[] = [];
      const errors: string[] = [];

      if (isCSV) {
        rows = parseCSV(text, errors);
      } else if (isXLSX) {
        // For XLSX, we'll use a simple approach - tell user to convert to CSV
        errors.push('XLSX 文件请先另存为 CSV 格式再导入');
        setProcessing(false);
        setResult({ totalRows: 0, validRows: 0, invalidRows: 0, errors, preview: [] });
        return;
      } else {
        errors.push('不支持的文件格式，请上传 CSV 文件');
        setProcessing(false);
        setResult({ totalRows: 0, validRows: 0, invalidRows: 0, errors, preview: [] });
        return;
      }

      // 验证数据
      const validRows = rows.filter(row => {
        const content = row.content || row.feedback || row.comment || row.text;
        return content && String(content).trim().length > 0;
      });

      const invalidCount = rows.length - validRows.length;
      if (invalidCount > 0) {
        errors.push(`${invalidCount} 行数据缺少内容字段（content/feedback/comment/text）`);
      }

      setResult({
        totalRows: rows.length,
        validRows: validRows.length,
        invalidRows: invalidCount,
        errors,
        preview: validRows.slice(0, 5),
      });
    } catch (err) {
      setResult({
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [`文件解析失败: ${err instanceof Error ? err.message : '未知错误'}`],
        preview: [],
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  const parseCSV = (text: string, errors: string[]): Record<string, unknown>[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      errors.push('CSV 文件至少需要包含表头和一行数据');
      return [];
    }

    // 简单 CSV 解析（处理引号）
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const row: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDownloadTemplate = () => {
    const csv = `content,score,category,sentiment,keywords
游戏画面很流畅，操作手感也不错，但是匹配机制有待改进,85,操作手感,positive,画面;操作;匹配
经常闪退，希望尽快修复这个 bug,20,性能问题,negative,闪退;bug
音乐和音效都很棒，沉浸感很强,90,音频体验,positive,音乐;音效
`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vop-lab-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">数据导入</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">上传 Excel/CSV 文件导入玩家反馈数据</p>
          </div>
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            size="sm"
            className="gap-2 text-xs md:text-sm"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">下载模板</span>
            <span className="sm:hidden">模板</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Upload Area */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">上传文件</CardTitle>
            <CardDescription>支持 CSV 格式，XLSX 请先另存为 CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
                ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${processing ? 'pointer-events-none opacity-50' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleInputChange}
              />
              
              {processing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">正在解析文件...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      拖拽文件到此处，或 <span className="text-primary">点击上传</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 CSV、XLSX 格式，最大 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {fileName && !processing && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{fileName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <>
            {/* Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">导入结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-xl md:text-2xl font-bold text-foreground">{result.totalRows}</p>
                    <p className="text-sm text-muted-foreground">总行数</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xl md:text-2xl font-bold text-success">{result.validRows}</p>
                    <p className="text-sm text-muted-foreground">有效数据</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xl md:text-2xl font-bold text-destructive">{result.invalidRows}</p>
                    <p className="text-sm text-muted-foreground">无效数据</p>
                  </div>
                </div>

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {result.errors.map((error, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span className="text-foreground/80">{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Success */}
                {result.validRows > 0 && (
                  <div className="flex items-center gap-2 text-sm p-3 bg-success/5 rounded-lg border border-success/10 mb-6">
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    <span className="text-foreground/80">
                      成功解析 {result.validRows} 条有效数据
                    </span>
                  </div>
                )}

                {/* Preview */}
                {result.preview.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">数据预览（前 5 条）</h4>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-secondary/50">
                            {Object.keys(result.preview[0]).map(key => (
                              <th key={key} className="px-4 py-2 text-left font-semibold text-foreground border-b border-border">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.preview.map((row, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="px-4 py-2 text-foreground/80 max-w-[300px] truncate">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            {result.validRows > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-medium">下一步</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-info/5 rounded-lg border border-info/10">
                    <Info className="w-5 h-5 text-info mt-0.5 shrink-0" />
                    <div className="text-sm text-foreground/80">
                      <p className="font-medium text-info mb-1">数据已解析，需要合并到项目吗？</p>
                      <p>由于当前为静态站点，请将解析后的数据文件提交到项目仓库，然后重新构建部署。</p>
                      <p className="mt-2 text-muted-foreground">
                        或者联系助手自动完成合并和部署。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Format Guide */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">文件格式说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">必填字段</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="font-mono text-xs text-primary">content</p>
                    <p className="text-muted-foreground mt-1">反馈内容（必填）</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="font-mono text-xs text-primary">score</p>
                    <p className="text-muted-foreground mt-1">评分 0-100（可选）</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">可选字段</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="font-mono text-xs text-muted-foreground">category</p>
                    <p className="text-muted-foreground mt-1">分类</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="font-mono text-xs text-muted-foreground">sentiment</p>
                    <p className="text-muted-foreground mt-1">情感</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="font-mono text-xs text-muted-foreground">keywords</p>
                    <p className="text-muted-foreground mt-1">关键词</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
