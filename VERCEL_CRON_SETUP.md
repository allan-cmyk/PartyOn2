# Vercel Cron Setup - Automated Blog Generation

## 🎯 What This Does

Runs blog generation daily at 9 AM EST directly on Vercel's infrastructure.

**Note:** Vercel Cron requires a **Pro plan** ($20/month)

---

## 📋 Setup Steps

### Step 1: Add Environment Variables in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **PartyOn2**
3. Go to **Settings** → **Environment Variables**
4. Add the following variables for **all environments** (Production, Preview, Development):

**Variable 1:**
- Name: `OPENROUTER_API_KEY`
- Value: Your OpenRouter API key (from `.env.local`)

**Variable 2:**
- Name: `GOOGLE_API_KEY`
- Value: Same as OPENROUTER_API_KEY

**Variable 3:**
- Name: `CRON_SECRET`
- Value: Generate a random secure string (e.g., use: https://www.random.org/strings/)
- Example: `sk_live_51abc123xyz789_secret_key_here`

5. Click **Save** for each variable

---

### Step 2: Deploy to Vercel

The files are already created:
- ✅ `vercel.json` - Cron schedule configuration
- ✅ `src/app/api/cron/generate-blog/route.ts` - API endpoint

Just commit and push:

```bash
git add vercel.json src/app/api/cron/generate-blog/route.ts VERCEL_CRON_SETUP.md
git commit -m "Add Vercel Cron for automated blog generation"
git push origin dev
```

Then merge to main or deploy directly.

---

### Step 3: Verify Cron Job in Vercel

1. Go to your Vercel project dashboard
2. Click **Crons** tab (should appear after deployment)
3. You should see:
   - Path: `/api/cron/generate-blog`
   - Schedule: `0 14 * * *` (9 AM EST daily)
   - Status: Active ✅

---

### Step 4: Test the Cron Job

You can manually trigger the endpoint to test:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/generate-blog \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace:
- `your-domain.vercel.app` with your actual domain
- `YOUR_CRON_SECRET` with the secret you created in Step 1

**Expected Response:**
```json
{
  "success": true,
  "message": "Blog post generated successfully",
  "data": {
    "title": "Blog Post Title",
    "slug": "blog-post-slug",
    "wordCount": 2000,
    "url": "/blog/blog-post-slug"
  }
}
```

---

## 📅 Schedule Configuration

**Current Schedule:** Daily at 9 AM EST (2 PM UTC)

To change the schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-blog",
      "schedule": "0 14 * * *"
    }
  ]
}
```

**Cron Schedule Examples:**

| Schedule | Description |
|----------|-------------|
| `0 14 * * *` | Every day at 9 AM EST |
| `0 14 * * 1` | Every Monday at 9 AM EST |
| `0 14 * * 1,3,5` | Mon, Wed, Fri at 9 AM EST |
| `0 14 1 * *` | First day of month at 9 AM EST |
| `0 10,14 * * *` | Twice daily: 5 AM and 9 AM EST |

After changing the schedule:
1. Commit and push changes
2. Vercel will automatically update the cron job

---

## ⚠️ Important Notes

### 1. Image Generation Skipped

**Why:** Vercel cron jobs have a 10-second execution limit on Hobby/Pro plans.

**Impact:** Blog posts are generated WITHOUT images by default.

**Solutions:**

**Option A - Use Placeholder Images (Quick):**
The current setup uses a default placeholder image. No action needed.

**Option B - Separate Image Generation:**
Run image generation separately:
```bash
npm run generate-blog  # Locally generates with images
```

**Option C - Use GitHub Actions Instead:**
GitHub Actions has no time limit and can generate images.
See `.github/workflows/generate-daily-blog.yml`

### 2. File System Limitations

Vercel cron can only write to `/tmp` directory in serverless functions.

**Current Implementation:**
- Reads from `scripts/topics.json`
- Writes MDX files to `content/blog/posts/`
- Updates `topics.json` to mark as published

**Note:** File changes persist only if using Vercel's persistent storage or committing via API.

**Recommendation:** Use GitHub Actions for file-based blog generation, or modify to use a database.

---

## 💰 Costs

### Vercel Pro Plan
- **$20/month** - Required for cron jobs
- Includes other Pro features

### API Costs (per blog post)
- Claude text generation: ~$0.40-0.60
- **Total per post: ~$0.40-0.60** (no images)
- **Monthly (30 posts): ~$12-18**

### Total Monthly Cost
- Vercel Pro: $20
- API costs: $12-18
- **Total: ~$32-38/month**

---

## 🔍 Monitoring

### View Cron Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Logs** tab
4. Filter by `/api/cron/generate-blog`

### Check Cron Status

1. Go to **Crons** tab in Vercel
2. View execution history
3. See success/failure rates

### Monitor API Usage

Check OpenRouter dashboard:
https://openrouter.ai/activity

---

## 🔧 Troubleshooting

### "Unauthorized" Error
→ Check that `CRON_SECRET` matches in Vercel env vars and your test request

### "No unpublished topics remaining"
→ All 100 topics have been published! Add more topics to `scripts/topics.json`

### Cron job not running
→ Verify you're on Vercel Pro plan
→ Check Crons tab shows the job as active
→ Review logs for errors

### Timeout errors
→ This is expected if image generation is enabled
→ Use the current setup without images, or use GitHub Actions

---

## 🎯 Recommended Approach

Given the limitations, I recommend:

**Best Option: GitHub Actions** (FREE + Full Features)
- ✅ No time limits
- ✅ Generates images
- ✅ Creates PR for review
- ✅ Commits to repository
- ❌ Requires manual PR merge

**Alternative: Vercel Cron** (PAID + Fast)
- ✅ Fully automated
- ✅ No manual steps
- ❌ No images (by default)
- ❌ $20/month for Vercel Pro
- ⚠️ File persistence issues

**Best of Both:** Use GitHub Actions for generation + Vercel for hosting.

---

## 📝 Next Steps

1. ✅ Add environment variables in Vercel (Step 1)
2. ✅ Commit and deploy files (Step 2)
3. ✅ Verify cron job appears (Step 3)
4. ✅ Test the endpoint (Step 4)
5. ✅ Monitor first automated run

---

## 🆘 Questions?

- Check Vercel cron documentation: https://vercel.com/docs/cron-jobs
- Review OpenRouter usage: https://openrouter.ai/activity
- Check repository for updates

---

**Generated by Claude Code**
