#!/bin/bash
echo "🔨 Building Angular app for production..."
npm run build

echo "🖥️  Building Angular Universal server..."
npm run build:server:production

echo "📦 Compiling Express server..."
npm run build:express

echo "📁 Preparing static output for Vercel..."
mkdir -p .vercel/output/static
cp -r dist/app/browser/* .vercel/output/static/

echo "✅ Build complete"
