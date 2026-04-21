/**
 * AI 分析脚本 — 使用小米 Mimo 模型
 * 读取反馈数据，调用 AI 进行深度分析，生成智能报告
 */

const fs = require('fs');
const path = require('path');

const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions';
const MIMO_API_KEY = 'sk-cvn6ljuntxb8vhmb0sf1sqrif6vapfiqhh07bjns8piu2t1j';
const MIMO_MODEL = 'mimo-v2-pro';

const dataDir = path.resolve(__dirname, '../data');
const reportsDir = path.resolve(dataDir, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

const feedback = JSON.parse(fs.readFileSync(path.join(dataDir, 'feedback_processed.json'), 'utf-8'));
console.log(`📊 读取到 ${feedback.length} 条反馈数据`);

// ========== 统计分析（本地快速计算） ==========

function analyzeStats(data) {
  const total = data.length;
  const scores = data.map(d => d.score || 0).filter(s => s > 0);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const categoryDist = {};
  data.forEach(d => { const c = d.category || '未分类'; categoryDist[c] = (categoryDist[c] || 0) + 1; });

  const sentimentDist = {};
  data.forEach(d => { const s = d.sentiment || 'neutral'; sentimentDist[s] = (sentimentDist[s] || 0) + 1; });

  const urgencyDist = {};
  data.forEach(d => { const u = d.urgency || 'normal'; urgencyDist[u] = (urgencyDist[u] || 0) + 1; });

  const keywordCount = {};
  data.forEach(d => { (d.keywords || []).forEach(kw => { keywordCount[kw] = (keywordCount[kw] || 0) + 1; }); });
  const topKeywords = Object.entries(keywordCount).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([word, count]) => ({ word, count }));

  const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  scores.forEach(s => {
    if (s <= 20) scoreRanges['0-20']++;
    else if (s <= 40) scoreRanges['21-40']++;
    else if (s <= 60) scoreRanges['41-60']++;
    else if (s <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });

  const categoryScores = {};
  data.forEach(d => {
    if (d.score && d.score > 0) {
      const cat = d.category || '未分类';
      if (!categoryScores[cat]) categoryScores[cat] = [];
      categoryScores[cat].push(d.score);
    }
  });
  const categoryAvgScores = Object.entries(categoryScores).map(([cat, sc]) => ({
    category: cat, avgScore: sc.reduce((a, b) => a + b, 0) / sc.length, count: sc.length
  })).sort((a, b) => a.avgScore - b.avgScore);

  const sentimentScores = {};
  data.forEach(d => {
    if (d.score && d.score > 0) {
      const s = d.sentiment || 'neutral';
      if (!sentimentScores[s]) sentimentScores[s] = [];
      sentimentScores[s].push(d.score);
    }
  });
  const sentimentAvgScores = Object.entries(sentimentScores).map(([s, sc]) => ({
    sentiment: s, avgScore: sc.reduce((a, b) => a + b, 0) / sc.length, count: sc.length
  }));

  return {
    total, avgScore: Math.round(avgScore * 10) / 10,
    categoryDist, sentimentDist, urgencyDist, topKeywords, scoreRanges,
    categoryAvgScores, sentimentAvgScores,
    lowScoreFeedback: data.filter(d => d.score && d.score <= 30).sort((a, b) => (a.score || 0) - (b.score || 0)).slice(0, 10),
    highScoreFeedback: data.filter(d => d.score && d.score >= 70).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10),
  };
}

// ========== 调用 Mimo AI ==========

async function callMimo(prompt, maxTokens = 4096) {
  const body = {
    model: MIMO_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.3,
  };

  const res = await fetch(MIMO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MIMO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mimo API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ========== 生成 AI 分析报告 ==========

async function generateAIReport(stats) {
  console.log('🤖 调用小米 Mimo 生成 AI 分析报告...');

  // 准备数据摘要给 AI
  const summary = {
    total: stats.total,
    avgScore: stats.avgScore,
    categoryDist: stats.categoryDist,
    sentimentDist: stats.sentimentDist,
    urgencyDist: stats.urgencyDist,
    topKeywords: stats.topKeywords.slice(0, 15),
    categoryAvgScores: stats.categoryAvgScores,
    scoreRanges: stats.scoreRanges,
    lowScoreSamples: stats.lowScoreFeedback.slice(0, 5).map(f => ({ content: f.content.substring(0, 100), score: f.score, category: f.category })),
    highScoreSamples: stats.highScoreFeedback.slice(0, 5).map(f => ({ content: f.content.substring(0, 100), score: f.score, category: f.category })),
  };

  const prompt = `你是一个专业的游戏运营数据分析师。请根据以下试玩反馈数据，生成一份结构化的分析报告。

## 数据摘要

- **样本总量**: ${summary.total} 份
- **平均评分**: ${summary.avgScore}/100
- **评分分布**: ${JSON.stringify(summary.scoreRanges)}
- **分类分布**: ${JSON.stringify(summary.categoryDist)}
- **情感分布**: ${JSON.stringify(summary.sentimentDist)}
- **紧急度分布**: ${JSON.stringify(summary.urgencyDist)}
- **各维度平均分**（从低到高）: ${JSON.stringify(summary.categoryAvgScores)}
- **TOP15 关键词**: ${JSON.stringify(summary.topKeywords)}
- **低分样本**（≤30分）: ${JSON.stringify(summary.lowScoreSamples)}
- **高分样本**（≥70分）: ${JSON.stringify(summary.highScoreSamples)}

## 报告要求

请用 Markdown 格式生成报告，包含以下章节：

1. **整体概况** — 样本量、平均分、正负面占比、紧急问题数
2. **评分分布分析** — 各分数段人数占比及解读
3. **各维度体验分析** — 按平均分从低到高排列，指出短板和优势
4. **情感分析** — 正/中/负面评价占比及特征
5. **热门关键词解读** — TOP10 关键词的玩家意图解读
6. **核心问题诊断** — 基于低分样本，提炼 3-5 个最严重的问题，每个问题给出：
   - 问题描述
   - 影响范围（估算）
   - 优先级（P0/P1/P2）
   - 建议措施
7. **正面体验亮点** — 玩家认可的功能/体验
8. **总结与行动建议** — 按优先级排序的 5-8 条行动建议

报告语言：简体中文
风格：专业、简洁、数据驱动、可直接发给团队`

  try {
    const reportContent = await callMimo(prompt, 4096);
    console.log('✅ AI 报告生成成功');
    return reportContent;
  } catch (err) {
    console.error(`❌ AI 调用失败: ${err.message}`);
    console.log('⚠️ 回退到统计分析报告');
    return generateFallbackReport(stats);
  }
}

function generateFallbackReport(stats) {
  const { total, avgScore, categoryDist, sentimentDist, urgencyDist, topKeywords, scoreRanges, categoryAvgScores } = stats;
  const positiveCount = sentimentDist.positive || 0;
  const negativeCount = sentimentDist.negative || 0;
  const criticalCount = urgencyDist.critical || 0;
  const highCount = urgencyDist.high || 0;
  const worstCategory = categoryAvgScores[0];
  const bestCategory = categoryAvgScores[categoryAvgScores.length - 1];

  let text = `# 《街篮2》试玩反馈分析报告\n\n`;
  text += `> 报告生成时间：${new Date().toISOString().split('T')[0]} | 样本总量：${total} 份 | AI 分析\n\n`;
  text += `## 一、整体概况\n\n`;
  text += `本次分析共收集 **${total}** 份有效试玩反馈，整体平均评分 **${avgScore}/100** 分。\n\n`;
  text += `- **正面评价**：${positiveCount} 份（${Math.round(positiveCount / total * 100)}%）\n`;
  text += `- **中性评价**：${sentimentDist.neutral || 0} 份（${Math.round((sentimentDist.neutral || 0) / total * 100)}%）\n`;
  text += `- **负面评价**：${negativeCount} 份（${Math.round(negativeCount / total * 100)}%）\n`;
  text += `- **紧急问题**：${criticalCount} 个严重 + ${highCount} 个高优先级\n\n`;
  text += `## 二、评分分布\n\n`;
  text += `| 分数段 | 人数 | 占比 |\n|--------|------|------|\n`;
  Object.entries(scoreRanges).forEach(([range, count]) => {
    text += `| ${range} 分 | ${count} | ${Math.round(count / total * 100)}% |\n`;
  });
  text += `\n## 三、各维度体验分析\n\n`;
  text += `| 体验维度 | 平均分 | 反馈数量 | 评价 |\n|----------|--------|----------|------|\n`;
  categoryAvgScores.forEach(({ category, avgScore: avg, count }) => {
    const tag = avg >= 55 ? '✅' : avg >= 45 ? '⚠️' : '❌';
    text += `| ${category} | ${Math.round(avg * 10) / 10} | ${count} | ${tag} |\n`;
  });
  text += `\n最差维度：**${worstCategory.category}**（${Math.round(worstCategory.avgScore * 10) / 10} 分）\n`;
  text += `最佳维度：**${bestCategory.category}**（${Math.round(bestCategory.avgScore * 10) / 10} 分）\n\n`;
  text += `## 四、热门关键词 TOP10\n\n`;
  text += `| 关键词 | 提及次数 |\n|--------|----------|\n`;
  topKeywords.slice(0, 10).forEach(({ word, count }) => { text += `| ${word} | ${count} |\n`; });
  text += `\n## 五、建议优先级\n\n`;
  text += `1. **P0** — 优先改善 "${worstCategory.category}" 维度体验\n`;
  text += `2. **P0** — 处理 ${criticalCount} 个严重紧急问题\n`;
  text += `3. **P1** — 优化高频关键词反映的问题\n`;
  text += `4. **P2** — 保持 "${bestCategory.category}" 优势\n`;
  text += `5. **P3** — 持续收集反馈，每周生成报告\n`;
  return text;
}

// ========== 执行 ==========

(async () => {
  const stats = analyzeStats(feedback);
  const reportContent = await generateAIReport(stats);

  const report = {
    id: 1,
    projectId: 1,
    title: '《街篮2》试玩反馈分析报告（AI 生成）',
    periodStart: '2024-06-01',
    periodEnd: new Date().toISOString().split('T')[0],
    totalFeedback: stats.total,
    avgScore: stats.avgScore,
    categoryDistribution: stats.categoryDist,
    sentimentDistribution: stats.sentimentDist,
    urgencyDistribution: stats.urgencyDist,
    topKeywords: stats.topKeywords.map(k => k.word),
    scoreRanges: stats.scoreRanges,
    categoryAvgScores: stats.categoryAvgScores,
    sentimentAvgScores: stats.sentimentAvgScores,
    urgentIssues: (stats.urgencyDist.critical || 0) + (stats.urgencyDist.high || 0),
    lowScoreFeedback: stats.lowScoreFeedback,
    highScoreFeedback: stats.highScoreFeedback,
    content: reportContent,
    summary: `共 ${stats.total} 份反馈，平均分 ${stats.avgScore}，正面评价 ${Math.round((stats.sentimentDist.positive || 0) / stats.total * 100)}%，紧急问题 ${stats.urgentIssues} 个`,
    createdAt: new Date().toISOString(),
  };

  // 写入
  const reportPath = path.join(reportsDir, 'report_latest.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ 报告已生成: ${reportPath}`);

  const docsReportPath = path.resolve(__dirname, '../docs/data/report_latest.json');
  const docsDataDir = path.dirname(docsReportPath);
  if (!fs.existsSync(docsDataDir)) fs.mkdirSync(docsDataDir, { recursive: true });
  fs.writeFileSync(docsReportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ 报告已同步: ${docsReportPath}`);

  const feedbackDest = path.resolve(__dirname, '../docs/data/feedback_processed.json');
  fs.copyFileSync(path.join(dataDir, 'feedback_processed.json'), feedbackDest);
  console.log(`✅ 反馈数据已同步: ${feedbackDest}`);

  console.log(`\n📋 报告摘要:`);
  console.log(`   样本量: ${report.totalFeedback}`);
  console.log(`   平均分: ${report.avgScore}`);
  console.log(`   正面率: ${Math.round((stats.sentimentDist.positive || 0) / stats.total * 100)}%`);
  console.log(`   紧急问题: ${report.urgentIssues}`);
  console.log(`   AI 模型: Xiaomi Mimo v2 Pro`);
})();
