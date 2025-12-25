#!/bin/bash
set -e

echo "-----------------------------------------"
echo "Hybrid MF Analyzer – Setup & Data Pipeline"
echo "-----------------------------------------"

node -v

echo "📈 Fetching AMFI NAV historical data..."
node scripts/fetch_amfi.js

echo "📊 Fetching Nifty 50 historical data..."
node scripts/fetch_nifty.js

echo "📊 Building category averages..."
node scripts/build_category_avg.js

echo "🚀 Pushing updated data to GitHub..."

git config user.name "amfi-bot"
git config user.email "amfi-bot@users.noreply.github.com"

git pull --rebase origin main
git add .
git commit -m "Automated MF data update" || echo "ℹ️ No changes to commit"
git push origin main
