# PartyOn Delivery - Documentation Index

> **Quick Reference**: Central hub for all project documentation, AI prompts, strategies, and guides.
>
> **Last Updated**: January 2026

---

## Quick Links

| Need | Go To |
|------|-------|
| **Start a new session** | [CLAUDE.md](../CLAUDE.md) - Main project context |
| **Create cocktail kit images** | [cocktail-kit-image-strategy.md](./cocktail-kit-image-strategy.md) |
| **Generate AI images** | [IMAGE_GENERATION_DOCUMENTATION.md](../IMAGE_GENERATION_DOCUMENTATION.md) |
| **Understand group orders** | [GROUP_ORDERS.md](./GROUP_ORDERS.md) |
| **Layout/hero section rules** | [layout-standards.md](../global-rules/partyondelivery/layout-standards.md) |

---

## 📁 Documentation by Category

### 🏠 Project Core

| File | Description | Location |
|------|-------------|----------|
| **CLAUDE.md** | Main project context, architecture, standards | [Root](../CLAUDE.md) |
| **NEXT_SESSION.md** | Session handoff notes (may be outdated) | [Root](../NEXT_SESSION.md) |
| **README.md** | Project readme | [Root](../README.md) |

---

### 🎨 AI Image & Content Generation

| File | Purpose | AI Tool |
|------|---------|---------|
| **[cocktail-kit-image-strategy.md](./cocktail-kit-image-strategy.md)** | Cocktail kit product photography strategy + Gemini prompt | Gemini Flash 2.5 |
| **[IMAGE_GENERATION_DOCUMENTATION.md](../IMAGE_GENERATION_DOCUMENTATION.md)** | Slide generation (photorealistic + animated styles) | Gemini 2.5 Flash |
| **[MIDJOURNEY_PROMPTS.md](./MIDJOURNEY_PROMPTS.md)** | Midjourney prompts for product/lifestyle images | Midjourney |
| **[HERO_VIDEO_PROMPTS.md](../HERO_VIDEO_PROMPTS.md)** | Video prompts for hero sections | Video AI |
| **[BACH_PARTIES_VIDEO_PROMPTS.md](../BACH_PARTIES_VIDEO_PROMPTS.md)** | Bachelorette party video content | Video AI |

---

### 🎬 Video Integration

| File | Description |
|------|-------------|
| **[VIDEO_INTEGRATION_PLAN.md](../VIDEO_INTEGRATION_PLAN.md)** | Overall video strategy |
| **[HERO_VIDEO_PLAN.md](../HERO_VIDEO_PLAN.md)** | Hero section video implementation |
| **[VIDEO_MODE_MAPPING.md](../VIDEO_MODE_MAPPING.md)** | Video mode configurations |
| **[EPIC_VIDEO_INTEGRATION.md](../EPIC_VIDEO_INTEGRATION.md)** | Epic-scale video features |
| **[public/videos/README.md](../public/videos/README.md)** | Video asset organization |

---

### ⚡ Features & Technical Guides

| File | Feature |
|------|---------|
| **[GROUP_ORDERS.md](./GROUP_ORDERS.md)** | Group ordering system - DB schema, API, flows |
| **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** | Supabase database configuration |
| **[database-setup.md](../database-setup.md)** | General database setup |
| **[WEBHOOK_SETUP.md](../WEBHOOK_SETUP.md)** | Shopify webhook configuration |
| **[PERFORMANCE_OPTIMIZATIONS.md](../PERFORMANCE_OPTIMIZATIONS.md)** | Performance improvements |
| **[PERFORMANCE_SUMMARY.md](../PERFORMANCE_SUMMARY.md)** | Performance audit results |

---

### 🎯 Brand & Design

| File | Purpose |
|------|---------|
| **[BRAND_ALIGNMENT_ANALYSIS.md](../BRAND_ALIGNMENT_ANALYSIS.md)** | Brand consistency analysis |
| **[MEDIA_USAGE_GUIDE.md](../MEDIA_USAGE_GUIDE.md)** | Media asset guidelines |
| **[public/images/README.md](../public/images/README.md)** | Image organization |
| **[public/images/ORGANIZATION_PLAN.md](../public/images/ORGANIZATION_PLAN.md)** | Image folder structure |

---

### 📧 Business Templates

| File | Use Case |
|------|----------|
| **[CLIENT_EMAIL_TEMPLATE.md](../CLIENT_EMAIL_TEMPLATE.md)** | Client communication templates |
| **[DELIVERY_REQUIREMENTS.md](../DELIVERY_REQUIREMENTS.md)** | Delivery zone rules, minimums |

---

### 📐 Global Rules (Claude Context)

These files are loaded by Claude Code at session start:

| File | Contains |
|------|----------|
| **[universal-principles.md](../global-rules/core/universal-principles.md)** | KISS, YAGNI, DRY, file limits, security |
| **[prp-methodology.md](../global-rules/workflows/prp-methodology.md)** | PRP development workflow |
| **[layout-standards.md](../global-rules/partyondelivery/layout-standards.md)** | Hero section rules (CRITICAL) |
| **[rasmus--nextjs-rules.md](../global-rules/nextjs/rasmus--nextjs-rules.md)** | Next.js 15 patterns |
| **[rasmus--react-rules.md](../global-rules/react/rasmus--react-rules.md)** | React 19 standards |
| **[CLAUDE.md (Archon)](../global-rules/archon/CLAUDE.md)** | Archon task management |

---

### 🛠️ Claude Skills

Located in `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| **algorithmic-art** | Generate art with p5.js |
| **brand-guidelines** | Apply Anthropic brand colors |
| **canvas-design** | Create visual designs (.png, .pdf) |
| **doc-coauthoring** | Co-author documentation |
| **docx** | Create/edit Word documents |
| **frontend-design** | Build web interfaces |
| **pdf** | PDF manipulation |
| **pptx** | PowerPoint creation |
| **xlsx** | Excel/spreadsheet work |

---

## 🗂️ File Organization

```
PartyOn2/
├── CLAUDE.md                          # 🔑 Main project context
├── docs/
│   ├── INDEX.md                       # 📚 This file
│   ├── cocktail-kit-image-strategy.md # 🍸 Cocktail kit images
│   ├── GROUP_ORDERS.md                # 👥 Group ordering
│   ├── MIDJOURNEY_PROMPTS.md          # 🎨 Midjourney
│   └── SUPABASE_SETUP.md              # 🗄️ Database
├── global-rules/
│   ├── core/                          # Universal principles
│   ├── workflows/                     # PRP methodology
│   ├── partyondelivery/               # Layout standards
│   ├── nextjs/                        # Next.js rules
│   └── react/                         # React rules
├── .claude/skills/                    # Claude Code skills
└── [Root MD files]                    # Various guides
```

---

## 📋 Session Start Checklist

When starting a new Claude Code session:

1. ✅ Claude reads `CLAUDE.md` automatically
2. ✅ Claude reads global-rules files (per instructions in CLAUDE.md)
3. 📖 Reference this INDEX.md for specific tasks
4. 🔍 Check `NEXT_SESSION.md` for any handoff notes

---

## 🔄 Maintenance

### Adding New Documentation
1. Create file in `docs/` folder
2. Add entry to this INDEX.md
3. Include "Last Updated" date in new file

### Outdated Files to Review
- `NEXT_SESSION.md` - May have stale tasks
- `FIXES_SUMMARY.md` - One-time fix log
- `*_copy.md` files - Duplicates to clean up

---

## 📊 Quick Stats

| Category | Count |
|----------|-------|
| Core Documentation | 3 files |
| AI/Image Guides | 5 files |
| Video Guides | 5 files |
| Feature Docs | 6 files |
| Brand/Design | 4 files |
| Business Templates | 2 files |
| Global Rules | 6 files |
| Claude Skills | 9+ skills |

---

*Last updated: January 2026*
