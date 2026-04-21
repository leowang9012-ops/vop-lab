/**
 * 构建时报告生成脚本
 * 读取 feedback_processed.json，生成结构化分析报告
 * 输出到 data/reports/ 目录
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../data');
const reportsDir = path.resolve(dataDir, 'reports');

// 确保 reports 目录存在
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// 读取反馈数据
const feedbackPath = path.join(dataDir, 'feedback_processed.json');
const feedback = JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));

console.log(`📊 读取到 ${feedback.length} 条反馈数据`);

// ========== 统计分析 ==========

function analyzeFeedback(data) {
  const total = data.length;
  const scores = data.map(d => d.score || 0).filter(s => s > 0);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // 分类分布
  const categoryDist = {};
  data.forEach(d => {
    const cat = d.category || '未分类';
    categoryDist[cat] = (categoryDist[cat] || 0) + 1;
  });

  // 情感分布
  const sentimentDist = {};
  data.forEach(d => {
    const s = d.sentiment || 'neutral';
    sentimentDist[s] = (sentimentDist[s] || 0) + 1;
  });

  // 紧急度分布
  const urgencyDist = {};
  data.forEach(d => {
    const u = d.urgency || 'normal';
    urgencyDist[u] = (urgencyDist[u] || 0) + 1;
  });

  // 关键词统计
  const keywordCount = {};
  data.forEach(d => {
    (d.keywords || []).forEach(kw => {
      keywordCount[kw] = (keywordCount[kw] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // 分数分布
  const scoreRanges = {
    '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
  };
  scores.forEach(s => {
    if (s <= 20) scoreRanges['0-20']++;
    else if (s <= 40) scoreRanges['21-40']++;
    else if (s <= 60) scoreRanges['41-60']++;
    else if (s <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });

  // 低分反馈（需要关注的问题）
  const lowScoreFeedback = data
    .filter(d => d.score && d.score <= 30)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      content: d.content,
      score: d.score,
      category: d.category,
      sentiment: d.sentiment,
      keywords: d.keywords
    }));

  // 高分反馈（正面体验）
  const highScoreFeedback = data
    .filter(d => d.score && d.score >= 70)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      content: d.content,
      score: d.score,
      category: d.category,
      sentiment: d.sentiment,
      keywords: d.keywords
    }));

  // 按分类统计平均分
  const categoryScores = {};
  data.forEach(d => {
    if (d.score && d.score > 0) {
      const cat = d.category || '未分类';
      if (!categoryScores[cat]) categoryScores[cat] = [];
      categoryScores[cat].push(d.score);
    }
  });
  const categoryAvgScores = Object.entries(categoryScores).map(([cat, scores]) => ({
    category: cat,
    avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length
  })).sort((a, b) => a.avgScore - b.avgScore);

  // 按情感统计平均分
  const sentimentScores = {};
  data.forEach(d => {
    if (d.score && d.score > 0) {
      const s = d.sentiment || 'neutral';
      if (!sentimentScores[s]) sentimentScores[s] = [];
      sentimentScores[s].push(d.score);
    }
  });
  const sentimentAvgScores = Object.entries(sentimentScores).map(([s, scores]) => ({
    sentiment: s,
    avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length
  }));

  return {
    total,
    avgScore: Math.round(avgScore * 10) / 10,
    categoryDist,
    sentimentDist,
    urgencyDist,
    topKeywords,
    scoreRanges,
    lowScoreFeedback,
    highScoreFeedback,
    categoryAvgScores,
    sentimentAvgScores
  };
}

// ========== 生成报告文本 ==========

function generateReportText(analysis) {
  const { total, avgScore, categoryDist, sentimentDist, urgencyDist, topKeywords, scoreRanges, lowScoreFeedback, highScoreFeedback, categoryAvgScores, sentimentAvgScores } = analysis;

  const positiveCount = sentimentDist.positive || 0;
  const negativeCount = sentimentDist.negative || 0;
  const neutralCount = sentimentDist.neutral || 0;
  const positiveRate = total > 0 ? Math.round(positiveCount / total * 100) : 0;
  const negativeRate = total > 0 ? Math.round(negativeCount / total * 100) : 0;

  const criticalCount = urgencyDist.critical || 0;
  const highCount = urgencyDist.high || 0;

  const worstCategory = categoryAvgScores[0];
  const bestCategory = categoryAvgScores[categoryAvgScores.length - 1];

  let text = `# 《街篮2》试玩反馈分析报告\n\n`;
  text += `> 报告生成时间：${new Date().toISOString().split('T')[0]} | 样本总量：${total} 份\n\n`;

  text += `## 一、整体概况\n\n`;
  text += `本次分析共收集 **${total}** 份有效试玩反馈，整体平均评分 **${avgScore}/100** 分。\n\n`;
  text += `- **正面评价占比**：${positiveRate}%（${positiveCount} 份）\n`;
  text += `- **中性评价占比**：${Math.round(neutralCount / total * 100)}%（${neutralCount} 份）\n`;
  text += `- **负面评价占比**：${negativeRate}%（${negativeCount} 份）\n`;
  text += `- **紧急问题**：${criticalCount} 个严重 + ${highCount} 个高优先级\n\n`;

  text += `## 二、评分分布\n\n`;
  text += `| 分数段 | 人数 | 占比 |\n|--------|------|------|\n`;
  Object.entries(scoreRanges).forEach(([range, count]) => {
    text += `| ${range} 分 | ${count} | ${Math.round(count / total * 100)}% |\n`;
  });
  text += `\n`;

  text += `## 三、分类体验分析\n\n`;
  text += `| 体验维度 | 平均分 | 反馈数量 |\n|----------|--------|----------|\n`;
  categoryAvgScores.forEach(({ category, avgScore: avg, count }) => {
    text += `| ${category} | ${Math.round(avg * 10) / 10} | ${count} |\n`;
  });
  text += `\n`;

  text += `### 3.1 表现最差维度：${worstCategory.category}（${Math.round(worstCategory.avgScore * 10) / 10} 分）\n\n`;
  text += `该维度收到 ${worstCategory.count} 份反馈，是玩家体验的短板。建议优先排查相关问题。\n\n`;

  text += `### 3.2 表现最佳维度：${bestCategory.category}（${Math.round(bestCategory.avgScore * 10) / 10} 分）\n\n`;
  text += `该维度收到 ${bestCategory.count} 份反馈，玩家认可度较高。\n\n`;

  text += `## 四、情感分析\n\n`;
  text += `| 情感倾向 | 数量 | 占比 | 平均评分 |\n|----------|------|------|----------|\n`;
  sentimentAvgScores.forEach(({ sentiment, avgScore: avg, count }) => {
    const label = sentiment === 'positive' ? '正面' : sentiment === 'negative' ? '负面' : '中性';
    text += `| ${label} | ${count} | ${Math.round(count / total * 100)}% | ${Math.round(avg * 10) / 10} |\n`;
  });
  text += `\n`;

  text += `## 五、热门关键词 TOP10\n\n`;
  text += `| 关键词 | 提及次数 |\n|--------|----------|\n`;
  topKeywords.slice(0, 10).forEach(({ word, count }) => {
    text += `| ${word} | ${count} |\n`;
  });
  text += `\n`;

  text += `## 六、紧急问题清单\n\n`;
  if (lowScoreFeedback.length > 0) {
    text += `以下反馈评分 ≤ 30 分，需要重点关注和处理：\n\n`;
    lowScoreFeedback.forEach((fb, i) => {
      text += `**${i + 1}.** [${fb.category}] ${fb.content.substring(0, 80)}... — 评分 **${fb.score}**\n\n`;
    });
  } else {
    text += `暂无评分 ≤ 30 的紧急反馈。\n\n`;
  }

  text += `## 七、正面体验亮点\n\n`;
  if (highScoreFeedback.length > 0) {
    text += `以下反馈评分 ≥ 70 分，代表玩家认可的体验：\n\n`;
    highScoreFeedback.slice(0, 5).forEach((fb, i) => {
      text += `**${i + 1}.** [${fb.category}] ${fb.content.substring(0, 80)}... — 评分 **${fb.score}**\n\n`;
    });
  }

  text += `## 八、总结与建议\n\n`;

  // 自动生成建议
  const suggestions = [];
  if (negativeRate > 15) {
    suggestions.push(`负面评价占比 ${negativeRate}%，超过警戒线（15%），建议立即组织专项复盘`);
  }
  if (worstCategory.avgScore < 40) {
    suggestions.push(`"${worstCategory.category}" 维度平均分仅 ${Math.round(worstCategory.avgScore * 10) / 10}，是当前最大体验短板，建议列为下个版本的优先优化项`);
  }
  if (criticalCount > 0) {
    suggestions.push(`存在 ${criticalCount} 个严重紧急问题，需在 48 小时内响应处理`);
  }
  if (topKeywords[0] && topKeywords[0].count > total * 0.3) {
    suggestions.push(`"${topKeywords[0].word}" 被提及 ${topKeywords[0].count} 次（覆盖率 ${Math.round(topKeywords[0].count / total * 100)}%），是最集中的玩家关注点`);
  }
  if (avgScore < 50) {
    suggestions.push(`整体平均分 ${avgScore} 低于 50 分基准线，建议全面评估当前版本质量`);
  }
  suggestions.push(`持续收集反馈数据，建议每周生成一次分析报告追踪趋势`);

  text += suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n');
  text += `\n`;

  return text;
}

// ========== 执行 ==========

const analysis = analyzeFeedback(feedback);
const reportText = generateReportText(analysis);

const report = {
  id: 1,
  projectId: 1,
  title: '《街篮2》试玩反馈分析报告',
  periodStart: '2024-06-01',
  periodEnd: new Date().toISOString().split('T')[0],
  totalFeedback: analysis.total,
  avgScore: analysis.avgScore,
  categoryDistribution: analysis.categoryDist,
  sentimentDistribution: analysis.sentimentDist,
  urgencyDistribution: analysis.urgencyDist,
  topKeywords: analysis.topKeywords.map(k => k.word),
  scoreRanges: analysis.scoreRanges,
  categoryAvgScores: analysis.categoryAvgScores,
  sentimentAvgScores: analysis.sentimentAvgScores,
  urgentIssues: (analysis.urgencyDist.critical || 0) + (analysis.urgencyDist.high || 0),
  lowScoreFeedback: analysis.lowScoreFeedback,
  highScoreFeedback: analysis.highScoreFeedback,
  content: reportText,
  summary: `共 ${analysis.total} 份反馈，平均分 ${analysis.avgScore}，正面评价 ${Math.round((analysis.sentimentDist.positive || 0) / analysis.total * 100)}%，紧急问题 ${analysis.urgentIssues} 个`,
  createdAt: new Date().toISOString(),
};

// 写入报告 JSON
const reportPath = path.join(reportsDir, 'report_latest.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`✅ 报告已生成: ${reportPath}`);

// 同时写入 docs 目录（供 GitHub Pages 直接读取）
const docsReportPath = path.resolve(__dirname, '../docs/data/report_latest.json');
const docsDataDir = path.dirname(docsReportPath);
if (!fs.existsSync(docsDataDir)) {
  fs.mkdirSync(docsDataDir, { recursive: true });
}
fs.writeFileSync(docsReportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`✅ 报告已同步: ${docsReportPath}`);

// 复制反馈数据到 docs 目录
const feedbackSrc = path.join(dataDir, 'feedback_processed.json');
const feedbackDest = path.resolve(__dirname, '../docs/data/feedback_processed.json');
fs.copyFileSync(feedbackSrc, feedbackDest);
console.log(`✅ 反馈数据已同步: ${feedbackDest}`);

console.log(`\n📋 报告摘要:`);
console.log(`   样本量: ${report.totalFeedback}`);
console.log(`   平均分: ${report.avgScore}`);
console.log(`   正面率: ${Math.round((analysis.sentimentDist.positive || 0) / analysis.total * 100)}%`);
console.log(`   紧急问题: ${report.urgentIssues}`);
console.log(`   最差维度: ${analysis.categoryAvgScores[0]?.category} (${analysis.categoryAvgScores[0]?.avgScore})`);
console.log(`   最佳维度: ${analysis.categoryAvgScores[analysis.categoryAvgScores.length - 1]?.category} (${analysis.categoryAvgScores[analysis.categoryAvgScores.length - 1]?.avgScore})`);
