/**
 * App Store 评论爬虫
 * 使用 Apple 公开 RSS Feed（无需 API Key）
 * API: https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/json
 */

const fs = require('fs');
const path = require('path');

/**
 * 抓取 App Store 评论
 * @param {string} appId - App Store 应用 ID
 * @param {string} country - 国家代码（cn/us/jp 等）
 * @param {number} maxPages - 最大页数（每页50条）
 */
async function fetchAppStoreReviews(appId, country = 'cn', maxPages = 10) {
  console.log(`🍎 开始抓取 App Store 评论 (app_id=${appId}, country=${country}, max_pages=${maxPages})`);
  
  const allReviews = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/json`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`⚠️ 第 ${page} 页请求失败: ${res.status}`);
        break;
      }

      const data = await res.json();
      const entries = data.feed?.entry || [];
      // 第一条是汇总信息，跳过
      const reviews = entries.slice(1);

      if (reviews.length === 0) break;

      for (const review of reviews) {
        const content = review.content?.label || '';
        const title = review.title?.label || '';
        const text = (title + ' ' + content).trim();
        if (!text) continue;

        const score = parseInt(review['im:rating']?.label || '0');
        const author = review.author?.name?.label || '匿名用户';
        const version = review['im:version']?.label || '';
        const date = review.updated?.label || '';

        allReviews.push({
          id: `appstore_${appId}_${page}_${allReviews.length}`,
          source: 'appstore',
          content: text.substring(0, 500),
          score: score,
          author: author,
          version: version,
          created_at: date,
          category: categorizeReview(text),
          sentiment: analyzeSentiment(text, score),
          urgency: calcUrgency(score),
          keywords: extractKeywords(text),
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`  ✅ 第 ${page} 页: ${reviews.length} 条 (累计 ${allReviews.length})`);

      // 如果返回少于50条，说明到最后一页了
      if (reviews.length < 50) break;

      // 礼貌延迟
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`  ❌ 第 ${page} 页出错: ${err.message}`);
      break;
    }
  }

  console.log(`✅ App Store 抓取完成: ${allReviews.length} 条`);
  return allReviews;
}

function categorizeReview(text) {
  const lower = text.toLowerCase();
  if (lower.includes('闪退') || lower.includes('卡顿') || lower.includes('崩溃') || lower.includes('bug')) return '性能问题';
  if (lower.includes('平衡') || lower.includes('削弱') || lower.includes('加强')) return '游戏平衡';
  if (lower.includes('美术') || lower.includes('画面') || lower.includes('模型')) return '美术表现';
  if (lower.includes('操作') || lower.includes('手感') || lower.includes('按键')) return '操作手感';
  if (lower.includes('音乐') || lower.includes('音效')) return '音频体验';
  if (lower.includes('ui') || lower.includes('界面')) return 'UI/UX';
  if (lower.includes('玩法') || lower.includes('模式') || lower.includes('活动')) return '玩法设计';
  return '综合体验';
}

function analyzeSentiment(text, score) {
  if (score >= 4) return 'positive';
  if (score <= 2) return 'negative';
  return 'neutral';
}

function calcUrgency(score) {
  if (score === 1) return 'critical';
  if (score === 2) return 'high';
  if (score === 3) return 'medium';
  return 'low';
}

function extractKeywords(text) {
  const kw = [];
  const terms = ['闪退', '卡顿', '崩溃', '延迟', '网络', '平衡', '职业', '操作', '手感', '美术', '画面', '音乐', '音效', 'UI', '界面', '玩法', '匹配', 'bug', '技能', '天赋'];
  terms.forEach(t => { if (text.includes(t)) kw.push(t); });
  return kw.slice(0, 5);
}

// 执行
(async () => {
  const appId = process.argv[2];
  const country = process.argv[3] || 'cn';
  const maxPages = parseInt(process.argv[4]) || 10;

  if (!appId) {
    console.log('用法: node crawl-appstore.js <appId> [country] [maxPages]');
    console.log('示例: node crawl-appstore.js 1234567890 cn 5');
    process.exit(1);
  }
  
  const reviews = await fetchAppStoreReviews(appId, country, maxPages);
  
  const outPath = path.resolve(__dirname, '../data/appstore_reviews.json');
  fs.writeFileSync(outPath, JSON.stringify(reviews, null, 2), 'utf-8');
  console.log(`💾 已保存到: ${outPath}`);
  
  const docsPath = path.resolve(__dirname, '../docs/data/appstore_reviews.json');
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.copyFileSync(outPath, docsPath);
  console.log(`💾 已同步到: ${docsPath}`);
})();
