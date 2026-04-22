const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'data', 'projects', 'star-rail');
const fb = JSON.parse(fs.readFileSync(path.join(p, 'feedback_processed.json'), 'utf8'));

// 分类统计
const cats = {};
const sents = { positive: 0, neutral: 0, negative: 0 };
const urgents = { critical: 0, high: 0, medium: 0, low: 0 };
const sources = {};
const kwCount = {};

fb.forEach(f => {
  sents[f.sentiment] = (sents[f.sentiment] || 0) + 1;
  cats[f.category] = (cats[f.category] || 0) + 1;
  urgents[f.urgency] = (urgents[f.urgency] || 0) + 1;
  sources[f.source] = (sources[f.source] || 0) + 1;
  (f.keywords || []).forEach(k => { kwCount[k] = (kwCount[k] || 0) + 1; });
});

const avgScore = +(fb.reduce((s, f) => s + (f.score || 0), 0) / fb.length).toFixed(1);
const positiveRate = +(sents.positive / fb.length * 100).toFixed(1);

const topKw = Object.entries(kwCount)
  .map(([w, c]) => ({ keyword: w, count: c }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

const catArr = Object.entries(cats)
  .map(([cat, count]) => {
    const catFb = fb.filter(f => f.category === cat);
    const avg = +(catFb.reduce((s, f) => s + (f.score || 0), 0) / catFb.length).toFixed(1);
    return { category: cat, count, avgScore: avg };
  })
  .sort((a, b) => b.count - a.count);

// 生成 summary
const sourceDesc = Object.entries(sources).map(([k, v]) => `${k} ${v}条`).join('、');
const summary = `共 ${fb.length} 份反馈（${sourceDesc}），平均分 ${avgScore}，正面评价 ${positiveRate}%，紧急问题 ${urgents.critical} 个`;

const report = {
  id: `star-rail-report-${Date.now()}`,
  projectId: 'star-rail',
  title: '《崩坏星穹铁道》反馈分析报告',
  periodStart: '2026-04-22',
  periodEnd: '2026-04-22',
  totalFeedback: fb.length,
  avgScore,
  sourceDistribution: sources,
  categoryDistribution: cats,
  sentimentDistribution: sents,
  urgencyDistribution: urgents,
  topKeywords: topKw,
  scoreRanges: [1, 2, 3, 4, 5].map(r => ({
    range: `${r}星`,
    count: fb.filter(f => f.score === r).length,
  })),
  categoryAvgScores: catArr,
  sentimentAvgScores: [],
  urgentIssues: urgents.critical,
  lowScoreFeedback: fb.filter(f => f.score <= 2).slice(0, 10).map(f => ({
    content: f.content,
    category: f.category,
    score: f.score,
  })),
  highScoreFeedback: fb.filter(f => f.score >= 4).slice(0, 10).map(f => ({
    content: f.content,
    category: f.category,
    score: f.score,
  })),
  content: summary,
  summary,
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(p, 'report_latest.json'), JSON.stringify(report, null, 2));
console.log(`生成完成: ${report.title}, ${report.totalFeedback} 条`);
