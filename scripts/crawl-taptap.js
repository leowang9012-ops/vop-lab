/**
 * TapTap 评论爬虫（Firecrawl 版）
 * 使用 Firecrawl 分布式爬虫绕过 WAF 防护
 * API Key: fc-31859158f6274c2c8e6c92ac4e38fca0
 */

const fs = require('fs');
const path = require('path');

const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
const FIRECRAWL_API_KEY = 'fc-31859158f6274c2c8e6c92ac4e38fca0';

/**
 * 使用 Firecrawl 抓取 TapTap 评论页
 */
async function scrapeWithFirecrawl(url) {
  const res = await fetch(FIRECRAWL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 3000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firecrawl API error ${res.status}: ${err}`);
  }

  return await res.json();
}

/**
 * 从 Firecrawl 返回的 Markdown 中提取评论
 * TapTap 评论结构：
 * [用户名](链接)
 * 玩过
 * [评论内容](https://www.taptap.cn/review/xxx)
 * 时间
 * 来自 设备
 * 
 * 评分可能以 "X 分" 或 "好评/中评/差评" 标签形式出现
 */
function extractReviewsFromMarkdown(markdown) {
  const reviews = [];
  
  // 匹配评论内容：[text](https://www.taptap.cn/review/xxx)
  const reviewRegex = /\[([^\]]{10,2000})\]\(https:\/\/www\.taptap\.cn\/review\/\d+\)/g;
  let match;
  
  while ((match = reviewRegex.exec(markdown)) !== null) {
    const content = match[1].trim();
    if (content.length < 10) continue;
    
    // 获取上下文（前后各 500 字符）
    const start = Math.max(0, match.index - 500);
    const end = Math.min(markdown.length, match.index + match[0].length + 500);
    const context = markdown.substring(start, end);
    
    // 提取评分
    let score = 0;
    
    // 1. 尝试匹配 "X 分" 或 "X分"
    const scoreMatch = context.match(/(\d+\.?\d*)\s*分/);
    if (scoreMatch) {
      score = parseFloat(scoreMatch[1]);
      // TapTap 评分 0-10，转为 0-100
      if (score <= 10) score = score * 10;
    }
    
    // 2. 尝试匹配标签
    if (score === 0) {
      if (context.includes('好评')) score = 80;
      else if (context.includes('中评')) score = 50;
      else if (context.includes('差评')) score = 20;
    }
    
    // 3. 如果还是没有评分，从内容情感推断
    if (score === 0) {
      const negativeWords = ['氪金', '坑', '差', '垃圾', '失望', '恶心', '无语', '退游', '弃坑', '闪退', '卡顿', '崩溃'];
      const positiveWords = ['好玩', '不错', '推荐', '喜欢', '优秀', '满意', '良心', '赞', '棒'];
      
      let negCount = 0, posCount = 0;
      negativeWords.forEach(w => { if (content.includes(w)) negCount++; });
      positiveWords.forEach(w => { if (content.includes(w)) posCount++; });
      
      if (negCount > posCount) score = 30 + Math.random() * 20; // 20-50
      else if (posCount > negCount) score = 70 + Math.random() * 20; // 70-90
      else score = 50; // 中性
    }
    
    score = Math.round(score);
    
    // 提取时间
    const timeMatch = context.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/) || 
                      context.match(/(\d+)\s*天前/);
    let timestamp = new Date().toISOString();
    if (timeMatch) {
      if (timeMatch[1].includes('/')) {
        const d = new Date(timeMatch[1].replace(/\//g, '-'));
        if (!isNaN(d.getTime())) timestamp = d.toISOString();
      } else {
        const daysAgo = parseInt(timeMatch[1]);
        const d = new Date(Date.now() - daysAgo * 86400000);
        timestamp = d.toISOString();
      }
    }
    
    // 提取设备
    const deviceMatch = context.match(/来自\s+([^\n]+)/);
    const device = deviceMatch ? deviceMatch[1].trim() : '';
    
    reviews.push({
      content: content,
      score: score,
      timestamp: timestamp,
      device: device,
    });
  }
  
  return reviews;
}

/**
 * 抓取 TapTap 评论
 * @param {string} appId - TapTap 游戏 ID（街篮2: 175459）
 * @param {number} maxPages - 最大页数
 */
async function fetchTapTapReviews(appId, maxPages = 10) {
  console.log(`🎮 开始抓取 TapTap 评论 (app_id=${appId}, max_pages=${maxPages})`);
  
  const allReviews = [];

  for (let p = 1; p <= maxPages; p++) {
    const url = `https://www.taptap.com/app/${appId}/review?p=${p}`;
    
    try {
      console.log(`  🌐 正在抓取第 ${p} 页...`);
      const result = await scrapeWithFirecrawl(url);
      
      const markdown = result.data?.markdown || '';
      
      console.log(`  📄 页面内容长度: ${markdown.length} chars`);
      
      // 检查是否被拦截
      if (markdown.includes('blocked') || markdown.includes('验证') || markdown.includes('滑块')) {
        console.log(`  ⚠️ 第 ${p} 页被 WAF 拦截`);
        break;
      }
      
      const reviews = extractReviewsFromMarkdown(markdown);
      
      if (reviews.length === 0) {
        console.log(`  ⚠️ 第 ${p} 页: 未提取到评论`);
        break;
      }
      
      for (const review of reviews) {
        allReviews.push({
          id: `taptap_${appId}_${p}_${allReviews.length}`,
          source: 'taptap',
          content: review.content.substring(0, 500),
          score: review.score || 0,
          device: review.device,
          category: categorizeReview(review.content),
          sentiment: analyzeSentiment(review.content, review.score),
          urgency: calcUrgency(review.score),
          keywords: extractKeywords(review.content),
          timestamp: review.timestamp,
        });
      }
      
      console.log(`  ✅ 第 ${p} 页: ${reviews.length} 条 (累计 ${allReviews.length})`);
      
      if (reviews.length === 0) break;
      
      // Firecrawl 速率限制
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(`  ❌ 第 ${p} 页出错: ${err.message}`);
      break;
    }
  }
  
  console.log(`✅ TapTap 抓取完成: ${allReviews.length} 条`);
  return allReviews;
}

function categorizeReview(text) {
  const lower = text.toLowerCase();
  if (lower.includes('闪退') || lower.includes('卡顿') || lower.includes('崩溃') || lower.includes('bug') || lower.includes('黑屏')) return '性能问题';
  if (lower.includes('平衡') || lower.includes('削弱') || lower.includes('加强') || lower.includes('氪金') || lower.includes('充值')) return '游戏平衡';
  if (lower.includes('美术') || lower.includes('画面') || lower.includes('模型') || lower.includes('画风')) return '美术表现';
  if (lower.includes('操作') || lower.includes('手感') || lower.includes('按键') || lower.includes('摇杆')) return '操作手感';
  if (lower.includes('音乐') || lower.includes('音效')) return '音频体验';
  if (lower.includes('ui') || lower.includes('界面')) return 'UI/UX';
  if (lower.includes('玩法') || lower.includes('模式') || lower.includes('活动') || lower.includes('匹配')) return '玩法设计';
  return '综合体验';
}

function analyzeSentiment(text, score) {
  if (score >= 70) return 'positive';
  if (score <= 40) return 'negative';
  return 'neutral';
}

function calcUrgency(score) {
  if (score > 0 && score <= 20) return 'critical';
  if (score > 20 && score <= 40) return 'high';
  if (score > 40 && score <= 60) return 'medium';
  return 'low';
}

function extractKeywords(text) {
  const kw = [];
  const terms = ['闪退', '卡顿', '崩溃', '延迟', '网络', '平衡', '职业', '操作', '手感', '美术', '画面', '音乐', '音效', 'UI', '界面', '玩法', '匹配', 'bug', '技能', '天赋', '氪金', '充值', '黑屏'];
  terms.forEach(t => { if (text.includes(t)) kw.push(t); });
  return kw.slice(0, 5);
}

// 执行
(async () => {
  const appId = process.argv[2] || '175459';
  const maxPages = parseInt(process.argv[3]) || 5;
  
  const reviews = await fetchTapTapReviews(appId, maxPages);
  
  const outPath = path.resolve(__dirname, '../data/taptap_reviews.json');
  fs.writeFileSync(outPath, JSON.stringify(reviews, null, 2), 'utf-8');
  console.log(`💾 已保存到: ${outPath}`);
  
  const docsPath = path.resolve(__dirname, '../docs/data/taptap_reviews.json');
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.copyFileSync(outPath, docsPath);
  console.log(`💾 已同步到: ${docsPath}`);
})();
