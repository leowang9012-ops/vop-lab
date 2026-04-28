import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { mockCategoryDistribution } from "@/data/mock";

const COLORS = [
  "hsl(199 95% 53%)",
  "hsl(152 69% 42%)",
  "hsl(38 92% 55%)",
  "hsl(328 85% 60%)",
  "hsl(262 80% 65%)",
  "hsl(25 90% 55%)",
  "hsl(180 70% 45%)",
];

export function CategoryPieChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={mockCategoryDistribution}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            fontSize={11}
            fontFamily="var(--font-display)"
            stroke="hsl(228 50% 3%)"
            strokeWidth={2}
          >
            {mockCategoryDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
