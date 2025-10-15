# Blog Automation Setup Guide

This guide explains how to set up automated daily blog post generation for your PartyOn Delivery website.

## 🎯 What This Does

- Automatically generates 1 blog post per day at 9 AM EST
- Uses AI (Claude) to write 2,000+ word posts
- Generates 4 AI images per post using Gemini
- Commits to dev branch and creates PR for review
- Works through all 99 remaining topics automatically

## 📋 Setup Instructions

### Option 1: GitHub Actions (Recommended - FREE)

#### Step 1: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/matthewtrundle/PartyOn2
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   **Secret 1:**
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key (same as in `.env.local`)

   **Secret 2:**
   - Name: `GOOGLE_API_KEY`
   - Value: Your OpenRouter API key (same as OPENROUTER_API_KEY)

#### Step 2: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
3. Click **Save**

#### Step 3: Commit the Workflow File

The workflow file is already created at `.github/workflows/generate-daily-blog.yml`

Just commit and push it:

```bash
git add .github/workflows/generate-daily-blog.yml
git add BLOG_AUTOMATION_SETUP.md
git commit -m "Add automated daily blog generation workflow"
git push origin dev
```

#### Step 4: Test It!

You can manually trigger the workflow to test:

1. Go to **Actions** tab in GitHub
2. Click **Generate Daily Blog Post** workflow
3. Click **Run workflow** → **Run workflow**
4. Watch it generate a blog post in ~2-3 minutes

#### Step 5: Review & Merge

When the automation runs:
1. It creates a new PR automatically
2. Review the generated blog post
3. Merge the PR to main
4. Vercel auto-deploys the new post!

---

## 🕐 Schedule

**Default Schedule:** Every day at 9:00 AM EST (2:00 PM UTC)

To change the schedule, edit `.github/workflows/generate-daily-blog.yml`:

```yaml
schedule:
  # Runs every day at 9 AM EST (2 PM UTC)
  - cron: '0 14 * * *'
```

**Cron Examples:**
- `0 14 * * *` - Daily at 9 AM EST
- `0 14 * * 1,3,5` - Monday, Wednesday, Friday at 9 AM EST
- `0 14 1 * *` - First of every month at 9 AM EST

---

## Option 2: Vercel Cron Jobs

If you prefer to use Vercel's cron jobs:

#### Step 1: Create API Route

Create `src/app/api/cron/generate-blog/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Run the blog generation script
    const { stdout, stderr } = await execAsync('npm run generate-blog');

    return NextResponse.json({
      success: true,
      output: stdout,
      error: stderr
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
```

#### Step 2: Add to vercel.json

```json
{
  "crons": [{
    "path": "/api/cron/generate-blog",
    "schedule": "0 14 * * *"
  }]
}
```

#### Step 3: Add Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `OPENROUTER_API_KEY`
   - `GOOGLE_API_KEY`
   - `CRON_SECRET` (generate a random string)

**Note:** Vercel cron jobs require a paid plan ($20/month)

---

## Option 3: Manual Generation

If you prefer manual control:

```bash
# Generate one blog post
npm run generate-blog

# Check remaining topics
cat scripts/topics.json | grep '"published": false' | wc -l

# Commit and push
git add .
git commit -m "Add new blog post"
git push origin dev
```

---

## 📊 Monitoring

### Check GitHub Actions Status

1. Go to **Actions** tab
2. View workflow runs
3. Click on any run to see logs

### Check Remaining Topics

```bash
# Count unpublished topics
grep -c '"published": false' scripts/topics.json

# View next topic
grep -A 5 '"published": false' scripts/topics.json | head -6
```

### Check Generated Posts

```bash
# List all generated posts
ls content/blog/posts/

# Count generated posts
ls content/blog/posts/ | wc -l
```

---

## 💰 Cost Estimates

**Per Blog Post:**
- Claude text generation: ~$0.40-0.60
- Gemini image generation (4 images): ~$0.20-0.40
- **Total per post: ~$0.60-1.00**

**Monthly (30 posts):**
- **Total: ~$18-30/month**

**All 99 remaining topics:**
- **Total: ~$60-100**

---

## 🔧 Troubleshooting

### Workflow fails with "permission denied"

→ Check Step 2: Enable write permissions in GitHub Actions settings

### "API key not found" error

→ Check that secrets are added correctly in GitHub Settings

### Images fail to generate

→ Check your OpenRouter credit balance and rate limits

### Topics.json not updating

→ Check that the workflow has permission to commit to the repository

---

## 🎮 Advanced: Custom Topic Management

### Add New Topics

Edit `scripts/topics.json`:

```json
{
  "id": 101,
  "title": "Your Custom Blog Title",
  "category": "Bachelor Parties",
  "keywords": ["keyword1", "keyword2", "austin"],
  "published": false
}
```

### Reset a Published Topic

Change `"published": true` to `"published": false` to regenerate it.

### Bulk Import Topics

Use a script to import topics from CSV or other sources.

---

## 📝 Next Steps

1. ✅ Set up GitHub Actions (Steps 1-3 above)
2. ✅ Test manual workflow run
3. ✅ Review first auto-generated PR
4. ✅ Merge to production
5. ✅ Let it run automatically daily!

---

## 🆘 Need Help?

- Check workflow logs in GitHub Actions
- Review API usage in OpenRouter dashboard
- Check Vercel deployment logs
- Review generated content before merging PRs

---

**Generated by Claude Code**
