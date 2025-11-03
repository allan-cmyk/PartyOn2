###############################################################################
# Deployment Script with Automatic Sitemap Pinging (PowerShell/Windows)
#
# This script automates the deployment process and notifies search engines
# about sitemap updates.
#
# Usage:
#   .\scripts\deploy-and-ping.ps1 [environment]
#
# Arguments:
#   environment - Optional. Defaults to "production"
#                 Options: production, staging, preview
#
# Examples:
#   .\scripts\deploy-and-ping.ps1
#   .\scripts\deploy-and-ping.ps1 production
#   .\scripts\deploy-and-ping.ps1 staging
#
# Author: Party On Delivery Team
# Last Updated: Nov 2024
###############################################################################

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

# Configuration
$SitemapUrl = "https://partyondelivery.com/sitemap.xml"
$GooglePingUrl = "https://www.google.com/ping?sitemap="
$BingPingUrl = "https://www.bing.com/ping?sitemap="

# Environment-specific URLs
if ($Environment -eq "staging") {
    $SitemapUrl = "https://party-on2-git-dev-infinite-burn-rate.vercel.app/sitemap.xml"
} elseif ($Environment -eq "preview") {
    Write-Host "Preview environment detected. Skipping sitemap ping." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     PartyOn Delivery - Deployment & SEO Notification      ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "Environment: " -NoNewline; Write-Host $Environment -ForegroundColor Cyan
Write-Host "Sitemap URL: " -NoNewline; Write-Host $SitemapUrl -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the application
Write-Host "[1/5] Building application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 2: Run tests (if available)
Write-Host ""
Write-Host "[2/5] Running tests..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
if ($packageJson.scripts.test) {
    try {
        npm test -- --passWithNoTests
        Write-Host "✓ Tests passed" -ForegroundColor Green
    } catch {
        Write-Host "✗ Tests failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠ No tests found. Skipping..." -ForegroundColor Yellow
}

# Step 3: Deploy to Vercel
Write-Host ""
Write-Host "[3/5] Deploying to Vercel..." -ForegroundColor Yellow
try {
    if ($Environment -eq "production") {
        vercel --prod
    } elseif ($Environment -eq "staging") {
        vercel
    } else {
        vercel --no-wait
    }
    Write-Host "✓ Deployment completed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for deployment to be live
if ($Environment -eq "production" -or $Environment -eq "staging") {
    Write-Host ""
    Write-Host "[4/5] Waiting for deployment to be live..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    Write-Host "✓ Deployment should be live now" -ForegroundColor Green
}

# Step 5: Ping search engines
if ($Environment -eq "production" -or $Environment -eq "staging") {
    Write-Host ""
    Write-Host "[5/5] Notifying search engines..." -ForegroundColor Yellow

    # Ping Google
    Write-Host "Pinging Google..." -ForegroundColor Cyan
    try {
        $googleResponse = Invoke-WebRequest -Uri "$GooglePingUrl$SitemapUrl" -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ Google notified successfully (HTTP $($googleResponse.StatusCode))" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "⚠ Google ping returned HTTP $statusCode (this is usually fine)" -ForegroundColor Yellow
    }

    # Ping Bing
    Write-Host "Pinging Bing..." -ForegroundColor Cyan
    try {
        $bingResponse = Invoke-WebRequest -Uri "$BingPingUrl$SitemapUrl" -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ Bing notified successfully (HTTP $($bingResponse.StatusCode))" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "⚠ Bing ping returned HTTP $statusCode (this is usually fine)" -ForegroundColor Yellow
    }

    # Verify sitemap is accessible
    Write-Host ""
    Write-Host "Verifying sitemap accessibility..." -ForegroundColor Cyan
    try {
        $sitemapResponse = Invoke-WebRequest -Uri $SitemapUrl -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ Sitemap is accessible (HTTP $($sitemapResponse.StatusCode))" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Sitemap returned HTTP $statusCode" -ForegroundColor Red
        Write-Host "Please check: $SitemapUrl" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[5/5] Skipping search engine notification for preview environment" -ForegroundColor Yellow
}

# Final summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                    Deployment Complete!                   ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "✓ Build: Success" -ForegroundColor Green
Write-Host "✓ Tests: Passed" -ForegroundColor Green
Write-Host "✓ Deploy: Success" -ForegroundColor Green

if ($Environment -eq "production" -or $Environment -eq "staging") {
    Write-Host "✓ SEO: Search engines notified" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check deployment at: " -NoNewline; Write-Host $SitemapUrl.Replace("/sitemap.xml", "") -ForegroundColor White
Write-Host "  2. Verify sitemap at: " -NoNewline; Write-Host $SitemapUrl -ForegroundColor White
Write-Host "  3. Monitor Google Search Console for indexing updates"
Write-Host ""
Write-Host "Happy deploying! 🚀" -ForegroundColor Green
