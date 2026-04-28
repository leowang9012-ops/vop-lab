import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { mockCategoryDistribution } from "@/data/mock";
import { CHART_PALETTE, CHART_TOOLTIP, PIE_STROKE } from "@/lib/chart-theme";

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
            stroke={PIE_STROKE}
            strokeWidth={2}
          >
            {mockCategoryDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={CHART_TOOLTIP.contentStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
