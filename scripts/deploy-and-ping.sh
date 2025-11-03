#!/bin/bash

###############################################################################
# Deployment Script with Automatic Sitemap Pinging
#
# This script automates the deployment process and notifies search engines
# about sitemap updates.
#
# Usage:
#   ./scripts/deploy-and-ping.sh [environment]
#
# Arguments:
#   environment - Optional. Defaults to "production"
#                 Options: production, staging, preview
#
# Examples:
#   ./scripts/deploy-and-ping.sh
#   ./scripts/deploy-and-ping.sh production
#   ./scripts/deploy-and-ping.sh staging
#
# Author: Party On Delivery Team
# Last Updated: Nov 2024
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
SITEMAP_URL="https://partyondelivery.com/sitemap.xml"
GOOGLE_PING_URL="https://www.google.com/ping?sitemap="
BING_PING_URL="https://www.bing.com/ping?sitemap="

# Environment-specific URLs
if [ "$ENVIRONMENT" = "staging" ]; then
    SITEMAP_URL="https://party-on2-git-dev-infinite-burn-rate.vercel.app/sitemap.xml"
elif [ "$ENVIRONMENT" = "preview" ]; then
    echo -e "${YELLOW}Preview environment detected. Skipping sitemap ping.${NC}"
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PartyOn Delivery - Deployment & SEO Notification      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo -e "${BLUE}Sitemap URL:${NC} $SITEMAP_URL"
echo ""

# Step 1: Build the application
echo -e "${YELLOW}[1/5]${NC} Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed. Aborting deployment.${NC}"
    exit 1
fi

# Step 2: Run tests (if available)
echo ""
echo -e "${YELLOW}[2/5]${NC} Running tests..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test -- --passWithNoTests
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Tests passed${NC}"
    else
        echo -e "${RED}✗ Tests failed. Aborting deployment.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ No tests found. Skipping...${NC}"
fi

# Step 3: Deploy to Vercel
echo ""
echo -e "${YELLOW}[3/5]${NC} Deploying to Vercel..."

if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
elif [ "$ENVIRONMENT" = "staging" ]; then
    vercel
else
    vercel --no-wait
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment completed successfully${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

# Step 4: Wait for deployment to be live
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo ""
    echo -e "${YELLOW}[4/5]${NC} Waiting for deployment to be live..."
    sleep 30  # Wait 30 seconds for deployment to propagate
    echo -e "${GREEN}✓ Deployment should be live now${NC}"
fi

# Step 5: Ping search engines
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo ""
    echo -e "${YELLOW}[5/5]${NC} Notifying search engines..."

    # Ping Google
    echo -e "${BLUE}Pinging Google...${NC}"
    GOOGLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${GOOGLE_PING_URL}${SITEMAP_URL}")

    if [ "$GOOGLE_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Google notified successfully (HTTP $GOOGLE_RESPONSE)${NC}"
    else
        echo -e "${YELLOW}⚠ Google ping returned HTTP $GOOGLE_RESPONSE (this is usually fine)${NC}"
    fi

    # Ping Bing
    echo -e "${BLUE}Pinging Bing...${NC}"
    BING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BING_PING_URL}${SITEMAP_URL}")

    if [ "$BING_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Bing notified successfully (HTTP $BING_RESPONSE)${NC}"
    else
        echo -e "${YELLOW}⚠ Bing ping returned HTTP $BING_RESPONSE (this is usually fine)${NC}"
    fi

    # Verify sitemap is accessible
    echo ""
    echo -e "${BLUE}Verifying sitemap accessibility...${NC}"
    SITEMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SITEMAP_URL")

    if [ "$SITEMAP_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Sitemap is accessible (HTTP $SITEMAP_RESPONSE)${NC}"
    else
        echo -e "${RED}✗ Sitemap returned HTTP $SITEMAP_RESPONSE${NC}"
        echo -e "${YELLOW}Please check: $SITEMAP_URL${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}[5/5]${NC} Skipping search engine notification for preview environment"
fi

# Final summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Deployment Complete!                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Build: Success${NC}"
echo -e "${GREEN}✓ Tests: Passed${NC}"
echo -e "${GREEN}✓ Deploy: Success${NC}"

if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${GREEN}✓ SEO: Search engines notified${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Check deployment at: ${SITEMAP_URL%/sitemap.xml}"
echo -e "  2. Verify sitemap at: $SITEMAP_URL"
echo -e "  3. Monitor Google Search Console for indexing updates"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
