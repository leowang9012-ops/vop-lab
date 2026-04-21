# VOP Lab - 游戏用户之声智能分析平台

数据导入与AI处理模块。

## 环境变量

```env
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=vop_lab

# AI API（千问）
AI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-xxx
AI_MODEL=qwen-plus
```

## 项目结构

```
vop-lab/
├── server/
│   ├── types.ts                    # 共享类型定义
│   ├── index.ts                    # 统一导出
│   ├── routes.ts                   # Express API路由示例
│   ├── db/
│   │   ├── schema.ts               # Drizzle ORM 数据库Schema
│   │   └── connection.ts           # 数据库连接
│   └── services/
│       ├── import.ts               # 数据导入模块
│       ├── ai-processor.ts         # AI分析处理模块
│       └── report-generator.ts     # 报告生成模块
├── drizzle.config.ts               # Drizzle Kit 配置
├── package.json
└── tsconfig.json
```

## 模块说明

### 1. 数据导入模块 (`import.ts`)

- 支持 `.csv` / `.xls` / `.xlsx` 文件
- 自动识别列头（Q1-Q22问题、IP、总分等）
- 映射为标准化 `FeedbackInsertRow` 格式
- 批量插入（每批100条），批量失败自动降级为逐条重试
- 返回 `ImportStats` 统计

### 2. AI处理模块 (`ai-processor.ts`)

- 调用千问API（OpenAI兼容格式）进行分类+情感+紧急度分析
- 分类：bug/payment/gameplay/suggestion/emotion/other
- 情感：positive/neutral/negative
- 紧急度：high/medium/low
- 提取关键词（最多5个）+ 一句话摘要
- 批量处理支持并发控制和重试
- 返回结果自动校验和规范化

### 3. 报告生成模块 (`report-generator.ts`)

- 汇总项目时间段内的反馈数据
- 生成结构化 `AnalysisReport` 对象
- 输出为Markdown格式（含表格、emoji标记）
- 包含：总体概况、分类分布、情感分布、紧急度分布、Top关键词、紧急问题列表、改进建议
- 改进建议基于数据分布自动生成

## API示例

```typescript
// 导入
POST /api/import  { filePath: "/data/feedback.xlsx", projectId: "game-alpha" }

// 分析
POST /api/analyze { projectId: "game-alpha", limit: 200 }

// 报告
GET  /api/report?projectId=game-alpha&start=2026-01-01&end=2026-04-21
```

## 独立使用

```typescript
import { importFeedbackFile, analyzeFeedback, generateReport, reportToMarkdown } from './server';

// 单条分析
const result = await analyzeFeedback('游戏经常闪退，尤其在打Boss的时候');
// → { category: "bug", sentiment: "negative", urgency: "high", keywords: [...], summary: "..." }

// 批量分析
const batch = await batchAnalyzeFeedbacks(feedbackTexts, {}, { concurrency: 5 });

// 生成报告
const report = await generateReport('game-alpha', { start, end }, queryFn);
const markdown = reportToMarkdown(report);
```
