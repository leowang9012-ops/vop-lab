// 模拟数据 - 《街篮2》真实试玩反馈数据 (700份，三批次)

// 项目类型
export interface Project {
  id: string;
  name: string;
  platform: "iOS" | "Android" | "PC" | "Console";
  feedbackCount: number;
  lastUpdated: string;
  status: "active" | "archived";
}

// 反馈类型
export interface Feedback {
  id: string;
  projectId: string;
  content: string;
  category: FeedbackCategory;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  createdAt: string;
  keywords: string[];
}

// 反馈分类
export type FeedbackCategory =
  | "bug"
  | "feature"
  | "balance"
  | "performance"
  | "ui"
  | "audio"
  | "story"
  | "other";

// 报告类型
export interface Report {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  summary: string;
  content: string;
}

// 统计数据
export interface DashboardStats {
  totalFeedback: number;
  weeklyNew: number;
  negativeRatio: number;
  urgentIssues: number;
}

// 项目列表 - 街篮2
export const mockProjects: Project[] = [
  {
    id: "proj-jl2",
    name: "街篮2",
    platform: "Android",
    feedbackCount: 700,
    lastUpdated: "2024-06-15",
    status: "active",
  },
];

// 反馈内容数据 - 基于真实问卷（三批次混合）
const contents = [
  // Batch 1: 基础体验 (20 items)
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:模拟器 | 延迟:感觉没法玩了 | 整体:1.0 战斗:1.0 美术:1.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "critical" as const, keywords: ["网络延迟", "感觉没法玩了", "模拟器"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 一加 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 黑鲨 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 魅族 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:模拟器 夜神 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "模拟器"] },
  { text: "设备:安卓手机 红米 | 延迟:比较难受 | 整体:3.0 战斗:4.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 没遇到过网络波动 | 整体:4.0 战斗:4.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["没遇到过", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:2.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  // Batch 2: 玩法机制 (15 items)
  { text: "职业:中锋（C） | 延迟:感觉没法玩了 | 职业平衡:2.0 天赋树:4.0 总分:35.0", category: "balance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["感觉没法玩了", "中锋", "职业平衡"] },
  { text: "职业:得分后卫（SG） | 延迟:感觉没法玩了 | 职业平衡:3.0 天赋树:5.0 总分:54.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["感觉没法玩了", "得分后卫", "天赋树"] },
  { text: "职业:大前锋（PF） | 延迟:比较难受 | 职业平衡:4.0 天赋树:4.0 总分:65.0", category: "balance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["比较难受", "大前锋", "天赋树"] },
  { text: "职业:小前锋（SF） | 延迟:感觉没法玩了 | 职业平衡:1.0 天赋树:3.0 总分:28.0", category: "balance" as FeedbackCategory, sentiment: "negative" as const, urgency: "critical" as const, keywords: ["感觉没法玩了", "小前锋", "职业平衡"] },
  { text: "职业:控球后卫（PG） | 延迟:感觉没法玩了 | 职业平衡:2.0 天赋树:4.0 总分:42.0", category: "balance" as FeedbackCategory, sentiment: "negative" as const, urgency: "medium" as const, keywords: ["感觉没法玩了", "控球后卫", "职业平衡"] },
  { text: "职业:中锋（C） | 延迟:比较难受 | 职业平衡:5.0 天赋树:5.0 总分:80.0", category: "balance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["比较难受", "中锋", "职业平衡"] },
  { text: "职业:得分后卫（SG） | 延迟:感觉没法玩了 | 职业平衡:3.0 天赋树:3.0 总分:47.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["感觉没法玩了", "得分后卫", "职业平衡"] },
  { text: "职业:大前锋（PF） | 延迟:比较难受 | 职业平衡:2.0 天赋树:5.0 总分:52.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["比较难受", "大前锋", "天赋树"] },
  { text: "职业:小前锋（SF） | 延迟:感觉没法玩了 | 职业平衡:3.0 天赋树:4.0 总分:58.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["感觉没法玩了", "小前锋", "职业平衡"] },
  { text: "职业:控球后卫（PG） | 延迟:比较难受 | 职业平衡:4.0 天赋树:4.0 总分:62.0", category: "balance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["比较难受", "控球后卫", "职业平衡"] },
  { text: "职业:中锋（C） | 延迟:感觉没法玩了 | 职业平衡:1.0 天赋树:2.0 总分:30.0", category: "balance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["感觉没法玩了", "中锋", "职业平衡"] },
  { text: "职业:得分后卫（SG） | 延迟:比较难受 | 职业平衡:3.0 天赋树:5.0 总分:68.0", category: "balance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["比较难受", "得分后卫", "天赋树"] },
  { text: "职业:大前锋（PF） | 延迟:感觉没法玩了 | 职业平衡:2.0 天赋树:3.0 总分:38.0", category: "balance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["感觉没法玩了", "大前锋", "职业平衡"] },
  { text: "职业:小前锋（SF） | 延迟:比较难受 | 职业平衡:4.0 天赋树:4.0 总分:72.0", category: "balance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["比较难受", "小前锋", "职业平衡"] },
  { text: "职业:控球后卫（PG） | 延迟:感觉没法玩了 | 职业平衡:3.0 天赋树:3.0 总分:45.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["感觉没法玩了", "控球后卫", "职业平衡"] },
  // Batch 3: 动作表现 (15 items)
  { text: "技能数量:一般 | 技能理解:一般 | 盖帽:2.0 投篮:3.0 抢篮板:4.0 总分:53.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["技能一般", "盖帽体验", "抢篮板"] },
  { text: "技能数量:根本不够 | 技能理解:不能理解 | 盖帽:1.0 投篮:2.0 抢篮板:2.0 总分:25.0", category: "ui" as FeedbackCategory, sentiment: "negative" as const, urgency: "critical" as const, keywords: ["技能不够", "盖帽体验", "投篮动作"] },
  { text: "技能数量:完全足够 | 技能理解:一般 | 盖帽:3.0 投篮:4.0 抢篮板:3.0 总分:68.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["技能足够", "投篮动作", "抢篮板"] },
  { text: "技能数量:不够 | 技能理解:一般 | 盖帽:2.0 投篮:2.0 抢篮板:2.0 总分:38.0", category: "ui" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["技能不够", "盖帽体验", "投篮动作"] },
  { text: "技能数量:一般 | 技能理解:一般 | 盖帽:3.0 投篮:3.0 抢篮板:3.0 总分:55.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["技能一般", "盖帽体验", "抢篮板"] },
  { text: "技能数量:足够 | 技能理解:一般 | 盖帽:4.0 投篮:4.0 抢篮板:4.0 总分:75.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["技能足够", "投篮动作", "抢篮板"] },
  { text: "技能数量:根本不够 | 技能理解:不能理解 | 盖帽:1.0 投篮:1.0 抢篮板:2.0 总分:19.0", category: "ui" as FeedbackCategory, sentiment: "negative" as const, urgency: "critical" as const, keywords: ["技能不够", "盖帽体验", "投篮动作"] },
  { text: "技能数量:一般 | 技能理解:一般 | 盖帽:3.0 投篮:3.0 抢篮板:3.0 总分:58.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["技能一般", "盖帽体验", "抢篮板"] },
  { text: "技能数量:完全足够 | 技能理解:一般 | 盖帽:4.0 投篮:5.0 抢篮板:4.0 总分:85.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["技能足够", "投篮动作", "抢篮板"] },
  { text: "技能数量:不够 | 技能理解:一般 | 盖帽:2.0 投篮:2.0 抢篮板:2.0 总分:42.0", category: "ui" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["技能不够", "盖帽体验", "投篮动作"] },
  { text: "技能数量:一般 | 技能理解:一般 | 盖帽:3.0 投篮:4.0 抢篮板:3.0 总分:62.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["技能一般", "投篮动作", "抢篮板"] },
  { text: "技能数量:足够 | 技能理解:一般 | 盖帽:4.0 投篮:4.0 抢篮板:4.0 总分:78.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["技能足够", "投篮动作", "抢篮板"] },
  { text: "技能数量:根本不够 | 技能理解:不能理解 | 盖帽:2.0 投篮:2.0 抢篮板:2.0 总分:32.0", category: "ui" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["技能不够", "盖帽体验", "投篮动作"] },
  { text: "技能数量:一般 | 技能理解:一般 | 盖帽:3.0 投篮:3.0 抢篮板:3.0 总分:56.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["技能一般", "盖帽体验", "抢篮板"] },
  { text: "技能数量:完全足够 | 技能理解:一般 | 盖帽:5.0 投篮:5.0 抢篮板:5.0 总分:95.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["技能足够", "投篮动作", "抢篮板"] },
];

// 生成反馈列表
const generateFeedbacks = (): Feedback[] => {
  const feedbacks: Feedback[] = [];
  const now = new Date();
  
  contents.forEach((content, index) => {
    const date = new Date(now);
    date.setHours(date.getHours() - index * 3);
    
    feedbacks.push({
      id: `fb-${String(index + 1).padStart(3, "0")}`,
      projectId: "proj-jl2",
      content: content.text,
      category: content.category,
      sentiment: content.sentiment,
      urgency: content.urgency,
      createdAt: date.toISOString(),
      keywords: content.keywords,
    });
  });
  
  return feedbacks;
};

// 反馈列表
export const mockFeedbacks: Feedback[] = generateFeedbacks();

// 紧急问题列表
export const mockUrgentFeedbacks: Feedback[] = mockFeedbacks.filter(
  (f) => f.urgency === "critical" || f.urgency === "high"
);

// 统计数据 - 基于真实数据（三批次 700 份）
export const mockDashboardStats: DashboardStats = {
  totalFeedback: 700,
  weeklyNew: 700,
  negativeRatio: 22.4,
  urgentIssues: 38,
};

// 分类分布数据 - 基于真实数据
export const mockCategoryDistribution = [
  { name: "性能/网络", value: 22, color: "var(--chart-1)" },
  { name: "操作手感", value: 20, color: "var(--chart-2)" },
  { name: "UI/UX", value: 16, color: "var(--chart-3)" },
  { name: "职业平衡", value: 14, color: "var(--chart-4)" },
  { name: "美术表现", value: 15, color: "var(--chart-5)" },
  { name: "音频体验", value: 13, color: "var(--muted)" },
];

// 情感趋势数据 - 基于真实数据
export const mockSentimentTrend = [
  { date: "Day 1", positive: 28.6, neutral: 50.0, negative: 21.4 },
  { date: "Day 2", positive: 30.2, neutral: 48.6, negative: 21.2 },
  { date: "Day 3", positive: 26.8, neutral: 52.4, negative: 20.8 },
  { date: "Day 4", positive: 32.1, neutral: 47.6, negative: 20.3 },
  { date: "Day 5", positive: 29.8, neutral: 49.2, negative: 21.0 },
  { date: "Day 6", positive: 31.5, neutral: 48.1, negative: 20.4 },
  { date: "Day 7", positive: 30.0, neutral: 49.0, negative: 21.0 },
];

// 热门关键词 - 基于真实数据（三批次）
export const mockTopKeywords = [
  { word: "网络延迟", count: 330, sentiment: "negative" as const },
  { word: "感觉没法玩了", count: 114, sentiment: "negative" as const },
  { word: "盖帽体验", count: 89, sentiment: "negative" as const },
  { word: "技能数量", count: 82, sentiment: "negative" as const },
  { word: "操作无反馈", count: 86, sentiment: "negative" as const },
  { word: "抢篮板", count: 67, sentiment: "negative" as const },
  { word: "投篮动作", count: 62, sentiment: "negative" as const },
  { word: "职业平衡", count: 89, sentiment: "negative" as const },
  { word: "身后盖帽", count: 58, sentiment: "negative" as const },
  { word: "爆发技", count: 67, sentiment: "negative" as const },
  { word: "天赋树", count: 54, sentiment: "positive" as const },
  { word: "贴身上篮", count: 48, sentiment: "positive" as const },
  { word: "技能理解", count: 43, sentiment: "negative" as const },
  { word: "突破投篮", count: 42, sentiment: "negative" as const },
  { word: "匹配时间", count: 42, sentiment: "neutral" as const },
  { word: "花式技能", count: 38, sentiment: "positive" as const },
  { word: "晃倒表现", count: 35, sentiment: "positive" as const },
  { word: "C/PF定位", count: 32, sentiment: "neutral" as const },
  { word: "动态篮网", count: 28, sentiment: "positive" as const },
  { word: "特写镜头", count: 25, sentiment: "positive" as const },
];

// 报告数据 - 基于真实数据（三批次 700 份）
export const mockReport: Report = {
  id: "report-jl2-001",
  projectId: "proj-jl2",
  title: "《街篮2》试玩反馈综合分析报告 - 700份有效样本（三批次）",
  createdAt: "2024-06-15T10:00:00Z",
  summary: "本次试玩共收集 700 份有效反馈（三批次），覆盖基础体验、玩法机制、动作表现三大维度。网络延迟（67.9%）和盖帽体验（2.26/5）是最核心痛点，40.8%玩家认为技能数量不足。天赋树设计（3.98/5）和镜头光效（3.37-3.53/5）获得认可。",
  content: `
## 一、数据概览

本次试玩共收集 **700 份**有效反馈问卷（三批次）。

| 批次 | 样本数 | 问卷类型 | 满分 | 平均分 |
|------|--------|----------|------|--------|
| Batch 1 | 374 | 基础体验 | 75 | 48.6 |
| Batch 2 | 125 | 玩法机制 | 80 | 54.6 |
| Batch 3 | 201 | 动作表现 | 95 | 57.7 |

### 核心指标
- **负面反馈占比**: 22.4%
- **紧急问题数**: 38 条
- **网络延迟率**: 67.9%（Batch1）/ 60.8% 感觉没法玩（Batch2）
- **技能不足感**: 40.8%（Batch3）
- **技能理解模糊**: 78.6%（Batch3）

### 用户画像
- **年龄段**: 30以上(48.7%) > 25~30(37.7%) > 19~24(12.6%)
- **设备**: 安卓手机(82.6%) > 模拟器(13.9%) > 凤凰系统(2.4%)
- **地域**: 江苏、上海、广东、浙江、山东为TOP5省份
- **段位**: 黄金~钻石(54.4%) > 王者(21.6%) > 大师~传奇(21.6%)
- **热门职业**: 中锋C(32.0%) > 得分后卫SG(28.0%) > 大前锋PF(14.4%)

## 二、各维度评分 (1-5分制)

### Batch 1 - 基础体验
| 维度 | 平均分 | 评价 |
|------|--------|------|
| 按键布局适应性 | 3.61 | ✅ 较好 |
| 初始技能掌握度 | 3.57 | ✅ 较好 |
| 背景音乐 | 3.43 | ✅ 较好 |
| 移动操作 | 3.45 | ✅ 较好 |
| 持球进攻 | 3.38 | ✅ 较好 |
| 美术风格 | 3.33 | ✅ 较好 |
| 球员形象 | 3.31 | ✅ 较好 |
| 额外按键位置 | 3.18 | ⚠️ 一般 |
| 操作响应及时性 | 3.12 | ⚠️ 一般 |
| 模型质量 | 3.06 | ⚠️ 一般 |
| 防守操作 | 3.09 | ⚠️ 一般 |
| 整体感受 | 3.08 | ⚠️ 一般 |
| 战斗体验 | 3.04 | ⚠️ 一般 |
| 爆发技位置 | 2.99 | ❌ 偏低 |
| 按键误触频率 | 2.97 | ❌ 偏低 |

### Batch 2 - 玩法机制
| 维度 | 平均分 | 评价 |
|------|--------|------|
| 天赋树设计 | 3.98 | ✅ 优秀 |
| 贴身上篮规则 | 3.92 | ✅ 优秀 |
| 盖帽硬直规则 | 3.87 | ✅ 较好 |
| 晃倒三种表现 | 3.83 | ✅ 较好 |
| 动态篮网效果 | 3.71 | ✅ 较好 |
| C/PF定位体验 | 3.62 | ✅ 较好 |
| 篮板碎裂动画 | 3.58 | ✅ 较好 |
| 爆发提示明显度 | 3.55 | ✅ 较好 |
| 爆发区域明显度 | 3.52 | ✅ 较好 |
| 花式技能体验 | 3.45 | ✅ 较好 |
| 技能绑定设计 | 3.34 | ✅ 较好 |
| 入场庆祝动作 | 3.02 | ⚠️ 一般 |
| 战斗内观众 | 2.92 | ⚠️ 一般 |
| 爆发技体验 | 2.87 | ❌ 偏低 |
| 职业平衡性 | 2.77 | ❌ 偏低 |
| 身后盖帽规则 | 2.60 | ❌ 偏低 |

### Batch 3 - 动作表现
| 维度 | 平均分 | 评价 |
|------|--------|------|
| 默认镜头 | 3.53 | ✅ 较好 |
| 特写镜头 | 3.44 | ✅ 较好 |
| 光效表现 | 3.37 | ✅ 较好 |
| 音效语音 | 3.31 | ✅ 较好 |
| 传球动作 | 3.34 | ✅ 较好 |
| 角色动作 | 3.34 | ✅ 较好 |
| 提示信息 | 3.22 | ✅ 较好 |
| 上篮动作 | 3.24 | ✅ 较好 |
| 扣篮动作 | 3.22 | ✅ 较好 |
| 篮球表现 | 3.06 | ⚠️ 一般 |
| 操作无反馈 | 2.93 | ⚠️ 一般 |
| 突破动作 | 2.89 | ⚠️ 一般 |
| 快捷聊天 | 2.86 | ⚠️ 一般 |
| 技能数量 | 2.75 | ❌ 偏低 |
| 投篮动作 | 2.67 | ❌ 偏低 |
| 抢篮板 | 2.56 | ❌ 偏低 |
| 突破投篮 | 2.85 | ❌ 偏低 |
| 盖帽体验 | 2.26 | ❌ 最低 |

## 三、重点问题

### 3.1 网络延迟（P0 - 紧急）
**影响范围**: 67.9% 用户遇到延迟，60.8% 表示"感觉没法玩了"
**主要感受**: "比较难受"、"感觉没法玩了"
**建议措施**:
1. 优化网络同步机制
2. 增加延迟补偿算法
3. 提供网络质量检测和提示

### 3.2 盖帽/投篮/篮板（P0 - 紧急）
**盖帽体验**: 2.26/5（全维度最低）
**投篮动作**: 2.67/5
**抢篮板**: 2.56/5
**建议措施**:
1. 重新设计盖帽判定逻辑
2. 优化投篮物理反馈
3. 调整篮板弹框次数和反弹高度

### 3.3 职业平衡（P1 - 高优）
**评分**: 2.77/5（Batch2 最低）
**建议措施**:
1. 重新评估各职业数值
2. 调整爆发技强度
3. 优化 C/PF 定位差异

### 3.4 身后盖帽规则（P1 - 高优）
**评分**: 2.60/5
**建议措施**:
1. 优化身后盖帽判定逻辑
2. 增加合理性提示

### 3.5 技能系统（P2 - 中优）
**40.8%** 玩家认为技能数量不够
**78.6%** 玩家对技能区别理解"一般"
**建议措施**:
1. 优化新手引导
2. 简化技能系统说明
3. 增加技能教学

## 四、优势项

1. **天赋树设计**（3.98/5）：天赋系统获得最高评价
2. **按键布局**（3.61/5）：整体布局合理
3. **贴身上篮规则**（3.92/5）：规则设计合理
4. **默认镜头**（3.53/5）：镜头系统好用
5. **背景音乐**（3.43/5）：音效获得认可
6. **光效表现**（3.37/5）：视觉效果不错

## 五、匹配时间容忍度
- **可以接受**: 46.4%（58人）
- **不能接受**: 33.6%（42人）
- **不在意**: 20.0%（25人）
- **结论**: 近半数玩家愿意为更公平的匹配等待更长时间

## 六、建议优先级
1. **P0 - 网络优化**：降低延迟，改善匹配体验
2. **P0 - 盖帽/投篮/篮板**：重新设计核心战斗体验
3. **P1 - 职业平衡**：调整各职业数值和爆发技强度
4. **P1 - 身后盖帽规则**：优化判定逻辑
5. **P2 - 技能系统**：优化引导，简化说明
6. **P3 - 保持优势**：继续优化天赋树、镜头和光效
`,
};
