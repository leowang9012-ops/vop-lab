#!/bin/bash
set -e

echo "📊 Merging multi-channel data..."
node scripts/merge-data.js

echo "📊 Generating AI analysis report..."
node scripts/generate-report.js

echo "🕷️  Crawling TapTap reviews (optional, skip if no network)..."
node scripts/crawl-taptap.js 175459 5 || echo "⚠️  TapTap crawl skipped"

echo "🕷️  Crawling App Store reviews (optional, skip if no network)..."
node scripts/crawl-appstore.js 1096974019 cn 5 || echo "⚠️  App Store crawl skipped"

echo "🔄 Re-merging with crawled data..."
node scripts/merge-data.js

echo "🔄 Re-generating report with all data..."
node scripts/generate-report.js

echo "📈 Generating trend comparison data..."
node scripts/generate-trend.js

echo "Building client..."
npx vite build

# Copy data files AFTER vite build (emptyOutDir clears docs/)
echo "📦 Copying data files to docs..."
mkdir -p docs/data
cp data/reports/report_latest.json docs/data/report_latest.json
cp data/feedback_processed.json docs/data/feedback_processed.json
cp data/trend_comparison.json docs/data/trend_comparison.json 2>/dev/null || true
cp data/taptap_reviews.json docs/data/taptap_reviews.json 2>/dev/null || true
cp data/appstore_reviews.json docs/data/appstore_reviews.json 2>/dev/null || true
cp data/projects.json docs/data/projects.json 2>/dev/null || true

# Generate semantic clusters AFTER data copy
echo "🔮 Running semantic clustering..."
node scripts/semantic-cluster.js || echo "⚠️  Semantic clustering skipped"
cp data/clusters.json docs/data/clusters.json 2>/dev/null || true

# GitHub Pages SPA fallback: redirect all 404s to app root
cat > docs/404.html << 'EOF404'
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>VoP Lab</title></head>
<body>
<script>
var base = location.pathname.replace(/\/[^/]*$/, '/');
location.replace(location.origin + base);
</script>
</body>
</html>
EOF404

echo "Build complete!"
