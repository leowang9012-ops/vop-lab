#!/bin/bash
set -e

echo "📊 Merging multi-channel data..."
node scripts/merge-data.js

echo "📊 Generating AI analysis report..."
node scripts/generate-report.js

echo "🕷️  Crawling TapTap reviews (optional, skip if no network)..."
node scripts/crawl-taptap.js 168332 20 500 || echo "⚠️ TapTap crawl skipped"

echo "🕷️  Crawling App Store reviews (optional, skip if no network)..."
node scripts/crawl-appstore.js 168332 cn 3 || echo "⚠️ App Store crawl skipped"

echo "🔄 Re-merging with crawled data..."
node scripts/merge-data.js

echo "🔄 Re-generating report with all data..."
node scripts/generate-report.js

echo "Building client..."
npx vite build

# Copy data files AFTER vite build (emptyOutDir clears docs/)
echo "📦 Copying data files to docs..."
mkdir -p docs/data
cp data/reports/report_latest.json docs/data/report_latest.json
cp data/feedback_processed.json docs/data/feedback_processed.json
cp data/taptap_reviews.json docs/data/taptap_reviews.json 2>/dev/null || true
cp data/appstore_reviews.json docs/data/appstore_reviews.json 2>/dev/null || true

# Restore 404.html for SPA routing
cat > docs/404.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>VoP Lab</title>
<script>location.replace('/vop-lab/'+location.pathname.slice(1))</script>
</head><body></body></html>
HTMLEOF

echo "Build complete!"
