/**
 * 语义聚类脚本 v3 - 贪心主题提取（无重复）
 * 改进：预合并相似关键词，避免重复主题
 */
const fs = require('fs');
const path = require('path');

const FEEDBACK_FILE = path.resolve(__dirname, '../data/feedback_processed.json');
const OUTPUT_FILE   = path.resolve(__dirname, '../data/clusters.json');

console.log('📊 语义聚类分析 v3...\n');

const rawData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
console.log('✅ 总反馈: ' + rawData.length + ' 条');

const hasKw = rawData.filter(item => item.keywords && item.keywords.length > 0);
console.log('✅ 有关键词: ' + hasKw.length + ' 条');

// ===== 1. 关键词预分组（语义相近的关键词归为一组）=====
const kwGroups = [
  { seeds: ['氪金', '充值', '钻石', '元宝', '付费', '消费', 'vip', '月卡', '抽卡', '开箱', '贵族', '首充'], group: '氪金与付费', emoji: '💰' },
  { seeds: ['匹配', '排位', '段位', '队友', '组排', '单排', '人机', '机器人', '青铜', '白银', '钻石', '皇冠'], group: '匹配体验', emoji: '🎮' },
  { seeds: ['画面', '画质', '特效', '建模', '美术', '角色', '皮肤', '时装', '立绘', '动画'], group: '美术表现', emoji: '🎨' },
  { seeds: ['手感', '操作', '按键', '摇杆', '投篮', '传球', '断招', '粘球'], group: '操作手感', emoji: '🕹️' },
  { seeds: ['bug', '闪退', '崩溃', '卡顿', '掉线', '延迟', '服务器', '发热', '耗电', '适配', '黑屏', '闪退', '网络延迟'], group: '性能与稳定性', emoji: '🔧' },
  { seeds: ['平衡', '削弱', '加强', '强度', '数值', '球员', '英雄', '技能', '太强', '太弱', '超标'], group: '游戏平衡', emoji: '⚖️' },
  { seeds: ['玩法', '模式', '活动', '更新', '版本', '内容', '无聊', '乏味', '趣味', '新鲜', '重复'], group: '玩法内容', emoji: '📦' },
  { seeds: ['中锋', '大前锋', '小前锋', '得分后卫', '控球后卫', '职业'], group: '职业与角色', emoji: '🏃' },
  { seeds: ['新手', '引导', '教程', '入门', '教学', '升级', '等级', '任务', '奖励'], group: '新手引导', emoji: '📖' },
  { seeds: ['公会', '好友', '社交', '组队', '聊天', '语音', '联盟', '师徒'], group: '社交体验', emoji: '👥' },
  { seeds: ['网络', 'wifi', '5g', '4g', '延迟'], group: '网络问题', emoji: '📶' },
];

// 构建 kw -> group 映射
const kwToGroup = new Map();
for (const g of kwGroups) {
  for (const kw of g.seeds) kwToGroup.set(kw, g);
}

// 全局关键词频率
const kwGlobal = new Map();
hasKw.forEach(item => {
  [...new Set(item.keywords)].forEach(k => {
    if (kwToGroup.has(k)) kwGlobal.set(k, (kwGlobal.get(k)||0) + 1);
  });
});

// 设备相关单独处理
const DEVICE_KW = new Set(['安卓手机','华为','小米','vivo','oppo','三星','一加','魅族','模拟器','荣耀','手机','平板','设备']);

// ===== 2. 预分类：每个样本分配到唯一主题组 =====
function assignGroup(item) {
  const kwCounts = new Map();
  for (const kw of item.keywords) {
    const g = kwToGroup.get(kw);
    if (g && !DEVICE_KW.has(kw)) {
      kwCounts.set(g.group, (kwCounts.get(g.group)||0) + 1);
    }
  }
  if (kwCounts.size === 0) return null;
  // 选关键词最多的组
  return [...kwCounts.entries()].sort((a,b)=>b[1]-a[1])[0];
}

// 按组聚合
const groupMembers = new Map();
for (const g of kwGroups) groupMembers.set(g.group, []);

hasKw.forEach(item => {
  const assigned = assignGroup(item);
  if (assigned) groupMembers.get(assigned[0]).push(item);
});

// 检查每个组的大小
console.log('\n📊 预分组结果:');
const sortedGroups = [...groupMembers.entries()].sort((a,b)=>b[1].length-a[1].length);
for (const [name, members] of sortedGroups) {
  const emoji = kwGroups.find(g=>g.group===name)?.emoji || '✨';
  console.log('   ' + emoji + ' ' + name + ': ' + members.length + '条');
}

// ===== 3. 生成主题报告 =====
const themes = [];
const STOP_KW = DEVICE_KW;

for (const g of kwGroups) {
  const members = groupMembers.get(g.group) || [];
  if (members.length < 20) continue;

  // 只统计本组的关键词（避免跨组污染）
  const groupKws = new Set(g.seeds);
  const kwFreq = new Map();
  members.forEach(item => {
    [...new Set(item.keywords)]
      .filter(k => groupKws.has(k) && !STOP_KW.has(k))
      .forEach(k => kwFreq.set(k, (kwFreq.get(k)||0) + 1));
  });

  const topTerms = [...kwFreq.entries()]
    .filter(([k,c]) => c >= 3)
    .sort((a,b)=>b[1]-a[1]).slice(0,12)
    .map(([word, count]) => ({ word, count }));

  const topWords = topTerms.slice(0,4).map(t=>t.word).join('');

  // 情感
  const sentDist = { positive:0, neutral:0, negative:0 };
  members.forEach(item => { const s = item.sentiment||'neutral'; sentDist[s]=(sentDist[s]||0)+1; });
  const sentTotal = members.length;

  // 类别
  const catDist = {};
  members.forEach(item => { const c = item.category||'其他'; catDist[c]=(catDist[c]||0)+1; });
  const topCat = Object.entries(catDist).sort((a,b)=>b[1]-a[1])[0]?.[0]||'其他';

  // 紧急
  const critical = members.filter(i=>i.urgency==='critical'||i.urgency==='high').length;

  // 主题描述
  const themeDesc = getThemeDesc(g.group, topWords, sentDist);

  // 代表反馈
  const reps = members.filter(item=>(item.content||'').length>=15)
    .sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,8)
    .map(item=>({
      id: item.id, content: item.content,
      sentiment: item.sentiment, urgency: item.urgency,
      source: item.source, score: item.score,
      keywords: item.keywords,
    }));

  themes.push({
    id: 'cluster-' + themes.length,
    themeName: g.group,
    themeEmoji: g.emoji,
    description: themeDesc,
    keywords: topTerms,
    primaryCategory: topCat,
    feedbackCount: members.length,
    criticalCount: critical,
    sampleCount: Math.min(members.length, 50),
    representatives: reps,
    sentiment: {
      positive: Math.round(sentDist.positive / sentTotal * 100),
      neutral:  Math.round(sentDist.neutral  / sentTotal * 100),
      negative: Math.round(sentDist.negative / sentTotal * 100),
    },
    categoryBreakdown: Object.entries(catDist).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(([name,count])=>({ name, count, pct: Math.round(count/sentTotal*100) })),
  });
}

// 未分类的反馈（无有效关键词）
const unclassified = hasKw.filter(item => !assignGroup(item));
console.log('\n⚠️  未归类: ' + unclassified.length + ' 条（无有效关键词）');

themes.sort((a,b)=>b.feedbackCount-a.feedbackCount);
themes.forEach((c,i)=>c.rank=i+1);

const output = {
  generatedAt: new Date().toISOString(),
  totalFeedback: rawData.length,
  analyzedFeedback: hasKw.length,
  classifiedFeedback: hasKw.length - unclassified.length,
  unclassifiedCount: unclassified.length,
  clusterCount: themes.length,
  method: 'Keyword Grouping + Pre-classification (v3)',
  clusters: themes,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
console.log('\n✅ 保存: ' + OUTPUT_FILE);
console.log('\n📊 主题概览（按反馈量排序）:');
themes.forEach(c => {
  console.log('  ' + c.rank + '. ' + c.themeEmoji + ' ' + c.themeName + ' (' + c.feedbackCount + '条 | 负面' + c.sentiment.negative + '% | 紧急' + c.criticalCount + '条)');
  console.log('     关键词: ' + c.keywords.slice(0,6).map(k=>k.word+'×'+k.count).join(', '));
});

function getThemeDesc(group, topWords, sentDist) {
  const negPct = sentDist.negative / (sentDist.positive+sentDist.neutral+sentDist.negative+1);
  const descs = {
    '氪金与付费': '涉及充值、虚拟货币、付费性价比，是玩家最关注的核心话题',
    '匹配体验': '关于匹配机制、队友质量和排位体验的反馈，高负面率话题',
    '美术表现': '游戏画面、视觉效果、美术风格相关反馈，部分机型适配问题突出',
    '操作手感': '操作响应、技能释放流畅度体验，是竞技体验的核心组成',
    '性能与稳定性': '技术性问题：Bug、闪退、服务器、发热耗电，影响留存',
    '游戏平衡': '角色强度、游戏数值平衡相关反馈，竞技公平性核心议题',
    '玩法内容': '游戏玩法设计、活动内容、版本更新相关反馈',
    '职业与角色': '关于篮球职业定位、角色强度的专项反馈',
    '新手引导': '新手入门、教程体验相关反馈，影响新玩家转化',
    '社交体验': '社交功能、公会系统体验反馈，影响长期留存',
    '网络问题': '网络连接质量、延迟、掉线相关反馈',
  };
  const base = descs[group] || '涉及多维度体验的综合反馈';
  if (negPct > 0.6) return base + '，需重点关注改善';
  return base;
}
