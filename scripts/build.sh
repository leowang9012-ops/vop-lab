#!/bin/bash
set -e

echo "📊 Generating analysis report..."
node scripts/generate-report.js

echo "Building client..."
npx vite build

# Copy data files AFTER vite build (emptyOutDir clears docs/)
echo "📦 Copying data files to docs..."
mkdir -p docs/data
cp data/reports/report_latest.json docs/data/report_latest.json
cp data/feedback_processed.json docs/data/feedback_processed.json

# Restore 404.html for SPA routing
cat > docs/404.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>VoP Lab</title>
<script>location.replace('/vop-lab/'+location.pathname.slice(1))</script>
</head><body></body></html>
HTMLEOF

echo "Build complete!"
