const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
const FIRECRAWL_API_KEY = 'fc-31859158f6274c2c8e6c92ac4e38fca0';

const fs = require('fs');
const path = require('path');

// 星穹铁道 TapTap
const APP_ID = '224267';
const PAGES = 8;

async function scrape(url) {
  const res = await fetch(FIRECRAWL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FIRECRAWL_API_KEY}` },
    body: JSON.stringify({ url, onlyMainContent: true }),
  });
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${await res.text()}`);
  return res.json();
}

function extractReviews(markdown) {
  if (!markdown) return [];
  // 尝试多种提取方式

  // 方式1: 标准 taptap.cn review 链接
  const rx1 = /\[([^\]]{10,3000})\]\(https:\/\/(?:www\.)?taptap\.cn\/review\/\d+\)/g;
  let matches = [...markdown.matchAll(rx1)];
  if (matches.length > 0) return matches.map(m => m[1]);

  // 方式2: taptap.com
  const rx2 = /\[([^\]]{10,3000})\]\(https:\/\/(?:www\.)?taptap\.com\/review\/\d+\)/g;
  matches = [...markdown.matchAll(rx2)];
  if (matches.length > 0) return matches.map(m => m[1]);

  // 方式3: 匿名用户评论格式 (匿名用户\n评论内容)
  const rx3 = /\[([^\]]{10,3000})\]\(https:\/\/www\.taptap\.(?:cn|com)\/\w+\//g;
  matches = [...markdown.matchAll(rx3)];
  if (matches.length > 0) return matches.map(m => m[1]);

  // 方式4: 按段落分割，取看起来像评论的段落
  const lines = markdown.split('\n').filter(l => l.trim().length > 15 && l.trim().length < 1000);
  return lines.filter(l => {
    const t = l.trim();
    return t.length > 20 && !t.startsWith('#') && !t.startsWith('![]') && !t.startsWith('[') && !t.startsWith('-') && !t.includes('http');
  });
}

async function main() {
  console.log(`抓取星穹铁道 TapTap (${APP_ID}), ${PAGES} 页...`);
  const allReviews = [];

  for (let p = 1; p <= PAGES; p++) {
    console.log(`  第 ${p}/${PAGES} 页...`);
    try {
      const url = `https://www.taptap.cn/app/${APP_ID}/review?p=${p}`;
      const result = await scrape(url);
      const md = result.data?.markdown || '';

      // 调试输出
      if (p === 1) {
        fs.writeFileSync(path.join(__dirname, 'debug_taptap_p1.md'), md);
        console.log(`    [debug] 内容长度: ${md.length}`);
      }

      const reviews = extractReviews(md);
      if (reviews.length === 0) { console.log(`    无评论`); continue; }

      reviews.forEach((content, i) => {
        allReviews.push({
          id: `starrail_taptap_${p}_${i}`,
          source: 'taptap',
          content,
          timestamp: new Date().toISOString(),
        });
      });
      console.log(`    +${reviews.length} 条`);
      await new Promise(r => setTimeout(r, 2500));
    } catch (err) {
      console.error(`    失败: ${err.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n共抓取 ${allReviews.length} 条`);

  const outDir = path.join(__dirname, '..', 'data', 'projects', 'star-rail');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'taptap_reviews.json');
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : [];
  const seen = new Set(existing.map(r => r.content?.slice(0, 50)));
  const newOnes = allReviews.filter(r => { const k = r.content?.slice(0, 50); if (!k || seen.has(k)) return false; seen.add(k); return true; });
  const combined = [...existing, ...newOnes];
  fs.writeFileSync(outPath, JSON.stringify(combined, null, 2));
  console.log(`已保存，共 ${combined.length} 条`);
}

main().catch(console.error);
