const fs = require('fs');
const path = require('path');

const APP_ID = '1523037824'; // 星穹铁道 App Store ID
const COUNTRY = 'cn';
const PAGES = 10;

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
  const terms = ['闪退', '卡顿', '崩溃', '延迟', '网络', '平衡', '抽卡', '角色', '剧情', '体力', '氪金', '美术', '画面', '音乐', '音效', 'UI', '界面', '玩法', '匹配', 'bug', '技能', '天赋', '星琼', '副本'];
  terms.forEach(t => { if (text.includes(t)) kw.push(t); });
  return kw.slice(0, 5);
}

async function main() {
  console.log(`抓取星穹铁道 App Store (appId=${APP_ID}), ${PAGES} 页...`);
  const allReviews = [];

  for (let page = 1; page <= PAGES; page++) {
    const url = `https://itunes.apple.com/${COUNTRY}/rss/customerreviews/page=${page}/id=${APP_ID}/json`;
    console.log(`  第 ${page}/${PAGES} 页...`);
    try {
      const res = await fetch(url);
      if (!res.ok) { console.log(`  失败: ${res.status}`); break; }
      const data = await res.json();
      const entries = data.feed?.entry || [];
      const reviews = entries.slice(1);
      if (reviews.length === 0) { console.log(`  无更多评论`); break; }

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
          id: `starrail_appstore_${page}_${allReviews.length}`,
          source: 'appstore',
          content: text.substring(0, 500),
          score,
          author,
          version,
          created_at: date,
          category: categorizeReview(text),
          sentiment: analyzeSentiment(text, score),
          urgency: calcUrgency(score),
          keywords: extractKeywords(text),
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`    +${reviews.length} 条`);
      if (reviews.length < 40) break;
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`    失败: ${err.message}`);
    }
  }

  console.log(`\n共抓取 ${allReviews.length} 条`);

  // 保存到 star-rail 项目目录
  const outDir = path.join(__dirname, '..', 'data', 'projects', 'star-rail');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'appstore_reviews.json');
  fs.writeFileSync(outPath, JSON.stringify(allReviews, null, 2));
  console.log(`已保存到 ${outPath}`);

  // 生成 feedback_processed.json（统一格式，供看板使用）
  const processed = allReviews.map(r => ({
    ...r,
    id: r.id.replace('starrail_appstore_', 'starrail_feedback_'),
  }));
  const processedPath = path.join(outDir, 'feedback_processed.json');
  fs.writeFileSync(processedPath, JSON.stringify(processed, null, 2));
  console.log(`已保存到 ${processedPath}`);
}

main().catch(console.error);
