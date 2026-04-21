// 共享类型定义

// 项目类型
export interface Project {
  id: string;
  name: string;
  platform: "iOS" | "Android" | "PC" | "Console";
  feedbackCount: number;
  lastUpdated: string;
  status: "active" | "archived";
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
