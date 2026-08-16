#!/bin/bash
echo "🔨 Building Angular app for production..."
npm run build

echo "🖥️  Building Angular Universal server..."
npm run build:server

echo "✅ Build complete"
