import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, Check, Link, Image } from "lucide-react";

interface ShareDialogProps {
  reportTitle: string;
  totalFeedback: number;
  avgScore: number;
  positiveRate: number;
  summary: string;
}

export function ShareDialog({ reportTitle, totalFeedback, avgScore, positiveRate, summary }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"link" | "card">("link");
  const [cardGenerating, setCardGenerating] = useState(false);
  const [cardUrl, setCardUrl] = useState<string>("");

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?share=report`
    : "";

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleGenerateCard = useCallback(async () => {
    setCardGenerating(true);
    try {
      const container = document.createElement("div");
      container.style.cssText = `
        position: fixed; left: 0; top: -10000px; width: 600px;
        background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
        color: #fff; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
        padding: 40px; border-radius: 16px;
      `;
      container.innerHTML = `
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">VoP Lab · 玩家反馈智能分析</div>
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">${reportTitle}</h1>
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; flex: 1;">
            <div style="font-size: 32px; font-weight: bold;">${totalFeedback}</div>
            <div style="font-size: 12px; opacity: 0.8;">反馈总数</div>
          </div>
          <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; flex: 1;">
            <div style="font-size: 32px; font-weight: bold;">${avgScore}</div>
            <div style="font-size: 12px; opacity: 0.8;">平均评分</div>
          </div>
          <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; flex: 1;">
            <div style="font-size: 32px; font-weight: bold;">${positiveRate}%</div>
            <div style="font-size: 12px; opacity: 0.8;">正面率</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
          ${summary.slice(0, 150)}${summary.length > 150 ? "..." : ""}
        </div>
        <div style="font-size: 11px; opacity: 0.6; text-align: right;">生成时间: ${new Date().toLocaleDateString("zh-CN")}</div>
      `;
      document.body.appendChild(container);

      const loadScript = (url: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${url}"]`);
          if (existing) { resolve(); return; }
          const script = document.createElement("script");
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`CDN 加载失败: ${url}`));
          document.head.appendChild(script);
        });

      await loadScript("https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");

      const canvas = await (window as any).html2canvas(container, {
        scale: 2, useCORS: true, backgroundColor: null, logging: false,
      });
      document.body.removeChild(container);

      const url = canvas.toDataURL("image/png");
      setCardUrl(url);
    } catch (err) {
      console.error("分享卡片生成失败:", err);
    } finally {
      setCardGenerating(false);
    }
  }, [reportTitle, totalFeedback, avgScore, positiveRate, summary]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Share2 className="w-4 h-4" />
        分享报告
      </Button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
        <Card className="w-[520px] max-h-[90vh] overflow-auto bg-card border-border" onClick={e => e.stopPropagation()}>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">分享报告</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>✕</Button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("link")}
                className="gap-2"
              >
                <Link className="w-3.5 h-3.5" />
                分享链接
              </Button>
              <Button
                variant={mode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("card")}
                className="gap-2"
              >
                <Image className="w-3.5 h-3.5" />
                分享卡片
              </Button>
            </div>

            {/* Link Mode */}
            {mode === "link" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">复制链接发送给团队成员，打开即可查看报告</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground"
                  />
                  <Button onClick={handleCopyLink} className="gap-2 shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                </div>
              </div>
            )}

            {/* Card Mode */}
            {mode === "card" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">生成报告摘要卡片，方便在群聊中分享</p>
                {!cardUrl && (
                  <Button onClick={handleGenerateCard} disabled={cardGenerating} className="w-full gap-2">
                    <Image className="w-4 h-4" />
                    {cardGenerating ? "生成中..." : "生成分享卡片"}
                  </Button>
                )}
                {cardUrl && (
                  <div className="space-y-3">
                    <img src={cardUrl} alt="分享卡片" className="w-full rounded-lg border border-border" />
                    <Button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = cardUrl;
                        a.download = `${reportTitle}_分享卡片.png`;
                        a.click();
                      }}
                      className="w-full gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      下载卡片
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
