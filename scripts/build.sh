#!/bin/bash
set -e

echo "📊 Merging multi-channel data..."
node scripts/merge-data.js

echo "📊 Generating AI analysis report..."
node scripts/generate-report.js

echo "🕷️  Crawling TapTap reviews (optional, skip if no network)..."
# 街篮2 TapTap ID: 175459
node scripts/crawl-taptap.js 175459 5 || echo "⚠️ TapTap crawl skipped"

echo "🕷️  Crawling App Store reviews (optional, skip if no network)..."
# 街篮 App Store ID: 1096974019 (街篮2 可能尚未上架)
node scripts/crawl-appstore.js 1096974019 cn 5 || echo "⚠️ App Store crawl skipped"

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

# Restore 404.html for SPA routing
cat > docs/404.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>VoP Lab</title>
<script>location.replace('/vop-lab/'+location.pathname.slice(1))</script>
</head><body></body></html>
HTMLEOF

echo "Build complete!"
