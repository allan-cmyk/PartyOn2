#!/bin/bash
# Submit sitemaps to Google and Bing

set -e

PRIMARY_DOMAIN="https://partyondelivery.com"
SITEMAP_INDEX_URL="${PRIMARY_DOMAIN}/sitemap_index.xml.gz"

echo "=========================================="
echo "Submitting Sitemaps to Search Engines"
echo "=========================================="

# Google
echo ""
echo "📤 Submitting to Google..."
GOOGLE_RESPONSE=$(curl -s -w "\n%{http_code}" "https://www.google.com/ping?sitemap=${SITEMAP_INDEX_URL}")
GOOGLE_STATUS=$(echo "$GOOGLE_RESPONSE" | tail -n1)

if [ "$GOOGLE_STATUS" == "200" ]; then
    echo "✅ Google submission successful (HTTP 200)"
else
    echo "⚠️  Google submission returned HTTP $GOOGLE_STATUS"
fi

# Bing
echo ""
echo "📤 Submitting to Bing..."
BING_RESPONSE=$(curl -s -w "\n%{http_code}" "https://www.bing.com/ping?sitemap=${SITEMAP_INDEX_URL}")
BING_STATUS=$(echo "$BING_RESPONSE" | tail -n1)

if [ "$BING_STATUS" == "200" ]; then
    echo "✅ Bing submission successful (HTTP 200)"
else
    echo "⚠️  Bing submission returned HTTP $BING_STATUS"
fi

# Google Search Console API (optional)
if [ -f "gsc_credentials.json" ]; then
    echo ""
    echo "📤 Submitting via Google Search Console API..."
    echo "⚠️  GSC API submission requires additional setup"
    echo "   See: https://developers.google.com/search/apis/indexing-api/v3/quickstart"
else
    echo ""
    echo "ℹ️  Tip: Add gsc_credentials.json for Search Console API submission"
fi

echo ""
echo "=========================================="
echo "✅ Submission Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify submissions in Google Search Console"
echo "2. Check Bing Webmaster Tools"
echo "3. Monitor indexing over next 24-48 hours"
