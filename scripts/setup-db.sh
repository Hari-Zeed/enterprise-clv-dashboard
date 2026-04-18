#!/bin/bash

# Migration script for CLV Prediction SaaS
# This script creates the database schema using Prisma

set -e

echo "🔧 Installing dependencies..."
pnpm install

echo "📦 Generating Prisma client..."
pnpm exec prisma generate

echo "🗄️  Running database migrations..."
pnpm exec prisma migrate deploy

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Set up NextAuth credentials in .env.local"
echo "3. Configure OAuth providers (Google, etc.)"
