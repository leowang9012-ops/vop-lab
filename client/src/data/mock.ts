// 模拟数据 - 用于前端页面骨架展示

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

// 项目列表
export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "星际冒险",
    platform: "iOS",
    feedbackCount: 1247,
    lastUpdated: "2026-04-21",
    status: "active",
  },
  {
    id: "proj-002",
    name: "王国争霸",
    platform: "Android",
    feedbackCount: 892,
    lastUpdated: "2026-04-20",
    status: "active",
  },
  {
    id: "proj-003",
    name: "末日求生",
    platform: "PC",
    feedbackCount: 567,
    lastUpdated: "2026-04-19",
    status: "active",
  },
  {
    id: "proj-004",
    name: "赛车传奇",
    platform: "Console",
    feedbackCount: 324,
    lastUpdated: "2026-04-18",
    status: "archived",
  },
];

// 反馈内容定义
interface ContentDef {
  text: string;
  category: FeedbackCategory;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  keywords: string[];
}

// 反馈内容数据
const contents: ContentDef[] = [
  { text: "游戏在 iPhone 15 上闪退，特别是在进入副本的时候，希望能尽快修复", category: "bug", sentiment: "negative", urgency: "critical", keywords: ["闪退", "副本", "iPhone 15"] },
  { text: "希望能增加公会系统，这样可以和朋友们一起玩", category: "feature", sentiment: "positive", urgency: "medium", keywords: ["公会", "社交", "组队"] },
  { text: "副本难度太高了，普通玩家根本打不过，建议调整", category: "balance", sentiment: "negative", urgency: "high", keywords: ["难度", "副本", "平衡"] },
  { text: "游戏加载时间太长了，每次进入都要等很久", category: "performance", sentiment: "negative", urgency: "high", keywords: ["加载", "性能", "等待"] },
  { text: "UI设计很漂亮，操作也很流畅，很喜欢这个游戏", category: "ui", sentiment: "positive", urgency: "low", keywords: ["UI", "操作", "设计"] },
  { text: "背景音乐太单调了，希望能增加更多BGM", category: "audio", sentiment: "neutral", urgency: "low", keywords: ["音乐", "BGM", "音效"] },
  { text: "主线剧情非常精彩，但是支线任务有点少", category: "story", sentiment: "positive", urgency: "medium", keywords: ["剧情", "主线", "支线"] },
  { text: "充值活动太频繁了，感觉像是逼氪", category: "other", sentiment: "negative", urgency: "medium", keywords: ["充值", "活动", "付费"] },
  { text: "PVP匹配机制有问题，经常遇到等级高很多的对手", category: "balance", sentiment: "negative", urgency: "high", keywords: ["PVP", "匹配", "平衡"] },
  { text: "新角色太弱了，完全打不过老角色", category: "balance", sentiment: "negative", urgency: "medium", keywords: ["角色", "平衡", "强度"] },
  { text: "服务器经常掉线，晚上高峰期特别严重", category: "performance", sentiment: "negative", urgency: "critical", keywords: ["掉线", "服务器", "网络"] },
  { text: "新手引导做得不错，很容易上手", category: "ui", sentiment: "positive", urgency: "low", keywords: ["新手", "引导", "教程"] },
  { text: "希望能增加自定义按键功能", category: "feature", sentiment: "neutral", urgency: "low", keywords: ["按键", "自定义", "操作"] },
  { text: "游戏画面卡顿，帧率不稳定", category: "performance", sentiment: "negative", urgency: "high", keywords: ["卡顿", "帧率", "优化"] },
  { text: "活动奖励很丰富，玩起来很有动力", category: "feature", sentiment: "positive", urgency: "low", keywords: ["活动", "奖励", "福利"] },
  { text: "背包系统不好用，找东西很麻烦", category: "ui", sentiment: "negative", urgency: "medium", keywords: ["背包", "UI", "便捷"] },
  { text: "希望能增加好友在线状态显示", category: "feature", sentiment: "positive", urgency: "medium", keywords: ["好友", "在线", "社交"] },
  { text: "战斗特效太华丽了，有时候会看不清敌人攻击", category: "ui", sentiment: "neutral", urgency: "medium", keywords: ["特效", "战斗", "视觉"] },
  { text: "希望能够回看战斗录像", category: "feature", sentiment: "positive", urgency: "low", keywords: ["回放", "录像", "战斗"] },
  { text: "装备强化成功率太低了，希望能提高", category: "balance", sentiment: "negative", urgency: "medium", keywords: ["强化", "装备", "概率"] },
  { text: "登录奖励经常领不到，显示网络错误", category: "bug", sentiment: "negative", urgency: "high", keywords: ["登录", "奖励", "BUG"] },
  { text: "游戏世界观很有意思，期待后续剧情", category: "story", sentiment: "positive", urgency: "low", keywords: ["剧情", "世界观", "故事"] },
  { text: "语音聊天功能有杂音，听不清楚", category: "audio", sentiment: "negative", urgency: "medium", keywords: ["语音", "聊天", "音质"] },
  { text: "排行榜显示错误，我的排名不对", category: "bug", sentiment: "negative", urgency: "high", keywords: ["排行榜", "BUG", "显示"] },
  { text: "希望能增加自动战斗功能", category: "feature", sentiment: "neutral", urgency: "low", keywords: ["自动", "战斗", "便捷"] },
];

// 项目2的反馈内容
const proj2Contents: ContentDef[] = [
  { text: "联盟战奖励发放延迟了，什么时候能到账？", category: "bug", sentiment: "negative", urgency: "high", keywords: ["奖励", "联盟", "延迟"] },
  { text: "城堡皮肤很好看，希望多出一些", category: "feature", sentiment: "positive", urgency: "low", keywords: ["皮肤", "城堡", "外观"] },
  { text: "资源采集速度太慢了，建议提高", category: "balance", sentiment: "neutral", urgency: "medium", keywords: ["资源", "采集", "速度"] },
];

// 生成反馈列表
const generateFeedbacks = (): Feedback[] => {
  const feedbacks: Feedback[] = [];
  const now = new Date();
  
  contents.forEach((content, index) => {
    const date = new Date(now);
    date.setHours(date.getHours() - index * 2);
    
    feedbacks.push({
      id: `fb-${String(index + 1).padStart(3, "0")}`,
      projectId: "proj-001",
      content: content.text,
      category: content.category,
      sentiment: content.sentiment,
      urgency: content.urgency,
      createdAt: date.toISOString(),
      keywords: content.keywords,
    });
  });
  
  proj2Contents.forEach((content, index) => {
    const date = new Date(now);
    date.setHours(date.getHours() - (index + 25) * 2);
    
    feedbacks.push({
      id: `fb-${String(index + 26).padStart(3, "0")}`,
      projectId: "proj-002",
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

// 统计数据
export const mockDashboardStats: DashboardStats = {
  totalFeedback: 3030,
  weeklyNew: 156,
  negativeRatio: 32.5,
  urgentIssues: 12,
};

// 分类分布数据
export const mockCategoryDistribution = [
  { name: "Bug 反馈", value: 35, color: "var(--chart-1)" },
  { name: "功能建议", value: 25, color: "var(--chart-2)" },
  { name: "平衡调整", value: 18, color: "var(--chart-3)" },
  { name: "性能问题", value: 12, color: "var(--chart-4)" },
  { name: "UI/UX", value: 7, color: "var(--chart-5)" },
  { name: "其他", value: 3, color: "var(--muted)" },
];

// 情感趋势数据
export const mockSentimentTrend = [
  { date: "04-15", positive: 45, neutral: 30, negative: 25 },
  { date: "04-16", positive: 42, neutral: 32, negative: 26 },
  { date: "04-17", positive: 50, neutral: 28, negative: 22 },
  { date: "04-18", positive: 38, neutral: 35, negative: 27 },
  { date: "04-19", positive: 55, neutral: 25, negative: 20 },
  { date: "04-20", positive: 48, neutral: 30, negative: 22 },
  { date: "04-21", positive: 52, neutral: 28, negative: 20 },
];

// 热门关键词
export const mockTopKeywords = [
  { word: "闪退", count: 89, sentiment: "negative" as const },
  { word: "公会系统", count: 67, sentiment: "positive" as const },
  { word: "副本难度", count: 54, sentiment: "negative" as const },
  { word: "加载速度", count: 45, sentiment: "negative" as const },
  { word: "画面精美", count: 38, sentiment: "positive" as const },
  { word: "新手引导", count: 35, sentiment: "neutral" as const },
  { word: "活动奖励", count: 32, sentiment: "positive" as const },
  { word: "匹配机制", count: 28, sentiment: "neutral" as const },
  { word: "PVP", count: 26, sentiment: "negative" as const },
  { word: "自动战斗", count: 24, sentiment: "neutral" as const },
  { word: "角色平衡", count: 22, sentiment: "negative" as const },
  { word: "战斗回放", count: 20, sentiment: "positive" as const },
];

// 报告数据
export const mockReport: Report = {
  id: "report-001",
  projectId: "proj-001",
  title: "星际冒险 - 2026年4月第三周反馈分析报告",
  createdAt: "2026-04-21T08:00:00Z",
  summary: "本周共收集玩家反馈 156 条，整体情感倾向偏正面，主要问题集中在闪退 Bug 和副本难度平衡上。",
  content: `
## 一、数据概览

本周（4月15日-4月21日）共收集玩家反馈 **156 条**，较上周增加 12%。

### 情感分布
- **正面反馈**：52%（81条）
- **中性反馈**：28%（44条）
- **负面反馈**：20%（31条）

## 二、重点问题

### 2.1 闪退问题（紧急）
**影响范围**：iPhone 15 系列
**反馈数量**：23 条
**问题描述**：玩家在进入副本或进行战斗时出现闪退现象。
**建议措施**：
1. 优先排查 iOS 17.4 兼容性问题
2. 收集闪退日志进行分析
3. 发布热修复补丁

### 2.2 副本难度过高
**反馈数量**：18 条
**问题描述**：第5章"暗影城堡"副本难度过高，普通玩家难以通关。
**建议措施**：
1. 适当降低小怪血量
2. 调整 BOSS 技能伤害
3. 优化匹配机制，增加组队引导

## 三、功能建议 Top 3

1. **公会系统**（67条）：玩家强烈希望能增加公会功能
2. **好友系统优化**（34条）：希望能查看好友在线状态
3. **战斗回放**（28条）：希望能回看精彩战斗

## 四、下周计划

1. 修复 iPhone 15 闪退问题
2. 平衡副本难度
3. 启动公会系统策划
`,
};
