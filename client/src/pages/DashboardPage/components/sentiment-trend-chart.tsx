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

export function SentimentTrendChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSentimentTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="none" stroke="hsl(228 25% 12%)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="hsl(215 15% 40%)"
            fontSize={11}
            fontFamily="var(--font-display)"
            tickLine={false}
            axisLine={{ stroke: "hsl(228 25% 12%)" }}
          />
          <YAxis
            stroke="hsl(215 15% 40%)"
            fontSize={11}
            fontFamily="var(--font-display)"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(228 40% 7%)",
              border: "1px solid hsl(228 25% 14%)",
              borderRadius: "12px",
              color: "hsl(210 40% 96%)",
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              boxShadow: "0 8px 32px hsl(228 60% 0% / 0.4)",
            }}
            itemStyle={{ padding: "2px 0" }}
            labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
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
            stroke="hsl(152 69% 42%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: "hsl(152 69% 42%)" }}
          />
          <Line
            type="monotone"
            dataKey="neutral"
            name="中性"
            stroke="hsl(199 95% 53%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: "hsl(199 95% 53%)" }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            name="负面"
            stroke="hsl(0 78% 57%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(228 50% 3%)", stroke: "hsl(0 78% 57%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
