// 模拟数据 - 《街篮2》真实试玩反馈数据 (374份)

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
    feedbackCount: 374,
    lastUpdated: "2024-06-15",
    status: "active",
  },
];

// 反馈内容数据 - 基于真实问卷
const contents = [
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:4.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:模拟器 | 延迟:感觉没法玩了 | 整体:1.0 战斗:1.0 美术:1.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "critical" as const, keywords: ["网络延迟", "感觉没法玩了", "模拟器"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 一加 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 魅族 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:模拟器 夜神 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "模拟器"] },
  { text: "设备:安卓手机 红米 | 延迟:比较难受 | 整体:3.0 战斗:4.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 黑鲨 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 锤子 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:2.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 没遇到过网络波动 | 整体:4.0 战斗:4.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["没遇到过", "安卓手机"] },
  { text: "设备:安卓手机 魅族 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 一加 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:模拟器 MUMU | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "模拟器"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:2.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 红米 | 延迟:比较难受 | 整体:3.0 战斗:4.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 魅族 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "performance" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:2.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:4.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 红米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 华为 | 延迟:比较难受 | 整体:4.0 战斗:4.0 美术:4.0", category: "ui" as FeedbackCategory, sentiment: "positive" as const, urgency: "low" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 小米 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 OPPO | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 vivo | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 荣耀 | 延迟:比较难受 | 整体:2.0 战斗:2.0 美术:3.0", category: "performance" as FeedbackCategory, sentiment: "negative" as const, urgency: "high" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 魅族 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "balance" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
  { text: "设备:安卓手机 三星 | 延迟:比较难受 | 整体:3.0 战斗:3.0 美术:3.0", category: "ui" as FeedbackCategory, sentiment: "neutral" as const, urgency: "medium" as const, keywords: ["网络延迟", "比较难受", "安卓手机"] },
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

// 统计数据 - 基于真实数据
export const mockDashboardStats: DashboardStats = {
  totalFeedback: 374,
  weeklyNew: 374,
  negativeRatio: 20.3,
  urgentIssues: 23,
};

// 分类分布数据 - 基于真实数据
export const mockCategoryDistribution = [
  { name: "UI/UX", value: 28, color: "var(--chart-1)" },
  { name: "性能问题", value: 22, color: "var(--chart-2)" },
  { name: "整体体验", value: 18, color: "var(--chart-3)" },
  { name: "操作手感", value: 15, color: "var(--chart-4)" },
  { name: "美术表现", value: 12, color: "var(--chart-5)" },
  { name: "音频体验", value: 5, color: "var(--muted)" },
];

// 情感趋势数据 - 基于真实数据
export const mockSentimentTrend = [
  { date: "Day 1", positive: 28.6, neutral: 51.4, negative: 20.0 },
  { date: "Day 2", positive: 26.8, neutral: 53.1, negative: 20.1 },
  { date: "Day 3", positive: 30.2, neutral: 48.6, negative: 21.2 },
  { date: "Day 4", positive: 24.5, neutral: 55.1, negative: 20.4 },
  { date: "Day 5", positive: 32.7, neutral: 46.9, negative: 20.4 },
  { date: "Day 6", positive: 28.6, neutral: 51.0, negative: 20.4 },
  { date: "Day 7", positive: 30.6, neutral: 49.0, negative: 20.4 },
];

// 热门关键词 - 基于真实数据
export const mockTopKeywords = [
  { word: "网络延迟", count: 254, sentiment: "negative" as const },
  { word: "比较难受", count: 142, sentiment: "negative" as const },
  { word: "安卓手机", count: 309, sentiment: "neutral" as const },
  { word: "感觉没法玩了", count: 38, sentiment: "negative" as const },
  { word: "模拟器", count: 52, sentiment: "neutral" as const },
  { word: "华为", count: 89, sentiment: "neutral" as const },
  { word: "小米", count: 76, sentiment: "neutral" as const },
  { word: "OPPO", count: 45, sentiment: "neutral" as const },
  { word: "vivo", count: 38, sentiment: "neutral" as const },
  { word: "荣耀", count: 42, sentiment: "neutral" as const },
  { word: "按键误触", count: 67, sentiment: "negative" as const },
  { word: "爆发技位置", count: 54, sentiment: "negative" as const },
  { word: "操作响应", count: 48, sentiment: "negative" as const },
  { word: "美术风格", count: 39, sentiment: "positive" as const },
  { word: "背景音乐", count: 35, sentiment: "positive" as const },
];

// 报告数据 - 基于真实数据
export const mockReport: Report = {
  id: "report-jl2-001",
  projectId: "proj-jl2",
  title: "《街篮2》试玩反馈分析报告 - 374份有效样本",
  createdAt: "2024-06-15T10:00:00Z",
  summary: "本次试玩共收集 374 份有效反馈，整体评分 48.6/75。67.9% 用户遇到网络延迟问题，按键误触和爆发技位置是主要操作痛点。美术表现获得认可，背景音乐评分最高。",
  content: `
## 一、数据概览

本次试玩共收集 **374 份**有效反馈问卷。

### 核心指标
- **平均分**: 48.6/75（满分75分）
- **负面反馈占比**: 20.3%
- **紧急问题数**: 23 条
- **网络延迟率**: 67.9%

### 用户画像
- **年龄段**: 30以上(48.7%) > 25~30(37.7%) > 19~24(12.6%)
- **设备**: 安卓手机(82.6%) > 模拟器(13.9%) > 凤凰系统(2.4%)
- **地域**: 江苏、上海、广东、浙江、山东为TOP5省份

## 二、各维度评分 (1-5分制)

| 维度 | 平均分 | 评价 |
|------|--------|------|
| 初始技能掌握度 | 3.57 | ✅ 较好 |
| 按键布局适应性 | 3.61 | ✅ 较好 |
| 背景音乐 | 3.43 | ✅ 较好 |
| 移动操作 | 3.45 | ✅ 较好 |
| 持球进攻 | 3.38 | ✅ 较好 |
| 美术风格 | 3.33 | ✅ 较好 |
| 球员形象 | 3.31 | ✅ 较好 |
| 额外按键位置 | 3.18 | ⚠️ 一般 |
| 防守操作 | 3.09 | ⚠️ 一般 |
| 整体感受 | 3.08 | ⚠️ 一般 |
| 操作响应及时性 | 3.12 | ⚠️ 一般 |
| 战斗体验 | 3.04 | ⚠️ 一般 |
| 模型质量 | 3.06 | ⚠️ 一般 |
| 爆发技位置 | 2.99 | ❌ 偏低 |
| 按键误触频率 | 2.97 | ❌ 偏低 |

## 三、重点问题

### 3.1 网络延迟（P0 - 紧急）
**影响范围**: 67.9% 用户（254人）
**主要感受**: "比较难受"、"感觉没法玩了"
**建议措施**:
1. 优化网络同步机制
2. 增加延迟补偿算法
3. 提供网络质量检测和提示

### 3.2 按键误触（P1 - 高优）
**评分**: 2.97/5（最低分维度）
**建议措施**:
1. 调整按键间距和大小
2. 增加误触防止机制
3. 提供自定义按键布局

### 3.3 爆发技位置（P1 - 高优）
**评分**: 2.99/5
**建议措施**:
1. 重新设计大招按键位置
2. 提供按键位置自定义
3. 增加技能释放提示

## 四、优势项

1. **初始球员技能**（3.57/5）：新手引导做得好
2. **按键布局**（3.61/5）：整体布局合理
3. **背景音乐**（3.43/5）：音效获得认可
4. **美术风格**（3.33/5）：画面表现不错

## 五、建议优先级

1. **P0 - 网络优化**：降低延迟，改善匹配体验
2. **P1 - 操作优化**：调整按键布局，减少误触
3. **P2 - 爆发技优化**：重新设计大招按键位置
4. **P3 - 保持美术品质**：继续优化球员模型
`,
};
