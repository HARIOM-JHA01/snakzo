#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL is not set${NC}"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ ERROR: VERCEL_TOKEN is not set${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
bun install --frozen-lockfile

echo -e "${YELLOW}🔨 Building application...${NC}"
bun run build

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
bunx prisma migrate deploy

echo -e "${YELLOW}🌱 Seeding database (if needed)...${NC}"
bunx prisma db seed || echo "Seeding skipped or already done"

echo -e "${YELLOW}☁️  Deploying to Vercel...${NC}"
vercel --prod --token="$VERCEL_TOKEN"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Post-deployment checks
echo -e "${YELLOW}🔍 Running post-deployment health checks...${NC}"

RETRIES=5
DELAY=10

for i in $(seq 1 $RETRIES); do
    echo "Attempt $i of $RETRIES..."
    
    if curl -f -s "$PRODUCTION_URL" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed! Site is up and running.${NC}"
        
        # Warm up cache
        echo -e "${YELLOW}🔥 Warming up cache...${NC}"
        curl -s "$PRODUCTION_URL/shop" > /dev/null
        curl -s "$PRODUCTION_URL/api/products" > /dev/null
        
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}⚠️  Health check failed. Retrying in ${DELAY}s...${NC}"
    sleep $DELAY
done

echo -e "${RED}❌ Health check failed after $RETRIES attempts.${NC}"
exit 1
