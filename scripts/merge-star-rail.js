const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'data', 'projects', 'star-rail');

function analyze(text) {
  const pos = ['好','推荐','优秀','棒','喜欢','好玩','赞','不错','完美','精彩','满意','良心'];
  const neg = ['差','垃圾','烂','坑','坑钱','抄袭','差评','退款','卸载','骗','辣鸡','恶心'];
  const crit = ['崩溃','闪退','卡顿','黑屏','白屏','bug','Bug','丢失','回档','登不上','进不去'];

  let sPos = 0, sNeg = 0;
  pos.forEach(w => { if (text.includes(w)) sPos++; });
  neg.forEach(w => { if (text.includes(w)) sNeg++; });

  let sentiment = 'neutral';
  if (sPos > sNeg + 1) sentiment = 'positive';
  else if (sNeg > sPos + 1) sentiment = 'negative';

  let urgency = 'low';
  if (crit.some(w => text.includes(w))) urgency = 'critical';
  else if (sNeg > 2) urgency = 'high';
  else if (sNeg > 0) urgency = 'medium';
  if (sentiment === 'positive' && urgency !== 'critical') urgency = 'low';

  let score = sentiment === 'positive' ? 4 : sentiment === 'negative' ? 2 : 3;

  const cats = {
    '美术表现': ['画面','美术','画风','特效','建模','角色设计','立绘'],
    '音乐体验': ['音乐','bgm','BGM','音效','配乐','OST'],
    '剧情故事': ['剧情','故事','主线','支线','任务','叙事'],
    '氪金付费': ['氪金','抽卡','充值','付费','保底','星琼','648'],
    '游戏平衡': ['平衡','强度','超标','数值','伤害','战力'],
    '性能问题': ['崩溃','闪退','卡顿','发热','耗电','bug'],
    '操作手感': ['手感','操作','控制','瞄准','移动'],
    '综合体验': [],
  };

  let category = '综合体验';
  for (const [cat, words] of Object.entries(cats)) {
    if (words.some(w => text.includes(w))) { category = cat; break; }
  }

  const kwSet = new Set();
  const allKw = [...pos, ...neg, ...crit, '角色','剧情','抽卡','音乐','玩法','美术','氪金','星琼','平衡','画面','崩坏','游戏'];
  allKw.forEach(w => { if (text.includes(w)) kwSet.add(w); });

  return { sentiment, urgency, score, category, keywords: [...kwSet].slice(0, 5) };
}

const appstore = JSON.parse(fs.readFileSync(path.join(p, 'appstore_reviews.json'), 'utf8'));
const taptap = JSON.parse(fs.readFileSync(path.join(p, 'taptap_reviews.json'), 'utf8'));

const processedAppstore = appstore.map(r => {
  const content = r.title ? `${r.title} ${r.content}` : r.content;
  const a = analyze(content);
  return {
    id: `sr_appstore_${r.id}`,
    source: 'appstore',
    content,
    originalContent: content,
    score: r.score || a.score,
    sentiment: r.score >= 4 ? 'positive' : r.score <= 2 ? 'negative' : 'neutral',
    category: a.category,
    urgency: a.urgency,
    keywords: a.keywords,
    timestamp: r.timestamp,
    author: r.author || '',
    version: r.version || '',
  };
});

const processedTaptap = taptap.map((r, i) => {
  const a = analyze(r.content);
  return {
    id: `sr_taptap_${i}`,
    source: 'taptap',
    content: r.content,
    originalContent: r.content,
    score: a.score,
    sentiment: a.sentiment,
    category: a.category,
    urgency: a.urgency,
    keywords: a.keywords,
    timestamp: r.timestamp || '',
    author: r.author || '',
    version: r.version || '',
  };
});

const combined = [...processedAppstore, ...processedTaptap];
fs.writeFileSync(path.join(p, 'feedback_processed.json'), JSON.stringify(combined, null, 2));
console.log(`合并: App Store ${processedAppstore.length} + TapTap ${processedTaptap.length} = ${combined.length}`);
