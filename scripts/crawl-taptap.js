/**
 * TapTap 评论爬虫
 * 使用 TapTap Web API 获取游戏评论
 * API: https://www.taptap.com/webapiv2/review/v2/by-app
 */

const fs = require('fs');
const path = require('path');

const TAPTAP_API = 'https://www.taptap.com/webapiv2/review/v2/by-app';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'X-UA': 'V=1&PN=WebApp&LANG=zh-CN',
};

/**
 * 抓取 TapTap 评论
 * @param {string} appId - TapTap 游戏 ID（如 街篮2: 168332）
 * @param {number} maxPages - 最大页数（每页10条）
 * @param {number} delayMs - 请求间隔（毫秒）
 */
async function fetchTapTapReviews(appId, maxPages = 50, delayMs = 800) {
  console.log(`🎮 开始抓取 TapTap 评论 (app_id=${appId}, max_pages=${maxPages})`);
  
  const allReviews = [];
  let hasMore = true;
  let page = 0;

  while (hasMore && page < maxPages) {
    const from = page * 10;
    const url = `${TAPTAP_API}?app_id=${appId}&from=${from}&limit=10&mainRequest=true&X-UA=V%3D1%26PN%3DWebApp%26LANG%3Dzh-CN`;

    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) {
        console.log(`⚠️ 第 ${page + 1} 页请求失败: ${res.status}`);
        break;
      }

      const data = await res.json();
      const reviews = data.data?.list || [];
      
      if (reviews.length === 0) {
        hasMore = false;
        break;
      }

      for (const review of reviews) {
        const msg = review.msg || review.title || '';
        if (!msg.trim()) continue;

        allReviews.push({
          id: `taptap_${review.id || review.uid}_${page}_${allReviews.length}`,
          source: 'taptap',
          content: msg.substring(0, 500),
          score: review.score || 0,
          author: review.author?.name || '匿名用户',
          version: review.version || '',
          voted_up: review.voted_up,
          created_at: review.updated_at || review.created_at || '',
          category: categorizeReview(msg),
          sentiment: analyzeSentiment(msg, review.score),
          urgency: calcUrgency(review.score),
          keywords: extractKeywords(msg),
          timestamp: new Date().toISOString(),
        });
      }

      page++;
      console.log(`  ✅ 第 ${page} 页: ${reviews.length} 条 (累计 ${allReviews.length})`);

      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (err) {
      console.log(`  ❌ 第 ${page + 1} 页出错: ${err.message}`);
      break;
    }
  }

  console.log(`✅ TapTap 抓取完成: ${allReviews.length} 条`);
  return allReviews;
}

// 简单分类
function categorizeReview(text) {
  const lower = text.toLowerCase();
  if (lower.includes('闪退') || lower.includes('卡顿') || lower.includes('崩溃') || lower.includes('bug') || lower.includes('报错')) return '性能问题';
  if (lower.includes('平衡') || lower.includes('削弱') || lower.includes('加强') || lower.includes('职业')) return '游戏平衡';
  if (lower.includes('美术') || lower.includes('画面') || lower.includes('模型') || lower.includes('特效')) return '美术表现';
  if (lower.includes('操作') || lower.includes('手感') || lower.includes('按键') || lower.includes('延迟')) return '操作手感';
  if (lower.includes('音乐') || lower.includes('音效') || lower.includes('声音')) return '音频体验';
  if (lower.includes('ui') || lower.includes('界面') || lower.includes('布局') || lower.includes('菜单')) return 'UI/UX';
  if (lower.includes('玩法') || lower.includes('模式') || lower.includes('活动') || lower.includes('副本')) return '玩法设计';
  if (lower.includes('匹配') || lower.includes('排队') || lower.includes('等待')) return '匹配体验';
  return '综合体验';
}

// 简单情感分析
function analyzeSentiment(text, score) {
  if (score >= 8) return 'positive';
  if (score <= 3) return 'negative';
  const negative = ['垃圾', '恶心', '失望', '差', '烂', '不行', '无语', '差评', '劝退', '没法玩', '难受'];
  const positive = ['好', '棒', '优秀', '喜欢', '不错', '满意', '好评', '赞', '完美', '好玩'];
  
  let negCount = 0, posCount = 0;
  negative.forEach(w => { if (text.includes(w)) negCount++; });
  positive.forEach(w => { if (text.includes(w)) posCount++; });
  
  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

function calcUrgency(score) {
  if (score <= 2) return 'critical';
  if (score <= 4) return 'high';
  if (score <= 6) return 'medium';
  return 'low';
}

function extractKeywords(text) {
  const kw = [];
  const terms = ['闪退', '卡顿', '崩溃', '延迟', '网络', '平衡', '职业', '操作', '手感', '美术', '画面', '音乐', '音效', 'UI', '界面', '玩法', '匹配', 'bug', 'BUG', '技能', '天赋', '盖帽', '投篮', '篮板', '爆发'];
  terms.forEach(t => { if (text.includes(t)) kw.push(t); });
  return kw.slice(0, 5);
}

// 执行
(async () => {
  const appId = process.argv[2] || '168332'; // 默认街篮2
  const maxPages = parseInt(process.argv[3]) || 50;
  
  const reviews = await fetchTapTapReviews(appId, maxPages);
  
  // 保存到 data 目录
  const outPath = path.resolve(__dirname, '../data/taptap_reviews.json');
  fs.writeFileSync(outPath, JSON.stringify(reviews, null, 2), 'utf-8');
  console.log(`💾 已保存到: ${outPath}`);
  
  // 同时复制到 docs
  const docsPath = path.resolve(__dirname, '../docs/data/taptap_reviews.json');
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.copyFileSync(outPath, docsPath);
  console.log(`💾 已同步到: ${docsPath}`);
})();
