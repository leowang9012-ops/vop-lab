#!/usr/bin/env node
/**
 * 趋势对比数据生成
 * 将反馈数据按时间分成两个时间段，生成对比分析数据
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const docsDir = path.join(__dirname, '../docs/data');

function loadData() {
  const filePath = path.join(dataDir, 'feedback_processed.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  // Save to both data/ and docs/data/
  const paths = [
    path.join(dataDir, 'trend_comparison.json'),
    path.join(docsDir, 'trend_comparison.json'),
  ];
  for (const p of paths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  }
  console.log(`✅ 趋势对比数据已保存`);
}

function generateTrendComparison() {
  console.log('📊 生成趋势对比数据...');
  
  const allData = loadData();
  console.log(`📊 读取到 ${allData.length} 条反馈数据`);

  // 按时间排序（假设有 created_at 或 timestamp 字段）
  // 如果没有时间字段，按数组顺序分成前后两半
  const sorted = [...allData].sort((a, b) => {
    const ta = a.created_at || a.timestamp || a.date || 0;
    const tb = b.created_at || b.timestamp || b.date || 0;
    return ta - tb;
  });

  // 分成两个时间段：前 50% vs 后 50%
  const mid = Math.floor(sorted.length / 2);
  const period1Data = sorted.slice(0, mid);
  const period2Data = sorted.slice(mid);

  console.log(`📊 时间段 1: ${period1Data.length} 条`);
  console.log(`📊 时间段 2: ${period2Data.length} 条`);

  const period1 = analyzePeriod(period1Data, '早期数据');
  const period2 = analyzePeriod(period2Data, '近期数据');

  const trendData = {
    period1,
    period2,
  };

  saveData(trendData);
  console.log('✅ 趋势对比数据生成完成');
}

function analyzePeriod(data, label) {
  const total = data.length;
  
  // 平均分
  const scores = data.map(d => d.score || d.rating || 0).filter(s => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0;

  // 情感分布
  const sentiments = data.map(d => d.sentiment || 'neutral');
  const sentimentCounts = {};
  sentiments.forEach(s => { sentimentCounts[s] = (sentimentCounts[s] || 0) + 1; });
  const sentimentDistribution = {
    positive: Math.round((sentimentCounts['positive'] || 0) / total * 100),
    neutral: Math.round((sentimentCounts['neutral'] || 0) / total * 100),
    negative: Math.round((sentimentCounts['negative'] || 0) / total * 100),
  };

  // 分类分布
  const categories = data.map(d => d.category || d.classification || '其他');
  const categoryCounts = {};
  categories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
  const categoryDistribution = Object.fromEntries(
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  );

  // 关键词统计
  const keywordCounts = {};
  data.forEach(d => {
    const kws = d.keywords || d.tags || [];
    if (Array.isArray(kws)) {
      kws.forEach(kw => {
        const key = typeof kw === 'string' ? kw : kw.keyword || kw.name || String(kw);
        keywordCounts[key] = (keywordCounts[key] || 0) + 1;
      });
    }
  });
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({ keyword, count }));

  // 紧急问题（从负面反馈中提取高频问题）
  const negativeData = data.filter(d => d.sentiment === 'negative' || d.urgency === 'high' || d.urgency === 'critical');
  const issueCounts = {};
  negativeData.forEach(d => {
    const content = d.content || d.comment || d.text || '';
    const category = d.category || d.classification || '其他';
    const key = `${category}`;
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  });
  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([issue, count]) => ({
      issue,
      count,
      severity: count > total * 0.15 ? 'critical' : count > total * 0.08 ? 'high' : 'medium',
    }));

  return {
    label,
    dateRange: '', // 会在后面填充
    totalFeedback: total,
    avgScore,
    positiveRate: sentimentDistribution.positive,
    negativeRate: sentimentDistribution.negative,
    categoryDistribution,
    sentimentDistribution,
    topKeywords,
    topIssues,
  };
}

// 运行
generateTrendComparison();
