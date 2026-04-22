/**
 * 语义聚类脚本 - 支持多项目
 * 用法: node scripts/semantic-cluster-project.js [dataDir]
 */
const fs = require('fs');
const path = require('path');

const inputDir = process.argv[2] || path.resolve(__dirname, '../data');
const FEEDBACK_FILE = path.join(inputDir, 'feedback_processed.json');
const OUTPUT_FILE   = path.join(inputDir, 'clusters.json');

console.log('📊 语义聚类分析... 输入: ' + inputDir);

if (!fs.existsSync(FEEDBACK_FILE)) {
  console.log('❌ 找不到 ' + FEEDBACK_FILE);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
console.log('✅ 总反馈: ' + rawData.length + ' 条');

const hasKw = rawData.filter(item => item.keywords && item.keywords.length > 0);
console.log('✅ 有关键词: ' + hasKw.length + ' 条');

// ===== 1. 关键词预分组 =====
const kwGroups = [
  { seeds: ['氪金', '充值', '钻石', '元宝', '付费', '消费', 'vip', '月卡', '抽卡', '开箱', '贵族', '首充'], group: '氪金与付费', emoji: '💰' },
  { seeds: ['匹配', '排位', '段位', '队友', '组排', '单排', '人机', '机器人', '青铜', '白银', '皇冠'], group: '匹配体验', emoji: '🎮' },
  { seeds: ['画面', '画质', '特效', '建模', '美术', '皮肤', '时装', '立绘', '动画', '角色设计'], group: '美术表现', emoji: '🎨' },
  { seeds: ['手感', '操作', '按键', '摇杆', '投篮', '传球', '断招', '粘球'], group: '操作手感', emoji: '🕹️' },
  { seeds: ['bug', '闪退', '崩溃', '卡顿', '掉线', '延迟', '服务器', '发热', '耗电', '适配', '黑屏', '网络延迟'], group: '性能与稳定性', emoji: '🔧' },
  { seeds: ['平衡', '削弱', '加强', '强度', '数值', '球员', '英雄', '技能', '太强', '太弱', '超标', '战力'], group: '游戏平衡', emoji: '⚖️' },
  { seeds: ['玩法', '模式', '活动', '更新', '版本', '内容', '无聊', '乏味', '趣味', '新鲜', '重复', '剧情', '故事', '主线', '任务'], group: '玩法内容', emoji: '📦' },
  { seeds: ['中锋', '大前锋', '小前锋', '得分后卫', '控球后卫', '职业', '角色'], group: '职业与角色', emoji: '🏃' },
  { seeds: ['新手', '引导', '教程', '入门', '教学', '升级', '等级', '奖励'], group: '新手引导', emoji: '📖' },
  { seeds: ['公会', '好友', '社交', '组队', '聊天', '语音', '联盟', '师徒'], group: '社交体验', emoji: '👥' },
  { seeds: ['网络', 'wifi', '5g', '4g', '延迟', '掉线'], group: '网络问题', emoji: '📶' },
  { seeds: ['音乐', 'bgm', 'BGM', '音效', '配乐', 'OST', '音轨'], group: '音乐体验', emoji: '🎵' },
  { seeds: ['保底', '星琼', '648', '价格', '性价比', '氪', '大小月卡'], group: '付费体验', emoji: '💎' },
];

const kwToGroup = new Map();
for (const g of kwGroups) {
  for (const kw of g.seeds) kwToGroup.set(kw, g);
}

const DEVICE_KW = new Set(['安卓手机','华为','小米','vivo','oppo','三星','一加','魅族','模拟器','荣耀','手机','平板','设备']);

function assignGroup(item) {
  const kwCounts = new Map();
  for (const kw of (item.keywords || [])) {
    const g = kwToGroup.get(kw);
    if (g && !DEVICE_KW.has(kw)) {
      kwCounts.set(g.group, (kwCounts.get(g.group)||0) + 1);
    }
  }
  if (kwCounts.size === 0) return null;
  return [...kwCounts.entries()].sort((a,b)=>b[1]-a[1])[0];
}

const groupMembers = new Map();
for (const g of kwGroups) groupMembers.set(g.group, []);

hasKw.forEach(item => {
  const assigned = assignGroup(item);
  if (assigned) groupMembers.get(assigned[0]).push(item);
});

console.log('\n📊 预分组结果:');
const sortedGroups = [...groupMembers.entries()].sort((a,b)=>b[1].length-a[1].length);
for (const [name, members] of sortedGroups) {
  if (members.length > 0) {
    const emoji = kwGroups.find(g=>g.group===name)?.emoji || '✨';
    console.log('   ' + emoji + ' ' + name + ': ' + members.length + '条');
  }
}

// ===== 3. 生成主题报告 =====
const themes = [];
const STOP_KW = DEVICE_KW;

for (const g of kwGroups) {
  const members = groupMembers.get(g.group) || [];
  if (members.length < 10) continue;

  const groupKws = new Set(g.seeds);
  const kwFreq = new Map();
  members.forEach(item => {
    [...new Set(item.keywords || [])]
      .filter(k => groupKws.has(k) && !STOP_KW.has(k))
      .forEach(k => kwFreq.set(k, (kwFreq.get(k)||0) + 1));
  });

  const topTerms = [...kwFreq.entries()]
    .filter(([k,c]) => c >= 2)
    .sort((a,b)=>b[1]-a[1]).slice(0,12)
    .map(([word, count]) => ({ word, count }));

  const sentDist = { positive:0, neutral:0, negative:0 };
  members.forEach(item => { const s = item.sentiment||'neutral'; sentDist[s]=(sentDist[s]||0)+1; });
  const sentTotal = members.length;

  const catDist = {};
  members.forEach(item => { const c = item.category||'其他'; catDist[c]=(catDist[c]||0)+1; });
  const topCat = Object.entries(catDist).sort((a,b)=>b[1]-a[1])[0]?.[0]||'其他';

  const critical = members.filter(i=>i.urgency==='critical'||i.urgency==='high').length;

  const reps = members.filter(item=>(item.content||'').length>=15)
    .sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,8)
    .map(item=>({
      id: item.id, content: item.content,
      sentiment: item.sentiment, urgency: item.urgency,
      source: item.source, score: item.score,
      keywords: item.keywords,
    }));

  const negPct = sentDist.negative / (sentTotal+1);
  const descMap = {
    '氪金与付费': '涉及充值、虚拟货币、付费性价比，是玩家最关注的核心话题',
    '匹配体验': '关于匹配机制、队友质量和排位体验的反馈',
    '美术表现': '游戏画面、视觉效果、美术风格相关反馈',
    '操作手感': '操作响应、技能释放流畅度体验',
    '性能与稳定性': '技术性问题：Bug、闪退、服务器、发热耗电',
    '游戏平衡': '角色强度、游戏数值平衡相关反馈',
    '玩法内容': '游戏玩法设计、活动内容、版本更新相关反馈',
    '职业与角色': '关于职业定位、角色强度的专项反馈',
    '新手引导': '新手入门、教程体验相关反馈',
    '社交体验': '社交功能、公会系统体验反馈',
    '网络问题': '网络连接质量、延迟、掉线相关反馈',
    '音乐体验': '游戏音乐、音效、配乐相关反馈',
    '付费体验': '关于定价、付费性价比的反馈',
  };
  let desc = descMap[g.group] || '综合反馈';
  if (negPct > 0.6) desc += '，需重点关注';

  themes.push({
    id: 'cluster-' + themes.length,
    themeName: g.group,
    themeEmoji: g.emoji,
    description: desc,
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

const unclassified = hasKw.filter(item => !assignGroup(item));
console.log('\n⚠️  未归类: ' + unclassified.length + ' 条');

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
console.log('📊 ' + themes.length + ' 个主题, 总反馈 ' + rawData.length + ' 条');
