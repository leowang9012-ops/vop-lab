import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mockSentimentTrend } from "@/data/mock";
import { SENTIMENT_COLORS, CHART_AXIS, CHART_TOOLTIP } from "@/lib/chart-theme";

export function SentimentTrendChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSentimentTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="none" stroke={CHART_AXIS.grid} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={CHART_AXIS.stroke}
            fontSize={CHART_AXIS.fontSize}
            fontFamily={CHART_AXIS.fontFamily}
            tickLine={CHART_AXIS.tickLine}
            axisLine={{ stroke: CHART_AXIS.grid }}
          />
          <YAxis
            stroke={CHART_AXIS.stroke}
            fontSize={CHART_AXIS.fontSize}
            fontFamily={CHART_AXIS.fontFamily}
            tickLine={CHART_AXIS.tickLine}
            axisLine={false}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP.contentStyle}
            itemStyle={CHART_TOOLTIP.itemStyle}
            labelStyle={CHART_TOOLTIP.labelStyle}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-display)" }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="positive"
            name="正面"
            stroke={SENTIMENT_COLORS.positive}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: SENTIMENT_COLORS.positive }}
          />
          <Line
            type="monotone"
            dataKey="neutral"
            name="中性"
            stroke={SENTIMENT_COLORS.neutral}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: SENTIMENT_COLORS.neutral }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            name="负面"
            stroke={SENTIMENT_COLORS.negative}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: SENTIMENT_COLORS.negative }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
