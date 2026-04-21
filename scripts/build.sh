#!/bin/bash
set -e

echo "📊 Generating analysis report..."
node scripts/generate-report.js

echo "Building client..."
npx vite build

echo "Build complete!"
