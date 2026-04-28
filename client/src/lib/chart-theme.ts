/**
 * VoP Lab 图表主题
 * 
 * 设计参考 ThinkingData TE 4.0 风格：
 * - 简约、高效、专注、可靠
 * - 有序色板，高区分度
 * - 语义化颜色（正面=绿，中性=蓝，负面=红）
 */

// ========================================
// 数据色板 - 用于饼图、柱状图等多系列图表
// 8 色有序色板，按色相从冷到暖排列
// ========================================
export const CHART_PALETTE = [
  "hsl(199 95% 53%)",  // 1 - 主蓝（品牌主色）
  "hsl(152 69% 42%)",  // 2 - 翠绿
  "hsl(38 92% 55%)",   // 3 - 琥珀
  "hsl(328 85% 60%)",  // 4 - 品红
  "hsl(262 80% 65%)",  // 5 - 紫罗兰
  "hsl(25 90% 55%)",   // 6 - 橙色
  "hsl(180 70% 45%)",  // 7 - 青色
  "hsl(348 80% 58%)",  // 8 - 玫红
] as const;

// ========================================
// 语义颜色 - 用于情感分析、状态指示
// ========================================
export const SENTIMENT_COLORS = {
  positive: "hsl(152 69% 42%)",  // 绿 - 正面
  neutral:  "hsl(199 95% 53%)",  // 蓝 - 中性
  negative: "hsl(0 78% 57%)",    // 红 - 负面
  warning:  "hsl(38 92% 55%)",   // 橙 - 警告
} as const;

// ========================================
// 图表框架样式 - 坐标轴、网格、Tooltip
// ========================================
export const CHART_AXIS = {
  stroke: "hsl(215 15% 40%)",    // 坐标轴文字颜色
  grid:   "hsl(228 25% 12%)",    // 网格线颜色
  tickLine: false,               // 不显示刻度线
  fontSize: 11,
  fontFamily: "var(--font-display)",
} as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: "hsl(228 40% 7%)",
    border: "1px solid hsl(228 25% 14%)",
    borderRadius: "12px",
    color: "hsl(210 40% 96%)",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    boxShadow: "0 8px 32px hsl(228 60% 0% / 0.4)",
  },
  itemStyle: { padding: "2px 0" },
  labelStyle: { fontWeight: 600, marginBottom: "4px" },
} as const;

// ========================================
// 语义状态颜色 - 用于评分条、进度指示
// ========================================
export const SCORE_COLORS = {
  good:    "hsl(152 69% 42%)",  // ≥55 绿
  warning: "hsl(38 92% 50%)",   // 45-54 橙
  bad:     "hsl(0 78% 57%)",    // <45 红
} as const;

// ========================================
// 图表 Pie 描边
// ========================================
export const PIE_STROKE = "hsl(228 50% 3%)";
