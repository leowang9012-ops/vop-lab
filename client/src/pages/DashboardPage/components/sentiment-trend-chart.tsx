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
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="positive"
            name="正面"
            stroke="hsl(142 76% 45%)"
            strokeWidth={2}
            dot={{ fill: "hsl(142 76% 45%)" }}
          />
          <Line
            type="monotone"
            dataKey="neutral"
            name="中性"
            stroke="hsl(199 89% 48%)"
            strokeWidth={2}
            dot={{ fill: "hsl(199 89% 48%)" }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            name="负面"
            stroke="hsl(0 72% 51%)"
            strokeWidth={2}
            dot={{ fill: "hsl(0 72% 51%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
