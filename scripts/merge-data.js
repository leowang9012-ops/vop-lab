/**
 * 多渠道数据合并脚本
 * 合并所有数据源：问卷反馈 + TapTap + App Store
 * 输出统一的 feedback_processed.json
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../data');
const reportsDir = path.resolve(dataDir, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.log(`⚠️ 解析失败: ${filePath}`);
    return [];
  }
}

// 加载所有数据源
const questionnaire = loadJSON(path.join(dataDir, 'feedback_processed.json'));
const taptap = loadJSON(path.join(dataDir, 'taptap_reviews.json'));
const appstore = loadJSON(path.join(dataDir, 'appstore_reviews.json'));

console.log(`📊 数据源加载:`);
console.log(`   问卷反馈: ${questionnaire.length} 条`);
console.log(`   TapTap: ${taptap.length} 条`);
console.log(`   App Store: ${appstore.length} 条`);

// 统一格式
function normalizeReview(review, source) {
  return {
    id: review.id || `${source}_${Math.random().toString(36).slice(2, 8)}`,
    source: review.source || source,
    content: review.content || '',
    category: review.category || '综合体验',
    sentiment: review.sentiment || 'neutral',
    urgency: review.urgency || 'normal',
    keywords: review.keywords || [],
    score: review.score || 0,
    timestamp: review.timestamp || review.created_at || new Date().toISOString(),
    author: review.author || '',
    version: review.version || '',
  };
}

// 合并
const allData = [
  ...questionnaire.map(r => normalizeReview(r, 'questionnaire')),
  ...taptap.map(r => normalizeReview(r, 'taptap')),
  ...appstore.map(r => normalizeReview(r, 'appstore')),
];

console.log(`✅ 合并完成: ${allData.length} 条`);

// 按来源统计
const sourceStats = {};
allData.forEach(r => {
  sourceStats[r.source] = (sourceStats[r.source] || 0) + 1;
});
console.log(`📋 来源分布:`, JSON.stringify(sourceStats));

// 保存
const outPath = path.join(dataDir, 'feedback_processed.json');
fs.writeFileSync(outPath, JSON.stringify(allData, null, 2), 'utf-8');
console.log(`💾 已保存: ${outPath}`);

// 同步到 docs
const docsPath = path.resolve(__dirname, '../docs/data/feedback_processed.json');
const docsDir = path.dirname(docsPath);
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
fs.copyFileSync(outPath, docsPath);
console.log(`💾 已同步: ${docsPath}`);
